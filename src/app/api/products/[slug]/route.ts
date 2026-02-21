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

  return NextResponse.json(data);
}
