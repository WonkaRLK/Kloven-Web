"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface GlitchTextProps {
  text: string;
  className?: string;
}

const GLITCH_CHARS = "!@#$%^&*()_+-=[]{}|;:',.<>?/\\~`01";

export default function GlitchText({ text, className = "" }: GlitchTextProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [displayText, setDisplayText] = useState(text);
  const [offset1, setOffset1] = useState({ x: 0, y: 0 });
  const [offset2, setOffset2] = useState({ x: 0, y: 0 });
  const [clipSlices, setClipSlices] = useState<string[]>([]);
  const [isGlitching, setIsGlitching] = useState(false);

  const scramble = useCallback((original: string, intensity: number) => {
    return original
      .split("")
      .map((ch) => {
        if (ch === " ") return " ";
        return Math.random() < intensity
          ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
          : ch;
      })
      .join("");
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let frameId: number;

    const generateSlices = () => {
      const slices: string[] = [];
      const count = 2 + Math.floor(Math.random() * 4);
      for (let i = 0; i < count; i++) {
        const top = Math.random() * 100;
        const height = 3 + Math.random() * 15;
        slices.push(`inset(${top}% 0 ${100 - top - height}% 0)`);
      }
      return slices;
    };

    const burst = () => {
      setIsGlitching(true);
      const burstDuration = 150 + Math.random() * 250;
      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        if (elapsed > burstDuration) {
          // End burst
          setDisplayText(text);
          setOffset1({ x: 0, y: 0 });
          setOffset2({ x: 0, y: 0 });
          setClipSlices([]);
          setIsGlitching(false);
          // Schedule next burst
          timeout = setTimeout(burst, 2000 + Math.random() * 5000);
          return;
        }

        const progress = elapsed / burstDuration;
        const intensity = progress < 0.5 ? progress * 2 : (1 - progress) * 2;

        // Scramble text
        setDisplayText(scramble(text, intensity * 0.4));

        // RGB split offsets
        setOffset1({
          x: (Math.random() - 0.5) * 8 * intensity,
          y: (Math.random() - 0.5) * 3 * intensity,
        });
        setOffset2({
          x: (Math.random() - 0.5) * 8 * intensity,
          y: (Math.random() - 0.5) * 3 * intensity,
        });

        // Clip slices
        if (Math.random() < 0.6) {
          setClipSlices(generateSlices());
        }

        frameId = requestAnimationFrame(animate);
      };

      frameId = requestAnimationFrame(animate);
    };

    // First burst
    timeout = setTimeout(burst, 800 + Math.random() * 1500);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frameId);
    };
  }, [text, scramble]);

  return (
    <h2
      ref={ref}
      className={`relative inline-block ${className}`}
      style={{ color: '#F5F5F5' }}
      aria-label={text}
    >
      {/* Cyan layer */}
      <span
        className="absolute inset-0 pointer-events-none select-none"
        style={{
          color: "#00ffff",
          opacity: isGlitching ? 0.7 : 0,
          transform: `translate(${offset1.x}px, ${offset1.y}px)`,
          clipPath: clipSlices[0] || "inset(0 0 0 0)",
        }}
        aria-hidden
      >
        {displayText}
      </span>

      {/* Red layer */}
      <span
        className="absolute inset-0 pointer-events-none select-none"
        style={{
          color: "#D90429",
          opacity: isGlitching ? 0.7 : 0,
          transform: `translate(${offset2.x}px, ${offset2.y}px)`,
          clipPath: clipSlices[1] || "inset(0 0 0 0)",
        }}
        aria-hidden
      >
        {displayText}
      </span>

      {/* Main text with scan line slices */}
      <span
        style={{
          clipPath: isGlitching && clipSlices[2]
            ? clipSlices[2]
            : "none",
        }}
      >
        {displayText}
      </span>
    </h2>
  );
}
