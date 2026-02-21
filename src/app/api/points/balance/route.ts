import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("points_balance, total_points_earned")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ points_balance: 0, total_points_earned: 0 });
  }

  return NextResponse.json(profile);
}
