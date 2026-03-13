import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  // Filter active variants only
  data.product_variants = data.product_variants.filter(
    (v: { active: boolean }) => v.active
  );

  // If combo, fetch combo_items with full product + variants data
  if (data.is_combo) {
    const { data: comboItems } = await supabase
      .from("combo_items")
      .select("id, combo_id, product_id, quantity, sort_order")
      .eq("combo_id", data.id)
      .order("sort_order");

    if (comboItems && comboItems.length > 0) {
      const productIds = comboItems.map((ci: { product_id: string }) => ci.product_id);

      const { data: comboProducts } = await supabase
        .from("products")
        .select("*, product_variants(*)")
        .in("id", productIds)
        .eq("active", true);

      if (comboProducts) {
        // Filter active variants for each sub-product
        for (const cp of comboProducts) {
          cp.product_variants = cp.product_variants.filter(
            (v: { active: boolean }) => v.active
          );
        }

        const productMap = new Map(comboProducts.map((p: { id: string }) => [p.id, p]));
        data.combo_items = comboItems.map((ci: { product_id: string }) => ({
          ...ci,
          product: productMap.get(ci.product_id) || null,
        })).filter((ci: { product: unknown }) => ci.product !== null);
      }
    } else {
      data.combo_items = [];
    }
  }

  return NextResponse.json(data);
}
