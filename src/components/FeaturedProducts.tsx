"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/types";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { StaggerContainer, StaggerItem } from "@/components/animations/StaggerChildren";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?featured=true")
      .then((r) => r.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="container mx-auto px-4 py-12 sm:py-24 relative z-20">
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 sm:gap-0 mb-10 sm:mb-16">
          <div>
            <h2
              className="glitch-text font-heading text-5xl md:text-6xl uppercase tracking-wider"
              data-text="Ultimos Drops"
            >
              Ultimos Drops
            </h2>
          </div>
          <span className="text-sm font-bold text-kloven-ash font-mono tabular-nums">
            [{String(products.length).padStart(2, "0")}] items
          </span>
        </div>
      </ScrollReveal>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 lg:gap-x-10 gap-y-10 sm:gap-y-16">
          {[1, 2, 3].map((i) => (
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
          <p className="text-kloven-ash text-lg font-medium">
            Proximamente nuevos productos.
          </p>
        </div>
      )}
    </section>
  );
}
