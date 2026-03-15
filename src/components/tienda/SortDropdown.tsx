"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { TiendaSortOption } from "@/lib/types";

const SORT_OPTIONS: { value: TiendaSortOption; label: string }[] = [
  { value: "newest", label: "Mas recientes" },
  { value: "price_asc", label: "Precio menor" },
  { value: "price_desc", label: "Precio mayor" },
  { value: "name_asc", label: "Nombre A-Z" },
];

interface SortDropdownProps {
  value: TiendaSortOption;
  onChange: (value: TiendaSortOption) => void;
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = SORT_OPTIONS.find((o) => o.value === value) || SORT_OPTIONS[0];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-kloven-ash hover:text-kloven-white transition-colors border border-kloven-smoke px-3 py-2 bg-kloven-carbon"
      >
        <span className="text-[10px] uppercase tracking-widest font-bold text-kloven-ash mr-1 hidden sm:inline">
          Ordenar:
        </span>
        <span className="text-kloven-white text-sm">{current.label}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1 w-48 bg-kloven-carbon border border-kloven-smoke shadow-xl z-30"
          >
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  option.value === value
                    ? "text-kloven-gold font-medium bg-kloven-dark"
                    : "text-kloven-ash hover:text-kloven-white hover:bg-kloven-dark"
                }`}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
