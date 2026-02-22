"use client";

import { useState, useEffect, useRef } from "react";
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

const LETTER_ORIGINS = [
  { x: -40, y: -50 },
  { x: 30, y: 60 },
  { x: -20, y: 50 },
  { x: 50, y: -40 },
  { x: -35, y: -30 },
  { x: 45, y: 35 },
];

export default function Hero() {
  const [showTitle, setShowTitle] = useState(true);
  const [formed, setFormed] = useState(false);
  const [melting, setMelting] = useState(false);
  const [lightning, setLightning] = useState(false);
  const [manifestoIndex, setManifestoIndex] = useState(0);
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [exitTarget, setExitTarget] = useState({ x: 0, y: "-45vh" as string | number, scale: 0.06 });
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [titleExiting, setTitleExiting] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768 || "ontouchstart" in window);
  }, []);

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

  // Calculate exit target — position of navbar logo
  // Runs after isMobile is determined and desktop version is rendered
  useEffect(() => {
    if (isMobile !== false || !showTitle) return;
    // Small delay to ensure the DOM is painted with the desktop letters
    const timer = setTimeout(() => {
      const navLogo = document.querySelector("[data-navbar-logo]");
      if (!navLogo || !titleRef.current) return;
      const logoRect = navLogo.getBoundingClientRect();
      const titleRect = titleRef.current.getBoundingClientRect();
      setExitTarget({
        x: (logoRect.left + logoRect.width / 2) - (titleRect.left + titleRect.width / 2),
        y: (logoRect.top + logoRect.height / 2) - (titleRect.top + titleRect.height / 2),
        scale: logoRect.width / titleRect.width,
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [isMobile, showTitle]);

  // Lightning flashes (desktop only)
  useEffect(() => {
    if (isMobile !== false) return;
    const flashes = [300, 600, 750, 1000];
    const timers = flashes.map((t) =>
      setTimeout(() => {
        setLightning(true);
        setTimeout(() => setLightning(false), 60);
      }, t)
    );
    return () => timers.forEach(clearTimeout);
  }, [isMobile]);

  // Timeline — wait until isMobile is determined
  useEffect(() => {
    if (isMobile === null) return;
    const formTimer = setTimeout(() => setFormed(true), isMobile ? 0 : 800);
    const meltTimer = setTimeout(() => setMelting(true), isMobile ? 0 : 1100);
    const exitStartTimer = isMobile
      ? setTimeout(() => setTitleExiting(true), 500)
      : undefined;
    const exitTimer = setTimeout(() => setShowTitle(false), isMobile ? 800 : 1500);
    return () => {
      clearTimeout(formTimer);
      clearTimeout(meltTimer);
      if (exitStartTimer) clearTimeout(exitStartTimer);
      clearTimeout(exitTimer);
    };
  }, [isMobile]);

  const redGlow = isMobile
    ? "0 0 4px rgba(217,4,41,0.6)"
    : "0 0 10px rgba(217,4,41,0.9), 0 0 40px rgba(217,4,41,0.6), 0 0 80px rgba(217,4,41,0.4), 0 0 120px rgba(217,4,41,0.2)";
  const redGlowIntense = isMobile
    ? "0 0 6px rgba(217,4,41,0.8)"
    : "0 0 15px rgba(217,4,41,1), 0 0 50px rgba(217,4,41,0.8), 0 0 100px rgba(217,4,41,0.5), 0 0 150px rgba(217,4,41,0.3), 0 0 200px rgba(217,4,41,0.1)";

  return (
    <div className="relative min-h-screen overflow-hidden bg-kloven-black">
      {/* SVG Filters */}
      <svg className="absolute w-0 h-0">
        <defs>
          {/* Erosion/holes filter — rough distressed look */}
          <filter id="erode">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.04"
              numOctaves="4"
              seed="2"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="6"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* Melting filter — warps downward with turbulence */}
          <filter id="melt">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.015 0.04"
              numOctaves="3"
              seed="5"
              result="turbulence"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale="18"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* Heavy melt — more distortion */}
          <filter id="meltHeavy">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.02 0.06"
              numOctaves="4"
              seed="8"
              result="turbulence"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale="35"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Lightning flash overlay */}
      <AnimatePresence>
        {lightning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.06 }}
            className="absolute inset-0 z-30 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(217,4,41,0.15) 0%, rgba(255,255,255,0.05) 40%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Phase 1: Mobile — pure CSS fade in/out */}
      {isMobile && showTitle && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <h1
            className="font-heading text-[16vw] leading-[0.85] tracking-[0.12em] select-none text-kloven-white"
            style={{
              opacity: titleExiting ? 0 : 1,
              transition: "opacity 0.3s ease",
              animationName: titleExiting ? "none" : "fadeIn",
              animationDuration: "0.4s",
              animationFillMode: "backwards",
            }}
          >
            KLOVEN
          </h1>
        </div>
      )}

      {/* Desktop: Framer Motion letter-by-letter */}
      <AnimatePresence>
        {isMobile === false && showTitle && (
          <motion.div
            ref={titleRef}
            exit={{
              x: exitTarget.x,
              y: exitTarget.y,
              scale: exitTarget.scale,
              opacity: 0,
            }}
            transition={{
              duration: 0.7,
              ease: [0.76, 0, 0.24, 1],
              opacity: { delay: 0.5, duration: 0.2 },
            }}
            className="absolute inset-0 z-20 flex items-center justify-center"
          >
            <div
              className="flex items-center"
              style={{
                filter: melting
                  ? "url(#meltHeavy)"
                  : formed
                  ? "url(#melt)"
                  : "url(#erode)",
                transition: "filter 0.3s",
              }}
            >
              {LETTERS.map((letter, i) => (
                <motion.span
                  key={i}
                  initial={{
                    opacity: 0,
                    x: LETTER_ORIGINS[i].x,
                    y: LETTER_ORIGINS[i].y,
                    scale: 0.3,
                    filter: "blur(8px)",
                  }}
                  animate={{
                    opacity: [0, 0.4, 1, 0.7, 1],
                    x: 0,
                    y: melting ? 4 + i * 2 : 0,
                    scale: melting ? 1.02 : 1,
                    filter: "blur(0px)",
                    textShadow: formed
                      ? [redGlow, redGlowIntense, redGlow]
                      : redGlow,
                  }}
                  transition={{
                    opacity: { duration: 0.4, delay: i * 0.1, times: [0, 0.2, 0.5, 0.7, 1] },
                    x: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
                    y: { duration: 0.4, ease: "easeIn" },
                    scale: { duration: 0.5, delay: melting ? 0 : i * 0.1, ease: "easeOut" },
                    filter: { duration: 0.4, delay: i * 0.1 },
                    textShadow: formed
                      ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.3, delay: i * 0.1 },
                  }}
                  className="font-heading text-[12vw] leading-[0.85] tracking-wider select-none inline-block"
                  style={{ color: "#F5F5F5" }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            {/* Red light lines */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: [0, 0.6, 0.3, 0.5, 0] }}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
              className="absolute left-[10%] right-[10%] h-[1px] top-1/2 -translate-y-8"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(217,4,41,0.8) 30%, rgba(217,4,41,0.9) 50%, rgba(217,4,41,0.8) 70%, transparent 100%)",
                boxShadow:
                  "0 0 15px rgba(217,4,41,0.5), 0 0 30px rgba(217,4,41,0.3)",
              }}
            />
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: [0, 0.4, 0.2, 0.4, 0] }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              className="absolute left-[15%] right-[15%] h-[1px] top-1/2 translate-y-8"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(217,4,41,0.6) 20%, rgba(217,4,41,0.7) 50%, rgba(217,4,41,0.6) 80%, transparent 100%)",
                boxShadow:
                  "0 0 10px rgba(217,4,41,0.4), 0 0 20px rgba(217,4,41,0.2)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2: Manifesto + Featured product */}
      <div className="relative z-10 flex items-center min-h-screen">
        <AnimatePresence>
          {!showTitle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col md:flex-row items-center w-full min-h-screen"
            >
              {/* Left: Manifesto — fixed width */}
              <div className="flex flex-col justify-center px-4 md:pl-[max(2rem,calc((100vw-1280px)/2+1rem))] md:pr-12 md:w-[40%] md:shrink-0">
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
                <div className="flex items-center justify-center w-full">
                  <Link
                    href={`/producto/${featuredProduct.slug}`}
                    className="group relative w-full max-w-[420px] aspect-[3/4] overflow-hidden block"
                    style={{
                      clipPath: "polygon(3% 0%, 100% 2%, 97% 100%, 0% 98%)",
                    }}
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
                </div>
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
