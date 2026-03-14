"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Package } from "lucide-react";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group block rounded-2xl overflow-hidden bg-kloven-dark/60 border border-white/10 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:border-white/20"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Combo badge */}
        {product.is_combo && (
          <span className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider z-10 flex items-center gap-1">
            <Package className="w-3 h-3" />
            COMBO
          </span>
        )}

        {/* Discount badge */}
        {product.compare_at_price && product.compare_at_price > product.price && (
          <span className="absolute top-2 left-2 bg-kloven-red text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider z-10">
            {Math.round((1 - product.price / product.compare_at_price) * 100)}% OFF
          </span>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300 flex flex-col gap-2 bg-gradient-to-t from-black/80 to-transparent pt-10">
          <span className="w-full bg-kloven-white text-kloven-black py-2.5 text-xs font-bold uppercase tracking-widest text-center flex items-center justify-center gap-1.5 rounded-lg">
            Ver Producto
            <ShoppingBag className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="px-3 py-3 sm:px-4 sm:py-4">
        <h3 className="font-bold text-sm sm:text-base leading-tight truncate text-kloven-white">
          {product.name}
        </h3>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-sm sm:text-base font-light text-kloven-white/80 tracking-wider">
            ${product.price.toLocaleString("es-AR")}
          </span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-xs text-kloven-ash line-through">
              ${product.compare_at_price.toLocaleString("es-AR")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
