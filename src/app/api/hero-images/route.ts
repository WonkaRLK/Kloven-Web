import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "hero_images")
    .single();

  const images: string[] = data?.value ? JSON.parse(data.value) : [];
  return NextResponse.json({ images });
}
