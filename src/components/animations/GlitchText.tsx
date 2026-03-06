"use client";

import { useEffect, useRef } from "react";

interface GlitchTextProps {
  text: string;
  className?: string;
}

export default function GlitchText({ text, className = "" }: GlitchTextProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timeout: ReturnType<typeof setTimeout>;

    const triggerBurst = () => {
      el.classList.add("glitch-burst");
      // Remove after burst animation ends
      setTimeout(() => el.classList.remove("glitch-burst"), 300);
      // Schedule next burst at random interval (2-6 seconds)
      const next = 2000 + Math.random() * 4000;
      timeout = setTimeout(triggerBurst, next);
    };

    // First burst after 1-3 seconds
    timeout = setTimeout(triggerBurst, 1000 + Math.random() * 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <h2
      ref={ref}
      className={`glitch-text ${className}`}
      data-text={text}
    >
      {text}
    </h2>
  );
}
