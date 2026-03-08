"use client";

import { useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type {
  ProductWithVariants,
  TiendaFilters,
  TiendaSortOption,
} from "@/lib/types";

const DEFAULT_FILTERS: TiendaFilters = {
  categories: [],
  sizes: [],
  colors: [],
  minPrice: null,
  maxPrice: null,
  sort: "newest",
};

function parseFilters(params: URLSearchParams): TiendaFilters {
  const cat = params.get("cat");
  const size = params.get("size");
  const color = params.get("color");
  const minP = params.get("minPrice");
  const maxP = params.get("maxPrice");
  const sort = params.get("sort");

  return {
    categories: cat ? cat.split(",").filter(Boolean) : [],
    sizes: size ? size.split(",").filter(Boolean) : [],
    colors: color ? color.split(",").filter(Boolean) : [],
    minPrice: minP ? Number(minP) : null,
    maxPrice: maxP ? Number(maxP) : null,
    sort: (["newest", "price_asc", "price_desc", "name_asc"].includes(sort || "")
      ? sort
      : "newest") as TiendaSortOption,
  };
}

function filtersToParams(filters: TiendaFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.categories.length) params.set("cat", filters.categories.join(","));
  if (filters.sizes.length) params.set("size", filters.sizes.join(","));
  if (filters.colors.length) params.set("color", filters.colors.join(","));
  if (filters.minPrice !== null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== null) params.set("maxPrice", String(filters.maxPrice));
  if (filters.sort !== "newest") params.set("sort", filters.sort);
  return params;
}

export interface FacetCounts {
  categories: Record<string, number>;
  sizes: Record<string, number>;
  colors: Record<string, number>;
}

export function useTiendaFilters(products: ProductWithVariants[]) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  const hasActiveFilters = useMemo(
    () =>
      filters.categories.length > 0 ||
      filters.sizes.length > 0 ||
      filters.colors.length > 0 ||
      filters.minPrice !== null ||
      filters.maxPrice !== null,
    [filters]
  );

  // Available facets from ALL products (unfiltered)
  const allFacets = useMemo(() => {
    const cats: Record<string, number> = {};
    const sizes: Record<string, number> = {};
    const colors: Record<string, number> = {};

    for (const p of products) {
      cats[p.category] = (cats[p.category] || 0) + 1;
      for (const v of p.product_variants) {
        if (v.stock > 0) {
          sizes[v.size] = (sizes[v.size] || 0) + 1;
          colors[v.color] = (colors[v.color] || 0) + 1;
        }
      }
    }

    return { categories: cats, sizes, colors } satisfies FacetCounts;
  }, [products]);

  // Filter & sort products
  const filtered = useMemo(() => {
    let result = products;

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter((p) => filters.categories.includes(p.category));
    }

    // Size filter: product must have at least one in-stock variant matching
    if (filters.sizes.length > 0) {
      result = result.filter((p) =>
        p.product_variants.some(
          (v) => v.stock > 0 && filters.sizes.includes(v.size)
        )
      );
    }

    // Color filter
    if (filters.colors.length > 0) {
      result = result.filter((p) =>
        p.product_variants.some(
          (v) => v.stock > 0 && filters.colors.includes(v.color)
        )
      );
    }

    // Price filter
    if (filters.minPrice !== null) {
      result = result.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== null) {
      result = result.filter((p) => p.price <= filters.maxPrice!);
    }

    // Sort
    const sorted = [...result];
    switch (filters.sort) {
      case "price_asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "name_asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
      default:
        sorted.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
    }

    return sorted;
  }, [products, filters]);

  const setFilters = useCallback(
    (update: Partial<TiendaFilters>) => {
      const next = { ...filters, ...update };
      const params = filtersToParams(next);
      const qs = params.toString();
      router.replace(`/tienda${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [filters, router]
  );

  const clearFilters = useCallback(() => {
    const params = filtersToParams({ ...DEFAULT_FILTERS, sort: filters.sort });
    const qs = params.toString();
    router.replace(`/tienda${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [filters.sort, router]);

  const toggleFilter = useCallback(
    (key: "categories" | "sizes" | "colors", value: string) => {
      const current = filters[key];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      setFilters({ [key]: next });
    },
    [filters, setFilters]
  );

  return {
    filters,
    filtered,
    allFacets,
    hasActiveFilters,
    setFilters,
    clearFilters,
    toggleFilter,
  };
}
