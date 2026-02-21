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
        className="relative aspect-[3/4] w-full overflow-hidden bg-kloven-dark mb-6 cursor-pointer block group-hover:animate-[cardShake_0.3s_steps(4)_infinite]"
      >
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover group-hover:brightness-110 group-hover:saturate-150"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Red overlay on hover — instant */}
        <div className="absolute inset-0 bg-kloven-red/0 group-hover:bg-kloven-red/15" />

        {/* Hover overlay — bottom bar */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-0 md:translate-y-full md:group-hover:translate-y-0 flex flex-col gap-2 bg-gradient-to-t from-black/80 to-transparent pt-12" style={{ transition: "transform 0s" }}>
          <span className="w-full bg-kloven-white text-kloven-black py-3 text-sm font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2">
            Ver Producto
            <ShoppingBag className="w-4 h-4" />
          </span>
        </div>

        {/* Badge — with noise effect */}
        <div className="absolute top-3 left-3 bg-kloven-red text-white text-[10px] uppercase font-bold px-2 py-1 tracking-wider opacity-0 group-hover:opacity-100 bg-[length:100px_100px]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E\")", backgroundBlendMode: "overlay" }}>
          Nuevo
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
