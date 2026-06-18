import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { validateAdminAuth } from "@/lib/admin-auth";
import { ensureCombosCategory } from "@/lib/combos-category";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateAdminAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  // If combo, fetch combo_items with product details
  if (data.is_combo) {
    const { data: comboItems } = await supabase
      .from("combo_items")
      .select("*, product:product_id(id, name, slug, image_url, price)")
      .eq("combo_id", id)
      .order("sort_order");

    data.combo_items = comboItems || [];
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateAdminAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();
  const supabase = getSupabaseAdmin();

  // Update product
  const { data, error } = await supabase
    .from("products")
    .update({
      name: body.name,
      slug: body.slug,
      description: body.description,
      price: body.price,
      compare_at_price: body.compare_at_price || null,
      category: body.category,
      images: body.images || [],
      image_url: body.images?.[0] || body.image_url || "",
      material: body.material,
      fit: body.fit,
      featured: body.featured,
      active: body.active,
      on_sale: body.on_sale || false,
      sold_out: body.sold_out ?? false,
      tags: body.tags || [],
      is_combo: body.is_combo || false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (body.is_combo) {
    // Make sure the "Combos" category exists (reorderable in admin + navbar).
    await ensureCombosCategory(supabase);

    // Delete existing combo_items and re-insert
    await supabase.from("combo_items").delete().eq("combo_id", id);

    if (body.combo_items?.length) {
      const comboItems = body.combo_items.map(
        (ci: { product_id: string; quantity: number }, idx: number) => ({
          combo_id: id,
          product_id: ci.product_id,
          quantity: ci.quantity || 1,
          sort_order: idx,
        })
      );

      await supabase.from("combo_items").insert(comboItems);
    }

    // Clean up any leftover variants
    await supabase.from("product_variants").delete().eq("product_id", id);
  } else if (body.variants) {
    if (body.variants.length > 0) {
      // Upsert variants by (product_id, size, color) unique constraint.
      // This updates existing rows (preserving their IDs and any FK references
      // from order_items) and inserts new ones — avoids FK violation on delete.
      const variantsToUpsert = (body.variants as { size: string; color: string; stock: number; sku: string; active?: boolean }[]).map((v) => ({
        product_id: id,
        size: v.size,
        color: v.color,
        stock: Math.max(1, parseInt(String(v.stock)) || 1),
        sku: v.sku || "",
        active: true,
      }));

      const { error: upsertError } = await supabase
        .from("product_variants")
        .upsert(variantsToUpsert, { onConflict: "product_id,size,color" });

      if (upsertError) {
        return NextResponse.json({ error: "Error al guardar variantes" }, { status: 500 });
      }
    }

    // Soft-delete variants that the admin removed from the list.
    // We can't hard-delete them if they're referenced by order_items.
    const incomingKeys = new Set(
      (body.variants as { size: string; color: string }[]).map((v) => `${v.size}|${v.color}`)
    );
    const { data: existingVariants } = await supabase
      .from("product_variants")
      .select("id, size, color")
      .eq("product_id", id);

    const toDeactivate = (existingVariants || [])
      .filter((v) => !incomingKeys.has(`${v.size}|${v.color}`))
      .map((v) => v.id);

    if (toDeactivate.length > 0) {
      await supabase
        .from("product_variants")
        .update({ active: false })
        .in("id", toDeactivate);
    }

    // Clean up any leftover combo items
    await supabase.from("combo_items").delete().eq("combo_id", id);
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateAdminAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  // Soft delete: mark as inactive instead of destroying data
  const { error } = await supabase
    .from("products")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
