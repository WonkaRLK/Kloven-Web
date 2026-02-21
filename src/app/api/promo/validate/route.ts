import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ valid: false });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("active", true)
      .single();

    if (error || !data) {
      return NextResponse.json({ valid: false });
    }

    // Check expiration
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ valid: false });
    }

    // Check max uses
    if (data.max_uses > 0 && data.current_uses >= data.max_uses) {
      return NextResponse.json({ valid: false });
    }

    return NextResponse.json({
      valid: true,
      discount_percent: data.discount_percent,
    });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
