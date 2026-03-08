import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");

  let query = supabase
    .from("products")
    .select("*, product_variants(*)")
    .eq("active", true);

  if (category) {
    query = query.eq("category", category);
  }
  if (featured === "true") {
    query = query.eq("featured", true);
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Filter inactive variants
  const products = (data || []).map((p: Record<string, unknown>) => ({
    ...p,
    product_variants: (p.product_variants as { active: boolean }[]).filter(
      (v) => v.active
    ),
  }));

  return NextResponse.json(products);
}
