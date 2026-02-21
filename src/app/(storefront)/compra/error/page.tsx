"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { motion } from "framer-motion";

export default function CompraErrorPage() {
  return (
    <div className="pt-28 pb-20 container mx-auto px-4 text-center max-w-2xl">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
      >
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-red-900/30 rounded-full flex items-center justify-center text-red-400 mx-auto mb-8">
          <X className="w-16 h-16" />
        </div>
      </motion.div>

      <h1 className="font-heading text-5xl md:text-6xl uppercase mb-4 tracking-wider text-kloven-white">
        Error en el Pago
      </h1>
      <p className="text-kloven-ash max-w-md mx-auto mb-10 text-base sm:text-lg">
        No se pudo procesar tu pago. Por favor intenta nuevamente o usa otro
        medio de pago.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/checkout"
          className="inline-block bg-kloven-red text-white px-6 py-3 sm:px-10 sm:py-4 font-bold uppercase tracking-widest hover:bg-kloven-red-dark transition-colors"
        >
          Reintentar
        </Link>
        <Link
          href="/tienda"
          className="inline-block border-2 border-kloven-smoke text-kloven-white px-6 py-3 sm:px-10 sm:py-4 font-bold uppercase tracking-widest hover:bg-kloven-dark transition-colors"
        >
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}
