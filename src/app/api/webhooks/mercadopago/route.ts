import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  sendOrderConfirmationEmail,
  sendAdminOrderNotification,
} from "@/lib/email";
import { verifyMPWebhook } from "@/lib/mp-verify";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

type FailureKind = "email" | "admin_email" | "points" | "stock_restore" | "other";

async function logFailure(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  params: {
    orderId: string | null;
    mpPaymentId: string | null;
    kind: FailureKind;
    error: unknown;
    payload?: Record<string, unknown>;
  }
) {
  try {
    const message =
      params.error instanceof Error
        ? params.error.message
        : typeof params.error === "string"
        ? params.error
        : JSON.stringify(params.error);

    await supabase.from("webhook_failures").insert({
      order_id: params.orderId,
      mp_payment_id: params.mpPaymentId,
      kind: params.kind,
      error_message: message,
      payload: params.payload ?? null,
    });
  } catch (logError) {
    console.error("Webhook: failed to log webhook_failures row", logError);
  }
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();

  try {
    const body = await req.json();

    if (body.type !== "payment") {
      return NextResponse.json({ received: true });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      return NextResponse.json({ error: "No payment ID" }, { status: 400 });
    }

    // Verify webhook signature
    const xSignature = req.headers.get("x-signature");
    const xRequestId = req.headers.get("x-request-id");
    if (!verifyMPWebhook(xSignature, xRequestId, String(paymentId))) {
      console.error("Webhook: invalid signature");
      return NextResponse.json({ error: "Firma invalida" }, { status: 403 });
    }

    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });

    const orderId = paymentData.external_reference;
    if (!orderId) {
      console.error("Webhook: payment without external_reference", paymentId);
      return NextResponse.json({ received: true });
    }

    const newStatus = paymentData.status as string;
    const mpPaymentId = String(paymentId);

    // Fetch current order state for idempotency checks
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id, status, mp_payment_id, points_awarded, user_id, payer_email")
      .eq("id", orderId)
      .single();

    if (!existingOrder) {
      console.error(`Webhook: order ${orderId} not found`);
      return NextResponse.json({ received: true });
    }

    // Idempotency: if we've already processed this exact payment+status combo,
    // skip side-effects to avoid duplicate emails / double stock restoration /
    // double points.
    const alreadyProcessed =
      existingOrder.mp_payment_id === mpPaymentId &&
      existingOrder.status === newStatus;

    if (alreadyProcessed) {
      console.log(
        `Webhook: order ${orderId} already at status ${newStatus} for payment ${mpPaymentId} — skipping side-effects`
      );
      return NextResponse.json({ received: true, idempotent: true });
    }

    // Update order status
    const { error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
        mp_payment_id: mpPaymentId,
        mp_status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
      console.error("Webhook: error updating order", orderId, error);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    console.log(`Webhook: order ${orderId} updated to ${newStatus}`);

    // If approved: send confirmation email + award points (both idempotent)
    if (newStatus === "approved") {
      const { data: orderData } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", orderId)
        .single();

      if (orderData?.payer_email) {
        // Customer confirmation email
        try {
          await sendOrderConfirmationEmail(orderData);
          console.log(
            `Webhook: email sent to ${orderData.payer_email} for order ${orderId}`
          );
        } catch (emailError) {
          console.error(
            `Webhook: failed to send email for order ${orderId}`,
            emailError
          );
          await logFailure(supabase, {
            orderId,
            mpPaymentId,
            kind: "email",
            error: emailError,
          });
        }

        // Admin notification (separate try/catch so a failure here doesn't
        // prevent the customer email from being marked sent)
        try {
          await sendAdminOrderNotification(orderData);
        } catch (adminEmailError) {
          console.error(
            `Webhook: failed to send admin notification for order ${orderId}`,
            adminEmailError
          );
          await logFailure(supabase, {
            orderId,
            mpPaymentId,
            kind: "admin_email",
            error: adminEmailError,
          });
        }
      }

      // Loyalty points — only award once per order
      if (orderData?.user_id && !existingOrder.points_awarded) {
        try {
          const pointsPerUnit = parseInt(process.env.POINTS_PER_UNIT || "1");
          const unitAmount = parseInt(process.env.POINTS_UNIT_AMOUNT || "100");

          await supabase.rpc("award_points", {
            p_user_id: orderData.user_id,
            p_order_id: orderId,
            p_order_total: orderData.total,
            p_points_per_unit: pointsPerUnit,
            p_unit_amount: unitAmount,
          });

          await supabase
            .from("orders")
            .update({ points_awarded: true })
            .eq("id", orderId);

          console.log(
            `Webhook: points awarded to user ${orderData.user_id} for order ${orderId}`
          );
        } catch (pointsError) {
          console.error(
            `Webhook: failed to award points for order ${orderId}`,
            pointsError
          );
          await logFailure(supabase, {
            orderId,
            mpPaymentId,
            kind: "points",
            error: pointsError,
          });
        }
      }
    }

    // If rejected/cancelled: restore stock atomically
    if (newStatus === "rejected" || newStatus === "cancelled") {
      // Only restore if the order wasn't already in a terminal refunded state
      const wasAlreadyRefunded =
        existingOrder.status === "rejected" ||
        existingOrder.status === "cancelled";

      if (!wasAlreadyRefunded) {
        try {
          const { data: orderItems } = await supabase
            .from("order_items")
            .select("variant_id, quantity, combo_variant_selections")
            .eq("order_id", orderId);

          if (orderItems && orderItems.length > 0) {
            const restoreItems: { variant_id: string; quantity: number }[] = [];

            for (const item of orderItems) {
              if (item.combo_variant_selections) {
                const selections = item.combo_variant_selections as {
                  variant_id: string;
                  quantity: number;
                }[];
                for (const sel of selections) {
                  restoreItems.push({
                    variant_id: sel.variant_id,
                    quantity: sel.quantity * item.quantity,
                  });
                }
              } else if (item.variant_id) {
                restoreItems.push({
                  variant_id: item.variant_id,
                  quantity: item.quantity,
                });
              }
            }

            if (restoreItems.length > 0) {
              const { error: restoreError } = await supabase.rpc(
                "restore_stock_batch",
                { p_items: restoreItems }
              );
              if (restoreError) throw restoreError;
              console.log(`Webhook: stock restored for order ${orderId}`);
            }
          }
        } catch (stockError) {
          console.error(
            `Webhook: failed to restore stock for order ${orderId}`,
            stockError
          );
          await logFailure(supabase, {
            orderId,
            mpPaymentId,
            kind: "stock_restore",
            error: stockError,
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ received: true });
  }
}
