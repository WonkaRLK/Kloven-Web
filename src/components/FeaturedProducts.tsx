"use client";

import { useEffect, useState, useRef } from "react";
import ProductCard from "./ProductCard";
import type { Product, Category } from "@/lib/types";
import ScrollReveal from "@/components/animations/ScrollReveal";
import GlitchText from "@/components/animations/GlitchText";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CategorySection {
  category: Category;
  products: Product[];
}

function CategoryRow({ category, products }: CategorySection) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [products]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  return (
    <div id={category.slug}>
      <ScrollReveal>
        <div className="flex items-end justify-between mb-5 md:mb-8 border-b border-kloven-smoke pb-3 md:pb-4">
          <GlitchText
            text={category.name}
            className="font-heading text-xl sm:text-3xl md:text-4xl uppercase tracking-wider"
          />
          <span className="text-[10px] md:text-xs font-bold text-kloven-ash font-mono tabular-nums">
            [{String(products.length).padStart(2, "0")}]
          </span>
        </div>
      </ScrollReveal>

      {products.length > 0 ? (
        <div className="relative group/row">
          {/* Left arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-9 h-9 bg-kloven-black border border-kloven-smoke flex items-center justify-center text-kloven-white hover:border-kloven-gold hover:text-kloven-gold transition-colors shadow-lg"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Right arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-9 h-9 bg-kloven-black border border-kloven-smoke flex items-center justify-center text-kloven-white hover:border-kloven-gold hover:text-kloven-gold transition-colors shadow-lg"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          >
            {products.map((product) => (
              <div key={product.id} className="w-44 sm:w-56 md:w-64 shrink-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 md:py-16 border border-dashed border-kloven-smoke">
          <p className="text-kloven-ash text-xs md:text-sm font-medium uppercase tracking-widest">
            Proximamente
          </p>
        </div>
      )}
    </div>
  );
}

export default function FeaturedProducts() {
  const [sections, setSections] = useState<CategorySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ])
      .then(([cats, prods]) => {
        const categories: Category[] = Array.isArray(cats) ? cats : [];
        const products: Product[] = Array.isArray(prods) ? prods : [];
        setTotalCount(products.length);
        setSections(
          categories.map((cat) => ({
            category: cat,
            products: products.filter((p) => p.category === cat.slug),
          }))
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="container mx-auto px-4 py-12 sm:py-24 relative z-20">
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 sm:gap-0 mb-6 sm:mb-8">
          <GlitchText
            text="Últimos Drops"
            className="font-heading text-3xl sm:text-5xl md:text-6xl uppercase tracking-wider"
          />
          <span className="text-sm font-bold text-kloven-ash font-mono tabular-nums">
            [{String(totalCount).padStart(2, "0")}] items
          </span>
        </div>
      </ScrollReveal>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-kloven-dark mb-4" />
              <div className="h-3 bg-kloven-dark w-1/3 mx-auto mb-2" />
              <div className="h-4 bg-kloven-dark w-2/3 mx-auto mb-2" />
              <div className="h-5 bg-kloven-dark w-1/4 mx-auto" />
            </div>
          ))}
        </div>
      ) : sections.length > 0 ? (
        <div className="space-y-12 md:space-y-24">
          {sections.map((section) => (
            <CategoryRow key={section.category.slug} {...section} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-kloven-dark border border-dashed border-kloven-smoke">
          <p className="text-kloven-ash text-lg font-medium">
            Proximamente nuevos productos.
          </p>
        </div>
      )}
    </section>
  );
}
