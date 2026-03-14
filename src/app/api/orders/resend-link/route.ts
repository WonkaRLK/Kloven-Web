import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { safeError } from "@/lib/api-utils";
import { sendTrackingLinksEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  // 3 requests per 5 minutes per IP
  if (!rateLimit(`resend-link:${ip}`, { maxTokens: 3, refillRate: 3 / 300 })) {
    return safeError(429, "Demasiados intentos. Intenta de nuevo en unos minutos.");
  }

  const body = await req.json();
  const email = (body.email || "").trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return safeError(400, "Email invalido");
  }

  // Always return the same generic message to prevent email enumeration
  const genericMessage = "Si hay pedidos asociados a ese email, te enviamos los links de seguimiento.";

  try {
    const supabase = getSupabaseAdmin();

    const { data: orders } = await supabase
      .from("orders")
      .select("id, status, tracking_token, payer_name, total, created_at")
      .eq("payer_email", email)
      .in("status", ["pending", "approved", "in_process", "preparing", "shipped"])
      .order("created_at", { ascending: false })
      .limit(10);

    if (orders && orders.length > 0) {
      await sendTrackingLinksEmail(email, orders);
    }
  } catch (err) {
    console.error("Error in resend-link:", err);
  }

  return NextResponse.json({ message: genericMessage });
}
