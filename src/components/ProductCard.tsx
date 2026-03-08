"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group flex flex-col items-center">
      <Link
        href={`/producto/${product.slug}`}
        className="relative aspect-[3/4] w-full overflow-hidden bg-kloven-dark mb-3 sm:mb-4 cursor-pointer block transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:shadow-[0_6px_24px_rgba(0,0,0,0.4)]"
      >
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Discount badge */}
        {product.compare_at_price && product.compare_at_price > product.price && (
          <span className="absolute top-2 left-2 bg-kloven-red text-white text-[10px] sm:text-xs font-bold px-2 py-1 uppercase tracking-wider z-10">
            {Math.round((1 - product.price / product.compare_at_price) * 100)}% OFF
          </span>
        )}

        {/* Hover overlay — bottom bar */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300 flex flex-col gap-2 bg-gradient-to-t from-black/80 to-transparent pt-10">
          <span className="w-full bg-kloven-white text-kloven-black py-2.5 text-xs font-bold uppercase tracking-widest text-center flex items-center justify-center gap-1.5">
            Ver Producto
            <ShoppingBag className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>

      <div className="text-center w-full px-1">
        <p className="text-[10px] text-kloven-ash uppercase tracking-widest mb-0.5">
          {product.category}
        </p>
        <h3 className="font-bold text-sm sm:text-base leading-tight mb-1 truncate text-kloven-white">
          {product.name}
        </h3>
        <div className="flex items-center justify-center gap-1.5">
          <span className="font-heading text-lg sm:text-xl text-kloven-red tracking-wider">
            ${product.price.toLocaleString("es-AR")}
          </span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-sm text-kloven-ash line-through">
              ${product.compare_at_price.toLocaleString("es-AR")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
