import type { SupabaseClient } from "@supabase/supabase-js";

/** Slug reserved for the auto-managed "Combos" category. */
export const COMBOS_SLUG = "combos";
export const COMBOS_NAME = "Combos";

/**
 * Ensures a real `categories` row exists for combos so it shows up in the
 * admin Categorías panel (reorderable) and the storefront navbar.
 *
 * Combo products are saved with `category = "combos"` but historically no
 * matching category row was created, leaving combos out of the ordering system.
 * This is idempotent and safe to call on every combo save.
 */
export async function ensureCombosCategory(supabase: SupabaseClient): Promise<void> {
  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", COMBOS_SLUG)
    .limit(1);

  if (existing && existing.length > 0) return;

  // Append at the end; the admin can reorder it afterwards.
  const { data: last } = await supabase
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = ((last?.[0]?.sort_order as number | undefined) ?? -1) + 1;

  await supabase.from("categories").insert({
    name: COMBOS_NAME,
    slug: COMBOS_SLUG,
    sort_order: nextOrder,
    size_type: "clothing",
    active: true,
  });
}
