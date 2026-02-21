"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/types";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.div
      className="group flex flex-col items-center"
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link
        href={`/producto/${product.slug}`}
        className="relative aspect-[3/4] w-full overflow-hidden bg-kloven-dark border border-kloven-smoke mb-6 cursor-pointer rounded-sm hover:shadow-xl hover:shadow-kloven-red/10 transition-all duration-300 block"
      >
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Red tint overlay on hover */}
        <div className="absolute inset-0 bg-kloven-red/0 group-hover:bg-kloven-red/10 transition-colors duration-300" />

        {/* Hover overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300 flex flex-col gap-2 bg-gradient-to-t from-black/80 to-transparent pt-12">
          <span className="w-full bg-kloven-white text-kloven-black py-3 text-sm font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2">
            Ver Producto
            <ShoppingBag className="w-4 h-4" />
          </span>
        </div>

        {/* Badge */}
        <div className="absolute top-3 left-3 bg-kloven-red text-white text-[10px] uppercase font-bold px-2 py-1 tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
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
    </motion.div>
  );
}
