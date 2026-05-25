"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const infinite = products.length > 1;
  const displayProducts = infinite
    ? [...products, ...products, ...products]
    : products;

  const updateScales = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const containerCenter = el.scrollLeft + el.clientWidth / 2;
    const children = Array.from(el.children) as HTMLElement[];
    children.forEach((child) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const distance = Math.abs(containerCenter - childCenter);
      const maxDist = el.clientWidth * 0.55;
      const ratio = Math.min(distance / maxDist, 1);
      child.style.transform = `scale(${1 - ratio * 0.28})`;
      child.style.opacity = String(Math.max(1 - ratio * 0.45, 0.45));
    });
  }, []);

  // Silently snap back to middle third — called only AFTER scroll animation ends
  const loopReset = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !infinite) return;
    const third = el.scrollWidth / 3;
    if (el.scrollLeft < third * 0.3) {
      el.scrollLeft += third;
      updateScales();
    } else if (el.scrollLeft > third * 1.7) {
      el.scrollLeft -= third;
      updateScales();
    }
  }, [infinite, updateScales]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !infinite) return;
    el.scrollLeft = el.scrollWidth / 3;
    updateScales();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScales();

    const scheduleReset = () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      // Fallback: fire 600ms after last scroll event (covers browsers without scrollend)
      resetTimerRef.current = setTimeout(loopReset, 600);
    };

    const onScroll = () => {
      updateScales();
      scheduleReset();
    };

    // scrollend fires after smooth scroll AND inertia both finish — perfect timing
    const onScrollEnd = () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      loopReset();
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("scrollend", onScrollEnd);
    window.addEventListener("resize", updateScales);
    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("scrollend", onScrollEnd);
      window.removeEventListener("resize", updateScales);
    };
  }, [products, updateScales, loopReset]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = (el.children[0] as HTMLElement)?.offsetWidth ?? 256;
    el.scrollBy({ left: dir === "left" ? -(cardWidth + 16) : (cardWidth + 16), behavior: "smooth" });
  };

  return (
    <div id={category.slug} className="mb-4 md:mb-6">
      <ScrollReveal>
        <div className="flex items-end justify-between px-4 sm:px-8 mb-5 md:mb-8 border-b border-kloven-smoke pb-3 md:pb-4">
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
          {/* Arrows at the outer edges — px-24 on scroll div keeps cards well clear */}
          <button
            onClick={() => scroll("left")}
            className="carousel-arrow absolute left-0 top-[40%] -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5 relative z-10" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="carousel-arrow absolute right-0 top-[40%] -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-5 h-5 relative z-10" />
          </button>

          {/* Edge fades — cover the full padding zone so no card bleeds under arrows */}
          <div
            className="absolute left-0 top-0 bottom-4 w-28 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to right, var(--background) 40%, transparent)" }}
          />
          <div
            className="absolute right-0 top-0 bottom-4 w-28 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to left, var(--background) 40%, transparent)" }}
          />

          {/* px-24 = 96px padding each side; arrow is 40px wide → 56px gap before first card */}
          <div
            ref={scrollRef}
            className="flex items-center gap-4 overflow-x-auto scrollbar-hide pt-10 pb-4 -mt-10 px-24"
          >
            {displayProducts.map((product, idx) => (
              <div
                key={`${product.id}-${idx}`}
                className="w-44 sm:w-56 md:w-64 shrink-0"
                style={{ transition: "transform 0.15s ease-out, opacity 0.15s ease-out", transformOrigin: "center center" }}
              >
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

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ])
      .then(([cats, prods]) => {
        const categories: Category[] = Array.isArray(cats) ? cats : [];
        const products: Product[] = Array.isArray(prods) ? prods : [];
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
    <section className="container mx-auto pt-2 pb-12 sm:pt-4 sm:pb-24 relative z-20">
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
        <div className="space-y-4 md:space-y-6">
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
