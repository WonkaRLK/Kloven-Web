"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import ProductCard from "./ProductCard";
import type { Product, Category } from "@/lib/types";
import ScrollReveal from "@/components/animations/ScrollReveal";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/StaggerChildren";
import GlitchText from "@/components/animations/GlitchText";

interface CategorySection {
  category: Category;
  products: Product[];
}

export default function FeaturedProducts() {
  const [sections, setSections] = useState<CategorySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [activeSlug, setActiveSlug] = useState<string>("");
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const navRef = useRef<HTMLDivElement>(null);
  const isClickScrolling = useRef(false);

  // Fetch categories + products in parallel
  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ])
      .then(([cats, prods]) => {
        const categories: Category[] = Array.isArray(cats) ? cats : [];
        const products: Product[] = Array.isArray(prods) ? prods : [];

        setTotalCount(products.length);

        // Group products by category slug, show ALL categories
        const grouped: CategorySection[] = categories.map((cat) => ({
          category: cat,
          products: products.filter((p) => p.category === cat.slug),
        }));

        setSections(grouped);
        if (grouped.length > 0) {
          setActiveSlug(grouped[0].category.slug);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // IntersectionObserver for active section detection
  useEffect(() => {
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSlug(entry.target.id);
          }
        }
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
    );

    sectionRefs.current.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = useCallback((slug: string) => {
    const el = sectionRefs.current.get(slug);
    if (!el) return;

    setActiveSlug(slug);
    isClickScrolling.current = true;

    // offset for navbar (80px) + sticky bar (~56px) + gap
    const y = el.getBoundingClientRect().top + window.scrollY - 148;
    window.scrollTo({ top: y, behavior: "smooth" });

    // Re-enable observer after scroll settles
    setTimeout(() => {
      isClickScrolling.current = false;
    }, 800);
  }, []);

  const setSectionRef = useCallback(
    (slug: string) => (el: HTMLElement | null) => {
      if (el) sectionRefs.current.set(slug, el);
      else sectionRefs.current.delete(slug);
    },
    []
  );

  return (
    <section className="container mx-auto px-4 py-12 sm:py-24 relative z-20">
      {/* Header */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 sm:gap-0 mb-6 sm:mb-8">
          <div>
            <GlitchText
              text="Últimos Drops"
              className="font-heading text-3xl sm:text-5xl md:text-6xl uppercase tracking-wider"
            />
          </div>
          <span className="text-sm font-bold text-kloven-ash font-mono tabular-nums">
            [{String(totalCount).padStart(2, "0")}] items
          </span>
        </div>
      </ScrollReveal>

      {/* Sticky category navigation */}
      {!loading && sections.length > 0 && (
        <div
          ref={navRef}
          className="sticky top-20 z-10 -mx-4 px-4 py-3 mb-8 sm:mb-12 bg-kloven-black/90 backdrop-blur-md border-y border-kloven-smoke"
        >
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {sections.map(({ category }) => (
              <button
                key={category.slug}
                onClick={() => scrollTo(category.slug)}
                className={`shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all duration-200 ${
                  activeSlug === category.slug
                    ? "bg-kloven-red border-kloven-red text-white"
                    : "border-kloven-smoke text-kloven-ash hover:text-kloven-white hover:border-kloven-white"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-3 sm:gap-x-5 lg:gap-x-6 gap-y-8 sm:gap-y-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-kloven-dark mb-6" />
              <div className="h-4 bg-kloven-dark w-1/3 mx-auto mb-2" />
              <div className="h-5 bg-kloven-dark w-2/3 mx-auto mb-2" />
              <div className="h-6 bg-kloven-dark w-1/4 mx-auto" />
            </div>
          ))}
        </div>
      ) : sections.length > 0 ? (
        <div className="space-y-16 sm:space-y-24">
          {sections.map(({ category, products }) => (
            <div
              key={category.slug}
              id={category.slug}
              ref={setSectionRef(category.slug)}
            >
              <ScrollReveal>
                <div className="flex items-end justify-between mb-8 sm:mb-12 border-b border-kloven-smoke pb-4">
                  <GlitchText
                    text={category.name}
                    className="font-heading text-2xl sm:text-3xl md:text-4xl uppercase tracking-wider"
                  />
                  <span className="text-xs font-bold text-kloven-ash font-mono tabular-nums">
                    [{String(products.length).padStart(2, "0")}]
                  </span>
                </div>
              </ScrollReveal>

              {products.length > 0 ? (
                <StaggerContainer className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-3 sm:gap-x-5 lg:gap-x-6 gap-y-8 sm:gap-y-10">
                  {products.map((product) => (
                    <StaggerItem key={product.id}>
                      <ProductCard product={product} />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              ) : (
                <div className="text-center py-16 border border-dashed border-kloven-smoke">
                  <p className="text-kloven-ash text-sm font-medium uppercase tracking-widest">
                    Proximamente
                  </p>
                </div>
              )}
            </div>
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
