"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import type { TiendaFilters } from "@/lib/types";
import type { FacetCounts } from "@/hooks/useTiendaFilters";

interface FilterSidebarProps {
  filters: TiendaFilters;
  facets: FacetCounts;
  hasActiveFilters: boolean;
  onToggle: (key: "categories" | "sizes" | "colors", value: string) => void;
  onSetFilters: (update: Partial<TiendaFilters>) => void;
  onClear: () => void;
  categoryMap: Record<string, string>;
}

function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-kloven-smoke pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left group"
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-kloven-ash group-hover:text-kloven-white transition-colors">
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-kloven-ash transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <div className="mt-3 space-y-1.5">{children}</div>}
    </div>
  );
}

function CheckboxItem({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center gap-2.5 cursor-pointer group py-0.5 w-full text-left"
    >
      <div
        className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-all ${
          checked
            ? "bg-kloven-red border-kloven-red"
            : "border-kloven-smoke group-hover:border-kloven-ash"
        }`}
      >
        {checked && (
          <svg
            className="w-2.5 h-2.5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      <span
        className={`text-sm flex-1 transition-colors ${
          checked ? "text-kloven-white font-medium" : "text-kloven-ash group-hover:text-kloven-white"
        }`}
      >
        {label}
      </span>
      <span className="text-xs text-kloven-ash tabular-nums">{count}</span>
    </button>
  );
}

export default function FilterSidebar({
  filters,
  facets,
  hasActiveFilters,
  onToggle,
  onSetFilters,
  onClear,
  categoryMap,
}: FilterSidebarProps) {
  const [minPrice, setMinPrice] = useState(
    filters.minPrice !== null ? String(filters.minPrice) : ""
  );
  const [maxPrice, setMaxPrice] = useState(
    filters.maxPrice !== null ? String(filters.maxPrice) : ""
  );

  const handleApplyPrice = () => {
    onSetFilters({
      minPrice: minPrice ? Number(minPrice) : null,
      maxPrice: maxPrice ? Number(maxPrice) : null,
    });
  };

  // Sort sizes in a logical order
  const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
  const sortedSizes = Object.keys(facets.sizes).sort((a, b) => {
    const ia = sizeOrder.indexOf(a);
    const ib = sizeOrder.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });

  const sortedCategories = Object.keys(facets.categories).sort((a, b) =>
    a.localeCompare(b)
  );

  const sortedColors = Object.keys(facets.colors).sort((a, b) =>
    a.localeCompare(b)
  );

  return (
    <div className="sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-kloven-white">
          Filtros
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-[11px] text-kloven-red hover:text-kloven-red-dark transition-colors font-medium flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Limpiar
          </button>
        )}
      </div>

      {/* Categories */}
      {sortedCategories.length > 0 && (
        <FilterSection title="Categorias">
          {sortedCategories.map((cat) => (
            <CheckboxItem
              key={cat}
              label={categoryMap[cat] || cat}
              count={facets.categories[cat]}
              checked={filters.categories.includes(cat)}
              onChange={() => onToggle("categories", cat)}
            />
          ))}
        </FilterSection>
      )}

      {/* Sizes */}
      {sortedSizes.length > 0 && (
        <FilterSection title="Talles">
          {sortedSizes.map((size) => (
            <CheckboxItem
              key={size}
              label={size}
              count={facets.sizes[size]}
              checked={filters.sizes.includes(size)}
              onChange={() => onToggle("sizes", size)}
            />
          ))}
        </FilterSection>
      )}

      {/* Colors */}
      {sortedColors.length > 0 && (
        <FilterSection title="Color">
          {sortedColors.map((color) => (
            <CheckboxItem
              key={color}
              label={color}
              count={facets.colors[color]}
              checked={filters.colors.includes(color)}
              onChange={() => onToggle("colors", color)}
            />
          ))}
        </FilterSection>
      )}

      {/* Price range */}
      <FilterSection title="Precio">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Desde"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full bg-kloven-carbon border border-kloven-smoke px-3 py-2 text-sm text-kloven-white placeholder-kloven-ash focus:outline-none focus:border-kloven-red transition-colors"
          />
          <span className="text-kloven-ash text-xs">-</span>
          <input
            type="number"
            placeholder="Hasta"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full bg-kloven-carbon border border-kloven-smoke px-3 py-2 text-sm text-kloven-white placeholder-kloven-ash focus:outline-none focus:border-kloven-red transition-colors"
          />
        </div>
        <button
          onClick={handleApplyPrice}
          className="w-full mt-2 bg-kloven-carbon border border-kloven-smoke text-kloven-white text-xs font-bold uppercase tracking-widest py-2 hover:border-kloven-red hover:text-kloven-red transition-colors"
        >
          Aplicar
        </button>
      </FilterSection>
    </div>
  );
}
