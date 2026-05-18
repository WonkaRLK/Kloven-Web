"use client";

import { useEffect, useState } from "react";

interface Props {
  opensAt: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(target: Date): TimeLeft | null {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function DropCountdown({ opensAt }: Props) {
  const target = new Date(opensAt);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => calcTimeLeft(target));

  useEffect(() => {
    const interval = setInterval(() => {
      const next = calcTimeLeft(target);
      setTimeLeft(next);
      if (!next) {
        clearInterval(interval);
        window.location.href = "/";
      }
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opensAt]);

  if (!timeLeft) return null;

  const units = [
    { label: "DÍAS", value: timeLeft.days },
    { label: "HS", value: timeLeft.hours },
    { label: "MIN", value: timeLeft.minutes },
    { label: "SEG", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-end gap-3 sm:gap-6">
      {units.map(({ label, value }, i) => (
        <div key={label} className="flex items-end gap-3 sm:gap-6">
          <div className="flex flex-col items-center">
            <span
              className="font-heading text-5xl sm:text-7xl lg:text-8xl tabular-nums leading-none"
              style={{ color: "var(--kloven-red)" }}
            >
              {pad(value)}
            </span>
            <span className="text-[10px] sm:text-xs tracking-[0.2em] mt-2" style={{ color: "var(--kloven-ash)" }}>
              {label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span
              className="font-heading text-4xl sm:text-6xl lg:text-7xl leading-none pb-5"
              style={{ color: "var(--kloven-smoke)" }}
            >
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
