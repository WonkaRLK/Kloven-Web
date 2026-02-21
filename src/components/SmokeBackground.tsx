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
  layer: number; // 0 = wispy detail, 1 = medium, 2 = large base
}

function createParticle(w: number, h: number): Particle {
  const layer = Math.random() < 0.4 ? 0 : Math.random() < 0.6 ? 1 : 2;

  // Smaller, tighter particles for defined smoke wisps
  const radiusByLayer = [8 + Math.random() * 16, 18 + Math.random() * 25, 30 + Math.random() * 40];
  const maxLifeByLayer = [150 + Math.random() * 200, 250 + Math.random() * 300, 350 + Math.random() * 300];
  const opacityByLayer = [0.25, 0.15, 0.08];

  return {
    x: Math.random() * w,
    y: h + 10 + Math.random() * 60,
    vx: (Math.random() - 0.5) * 0.6,
    vy: -(0.4 + Math.random() * 0.8),
    radius: radiusByLayer[layer],
    opacity: 0,
    life: 0,
    maxLife: maxLifeByLayer[layer],
    turbulence: 10 + Math.random() * 25,
    turbulenceSpeed: 0.005 + Math.random() * 0.01,
    turbulenceOffset: Math.random() * Math.PI * 2,
    layer,
  };
}

export default function SmokeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);

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
    const PARTICLE_COUNT = 120;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Pre-fill at various life stages
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = createParticle(canvas.width, canvas.height);
      p.life = Math.random() * p.maxLife;
      p.y -= p.life * Math.abs(p.vy);
      p.x += Math.sin(p.life * p.turbulenceSpeed + p.turbulenceOffset) * p.turbulence;
      particles.push(p);
    }

    const opacityByLayer = [0.25, 0.15, 0.08];

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        const lifeRatio = p.life / p.maxLife;
        const peakOpacity = opacityByLayer[p.layer];

        // Sharp fade in (10%), sustain, fade out (25%)
        if (lifeRatio < 0.1) {
          p.opacity = (lifeRatio / 0.1) * peakOpacity;
        } else if (lifeRatio > 0.75) {
          p.opacity = ((1 - lifeRatio) / 0.25) * peakOpacity;
        } else {
          p.opacity = peakOpacity;
        }

        // Turbulence
        const turbX =
          Math.sin(p.life * p.turbulenceSpeed + p.turbulenceOffset) * p.turbulence;
        const turbY =
          Math.cos(p.life * p.turbulenceSpeed * 0.8 + p.turbulenceOffset + 1.5) *
          p.turbulence * 0.4;

        p.x += p.vx;
        p.y += p.vy;

        // Less expansion — keeps definition
        const currentRadius = p.radius * (1 + lifeRatio * 0.4);

        const drawX = p.x + turbX;
        const drawY = p.y + turbY;

        // Tighter gradient — more solid center, sharper edge
        const gradient = ctx.createRadialGradient(
          drawX, drawY, 0,
          drawX, drawY, currentRadius
        );
        gradient.addColorStop(0, `rgba(200, 200, 200, ${p.opacity})`);
        gradient.addColorStop(0.3, `rgba(170, 170, 170, ${p.opacity * 0.85})`);
        gradient.addColorStop(0.6, `rgba(130, 130, 130, ${p.opacity * 0.4})`);
        gradient.addColorStop(0.85, `rgba(100, 100, 100, ${p.opacity * 0.1})`);
        gradient.addColorStop(1, "rgba(80, 80, 80, 0)");

        ctx.beginPath();
        ctx.arc(drawX, drawY, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

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
    />
  );
}
