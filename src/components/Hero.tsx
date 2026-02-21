"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-kloven-black">
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Giant KLOVEN with glitch */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <h1
            className="glitch-text font-heading text-[20vw] sm:text-[15vw] leading-[0.85] tracking-wider text-kloven-white select-none"
            data-text="KLOVEN"
          >
            KLOVEN
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-xs sm:text-sm uppercase tracking-[0.4em] sm:tracking-[0.5em] text-kloven-ash mt-4 sm:mt-6 font-semibold"
        >
          Streetwear Redefined
        </motion.p>

        {/* Red line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="w-16 h-[2px] bg-kloven-red mx-auto mt-6 sm:mt-8"
        />

        {/* CTA — text link, not inflated button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="mt-8 sm:mt-10"
        >
          <Link
            href="/tienda"
            className="inline-block text-sm uppercase tracking-[0.3em] text-kloven-white font-bold border-b-2 border-kloven-red pb-1 hover:text-kloven-red"
          >
            Ver Catalogo
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-kloven-ash"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </div>
  );
}
