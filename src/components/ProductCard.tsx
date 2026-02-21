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
        className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100 mb-6 cursor-pointer rounded-sm shadow-sm hover:shadow-xl transition-all duration-300 block"
      >
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Hover overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col gap-2 bg-gradient-to-t from-black/80 to-transparent pt-12">
          <span className="w-full bg-white text-black py-3 text-sm font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2">
            Ver Producto
            <ShoppingBag className="w-4 h-4" />
          </span>
        </div>

        {/* Badge */}
        <div className="absolute top-3 left-3 bg-black text-white text-[10px] uppercase font-bold px-2 py-1 tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
          Nuevo
        </div>
      </Link>

      <div className="text-center w-full px-2">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
          {product.category}
        </p>
        <h3 className="font-bold text-lg leading-tight mb-2 truncate">
          {product.name}
        </h3>
        <span className="font-black text-xl">
          ${product.price.toLocaleString("es-AR")}
        </span>
      </div>
    </div>
  );
}
