import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { safeError } from "@/lib/api-utils";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!UUID_RE.test(token)) {
    return safeError(400, "Token invalido");
  }

  const supabase = getSupabaseAdmin();

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, status, payer_name, shipping_address, shipping_city, shipping_zip, subtotal, shipping_cost, discount_amount, total, created_at, updated_at, order_items(id, product_name, size, color, quantity, unit_price)")
    .eq("tracking_token", token)
    .single();

  if (error || !order) {
    return safeError(404, "Pedido no encontrado");
  }

  return NextResponse.json(order);
}
