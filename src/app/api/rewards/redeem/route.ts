import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { reward_id } = await req.json();
  if (!reward_id) {
    return NextResponse.json(
      { error: "reward_id requerido" },
      { status: 400 }
    );
  }

  const admin = getSupabaseAdmin();

  // Call the redeem_reward function
  const { data, error } = await admin.rpc("redeem_reward", {
    p_user_id: user.id,
    p_reward_id: reward_id,
  });

  if (error) {
    console.error("Redeem error:", error);
    return NextResponse.json(
      { error: error.message || "Error al canjear" },
      { status: 400 }
    );
  }

  return NextResponse.json(data || { success: true });
}
