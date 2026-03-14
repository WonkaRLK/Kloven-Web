import { NextRequest, NextResponse } from "next/server";
import { validateAdminAuth } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const authError = validateAdminAuth(request);
  if (authError) return authError;

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "mp_marketplace_fee_percent")
    .single();

  return NextResponse.json({
    connected: !!process.env.MP_SELLER_ACCESS_TOKEN,
    fee_percent: parseFloat(data?.value || process.env.MP_MARKETPLACE_FEE_PERCENT || "0"),
    app_id_configured: !!process.env.MP_APP_ID,
  });
}

export async function PUT(request: NextRequest) {
  const authError = validateAdminAuth(request);
  if (authError) return authError;

  const { fee_percent } = await request.json();

  if (typeof fee_percent !== "number" || fee_percent < 0 || fee_percent > 100) {
    return NextResponse.json(
      { error: "Porcentaje invalido (0-100)" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("app_settings")
    .upsert(
      { key: "mp_marketplace_fee_percent", value: String(fee_percent), updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ fee_percent });
}
