"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FilterSidebar from "./FilterSidebar";
import type { TiendaFilters } from "@/lib/types";
import type { FacetCounts } from "@/hooks/useTiendaFilters";

interface MobileFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  resultCount: number;
  filters: TiendaFilters;
  facets: FacetCounts;
  hasActiveFilters: boolean;
  onToggle: (key: "categories" | "sizes" | "colors" | "tags", value: string) => void;
  onSetFilters: (update: Partial<TiendaFilters>) => void;
  onClear: () => void;
  categoryMap: Record<string, string>;
  categoryOrder: string[];
}

export default function MobileFilterDrawer({
  open,
  onClose,
  resultCount,
  filters,
  facets,
  hasActiveFilters,
  onToggle,
  onSetFilters,
  onClear,
  categoryMap,
  categoryOrder,
}: MobileFilterDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Drawer - slides from left */}
      <motion.div
        className="fixed top-0 left-0 h-full w-[calc(100%-1.5rem)] max-w-sm bg-kloven-dark z-50 shadow-2xl flex flex-col border-r border-kloven-smoke"
        initial={false}
        animate={{ x: open ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-kloven-smoke flex items-center justify-between">
          <h2 className="font-heading text-xl uppercase tracking-wider text-kloven-white">
            Filtros
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-kloven-carbon rounded-full transition-colors group"
          >
            <X className="w-6 h-6 text-kloven-ash group-hover:text-kloven-white group-hover:rotate-90 transition-all" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <FilterSidebar
            filters={filters}
            facets={facets}
            hasActiveFilters={hasActiveFilters}
            onToggle={onToggle}
            onSetFilters={onSetFilters}
            onClear={onClear}
            categoryMap={categoryMap}
            categoryOrder={categoryOrder}
          />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-kloven-smoke">
          <button
            onClick={onClose}
            className="w-full bg-kloven-gold text-white py-3.5 font-bold uppercase tracking-widest text-sm hover:bg-kloven-gold/80 transition-colors"
          >
            Ver {resultCount} {resultCount === 1 ? "producto" : "productos"}
          </button>
        </div>
      </motion.div>
    </>
  );
}
