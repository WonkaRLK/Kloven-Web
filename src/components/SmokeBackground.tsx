"use client";

import { useState, useEffect } from "react";

export default function SmokeBackground() {
  const [visible, setVisible] = useState(false);

  // Appear after the hero title smoke-exits
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[1] pointer-events-none overflow-hidden"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 2s ease-in",
      }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ mixBlendMode: "screen", opacity: 0.4 }}
      >
        <source src="/smoke.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
