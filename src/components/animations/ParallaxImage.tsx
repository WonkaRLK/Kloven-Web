"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

interface ParallaxImageProps {
  src: string;
  alt: string;
  speed?: number;
  className?: string;
  overlay?: boolean;
}

export default function ParallaxImage({
  src,
  alt,
  speed = 0.3,
  className = "",
  overlay = true,
}: ParallaxImageProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);

  return (
    <div ref={ref} className={`absolute inset-0 overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="absolute inset-0 -top-[20%] -bottom-[20%]">
        <Image
          src={src}
          alt={alt}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </motion.div>
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-kloven-black/70 via-kloven-black/50 to-kloven-black" />
      )}
    </div>
  );
}
