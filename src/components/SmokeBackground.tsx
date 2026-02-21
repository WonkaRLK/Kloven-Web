"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export default function SmokeBackground() {
  const [visible, setVisible] = useState(false);
  const videoA = useRef<HTMLVideoElement>(null);
  const videoB = useRef<HTMLVideoElement>(null);
  const [opacityA, setOpacityA] = useState(1);
  const [opacityB, setOpacityB] = useState(0);
  const activeRef = useRef<"A" | "B">("A");

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  const crossfade = useCallback(() => {
    if (activeRef.current === "A") {
      // B starts playing, fades in; A fades out then resets
      videoB.current?.play();
      setOpacityA(0);
      setOpacityB(1);
      activeRef.current = "B";
      setTimeout(() => {
        if (videoA.current) {
          videoA.current.currentTime = 0;
        }
      }, 2000);
    } else {
      videoA.current?.play();
      setOpacityB(0);
      setOpacityA(1);
      activeRef.current = "A";
      setTimeout(() => {
        if (videoB.current) {
          videoB.current.currentTime = 0;
        }
      }, 2000);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;

    const vA = videoA.current;
    const vB = videoB.current;
    if (!vA || !vB) return;

    const handleTimeUpdate = () => {
      const active = activeRef.current === "A" ? vA : vB;
      // Start crossfade 2s before end
      if (active.duration && active.currentTime >= active.duration - 2) {
        active.removeEventListener("timeupdate", handleTimeUpdate);
        crossfade();
        // Re-attach to the new active video after crossfade
        setTimeout(() => {
          const newActive = activeRef.current === "A" ? vA : vB;
          newActive.addEventListener("timeupdate", handleTimeUpdate);
        }, 2500);
      }
    };

    vA.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      vA.removeEventListener("timeupdate", handleTimeUpdate);
      vB.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [visible, crossfade]);

  return (
    <div
      className="fixed inset-0 z-[1] pointer-events-none overflow-hidden"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 2s ease-in",
      }}
    >
      <video
        ref={videoA}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          mixBlendMode: "screen",
          opacity: opacityA * 0.4,
          transition: "opacity 2s ease-in-out",
        }}
      >
        <source src="/smoke.mp4" type="video/mp4" />
      </video>
      <video
        ref={videoB}
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          mixBlendMode: "screen",
          opacity: opacityB * 0.4,
          transition: "opacity 2s ease-in-out",
        }}
      >
        <source src="/smoke.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
