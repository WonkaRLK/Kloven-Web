import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { validateAdminAuth } from "@/lib/admin-auth";
import { ensureCombosCategory } from "@/lib/combos-category";

export async function GET(request: NextRequest) {
  const authError = validateAdminAuth(request);
  if (authError) return authError;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // For combos, fetch combo_items count
  if (data) {
    const combos = data.filter((p: { is_combo?: boolean }) => p.is_combo);
    if (combos.length > 0) {
      const comboIds = combos.map((p: { id: string }) => p.id);
      const { data: comboItems } = await supabase
        .from("combo_items")
        .select("combo_id, product_id")
        .in("combo_id", comboIds);

      if (comboItems) {
        const countMap = new Map<string, number>();
        for (const ci of comboItems) {
          countMap.set(ci.combo_id, (countMap.get(ci.combo_id) || 0) + 1);
        }
        for (const p of data) {
          if (p.is_combo) {
            (p as Record<string, unknown>).combo_items_count = countMap.get(p.id) || 0;
          }
        }
      }
    }
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const authError = validateAdminAuth(request);
  if (authError) return authError;

  const body = await request.json();
  const supabase = getSupabaseAdmin();

  // Create product
  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      name: body.name,
      slug: body.slug,
      description: body.description || "",
      price: body.price,
      compare_at_price: body.compare_at_price || null,
      category: body.category,
      images: body.images || [],
      image_url: body.images?.[0] || body.image_url || "",
      material: body.material || "",
      fit: body.fit || "",
      featured: body.featured || false,
      active: body.active !== false,
      on_sale: body.on_sale || false,
      sold_out: body.sold_out || false,
      tags: body.tags || [],
      is_combo: body.is_combo || false,
    })
    .select()
    .single();

  if (productError || !product) {
    return NextResponse.json(
      { error: productError?.message || "Error al crear producto" },
      { status: 500 }
    );
  }

  // Make sure the "Combos" category exists so it appears in the admin
  // Categorías panel (reorderable) and the storefront navbar.
  if (body.is_combo) {
    await ensureCombosCategory(supabase);
  }

  if (body.is_combo && body.combo_items?.length) {
    // Create combo items
    const comboItems = body.combo_items.map(
      (ci: { product_id: string; quantity: number }, idx: number) => ({
        combo_id: product.id,
        product_id: ci.product_id,
        quantity: ci.quantity || 1,
        sort_order: idx,
      })
    );

    const { error: comboError } = await supabase
      .from("combo_items")
      .insert(comboItems);

    if (comboError) {
      await supabase.from("products").delete().eq("id", product.id);
      return NextResponse.json(
        { error: comboError.message },
        { status: 500 }
      );
    }
  } else if (body.variants?.length) {
    // Create variants if provided
    const variants = body.variants.map(
      (v: { size: string; color: string; stock: number; sku: string }) => ({
        product_id: product.id,
        size: v.size,
        color: v.color,
        stock: v.stock || 0,
        sku: v.sku || "",
        active: true,
      })
    );

    const { error: variantsError } = await supabase
      .from("product_variants")
      .insert(variants);

    if (variantsError) {
      // Cleanup product if variants fail
      await supabase.from("products").delete().eq("id", product.id);
      return NextResponse.json(
        { error: variantsError.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(product, { status: 201 });
}
