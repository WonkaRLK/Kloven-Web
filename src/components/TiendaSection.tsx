"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { ProductWithVariants, Category } from "@/lib/types";
import { ShoppingBag, XCircle } from "lucide-react";
import ScrollReveal from "@/components/animations/ScrollReveal";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/StaggerChildren";
import GlitchText from "@/components/animations/GlitchText";
import { useTiendaFilters } from "@/hooks/useTiendaFilters";
import FilterSidebar from "@/components/tienda/FilterSidebar";
import MobileFilterDrawer from "@/components/tienda/MobileFilterDrawer";
import TopBar from "@/components/tienda/TopBar";

interface TiendaSectionProps {
  title?: string;
  showPaddingTop?: boolean;
}

export default function TiendaSection({
  title = "Tienda",
  showPaddingTop = true,
}: TiendaSectionProps) {
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const {
    filters,
    filtered,
    allFacets,
    hasActiveFilters,
    setFilters,
    clearFilters,
    toggleFilter,
  } = useTiendaFilters(products);

  // Fetch categories
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: Category[]) => {
        if (Array.isArray(data)) {
          const map: Record<string, string> = {};
          data.forEach((c) => (map[c.slug] = c.name));
          setCategoryMap(map);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch all products (with variants) once
  useEffect(() => {
    setLoading(true);
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className={showPaddingTop ? "pt-24" : ""}>
      <section className="max-w-[1600px] mx-auto px-4 lg:pl-4 lg:pr-8 pb-20">
        {/* Title */}
        <ScrollReveal>
          <div className="mb-8 sm:mb-10">
            <GlitchText
              text={title}
              className="font-heading text-3xl sm:text-5xl md:text-6xl uppercase tracking-wider"
            />
          </div>
        </ScrollReveal>

        {loading ? (
          /* Skeleton loader */
          <div className="flex gap-5 lg:gap-6">
            {/* Sidebar skeleton - desktop only */}
            <div className="hidden lg:block w-64 flex-shrink-0 space-y-6">
              <div className="h-4 bg-kloven-dark w-20 mb-6" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-3 bg-kloven-dark w-24" />
                  <div className="h-4 bg-kloven-dark w-full" />
                  <div className="h-4 bg-kloven-dark w-3/4" />
                  <div className="h-4 bg-kloven-dark w-1/2" />
                </div>
              ))}
            </div>
            {/* Grid skeleton */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <div className="h-5 bg-kloven-dark w-32 animate-pulse" />
                <div className="h-10 bg-kloven-dark w-40 animate-pulse" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 sm:gap-x-5 lg:gap-x-6 gap-y-8 sm:gap-y-10">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-kloven-dark mb-4" />
                    <div className="h-3 bg-kloven-dark w-1/3 mx-auto mb-2" />
                    <div className="h-4 bg-kloven-dark w-2/3 mx-auto mb-2" />
                    <div className="h-5 bg-kloven-dark w-1/4 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-5 lg:gap-6">
            {/* Sidebar - desktop only */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <FilterSidebar
                filters={filters}
                facets={allFacets}
                hasActiveFilters={hasActiveFilters}
                onToggle={toggleFilter}
                onSetFilters={setFilters}
                onClear={clearFilters}
                categoryMap={categoryMap}
              />
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <TopBar
                resultCount={filtered.length}
                filters={filters}
                onSortChange={(sort) => setFilters({ sort })}
                onToggle={toggleFilter}
                onSetFilters={setFilters}
                hasActiveFilters={hasActiveFilters}
                onOpenMobileFilters={() => setMobileFiltersOpen(true)}
                categoryMap={categoryMap}
              />

              {filtered.length > 0 ? (
                <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 sm:gap-x-5 lg:gap-x-6 gap-y-8 sm:gap-y-10">
                  {filtered.map((product) => (
                    <StaggerItem key={product.id}>
                      <ProductCard product={product} />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              ) : (
                <div className="text-center py-32 bg-kloven-dark border border-dashed border-kloven-smoke">
                  <ShoppingBag className="w-12 h-12 mx-auto text-kloven-ash mb-4" />
                  <p className="text-kloven-ash text-lg font-medium mb-4">
                    No hay productos que coincidan con los filtros.
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center gap-2 text-kloven-gold hover:text-kloven-gold/80 transition-colors font-bold text-sm uppercase tracking-widest"
                    >
                      <XCircle className="w-4 h-4" />
                      Limpiar filtros
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Mobile filter drawer */}
      <MobileFilterDrawer
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        resultCount={filtered.length}
        filters={filters}
        facets={allFacets}
        hasActiveFilters={hasActiveFilters}
        onToggle={toggleFilter}
        onSetFilters={setFilters}
        onClear={clearFilters}
        categoryMap={categoryMap}
      />
    </div>
  );
}
