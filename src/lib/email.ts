import { Resend } from "resend";
import { escapeHtml } from "@/lib/sanitize";

const resend = new Resend(process.env.RESEND_API_KEY || "");

interface OrderData {
  id: string;
  tracking_token?: string;
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

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://kloven-web.vercel.app";

export async function sendOrderConfirmationEmail(order: OrderData) {
  const safeName = escapeHtml(order.payer_name);
  const safeAddress = escapeHtml(order.shipping_address);
  const safeCity = escapeHtml(order.shipping_city);
  const safeZip = escapeHtml(order.shipping_zip);

  const itemRows = order.order_items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #eee;">
          <strong style="color:#0a0a0a;">${escapeHtml(item.product_name)}</strong><br/>
          <span style="color:#888;font-size:13px;">Talle: ${escapeHtml(item.size)} | Color: ${escapeHtml(item.color)}</span><br/>
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
          Hola <strong>${safeName}</strong>, gracias por tu compra! Tu pedido esta confirmado.
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
          <p style="margin:0;font-size:14px;color:#0a0a0a;">${safeAddress}, ${safeCity} (${safeZip})</p>
        </div>

        ${order.tracking_token ? `
        <div style="margin-top:24px;text-align:center;">
          <a href="${baseUrl}/mi-pedido/${order.tracking_token}" style="display:inline-block;background:#D90429;color:#ffffff;font-weight:bold;text-transform:uppercase;letter-spacing:1px;font-size:13px;padding:14px 32px;text-decoration:none;border-radius:2px;">
            Ver estado de mi pedido
          </a>
        </div>
        ` : ""}

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

interface TrackingOrder {
  id: string;
  tracking_token: string;
  payer_name: string;
  total: number;
  created_at: string;
}

export async function sendTrackingLinksEmail(email: string, orders: TrackingOrder[]) {
  const orderRows = orders
    .map((o) => {
      const date = new Date(o.created_at).toLocaleDateString("es-AR");
      const trackUrl = `${baseUrl}/mi-pedido/${o.tracking_token}`;
      return `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #eee;">
          <strong style="color:#0a0a0a;">Pedido #${o.id.slice(0, 8)}</strong><br/>
          <span style="color:#888;font-size:13px;">${date} &mdash; $${o.total.toLocaleString("es-AR")}</span>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #eee;text-align:right;">
          <a href="${trackUrl}" style="display:inline-block;background:#D90429;color:#ffffff;font-weight:bold;text-transform:uppercase;letter-spacing:1px;font-size:11px;padding:8px 16px;text-decoration:none;border-radius:2px;">
            Ver estado
          </a>
        </td>
      </tr>`;
    })
    .join("");

  const html = `
  <div style="background:#f5f5f5;padding:40px 0;font-family:system-ui,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #eee;border-radius:4px;overflow:hidden;">
      <div style="height:4px;background:#D90429;"></div>
      <div style="padding:32px;">
        <h1 style="color:#0a0a0a;font-size:24px;margin:0 0 4px;font-weight:900;letter-spacing:-0.5px;">KLOVEN<span style="color:#D90429;">.</span></h1>
        <p style="color:#888;font-size:13px;margin:0 0 24px;">Links de seguimiento</p>

        <p style="color:#0a0a0a;font-size:15px;margin:0 0 24px;line-height:1.5;">
          Hola! Aca tenes los links para seguir tus pedidos:
        </p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tbody>
            ${orderRows}
          </tbody>
        </table>

        <p style="color:#aaa;font-size:12px;margin:32px 0 0;text-align:center;">
          Kloven Argentina &mdash; Streetwear Redefined
        </p>
      </div>
    </div>
  </div>`;

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Kloven <onboarding@resend.dev>",
    to: email,
    subject: "Kloven - Links de seguimiento de tus pedidos",
    html,
  });

  if (error) {
    console.error("Resend tracking links email error:", error);
    throw error;
  }
}

export async function sendAdminOrderNotification(order: OrderData) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) {
    console.warn("ADMIN_NOTIFICATION_EMAIL not configured — skipping admin notification");
    return;
  }

  const itemRows = order.order_items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">
          <strong>${escapeHtml(item.product_name)}</strong>
          <span style="color:#888;font-size:12px;"> — ${escapeHtml(item.size)}/${escapeHtml(item.color)} x${item.quantity}</span>
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">
          $${(item.unit_price * item.quantity).toLocaleString("es-AR")}
        </td>
      </tr>`
    )
    .join("");

  const html = `
  <div style="background:#f5f5f5;padding:32px 0;font-family:system-ui,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #eee;">
      <div style="height:4px;background:#D90429;"></div>
      <div style="padding:24px;">
        <h1 style="color:#0a0a0a;font-size:18px;margin:0 0 4px;font-weight:900;">Nuevo pedido confirmado</h1>
        <p style="color:#888;font-size:12px;margin:0 0 20px;">Pedido #${order.id.slice(0, 8)}</p>

        <p style="font-size:14px;margin:0 0 8px;"><strong>Cliente:</strong> ${escapeHtml(order.payer_name)}</p>
        <p style="font-size:14px;margin:0 0 8px;"><strong>Email:</strong> ${escapeHtml(order.payer_email)}</p>
        <p style="font-size:14px;margin:0 0 16px;"><strong>Envio:</strong> ${escapeHtml(order.shipping_address)}, ${escapeHtml(order.shipping_city)} (${escapeHtml(order.shipping_zip)})</p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:13px;">
          <tbody>${itemRows}</tbody>
        </table>

        <p style="font-size:15px;font-weight:900;margin:0;">Total: $${order.total.toLocaleString("es-AR")}</p>

        <div style="margin-top:20px;">
          <a href="${baseUrl}/admin/pedidos/${order.id}" style="display:inline-block;background:#0a0a0a;color:#fff;padding:10px 20px;text-decoration:none;font-size:12px;text-transform:uppercase;letter-spacing:1px;">
            Ver en admin
          </a>
        </div>
      </div>
    </div>
  </div>`;

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Kloven <onboarding@resend.dev>",
    to: adminEmail,
    subject: `Kloven - Nuevo pedido #${order.id.slice(0, 8)} ($${order.total.toLocaleString("es-AR")})`,
    html,
  });

  if (error) {
    console.error("Resend admin notification error:", error);
    throw error;
  }
}
