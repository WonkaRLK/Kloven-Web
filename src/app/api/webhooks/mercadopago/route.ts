import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendOrderConfirmationEmail } from "@/lib/email";

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

    // If approved: send confirmation email
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
      } catch (emailError) {
        console.error(
          `Webhook: failed to send email for order ${orderId}`,
          emailError
        );
      }
    }

    // If rejected/cancelled: restore stock
    if (
      paymentData.status === "rejected" ||
      paymentData.status === "cancelled"
    ) {
      try {
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("variant_id, quantity")
          .eq("order_id", orderId);

        if (orderItems) {
          for (const item of orderItems) {
            const { data: variant } = await supabase
              .from("product_variants")
              .select("stock")
              .eq("id", item.variant_id)
              .single();

            if (variant) {
              await supabase
                .from("product_variants")
                .update({ stock: variant.stock + item.quantity })
                .eq("id", item.variant_id);
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
