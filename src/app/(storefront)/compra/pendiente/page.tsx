"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function CompraPendientePage() {
  return (
    <div className="pt-28 pb-20 container mx-auto px-4 text-center max-w-2xl">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
      >
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-yellow-900/30 rounded-full flex items-center justify-center text-yellow-400 mx-auto mb-8">
          <Clock className="w-16 h-16" />
        </div>
      </motion.div>

      <h1 className="font-heading text-5xl md:text-6xl uppercase mb-4 tracking-wider text-kloven-white">
        Pago Pendiente
      </h1>
      <p className="text-kloven-ash max-w-md mx-auto mb-10 text-base sm:text-lg">
        Tu pago esta siendo procesado. Recibiras un email cuando se confirme.
      </p>

      <Link
        href="/tienda"
        className="inline-block bg-kloven-red text-white px-6 py-3 sm:px-10 sm:py-4 font-bold uppercase tracking-widest hover:bg-kloven-red-dark transition-colors glow-red"
      >
        Volver a la tienda
      </Link>
    </div>
  );
}
