import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const SEGMENTS = [
  { discount: 25, probability: 0.05 },
  { discount: 0, probability: 0.30 },
  { discount: 10, probability: 0.25 },
  { discount: 20, probability: 0.12 },
  { discount: 5, probability: 0.05 },
  { discount: 15, probability: 0.23 },
];

function weightedRandom(): number {
  const random = Math.random();
  let cumulative = 0;
  for (let i = 0; i < SEGMENTS.length; i++) {
    cumulative += SEGMENTS[i].probability;
    if (random <= cumulative) return i;
  }
  return SEGMENTS.length - 1;
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "SPIN-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(request: NextRequest) {
  // Rate limit: 3 per hour per IP
  const ip = getClientIp(request.headers);
  const allowed = rateLimit(`spin_wheel_${ip}`, {
    maxTokens: 3,
    refillRate: 3 / 3600,
  });

  if (!allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Esper\u00e1 un rato antes de volver a intentar." },
      { status: 429 }
    );
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Datos inv\u00e1lidos." }, { status: 400 });
  }

  const email = body.email?.trim()?.toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email inv\u00e1lido." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Check if this email already spun
  const { data: existingEmail } = await supabase
    .from("promo_codes")
    .select("id")
    .eq("created_for_email", email)
    .eq("source", "spin_wheel")
    .limit(1);

  if (existingEmail && existingEmail.length > 0) {
    return NextResponse.json(
      { error: "Ya giraste la ruleta con este email." },
      { status: 409 }
    );
  }

  // Check IP abuse: max 10 spins per IP per day (CGNAT-friendly)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: ipSpinCount } = await supabase
    .from("promo_codes")
    .select("id", { count: "exact", head: true })
    .eq("client_ip", ip)
    .eq("source", "spin_wheel")
    .gte("created_at", oneDayAgo);

  if (ipSpinCount !== null && ipSpinCount >= 13) {
    return NextResponse.json(
      { error: "Se alcanz\u00f3 el l\u00edmite de giros desde esta conexi\u00f3n. Prob\u00e1 ma\u00f1ana." },
      { status: 429 }
    );
  }

  // Determine winner via weighted random
  const segmentIndex = weightedRandom();
  const segment = SEGMENTS[segmentIndex];

  let code: string | null = null;

  if (segment.discount > 0) {
    // Winner — generate unique promo code
    code = generateCode();
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

    const { error: insertError } = await supabase.from("promo_codes").insert({
      code,
      discount_percent: segment.discount,
      max_uses: 1,
      current_uses: 0,
      expires_at: expiresAt,
      active: true,
      created_for_email: email,
      client_ip: ip,
      source: "spin_wheel",
    });

    if (insertError) {
      // Retry with a new code in case of collision
      code = generateCode();
      const { error: retryError } = await supabase
        .from("promo_codes")
        .insert({
          code,
          discount_percent: segment.discount,
          max_uses: 1,
          current_uses: 0,
          expires_at: expiresAt,
          active: true,
          created_for_email: email,
          client_ip: ip,
          source: "spin_wheel",
        });

      if (retryError) {
        return NextResponse.json(
          { error: "Error al generar el c\u00f3digo. Intent\u00e1 de nuevo." },
          { status: 500 }
        );
      }
    }
  } else {
    // Loser — record the spin to prevent re-spins
    await supabase.from("promo_codes").insert({
      code: `NOPE-${Date.now().toString(36).toUpperCase()}`,
      discount_percent: 1, // minimum valid per CHECK constraint
      max_uses: 0,
      current_uses: 0,
      expires_at: new Date().toISOString(),
      active: false,
      created_for_email: email,
      client_ip: ip,
      source: "spin_wheel",
    });
  }

  return NextResponse.json({
    segmentIndex,
    code,
    discount: segment.discount,
  });
}
