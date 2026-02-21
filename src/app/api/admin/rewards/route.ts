import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { validateAdminAuth } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const authError = validateAdminAuth(req);
  if (authError) return authError;

  const supabase = getSupabaseAdmin();
  const { data: rewards } = await supabase
    .from("rewards")
    .select("*")
    .order("created_at", { ascending: false });

  return NextResponse.json(rewards || []);
}

export async function POST(req: NextRequest) {
  const authError = validateAdminAuth(req);
  if (authError) return authError;

  const body = await req.json();
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("rewards")
    .insert({
      name: body.name,
      description: body.description || "",
      type: body.type,
      points_cost: body.points_cost,
      discount_percent: body.discount_percent || 0,
      product_id: body.product_id || null,
      max_redemptions: body.max_redemptions || 0,
      active: body.active ?? true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const authError = validateAdminAuth(req);
  if (authError) return authError;

  const body = await req.json();
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("rewards")
    .update({
      name: body.name,
      description: body.description,
      type: body.type,
      points_cost: body.points_cost,
      discount_percent: body.discount_percent,
      product_id: body.product_id || null,
      max_redemptions: body.max_redemptions,
      active: body.active,
    })
    .eq("id", body.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const authError = validateAdminAuth(req);
  if (authError) return authError;

  const { id } = await req.json();
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from("rewards").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
