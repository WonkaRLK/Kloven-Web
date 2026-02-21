import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "ID invalido" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, status, payer_name, payer_email, subtotal, shipping_cost, discount_amount, total, created_at, order_items(id, product_name, size, color, quantity, unit_price)"
    )
    .eq("id", id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
  }

  return NextResponse.json(order);
}
