"use client";

import { motion } from "framer-motion";
import {
  SEGMENTS,
  SEGMENT_ANGLE,
  describeArc,
  polarToCartesian,
} from "./segments";

interface RouletteWheelProps {
  rotation: number;
  spinning: boolean;
}

const CX = 150;
const CY = 150;
const R = 140;

export default function RouletteWheel({ rotation, spinning }: RouletteWheelProps) {
  return (
    <div className="relative w-full max-w-[280px] mx-auto">
      {/* Pointer at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
        <svg width="20" height="24" viewBox="0 0 20 24">
          <polygon points="10,24 0,0 20,0" fill="#D90429" stroke="#fff" strokeWidth="1" />
        </svg>
      </div>

      <motion.div
        animate={{ rotate: rotation }}
        transition={
          spinning
            ? { duration: 5, ease: [0.2, 0.8, 0.3, 1] }
            : { duration: 0 }
        }
      >
        <svg viewBox="0 0 300 300" className="w-full h-auto">
          {/* Outer ring */}
          <circle
            cx={CX}
            cy={CY}
            r={R + 4}
            fill="none"
            stroke="#D90429"
            strokeWidth="3"
          />

          <defs>
            <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.7" />
            </filter>
            {SEGMENTS.map((_, i) => {
              const startAngle = i * SEGMENT_ANGLE;
              const endAngle = startAngle + SEGMENT_ANGLE;
              const midAngle = startAngle + SEGMENT_ANGLE / 2;
              const isBottom = midAngle > 90 && midAngle < 270;
              const textR = R * 0.75;

              let arcPath: string;
              if (isBottom) {
                const p1 = polarToCartesian(CX, CY, textR, endAngle);
                const p2 = polarToCartesian(CX, CY, textR, startAngle);
                arcPath = `M ${p1.x} ${p1.y} A ${textR} ${textR} 0 0 0 ${p2.x} ${p2.y}`;
              } else {
                const p1 = polarToCartesian(CX, CY, textR, startAngle);
                const p2 = polarToCartesian(CX, CY, textR, endAngle);
                arcPath = `M ${p1.x} ${p1.y} A ${textR} ${textR} 0 0 1 ${p2.x} ${p2.y}`;
              }

              return <path key={`arc-${i}`} id={`textArc-${i}`} d={arcPath} />;
            })}
          </defs>

          {SEGMENTS.map((seg, i) => {
            const startAngle = i * SEGMENT_ANGLE;
            const endAngle = startAngle + SEGMENT_ANGLE;
            const d = describeArc(CX, CY, R, startAngle, endAngle);

            return (
              <g key={i}>
                <path
                  d={d}
                  fill={seg.color}
                  stroke="#0a0a0a"
                  strokeWidth="1.5"
                />
                <text
                  fill="#ffffff"
                  fontSize="14"
                  fontWeight="800"
                  fontFamily="Arial, Helvetica, sans-serif"
                  letterSpacing="1"
                  filter="url(#textShadow)"
                >
                  <textPath
                    href={`#textArc-${i}`}
                    startOffset="50%"
                    textAnchor="middle"
                  >
                    {seg.label}
                  </textPath>
                </text>
              </g>
            );
          })}

          {/* Tick marks at segment boundaries */}
          {SEGMENTS.map((_, i) => {
            const angle = i * SEGMENT_ANGLE;
            const outer = polarToCartesian(CX, CY, R, angle);
            const inner = polarToCartesian(CX, CY, R - 10, angle);
            return (
              <line
                key={`tick-${i}`}
                x1={outer.x}
                y1={outer.y}
                x2={inner.x}
                y2={inner.y}
                stroke="#ffffff33"
                strokeWidth="1"
              />
            );
          })}

          {/* Center circle */}
          <circle
            cx={CX}
            cy={CY}
            r={18}
            fill="#0a0a0a"
            stroke="#D90429"
            strokeWidth="2.5"
          />
        </svg>
      </motion.div>
    </div>
  );
}
