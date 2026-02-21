"use client";

import Link from "next/link";
import { X } from "lucide-react";

export default function CompraErrorPage() {
  return (
    <div className="pt-28 pb-20 container mx-auto px-4 text-center max-w-2xl">
      <div className="w-32 h-32 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-8">
        <X className="w-16 h-16" />
      </div>

      <h1 className="text-4xl md:text-5xl font-black uppercase mb-4 tracking-tighter">
        Error en el Pago
      </h1>
      <p className="text-gray-500 max-w-md mx-auto mb-10 text-lg">
        No se pudo procesar tu pago. Por favor intenta nuevamente o usa otro
        medio de pago.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/checkout"
          className="inline-block bg-black text-white px-10 py-4 font-bold uppercase tracking-widest hover:bg-kloven-red transition-colors"
        >
          Reintentar
        </Link>
        <Link
          href="/tienda"
          className="inline-block border-2 border-black text-black px-10 py-4 font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
        >
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}
