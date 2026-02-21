import type { Product, ProductWithVariants } from "./types";

const BASE = "";

export async function fetchProducts(params?: {
  category?: string;
  featured?: boolean;
}): Promise<Product[]> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set("category", params.category);
  if (params?.featured) searchParams.set("featured", "true");

  const qs = searchParams.toString();
  const res = await fetch(`${BASE}/api/products${qs ? `?${qs}` : ""}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchProductBySlug(
  slug: string
): Promise<ProductWithVariants | null> {
  const res = await fetch(`${BASE}/api/products/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  return res.json();
}
