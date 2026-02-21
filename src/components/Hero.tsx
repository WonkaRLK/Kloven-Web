"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/lib/types";

const LETTERS = ["K", "L", "O", "V", "E", "N"];

const MANIFESTO = [
  "NO SEGUIMOS\nTENDENCIAS.\nLAS ROMPEMOS.",
  "LA CALLE\nES NUESTRA\nPASARELA.",
  "SIN REGLAS.\nSIN LIMITES.\nSIN COMPROMISOS.",
];

// Each letter floats in from a random-ish position
const LETTER_ORIGINS = [
  { x: -60, y: -80 },
  { x: 40, y: 90 },
  { x: -30, y: 70 },
  { x: 70, y: -60 },
  { x: -50, y: -40 },
  { x: 60, y: 50 },
];

export default function Hero() {
  const [showTitle, setShowTitle] = useState(true);
  const [formed, setFormed] = useState(false);
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

  // Letters finish arriving ~1.8s, hold formed for 1.5s, then exit
  useEffect(() => {
    const formTimer = setTimeout(() => setFormed(true), 1800);
    const exitTimer = setTimeout(() => setShowTitle(false), 3300);
    return () => {
      clearTimeout(formTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-kloven-black">
      {/* Phase 1: Stranger Things style letter reveal */}
      <AnimatePresence>
        {showTitle && (
          <motion.div
            exit={{ opacity: 0, scale: 1.1, filter: "blur(24px)" }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="absolute inset-0 z-20 flex items-center justify-center"
          >
            <div className="flex items-center">
              {LETTERS.map((letter, i) => (
                <motion.span
                  key={i}
                  initial={{
                    opacity: 0,
                    x: LETTER_ORIGINS[i].x,
                    y: LETTER_ORIGINS[i].y,
                    scale: 0.3,
                    filter: "blur(12px)",
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    y: 0,
                    scale: 1,
                    filter: "blur(0px)",
                    textShadow: formed
                      ? [
                          "0 0 20px rgba(217,4,41,0.8), 0 0 60px rgba(217,4,41,0.4), 0 0 100px rgba(217,4,41,0.2)",
                          "0 0 30px rgba(217,4,41,1), 0 0 80px rgba(217,4,41,0.6), 0 0 120px rgba(217,4,41,0.3)",
                          "0 0 20px rgba(217,4,41,0.8), 0 0 60px rgba(217,4,41,0.4), 0 0 100px rgba(217,4,41,0.2)",
                        ]
                      : "0 0 40px rgba(217,4,41,0.6), 0 0 80px rgba(217,4,41,0.3)",
                  }}
                  transition={{
                    opacity: { duration: 0.6, delay: i * 0.2 },
                    x: { duration: 0.8, delay: i * 0.2, ease: "easeOut" },
                    y: { duration: 0.8, delay: i * 0.2, ease: "easeOut" },
                    scale: { duration: 0.8, delay: i * 0.2, ease: "easeOut" },
                    filter: { duration: 0.8, delay: i * 0.2 },
                    textShadow: formed
                      ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.6, delay: i * 0.2 },
                  }}
                  className="font-heading text-[16vw] sm:text-[12vw] leading-[0.85] tracking-wider text-kloven-white select-none inline-block"
                  style={{ color: formed ? "#F5F5F5" : "rgba(245,245,245,0.9)" }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>
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
        transition={{ delay: 4, duration: 0.6 }}
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
