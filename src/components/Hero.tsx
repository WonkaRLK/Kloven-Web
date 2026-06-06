"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import { motion } from "framer-motion";

const DEFAULT_IMAGES = [
  "/hero/1.jpg", "/hero/2.jpg", "/hero/3.jpg", "/hero/4.jpg",
  "/hero/5.jpg", "/hero/6.jpg", "/hero/7.jpg", "/hero/8.jpg",
];

function buildColumns(images: string[]): string[][] {
  const pool = images.length >= 3 ? images : DEFAULT_IMAGES;
  const cols: string[][] = [];
  for (let i = 0; i < 5; i++) {
    cols.push([
      pool[(i * 3) % pool.length],
      pool[(i * 3 + 1) % pool.length],
      pool[(i * 3 + 2) % pool.length],
    ]);
  }
  return cols;
}

export default function Hero() {
  const [showTitle, setShowTitle] = useState(true);
  const [heroColumns, setHeroColumns] = useState<string[][]>(() => buildColumns([]));
  const [glitchPhase, setGlitchPhase] = useState(0);
  const [goldShimmer, setGoldShimmer] = useState(false);

  useEffect(() => {
    fetch("/api/hero-images")
      .then((r) => r.json())
      .then(({ images }) => {
        if (Array.isArray(images) && images.length >= 3) {
          setHeroColumns(buildColumns(images));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setGlitchPhase(1), 100);
    const t2 = setTimeout(() => setGlitchPhase(2), 350);
    const t3 = setTimeout(() => setGlitchPhase(3), 550);
    const t4 = setTimeout(() => setShowTitle(false), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  useEffect(() => {
    if (showTitle) return;
    const interval = setInterval(() => {
      setGoldShimmer(true);
      setTimeout(() => setGoldShimmer(false), 800);
    }, 4000);
    return () => clearInterval(interval);
  }, [showTitle]);

  return (
    <div className="relative overflow-hidden md:min-h-[25vh]">
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
          color: #c9a84c;
          animation: glitchSlice1 0.15s steps(2) 3;
        }
        .hero-glitch-active::after {
          color: #F5F5F5;
          animation: glitchSlice2 0.15s steps(2) 3;
        }

        .hero-overlay-logo-wrap {
          position: relative;
          display: inline-block;
          filter: drop-shadow(0 6px 20px rgba(0,0,0,0.6));
        }

        .hero-3d-shadow,
        .hero-3d-shadow2 {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          text-align: center;
          -webkit-text-stroke: 0;
        }
        .hero-3d-shadow {
          color: #000;
          transform: translate(4px, 8px);
          opacity: 0.7;
          filter: blur(2px);
        }
        .hero-3d-shadow2 {
          color: #000;
          transform: translate(2px, 4px);
          opacity: 0.9;
        }

        .hero-overlay-logo {
          position: relative;
          color: #F5F5F5;
          -webkit-text-stroke: 0;
        }

        .hero-overlay-logo-wrap {
          opacity: 1;
          transition: opacity 1s ease-out;
        }
        @media (min-width: 768px) {
          .hero-overlay-logo-wrap {
            opacity: 1;
          }
        }

        @keyframes goldSweep {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }

        .hero-overlay-logo.gold-shimmer {
          animation: goldTextColor 1s ease-in-out 1;
        }
        .hero-overlay-logo.gold-shimmer span {
          animation: goldTextColor 1s ease-in-out 1;
        }

        @keyframes goldTextColor {
          0% { color: #F5F5F5; }
          30% { color: #a67c2e; }
          50% { color: #c9a84c; }
          70% { color: #a67c2e; }
          100% { color: #F5F5F5; }
        }
        .hero-overlay-logo-wrap:has(.gold-shimmer) {
          opacity: 1;
        }
        @media (min-width: 768px) {
          .hero-overlay-logo-wrap:has(.gold-shimmer) {
            opacity: 1;
          }
        }

        @keyframes bounceO {
          0%, 20%, 100% { transform: translateY(0); }
          4% { transform: translateY(-12%); }
          9% { transform: translateY(0); }
          12% { transform: translateY(-4%); }
          17% { transform: translateY(0); }
        }

        @keyframes spinN {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }

        @keyframes heroScrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes heroScrollDown {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
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
      <div className="relative z-[1] flex items-center md:min-h-[25vh]">
        {!showTitle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center w-full md:min-h-[25vh]"
          >
            <div className="flex flex-col justify-center pt-16 pb-4 md:pt-16 md:pb-4 w-full">
              {/* Gallery with gold border and overlay */}
              <div
                className="relative w-full h-[28vh] md:h-[38vh] overflow-hidden"
                style={{
                  boxShadow: "inset 0 0 60px rgba(0,0,0,0.5)",
                }}
              >
                {/* Gold overlay on photos */}
                <div
                  className="absolute inset-0 z-[5] pointer-events-none"
                  style={{
                    background: "linear-gradient(180deg, rgba(166,124,46,0.08) 0%, rgba(139,105,20,0.12) 50%, rgba(166,124,46,0.08) 100%)",
                    mixBlendMode: "color",
                  }}
                />
                {/* Vignette */}
                <div
                  className="absolute inset-0 z-[6] pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse at center, transparent 40%, rgba(10,10,10,0.6) 100%)",
                  }}
                />

                {/* Dark vignette overlay */}
                <div
                  className="absolute inset-0 z-[7] pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)" }}
                />

                {/* Logo overlay — 3D gold */}
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                  <span className="font-heading text-[13vw] md:text-[14vw] leading-none tracking-[0.15em] select-none relative hero-overlay-logo-wrap">
                    {/* Shadow/depth layers */}
                    <span className="hero-3d-shadow" aria-hidden="true"><span style={{ display: "inline-block", animation: "spinN 3s linear infinite" }}>K</span>L<span style={{ display: "inline-block", animation: "bounceO 3s ease-in-out infinite" }}>O</span>VEN</span>
                    <span className="hero-3d-shadow2" aria-hidden="true"><span style={{ display: "inline-block", animation: "spinN 3s linear infinite" }}>K</span>L<span style={{ display: "inline-block", animation: "bounceO 3s ease-in-out infinite" }}>O</span>VEN</span>
                    {/* Main text */}
                    <span
                      className={`hero-overlay-logo ${goldShimmer ? "gold-shimmer" : ""}`}
                    >
                      <span style={{ display: "inline-block", animation: "spinN 3s linear infinite" }}>K</span>L<span style={{ display: "inline-block", animation: "bounceO 3s ease-in-out infinite" }}>O</span>VEN
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2 h-full">
                  {heroColumns.map((col, colIndex) => (
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

            </div>
          </motion.div>
        )}
      </div>

      {/* Fade de transición al fondo de la página */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent 0%, #080808 85%)" }}
      />
    </div>
  );
}
