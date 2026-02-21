import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "");

interface OrderData {
  id: string;
  payer_name: string;
  payer_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_zip: string;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  total: number;
  order_items: {
    product_name: string;
    size: string;
    color: string;
    quantity: number;
    unit_price: number;
  }[];
}

export async function sendOrderConfirmationEmail(order: OrderData) {
  const itemRows = order.order_items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #eee;">
          <strong style="color:#0a0a0a;">${item.product_name}</strong><br/>
          <span style="color:#888;font-size:13px;">Talle: ${item.size} | Color: ${item.color}</span><br/>
          <span style="color:#888;font-size:13px;">${item.quantity} x $${item.unit_price.toLocaleString("es-AR")}</span>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #eee;text-align:right;font-weight:bold;">
          $${(item.unit_price * item.quantity).toLocaleString("es-AR")}
        </td>
      </tr>`
    )
    .join("");

  const html = `
  <div style="background:#f5f5f5;padding:40px 0;font-family:system-ui,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #eee;border-radius:4px;overflow:hidden;">
      <div style="height:4px;background:#D90429;"></div>
      <div style="padding:32px;">
        <h1 style="color:#0a0a0a;font-size:24px;margin:0 0 4px;font-weight:900;letter-spacing:-0.5px;">KLOVEN<span style="color:#D90429;">.</span></h1>
        <p style="color:#888;font-size:13px;margin:0 0 24px;">Confirmacion de pedido</p>

        <p style="color:#0a0a0a;font-size:15px;margin:0 0 24px;line-height:1.5;">
          Hola <strong>${order.payer_name}</strong>, gracias por tu compra! Tu pedido esta confirmado.
        </p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <thead>
            <tr style="border-bottom:2px solid #0a0a0a;">
              <th style="text-align:left;padding:8px 16px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;">Producto</th>
              <th style="text-align:right;padding:8px 16px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:4px 16px;color:#666;">Subtotal</td>
            <td style="padding:4px 16px;text-align:right;">$${order.subtotal.toLocaleString("es-AR")}</td>
          </tr>
          ${
            order.discount_amount > 0
              ? `<tr>
            <td style="padding:4px 16px;color:#16a34a;">Descuento</td>
            <td style="padding:4px 16px;text-align:right;color:#16a34a;">-$${order.discount_amount.toLocaleString("es-AR")}</td>
          </tr>`
              : ""
          }
          <tr>
            <td style="padding:4px 16px;color:#666;">Envio</td>
            <td style="padding:4px 16px;text-align:right;">${order.shipping_cost === 0 ? "Gratis" : `$${order.shipping_cost.toLocaleString("es-AR")}`}</td>
          </tr>
          <tr style="border-top:2px solid #0a0a0a;">
            <td style="padding:12px 16px;font-weight:900;font-size:16px;">Total</td>
            <td style="padding:12px 16px;text-align:right;font-weight:900;font-size:16px;">$${order.total.toLocaleString("es-AR")}</td>
          </tr>
        </table>

        <div style="margin-top:24px;padding:16px;background:#f9f9f9;border:1px solid #eee;border-radius:4px;">
          <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;font-weight:bold;">Direccion de envio</p>
          <p style="margin:0;font-size:14px;color:#0a0a0a;">${order.shipping_address}, ${order.shipping_city} (${order.shipping_zip})</p>
        </div>

        <p style="color:#aaa;font-size:12px;margin:32px 0 0;text-align:center;">
          Kloven Argentina &mdash; Streetwear Redefined
        </p>
      </div>
    </div>
  </div>`;

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Kloven <onboarding@resend.dev>",
    to: order.payer_email,
    subject: `Kloven - Confirmacion de pedido #${order.id.slice(0, 8)}`,
    html,
  });

  if (error) {
    console.error("Resend email error:", error);
    throw error;
  }
}
