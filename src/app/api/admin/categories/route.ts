import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { validateAdminAuth } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const authError = validateAdminAuth(request);
  if (authError) return authError;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

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

  // Get max sort_order
  const { data: last } = await supabase
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (last?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: body.name,
      slug: body.slug,
      sort_order: nextOrder,
      size_type: body.size_type || "clothing",
      active: body.active !== false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const authError = validateAdminAuth(request);
  if (authError) return authError;

  const body = await request.json();
  const supabase = getSupabaseAdmin();

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.slug !== undefined) updates.slug = body.slug;
  if (body.sort_order !== undefined) updates.sort_order = body.sort_order;
  if (body.active !== undefined) updates.active = body.active;
  if (body.size_type !== undefined) updates.size_type = body.size_type;

  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", body.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const authError = validateAdminAuth(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Check if any products use this category
  const { data: cat } = await supabase
    .from("categories")
    .select("slug")
    .eq("id", id)
    .single();

  if (cat) {
    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category", cat.slug);

    if (count && count > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar: hay ${count} producto(s) con esta categoria` },
        { status: 409 }
      );
    }
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
