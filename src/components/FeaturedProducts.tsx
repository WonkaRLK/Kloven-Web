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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

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
      const scale = 1 - ratio * 0.28;
      const opacity = 1 - ratio * 0.45;
      child.style.transform = `scale(${scale})`;
      child.style.opacity = String(Math.max(opacity, 0.45));
    });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    updateScales();
    const onScroll = () => { checkScroll(); updateScales(); };
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [products, checkScroll, updateScales]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = (el.children[0] as HTMLElement)?.offsetWidth ?? 256;
    el.scrollBy({ left: dir === "left" ? -(cardWidth + 16) : (cardWidth + 16), behavior: "smooth" });
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
          {/* Left arrow — outside the scroll area, centered with card image */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="carousel-arrow absolute -left-12 top-[40%] -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-4 h-4 relative z-10" />
            </button>
          )}

          {/* Right arrow — outside the scroll area, centered with card image */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="carousel-arrow absolute -right-12 top-[40%] -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-4 h-4 relative z-10" />
            </button>
          )}

          {/* Edge fades */}
          {canScrollLeft && (
            <div
              className="absolute left-0 top-0 bottom-4 w-32 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to right, var(--background) 30%, transparent)" }}
            />
          )}
          {canScrollRight && (
            <div
              className="absolute right-0 top-0 bottom-4 w-32 z-10 pointer-events-none"
              style={{ background: "linear-gradient(to left, var(--background) 30%, transparent)" }}
            />
          )}

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="w-44 sm:w-56 md:w-64 shrink-0"
                style={{ transition: "transform 0.15s ease-out, opacity 0.15s ease-out", transformOrigin: "center top" }}
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
    <section className="container mx-auto px-14 sm:px-16 pt-4 pb-12 sm:pt-6 sm:pb-24 relative z-20">
      <ScrollReveal>
        <div className="mb-6 sm:mb-8">
          <GlitchText
            text="Últimos Drops"
            className="font-heading text-2xl sm:text-3xl md:text-4xl uppercase tracking-wider"
          />
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
        <div className="space-y-8 md:space-y-14">
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
