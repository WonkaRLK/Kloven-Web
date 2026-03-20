"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, X } from "lucide-react";
import type { TiendaFilters } from "@/lib/types";
import type { FacetCounts } from "@/hooks/useTiendaFilters";

interface FilterSidebarProps {
  filters: TiendaFilters;
  facets: FacetCounts;
  hasActiveFilters: boolean;
  onToggle: (key: "categories" | "sizes" | "colors" | "tags", value: string) => void;
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
            ? "bg-kloven-gold border-kloven-gold"
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
  const formatPrice = (val: string) => {
    const num = val.replace(/\D/g, "");
    if (!num) return "";
    return Number(num).toLocaleString("es-AR");
  };

  const parsePrice = (val: string) => {
    const num = val.replace(/\D/g, "");
    return num ? Number(num) : null;
  };

  const [minPrice, setMinPrice] = useState(
    filters.minPrice !== null ? formatPrice(String(filters.minPrice)) : ""
  );
  const [maxPrice, setMaxPrice] = useState(
    filters.maxPrice !== null ? formatPrice(String(filters.maxPrice)) : ""
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const min = parsePrice(minPrice);
      const max = parsePrice(maxPrice);
      if (min !== filters.minPrice || max !== filters.maxPrice) {
        onSetFilters({ minPrice: min, maxPrice: max });
      }
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [minPrice, maxPrice]); // eslint-disable-line react-hooks/exhaustive-deps

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
    <div className="sticky top-24 bg-kloven-carbon border border-kloven-smoke rounded-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-kloven-white">
          Filtros
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-[11px] text-kloven-gold hover:text-kloven-gold/80 transition-colors font-medium flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Limpiar
          </button>
        )}
      </div>

      {/* OFERTAS - highlighted in red */}
      {facets.onSaleCount > 0 && (
        <div className="border-b border-kloven-smoke pb-4 mb-4">
          <button
            type="button"
            onClick={() => onSetFilters({ onSale: !filters.onSale })}
            className="flex items-center gap-2.5 cursor-pointer group py-0.5 w-full text-left"
          >
            <div
              className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-all ${
                filters.onSale
                  ? "bg-kloven-gold border-kloven-gold"
                  : "border-kloven-gold/50 group-hover:border-kloven-gold"
              }`}
            >
              {filters.onSale && (
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
              className={`text-sm font-bold flex-1 transition-colors ${
                filters.onSale ? "text-kloven-gold" : "text-kloven-gold/80 group-hover:text-kloven-gold"
              }`}
            >
              OFERTAS
            </span>
            <span className="text-xs font-medium text-kloven-gold/70 tabular-nums">
              {facets.onSaleCount}
            </span>
          </button>
        </div>
      )}

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

      {/* Etiquetas */}
      {Object.keys(facets.tags).length > 0 && (
        <FilterSection title="Etiquetas" defaultOpen={false}>
          {Object.keys(facets.tags)
            .sort((a, b) => a.localeCompare(b))
            .map((tag) => (
              <CheckboxItem
                key={tag}
                label={tag}
                count={facets.tags[tag]}
                checked={filters.tags.includes(tag)}
                onChange={() => onToggle("tags", tag)}
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
            type="text"
            inputMode="numeric"
            placeholder="Desde"
            value={minPrice}
            onChange={(e) => setMinPrice(formatPrice(e.target.value))}
            className="w-full bg-kloven-carbon border border-kloven-smoke px-3 py-2 text-sm text-kloven-white placeholder-kloven-ash focus:outline-none focus:border-kloven-gold transition-colors"
          />
          <span className="text-kloven-ash text-xs">-</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Hasta"
            value={maxPrice}
            onChange={(e) => setMaxPrice(formatPrice(e.target.value))}
            className="w-full bg-kloven-carbon border border-kloven-smoke px-3 py-2 text-sm text-kloven-white placeholder-kloven-ash focus:outline-none focus:border-kloven-gold transition-colors"
          />
        </div>
      </FilterSection>
    </div>
  );
}
