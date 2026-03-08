"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const HERO_COLUMNS = [
  ["/hero/1.jpg", "/hero/6.jpg", "/hero/3.jpg"],
  ["/hero/4.jpg", "/hero/7.jpg", "/hero/2.jpg"],
  ["/hero/2.jpg", "/hero/5.jpg", "/hero/8.jpg"],
  ["/hero/8.jpg", "/hero/3.jpg", "/hero/6.jpg"],
  ["/hero/5.jpg", "/hero/1.jpg", "/hero/7.jpg"],
];

export default function Hero() {
  const [showTitle, setShowTitle] = useState(true);
  const [glitchPhase, setGlitchPhase] = useState(0);
  const [overlayGlitch, setOverlayGlitch] = useState(false);

  useEffect(() => {
    // Glitch timeline: appear → glitch → settle → fade out
    const t1 = setTimeout(() => setGlitchPhase(1), 100);   // appear
    const t2 = setTimeout(() => setGlitchPhase(2), 350);   // glitch burst
    const t3 = setTimeout(() => setGlitchPhase(3), 550);   // settle
    const t4 = setTimeout(() => setShowTitle(false), 900);  // fade out & show content
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  useEffect(() => {
    if (showTitle) return;
    const interval = setInterval(() => {
      setOverlayGlitch(true);
      setTimeout(() => setOverlayGlitch(false), 500);
    }, 3000);
    return () => clearInterval(interval);
  }, [showTitle]);

  return (
    <div className={`relative overflow-hidden ${showTitle ? "min-h-screen bg-kloven-black" : "md:min-h-screen"}`}>
      <style>{`
        @keyframes glitchSlice1 {
          0% { clip-path: inset(20% 0 60% 0); transform: translateX(-8px) skewX(-2deg); }
          25% { clip-path: inset(50% 0 20% 0); transform: translateX(6px) skewX(1deg); }
          50% { clip-path: inset(10% 0 70% 0); transform: translateX(-4px) skewX(-1deg); }
          75% { clip-path: inset(60% 0 10% 0); transform: translateX(10px) skewX(2deg); }
          100% { clip-path: inset(30% 0 40% 0); transform: translateX(-6px) skewX(-1deg); }
        }
        @keyframes glitchSlice2 {
          0% { clip-path: inset(60% 0 10% 0); transform: translateX(6px) skewX(1deg); }
          25% { clip-path: inset(15% 0 55% 0); transform: translateX(-10px) skewX(-2deg); }
          50% { clip-path: inset(40% 0 30% 0); transform: translateX(8px) skewX(2deg); }
          75% { clip-path: inset(5% 0 75% 0); transform: translateX(-5px) skewX(-1deg); }
          100% { clip-path: inset(70% 0 5% 0); transform: translateX(7px) skewX(1deg); }
        }
        .hero-glitch-active::before,
        .hero-glitch-active::after {
          content: 'KLOVEN';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          text-align: center;
        }
        .hero-glitch-active::before {
          color: #D90429;
          animation: glitchSlice1 0.15s steps(2) 3;
        }
        .hero-glitch-active::after {
          color: #F5F5F5;
          animation: glitchSlice2 0.15s steps(2) 3;
        }
        @keyframes overlayGlitch1 {
          0%, 100% { clip-path: inset(0 0 100% 0); transform: translate(0); }
          10% { clip-path: inset(20% 0 60% 0); transform: translateX(-6px) skewX(-2deg); }
          20% { clip-path: inset(50% 0 20% 0); transform: translateX(4px) skewX(1deg); }
          30% { clip-path: inset(10% 0 70% 0); transform: translateX(-3px); }
          40% { clip-path: inset(0 0 100% 0); transform: translate(0); }
        }
        @keyframes overlayGlitch2 {
          0%, 100% { clip-path: inset(0 0 100% 0); transform: translate(0); }
          10% { clip-path: inset(60% 0 10% 0); transform: translateX(5px) skewX(1deg); }
          20% { clip-path: inset(15% 0 55% 0); transform: translateX(-8px) skewX(-2deg); }
          30% { clip-path: inset(40% 0 30% 0); transform: translateX(6px); }
          40% { clip-path: inset(0 0 100% 0); transform: translate(0); }
        }
        .hero-overlay-logo {
          opacity: 0.35;
          text-shadow: 0 0 40px rgba(0,0,0,0.6);
          transition: opacity 1s ease-out;
        }
        @media (min-width: 768px) {
          .hero-overlay-logo {
            opacity: 0.12;
            text-shadow: none;
          }
        }
        .hero-overlay-logo.glitch-burst {
          opacity: 0.7;
          transition: opacity 0.15s ease-in;
        }
        .hero-overlay-logo.glitch-burst::before,
        .hero-overlay-logo.glitch-burst::after {
          content: 'KLOVEN';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          text-align: center;
          opacity: 0.6;
        }
        .hero-overlay-logo.glitch-burst::before {
          color: #D90429;
          animation: overlayGlitch1 0.4s steps(2) 1;
        }
        .hero-overlay-logo.glitch-burst::after {
          color: #F5F5F5;
          animation: overlayGlitch2 0.4s steps(2) 1;
        }
      `}</style>

      {/* Glitch title overlay */}
      {showTitle && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center"
          style={{
            opacity: glitchPhase === 0 ? 0 : glitchPhase === 3 ? 0 : 1,
            transition: glitchPhase === 0 ? "opacity 0.1s" : "opacity 0.35s ease-out",
          }}
        >
          <h1
            className={`font-heading text-[16vw] md:text-[12vw] leading-[0.85] tracking-[0.12em] select-none text-kloven-white relative ${
              glitchPhase === 2 ? "hero-glitch-active" : ""
            }`}
          >
            KLOVEN
          </h1>
        </div>
      )}

      {/* Gallery content */}
      <div className="relative z-[1] flex items-center md:min-h-screen">
        {!showTitle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center w-full md:min-h-screen"
          >
              {/* 3-column vertical scroll gallery */}
              <div className="flex flex-col justify-center px-2 pt-20 pb-10 md:pt-24 md:pb-0 w-full md:px-4">
                <style>{`
                  @keyframes heroScrollUp {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-50%); }
                  }
                  @keyframes heroScrollDown {
                    0% { transform: translateY(-50%); }
                    100% { transform: translateY(0); }
                  }
                `}</style>
                <div className="relative w-full h-[55vh] md:h-[75vh] overflow-hidden rounded-lg">
                  {/* Logo overlay */}
                  <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                    <span
                      className={`font-heading text-[13vw] md:text-[14vw] leading-none tracking-[0.15em] select-none text-kloven-white relative hero-overlay-logo ${overlayGlitch ? "glitch-burst" : ""}`}
                    >
                      KLOVEN
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 h-full">
                    {HERO_COLUMNS.map((col, colIndex) => (
                      <div key={colIndex} className="relative overflow-hidden h-full">
                        <div
                          className="flex flex-col gap-2"
                          style={{
                            animation: `${colIndex % 2 === 0 ? "heroScrollUp" : "heroScrollDown"} ${18 + colIndex * 2}s linear infinite`,
                          }}
                        >
                          {[...col, ...col].map((src, i) => (
                            <div key={i} className="relative aspect-[3/4] w-full shrink-0">
                              <Image
                                src={src}
                                alt="Kloven"
                                fill
                                className="object-cover rounded-sm"
                                sizes="(max-width: 768px) 20vw, 11vw"
                                priority={i < 3}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-[2px] w-12 bg-kloven-red mt-5 mb-4 md:mt-8 md:mb-6" />

                <Link
                  href="/tienda"
                  className="inline-flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-kloven-white font-bold hover:text-kloven-red group w-fit"
                >
                  Ver Catalogo
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

            </motion.div>
          )}
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 text-kloven-ash"
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
