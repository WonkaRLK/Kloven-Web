"use client";

import { useState, useEffect } from "react";

export default function SmokeBackground() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 2s ease-in",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 30%, rgba(166,124,46,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 70%, rgba(201,168,76,0.09) 0%, transparent 50%),
            radial-gradient(ellipse 90% 60% at 50% 50%, rgba(139,105,20,0.06) 0%, transparent 70%)
          `,
          animation: "bgGoldShift 12s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 70% 20%, rgba(201,168,76,0.09) 0%, transparent 50%),
            radial-gradient(ellipse 50% 40% at 30% 80%, rgba(166,124,46,0.07) 0%, transparent 50%)
          `,
          animation: "bgGoldShift 15s ease-in-out infinite alternate-reverse",
        }}
      />
    </div>
  );
}
