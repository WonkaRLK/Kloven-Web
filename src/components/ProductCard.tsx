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
        className="relative aspect-[3/4] w-full overflow-hidden bg-kloven-dark mb-6 cursor-pointer block transition-all duration-300 ease-out group-hover:-translate-y-2 group-hover:shadow-[0_8px_30px_rgba(217,4,41,0.25)]"
      >
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Hover overlay — bottom bar */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300 flex flex-col gap-2 bg-gradient-to-t from-black/80 to-transparent pt-12">
          <span className="w-full bg-kloven-white text-kloven-black py-3 text-sm font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2">
            Ver Producto
            <ShoppingBag className="w-4 h-4" />
          </span>
        </div>
      </Link>

      <div className="text-center w-full px-2">
        <p className="text-xs text-kloven-ash uppercase tracking-widest mb-1">
          {product.category}
        </p>
        <h3 className="font-bold text-lg leading-tight mb-2 truncate text-kloven-white">
          {product.name}
        </h3>
        <span className="font-heading text-2xl text-kloven-red tracking-wider">
          ${product.price.toLocaleString("es-AR")}
        </span>
      </div>
    </div>
  );
}
