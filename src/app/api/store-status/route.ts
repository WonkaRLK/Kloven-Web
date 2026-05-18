import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data } = await supabase
    .from("store_config")
    .select("drop_mode_active, drop_opens_at")
    .eq("id", 1)
    .single();

  const active = data?.drop_mode_active ?? false;
  const opensAt = data?.drop_opens_at ?? null;

  // Store is open if drop mode is off, or if countdown already passed
  const open =
    !active || (opensAt !== null && new Date(opensAt) <= new Date());

  return NextResponse.json({ open, drop_opens_at: opensAt });
}
