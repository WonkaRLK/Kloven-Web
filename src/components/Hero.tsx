"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import ParallaxImage from "@/components/animations/ParallaxImage";
import TextReveal from "@/components/animations/TextReveal";
import MagneticButton from "@/components/animations/MagneticButton";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Parallax background */}
      <ParallaxImage
        src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=1920"
        alt="Streetwear model"
        speed={0.3}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="inline-flex items-center gap-2 py-1.5 px-4 bg-kloven-white/10 backdrop-blur-sm border border-kloven-white/20 text-kloven-white text-xs font-bold uppercase tracking-widest mb-8 rounded-full"
        >
          Nueva Coleccion 2026
        </motion.div>

        <TextReveal
          text="REDEFINI TU ESTILO"
          className="font-heading text-5xl sm:text-7xl md:text-9xl leading-[0.9] mb-4 tracking-wider text-kloven-white"
          delay={0.5}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-lg text-kloven-ash max-w-md mx-auto mb-12 leading-relaxed"
        >
          Disenos exclusivos con cortes amplios y telas premium. Streetwear de
          vanguardia.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          <MagneticButton className="inline-block">
            <Link
              href="/tienda"
              className="group inline-flex bg-kloven-red text-white px-8 py-5 sm:px-12 sm:py-6 font-bold uppercase tracking-widest hover:bg-kloven-red-dark transition-colors duration-300 items-center gap-3 glow-red"
            >
              Ver Catalogo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </MagneticButton>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-kloven-ash"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
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
