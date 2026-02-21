"use client";

import Link from "next/link";
import { Clock } from "lucide-react";

export default function CompraPendientePage() {
  return (
    <div className="pt-28 pb-20 container mx-auto px-4 text-center max-w-2xl">
      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-500 mx-auto mb-8">
        <Clock className="w-16 h-16" />
      </div>

      <h1 className="text-4xl md:text-5xl font-black uppercase mb-4 tracking-tighter">
        Pago Pendiente
      </h1>
      <p className="text-gray-500 max-w-md mx-auto mb-10 text-base sm:text-lg">
        Tu pago esta siendo procesado. Recibiras un email cuando se confirme.
      </p>

      <Link
        href="/tienda"
        className="inline-block bg-black text-white px-6 py-3 sm:px-10 sm:py-4 font-bold uppercase tracking-widest hover:bg-kloven-red transition-colors shadow-lg"
      >
        Volver a la tienda
      </Link>
    </div>
  );
}
