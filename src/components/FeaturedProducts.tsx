"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/types";

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
    <section className="container mx-auto px-4 py-12 sm:py-20 bg-white relative z-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 sm:gap-0 mb-10 sm:mb-16">
        <div>
          <span className="text-kloven-red font-bold uppercase tracking-widest text-sm mb-2 block">
            Coleccion
          </span>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
            Ultimos Drops
          </h2>
        </div>
        <span className="text-sm font-bold text-gray-400 border-b border-gray-200 pb-1">
          {products.length} productos
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 lg:gap-x-10 gap-y-10 sm:gap-y-16">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-gray-200 rounded-sm mb-6" />
              <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-2" />
              <div className="h-5 bg-gray-200 rounded w-2/3 mx-auto mb-2" />
              <div className="h-6 bg-gray-200 rounded w-1/4 mx-auto" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 lg:gap-x-10 gap-y-10 sm:gap-y-16">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <p className="text-gray-500 text-lg font-medium">
            Proximamente nuevos productos.
          </p>
        </div>
      )}
    </section>
  );
}
