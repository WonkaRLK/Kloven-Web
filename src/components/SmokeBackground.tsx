"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const SMOKE_BLOBS = [
  // Each blob: position, size, animation duration, direction
  { x: "10%", y: "20%", size: 400, dur: 25, dx: 80, dy: -40 },
  { x: "70%", y: "10%", size: 350, dur: 30, dx: -60, dy: 50 },
  { x: "40%", y: "60%", size: 500, dur: 35, dx: 50, dy: -70 },
  { x: "80%", y: "70%", size: 300, dur: 20, dx: -90, dy: -30 },
  { x: "20%", y: "80%", size: 450, dur: 28, dx: 70, dy: 40 },
  { x: "55%", y: "35%", size: 380, dur: 32, dx: -40, dy: -60 },
];

export default function SmokeBackground() {
  const [visible, setVisible] = useState(false);

  // Appear after the hero title smoke-exits (~2.2s = 1s show + 1.2s exit)
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {SMOKE_BLOBS.map((blob, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0, 0.07, 0.04, 0.07, 0.04],
            scale: [0.5, 1, 1.1, 0.9, 1],
            x: [0, blob.dx, -blob.dx * 0.5, blob.dx * 0.7, 0],
            y: [0, blob.dy, -blob.dy * 0.6, blob.dy * 0.4, 0],
          }}
          transition={{
            duration: blob.dur,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.25, 0.5, 0.75, 1],
          }}
          className="absolute rounded-full"
          style={{
            left: blob.x,
            top: blob.y,
            width: blob.size,
            height: blob.size,
            background: `radial-gradient(circle, rgba(217,4,41,0.15) 0%, rgba(217,4,41,0.05) 40%, transparent 70%)`,
            filter: "blur(80px)",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
}
