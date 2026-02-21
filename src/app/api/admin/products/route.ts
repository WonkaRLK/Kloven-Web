import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { validateAdminAuth } from "@/lib/admin-auth";

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
      category: body.category,
      image_url: body.image_url || "",
      material: body.material || "",
      fit: body.fit || "",
      featured: body.featured || false,
      active: body.active !== false,
    })
    .select()
    .single();

  if (productError || !product) {
    return NextResponse.json(
      { error: productError?.message || "Error al crear producto" },
      { status: 500 }
    );
  }

  // Create variants if provided
  if (body.variants?.length) {
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
