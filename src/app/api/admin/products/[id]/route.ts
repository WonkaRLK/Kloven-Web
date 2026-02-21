import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { validateAdminAuth } from "@/lib/admin-auth";

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
      category: body.category,
      image_url: body.image_url,
      material: body.material,
      fit: body.fit,
      featured: body.featured,
      active: body.active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update variants: delete existing and re-insert
  if (body.variants) {
    await supabase.from("product_variants").delete().eq("product_id", id);

    if (body.variants.length > 0) {
      const variants = body.variants.map(
        (v: { size: string; color: string; stock: number; sku: string; active?: boolean }) => ({
          product_id: id,
          size: v.size,
          color: v.color,
          stock: v.stock || 0,
          sku: v.sku || "",
          active: v.active !== false,
        })
      );

      await supabase.from("product_variants").insert(variants);
    }
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

  // Delete order_items referencing this product first
  await supabase.from("order_items").delete().eq("product_id", id);

  // Delete variants
  await supabase.from("product_variants").delete().eq("product_id", id);

  // Delete product
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
