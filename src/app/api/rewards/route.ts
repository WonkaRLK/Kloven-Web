import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data: rewards } = await supabase
    .from("rewards")
    .select("*")
    .eq("active", true)
    .order("points_cost", { ascending: true });

  return NextResponse.json(rewards || []);
}
