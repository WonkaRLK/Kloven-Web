"use client";

import { SlidersHorizontal, X } from "lucide-react";
import SortDropdown from "./SortDropdown";
import type { TiendaFilters, TiendaSortOption } from "@/lib/types";

interface TopBarProps {
  resultCount: number;
  filters: TiendaFilters;
  onSortChange: (sort: TiendaSortOption) => void;
  onToggle: (key: "categories" | "sizes" | "colors" | "tags", value: string) => void;
  onSetFilters: (update: Partial<TiendaFilters>) => void;
  hasActiveFilters: boolean;
  onOpenMobileFilters: () => void;
  categoryMap: Record<string, string>;
}

export default function TopBar({
  resultCount,
  filters,
  onSortChange,
  onToggle,
  onSetFilters,
  hasActiveFilters,
  onOpenMobileFilters,
  categoryMap,
}: TopBarProps) {
  // Build active filter tags
  const tags: { key: string; label: string; onRemove: () => void }[] = [];

  if (filters.onSale) {
    tags.push({
      key: "sale",
      label: "En oferta",
      onRemove: () => onSetFilters({ onSale: false }),
    });
  }
  for (const cat of filters.categories) {
    tags.push({
      key: `cat-${cat}`,
      label: categoryMap[cat] || cat,
      onRemove: () => onToggle("categories", cat),
    });
  }
  for (const tag of filters.tags) {
    tags.push({
      key: `tag-${tag}`,
      label: tag,
      onRemove: () => onToggle("tags", tag),
    });
  }
  for (const size of filters.sizes) {
    tags.push({
      key: `size-${size}`,
      label: `Talle ${size}`,
      onRemove: () => onToggle("sizes", size),
    });
  }
  for (const color of filters.colors) {
    tags.push({
      key: `color-${color}`,
      label: color,
      onRemove: () => onToggle("colors", color),
    });
  }
  if (filters.minPrice !== null || filters.maxPrice !== null) {
    const parts = [];
    if (filters.minPrice !== null) parts.push(`$${filters.minPrice}`);
    if (filters.maxPrice !== null) parts.push(`$${filters.maxPrice}`);
    tags.push({
      key: "price",
      label: `Precio: ${parts.join(" - ")}`,
      onRemove: () => onSetFilters({ minPrice: null, maxPrice: null }),
    });
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-4">
        {/* Left: mobile filter button + count */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileFilters}
            className="lg:hidden flex items-center gap-2 text-sm text-kloven-ash hover:text-kloven-white transition-colors border border-kloven-smoke px-3 py-2 bg-kloven-carbon"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="font-bold uppercase tracking-widest text-[10px]">
              Filtros
            </span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-kloven-gold" />
            )}
          </button>
          <span className="text-sm text-kloven-ash font-mono tabular-nums">
            [{String(resultCount).padStart(2, "0")}]{" "}
            {resultCount === 1 ? "producto" : "productos"}
          </span>
        </div>

        {/* Right: sort */}
        <SortDropdown value={filters.sort} onChange={onSortChange} />
      </div>

      {/* Active filter tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag) => (
            <button
              key={tag.key}
              onClick={tag.onRemove}
              className="flex items-center gap-1.5 bg-kloven-carbon border border-kloven-smoke px-2.5 py-1 text-xs text-kloven-ash hover:text-kloven-white hover:border-kloven-gold transition-colors group"
            >
              {tag.label}
              <X className="w-3 h-3 group-hover:text-kloven-gold" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
