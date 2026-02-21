"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  life: number;
  maxLife: number;
  turbulence: number;
  turbulenceSpeed: number;
  turbulenceOffset: number;
}

function createParticle(w: number, h: number): Particle {
  const maxLife = 300 + Math.random() * 400;
  return {
    x: Math.random() * w,
    y: h + 20 + Math.random() * 100,
    vx: (Math.random() - 0.5) * 0.4,
    vy: -(0.3 + Math.random() * 0.7),
    radius: 40 + Math.random() * 80,
    opacity: 0,
    life: 0,
    maxLife,
    turbulence: 20 + Math.random() * 40,
    turbulenceSpeed: 0.003 + Math.random() * 0.006,
    turbulenceOffset: Math.random() * Math.PI * 2,
  };
}

export default function SmokeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);

  // Appear after the hero title smoke-exits
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];
    const PARTICLE_COUNT = 60;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize particles at various life stages so it doesn't start empty
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = createParticle(canvas.width, canvas.height);
      p.life = Math.random() * p.maxLife;
      p.y -= p.life * Math.abs(p.vy);
      particles.push(p);
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        // Fade in first 20%, full middle, fade out last 30%
        const lifeRatio = p.life / p.maxLife;
        if (lifeRatio < 0.2) {
          p.opacity = (lifeRatio / 0.2) * 0.12;
        } else if (lifeRatio > 0.7) {
          p.opacity = ((1 - lifeRatio) / 0.3) * 0.12;
        } else {
          p.opacity = 0.12;
        }

        // Turbulence — sinusoidal drift
        const turbX =
          Math.sin(p.life * p.turbulenceSpeed + p.turbulenceOffset) *
          p.turbulence;
        const turbY =
          Math.cos(p.life * p.turbulenceSpeed * 0.7 + p.turbulenceOffset) *
          p.turbulence * 0.3;

        p.x += p.vx;
        p.y += p.vy;

        // Expand as it rises
        const currentRadius = p.radius * (1 + lifeRatio * 0.8);

        const drawX = p.x + turbX;
        const drawY = p.y + turbY;

        // Radial gradient for soft smoke look
        const gradient = ctx.createRadialGradient(
          drawX,
          drawY,
          0,
          drawX,
          drawY,
          currentRadius
        );
        gradient.addColorStop(0, `rgba(180, 180, 180, ${p.opacity})`);
        gradient.addColorStop(0.4, `rgba(140, 140, 140, ${p.opacity * 0.6})`);
        gradient.addColorStop(0.7, `rgba(100, 100, 100, ${p.opacity * 0.2})`);
        gradient.addColorStop(1, "rgba(80, 80, 80, 0)");

        ctx.beginPath();
        ctx.arc(drawX, drawY, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Recycle dead particles
        if (p.life >= p.maxLife) {
          particles[i] = createParticle(canvas.width, canvas.height);
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[1] pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}
