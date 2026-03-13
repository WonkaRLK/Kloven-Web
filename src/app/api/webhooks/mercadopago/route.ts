import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { verifyMPWebhook } from "@/lib/mp-verify";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

export async function POST(req: NextRequest) {
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

    const supabase = getSupabaseAdmin();

    // Update order
    const { error } = await supabase
      .from("orders")
      .update({
        status: paymentData.status as string,
        mp_payment_id: String(paymentId),
        mp_status: paymentData.status as string,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
      console.error("Webhook: error updating order", orderId, error);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    console.log(`Webhook: order ${orderId} updated to ${paymentData.status}`);

    // If approved: send confirmation email + award points
    if (paymentData.status === "approved") {
      try {
        const { data: orderData } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .eq("id", orderId)
          .single();

        if (orderData?.payer_email) {
          await sendOrderConfirmationEmail(orderData);
          console.log(
            `Webhook: email sent to ${orderData.payer_email} for order ${orderId}`
          );
        }

        // Award loyalty points if user is linked
        if (orderData?.user_id) {
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
            console.log(
              `Webhook: points awarded to user ${orderData.user_id} for order ${orderId}`
            );
          } catch (pointsError) {
            console.error(
              `Webhook: failed to award points for order ${orderId}`,
              pointsError
            );
          }
        }
      } catch (emailError) {
        console.error(
          `Webhook: failed to send email for order ${orderId}`,
          emailError
        );
      }
    }

    // If rejected/cancelled: restore stock atomically
    if (
      paymentData.status === "rejected" ||
      paymentData.status === "cancelled"
    ) {
      try {
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("variant_id, quantity, combo_variant_selections")
          .eq("order_id", orderId);

        if (orderItems) {
          for (const item of orderItems) {
            if (item.combo_variant_selections) {
              // Combo item — restore stock for each sub-product variant
              const selections = item.combo_variant_selections as {
                variant_id: string;
                quantity: number;
              }[];
              for (const sel of selections) {
                await supabase.rpc("restore_stock", {
                  p_variant_id: sel.variant_id,
                  p_quantity: sel.quantity * item.quantity,
                });
              }
            } else if (item.variant_id) {
              // Regular item
              await supabase.rpc("restore_stock", {
                p_variant_id: item.variant_id,
                p_quantity: item.quantity,
              });
            }
          }
          console.log(`Webhook: stock restored for order ${orderId}`);
        }
      } catch (stockError) {
        console.error(
          `Webhook: failed to restore stock for order ${orderId}`,
          stockError
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ received: true });
  }
}
