import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { validateAdminAuth } from "@/lib/admin-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateAdminAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();

  if (typeof body.sold_out !== "boolean") {
    return NextResponse.json({ error: "sold_out debe ser boolean" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("products")
    .update({ sold_out: body.sold_out, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
