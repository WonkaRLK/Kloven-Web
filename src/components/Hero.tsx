"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// 3 distinct glitch pattern sets — each has different clip/offset combos
const GLITCH_PATTERNS = [
  // Pattern A: horizontal slices, strong offset
  [
    { clipPath: "inset(15% 0 65% 0)", x: -4, y: 2 },
    { clipPath: "inset(65% 0 10% 0)", x: 5, y: -1 },
    { clipPath: "inset(40% 0 35% 0)", x: -3, y: 3 },
  ],
  // Pattern B: thin slices, vertical jitter
  [
    { clipPath: "inset(5% 0 85% 0)", x: 3, y: -4 },
    { clipPath: "inset(50% 0 40% 0)", x: -6, y: 1 },
    { clipPath: "inset(80% 0 5% 0)", x: 2, y: -3 },
  ],
  // Pattern C: wide slices, diagonal feel
  [
    { clipPath: "inset(25% 0 45% 0)", x: 6, y: 2 },
    { clipPath: "inset(70% 0 15% 0)", x: -4, y: -2 },
    { clipPath: "inset(10% 0 75% 0)", x: 5, y: 3 },
  ],
];

interface GlitchLayer {
  clipPath: string;
  x: number;
  y: number;
  color: string;
}

export default function Hero() {
  const [showTitle, setShowTitle] = useState(true);
  const [layers, setLayers] = useState<GlitchLayer[]>([]);
  const [glitching, setGlitching] = useState(false);

  const triggerGlitch = useCallback(() => {
    const pattern =
      GLITCH_PATTERNS[Math.floor(Math.random() * GLITCH_PATTERNS.length)];
    const colors = ["#00ffff", "#D90429", "#ff00ff"];

    // Rapidly cycle through the pattern's steps
    let step = 0;
    setGlitching(true);

    const interval = setInterval(() => {
      if (step >= pattern.length) {
        clearInterval(interval);
        setLayers([]);
        setGlitching(false);
        return;
      }
      const p = pattern[step];
      setLayers([
        { ...p, color: colors[step % colors.length] },
        {
          clipPath: p.clipPath,
          x: -p.x * 1.2,
          y: -p.y * 0.8,
          color: colors[(step + 1) % colors.length],
        },
      ]);
      step++;
    }, 80);
  }, []);

  // Auto-glitch at random intervals between 0.5-1.5s (fast, 3s window)
  useEffect(() => {
    if (!showTitle) return;

    let timeout: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      const delay = 500 + Math.random() * 1000;
      timeout = setTimeout(() => {
        if (!glitching) triggerGlitch();
        scheduleNext();
      }, delay);
    };

    timeout = setTimeout(() => {
      triggerGlitch();
      scheduleNext();
    }, 400);

    return () => clearTimeout(timeout);
  }, [showTitle, glitching, triggerGlitch]);

  // Hide title after 3s with smoke effect
  useEffect(() => {
    const timer = setTimeout(() => setShowTitle(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-kloven-black">
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Giant KLOVEN with JS glitch — disappears after 10s */}
        <AnimatePresence>
          {showTitle && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, filter: "blur(0px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{
                opacity: 0,
                scale: 1.15,
                y: -40,
                filter: "blur(20px)",
              }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative"
            >
              <h1 className="font-heading text-[16vw] sm:text-[12vw] leading-[0.85] tracking-wider text-kloven-white select-none">
                KLOVEN
              </h1>
              {/* Glitch layers */}
              {layers.map((layer, i) => (
                <span
                  key={i}
                  aria-hidden
                  className="absolute inset-0 font-heading text-[16vw] sm:text-[12vw] leading-[0.85] tracking-wider select-none pointer-events-none"
                  style={{
                    clipPath: layer.clipPath,
                    transform: `translate(${layer.x}px, ${layer.y}px)`,
                    color: layer.color,
                    opacity: 0.8,
                  }}
                >
                  KLOVEN
                </span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

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

        {/* CTA */}
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
