"use client";

import { useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Package } from "lucide-react";
import type { Product } from "@/lib/types";
import { useStoreConfig } from "@/context/StoreConfigContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const { transferDiscountPercent, installmentsCount } = useStoreConfig();

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!card || !glare) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.15) 0%, transparent 60%)`;
    glare.style.opacity = "1";
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!card || !glare) return;

    card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)";
    glare.style.opacity = "0";
  }, []);

  return (
    <>
    <Link
      ref={cardRef}
      href={`/producto/${product.slug}`}
      className="group relative block rounded-2xl overflow-hidden bg-kloven-dark/60 shadow-lg hover:shadow-[0_8px_30px_rgba(201,168,76,0.15)] will-change-transform"
      style={{
        transition: "transform 0.15s ease-out, box-shadow 0.3s ease-out, border-color 0.3s ease-out",
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glare overlay */}
      <div
        ref={glareRef}
        className="pointer-events-none absolute inset-0 z-20 rounded-2xl"
        style={{ opacity: 0, transition: "opacity 0.3s ease-out" }}
      />

      {/* Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Combo badge */}
        {product.is_combo && (
          <span className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider z-10 flex items-center gap-1">
            <Package className="w-3 h-3" />
            COMBO
          </span>
        )}

        {/* Sold out badge */}
        {product.sold_out && (
          <span className={`absolute text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider z-10 bg-gray-900 text-white ${
            product.is_combo ? "top-10 right-2" : product.compare_at_price && product.compare_at_price > product.price ? "top-2 right-2" : "top-2 left-2"
          }`}>
            AGOTADO
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
          {product.sold_out ? (
            <span className="w-full bg-gray-700 text-gray-400 py-2.5 text-xs font-bold uppercase tracking-widest text-center rounded-lg">
              Sin Stock
            </span>
          ) : (
            <span className="w-full bg-kloven-white text-kloven-black py-2.5 text-xs font-bold uppercase tracking-widest text-center flex items-center justify-center gap-1.5 rounded-lg">
              Ver Producto
              <ShoppingBag className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>

    </Link>

    {/* Info — price first, then name */}
    <div className="mt-3 px-1">
      <div className="flex items-center gap-2">
        <span className="text-lg sm:text-xl font-bold text-kloven-white">
          $ {product.price.toLocaleString("es-AR")}
        </span>
        {product.compare_at_price && product.compare_at_price > product.price && (
          <span className="text-sm text-kloven-ash line-through">
            $ {product.compare_at_price.toLocaleString("es-AR")}
          </span>
        )}
      </div>
      <h3 className="text-sm sm:text-base text-kloven-ash leading-tight truncate mt-1">
        {product.name}
      </h3>
      {transferDiscountPercent > 0 && (
        <p className="text-xs text-emerald-400 mt-1 leading-tight">
          ${Math.round(product.price * (1 - transferDiscountPercent / 100)).toLocaleString("es-AR")} con Transferencia
        </p>
      )}
      {installmentsCount > 0 && (
        <p className="text-xs text-sky-400 mt-0.5 leading-tight">
          {installmentsCount} cuotas sin interés de ${Math.round(product.price / installmentsCount).toLocaleString("es-AR")}
        </p>
      )}
    </div>
    </>
  );
}
