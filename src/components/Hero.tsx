"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/lib/types";

const MANIFESTO = [
  "NO SEGUIMOS\nTENDENCIAS.\nLAS ROMPEMOS.",
  "LA CALLE\nES NUESTRA\nPASARELA.",
  "SIN REGLAS.\nSIN LIMITES.\nSIN COMPROMISOS.",
];

export default function Hero() {
  const [showTitle, setShowTitle] = useState(true);
  const [manifestoIndex, setManifestoIndex] = useState(0);
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch("/api/products?featured=true")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFeaturedProduct(data[0]);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (showTitle) return;
    const interval = setInterval(() => {
      setManifestoIndex((prev) => (prev + 1) % MANIFESTO.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [showTitle]);

  useEffect(() => {
    const timer = setTimeout(() => setShowTitle(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-kloven-black">
      {/* Phase 1: Giant KLOVEN — clean, no glitch artifacts */}
      <AnimatePresence>
        {showTitle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.15, filter: "blur(20px)" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0 z-20 flex items-center justify-center"
          >
            <h1 className="font-heading text-[16vw] sm:text-[12vw] leading-[0.85] tracking-wider text-kloven-white select-none">
              KLOVEN
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2: Manifesto + Featured product */}
      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16 flex items-center min-h-screen">
        <AnimatePresence>
          {!showTitle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center w-full"
            >
              {/* Left: Manifesto */}
              <div className="flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={manifestoIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase leading-[0.95] tracking-wider text-kloven-white whitespace-pre-line"
                  >
                    {MANIFESTO[manifestoIndex]}
                  </motion.p>
                </AnimatePresence>

                <div className="h-[2px] w-12 bg-kloven-red mt-8 mb-6" />

                <Link
                  href="/tienda"
                  className="inline-flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-kloven-white font-bold hover:text-kloven-red group w-fit"
                >
                  Ver Catalogo
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Right: Featured product */}
              {featuredProduct && (
                <Link
                  href={`/producto/${featuredProduct.slug}`}
                  className="group relative aspect-[3/4] max-h-[65vh] overflow-hidden block"
                >
                  <Image
                    src={featuredProduct.image_url}
                    alt={featuredProduct.name}
                    fill
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-kloven-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6">
                    <p className="text-xs text-kloven-ash uppercase tracking-widest mb-1">
                      {featuredProduct.category}
                    </p>
                    <h3 className="font-heading text-2xl sm:text-3xl tracking-wider text-kloven-white mb-1">
                      {featuredProduct.name}
                    </h3>
                    <span className="font-heading text-xl text-kloven-red tracking-wider">
                      ${featuredProduct.price.toLocaleString("es-AR")}
                    </span>
                  </div>
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-kloven-ash"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.6 }}
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
