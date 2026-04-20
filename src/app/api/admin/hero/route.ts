import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { validateAdminAuth } from "@/lib/admin-auth";

const SETTING_KEY = "hero_images";

export async function GET(request: NextRequest) {
  const authError = validateAdminAuth(request);
  if (authError) return authError;

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", SETTING_KEY)
    .single();

  const images: string[] = data?.value ? JSON.parse(data.value) : [];
  return NextResponse.json({ images });
}

export async function PUT(request: NextRequest) {
  const authError = validateAdminAuth(request);
  if (authError) return authError;

  const { images } = await request.json() as { images: string[] };

  if (!Array.isArray(images)) {
    return NextResponse.json({ error: "images debe ser un array" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("app_settings")
    .upsert({ key: SETTING_KEY, value: JSON.stringify(images), updated_at: new Date().toISOString() });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
