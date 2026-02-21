"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { categoryLabels, type Product, type Category } from "@/lib/types";
import { ShoppingBag, Loader2 } from "lucide-react";
import Link from "next/link";

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
      {/* Category filters */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.id === "all" ? "/tienda" : `/tienda?cat=${cat.id}`}
              className={`text-xs sm:text-sm font-bold uppercase tracking-widest px-3 sm:px-4 py-2 transition-all ${
                activeCategory === cat.id
                  ? "text-black border-b-2 border-black"
                  : "text-gray-400 hover:text-black"
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>

      <section className="container mx-auto px-4 pb-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 sm:gap-0 mb-8 sm:mb-12">
          <div>
            <span className="text-kloven-red font-bold uppercase tracking-widest text-sm mb-2 block">
              Catalogo
            </span>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
              {activeCategory === "all"
                ? "Todos los Productos"
                : categoryLabels[activeCategory as Category]}
            </h2>
          </div>
          <span className="text-sm font-bold text-gray-400 border-b border-gray-200 pb-1">
            {products.length} productos
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 lg:gap-x-10 gap-y-10 sm:gap-y-16">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
            <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-medium">
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
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <TiendaContent />
    </Suspense>
  );
}
