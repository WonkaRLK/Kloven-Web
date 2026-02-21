"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { categoryLabels, type Product, type Category } from "@/lib/types";
import { ShoppingBag, Loader2 } from "lucide-react";
import Link from "next/link";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { StaggerContainer, StaggerItem } from "@/components/animations/StaggerChildren";

const CATEGORIES: { id: string; label: string }[] = [
  { id: "all", label: "Todo" },
  ...Object.entries(categoryLabels).map(([id, label]) => ({ id, label })),
];

function TiendaContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cat") || "all";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(catParam);

  useEffect(() => {
    setActiveCategory(catParam);
  }, [catParam]);

  useEffect(() => {
    setLoading(true);
    const url =
      activeCategory === "all"
        ? "/api/products"
        : `/api/products?category=${activeCategory}`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeCategory]);

  return (
    <div className="pt-24">
      {/* Category filters — instant color change, no transition */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.id === "all" ? "/tienda" : `/tienda?cat=${cat.id}`}
              className={`text-xs sm:text-sm font-bold uppercase tracking-widest px-3 sm:px-4 py-2 ${
                activeCategory === cat.id
                  ? "text-kloven-red border-b-2 border-kloven-red"
                  : "text-kloven-ash hover:text-kloven-red"
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>

      <section className="container mx-auto px-4 pb-20">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 sm:gap-0 mb-8 sm:mb-12">
            <div>
              <h2
                className="glitch-text font-heading text-5xl md:text-6xl uppercase tracking-wider"
                data-text={
                  activeCategory === "all"
                    ? "Todos los Productos"
                    : categoryLabels[activeCategory as Category] || "Productos"
                }
              >
                {activeCategory === "all"
                  ? "Todos los Productos"
                  : categoryLabels[activeCategory as Category]}
              </h2>
            </div>
            <span className="text-sm font-bold text-kloven-ash font-mono tabular-nums">
              [{String(products.length).padStart(2, "0")}] items
            </span>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 lg:gap-x-10 gap-y-10 sm:gap-y-16">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-kloven-dark mb-6" />
                <div className="h-4 bg-kloven-dark w-1/3 mx-auto mb-2" />
                <div className="h-5 bg-kloven-dark w-2/3 mx-auto mb-2" />
                <div className="h-6 bg-kloven-dark w-1/4 mx-auto" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 lg:gap-x-10 gap-y-10 sm:gap-y-16">
            {products.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <div className="text-center py-32 bg-kloven-dark border border-dashed border-kloven-smoke">
            <ShoppingBag className="w-12 h-12 mx-auto text-kloven-ash mb-4" />
            <p className="text-kloven-ash text-lg font-medium">
              No hay productos en esta categoria por el momento.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default function TiendaPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-28 flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-kloven-ash" />
        </div>
      }
    >
      <TiendaContent />
    </Suspense>
  );
}
