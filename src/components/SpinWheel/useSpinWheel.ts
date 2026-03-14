"use client";

import { useState, useEffect, useCallback } from "react";
import { SEGMENT_ANGLE } from "./segments";

interface SpinResult {
  segmentIndex: number;
  code: string | null;
  discount: number;
}

const LS_KEY = "kloven_spin_wheel";

interface StoredState {
  hasSpun: boolean;
  result: SpinResult | null;
  dismissedAt: number | null;
}

function getStoredState(): StoredState {
  if (typeof window === "undefined")
    return { hasSpun: false, result: null, dismissedAt: null };
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { hasSpun: false, result: null, dismissedAt: null };
    return JSON.parse(raw);
  } catch {
    return { hasSpun: false, result: null, dismissedAt: null };
  }
}

function setStoredState(state: StoredState) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

/** Calculate the resting rotation angle that places the given segment under the pointer (top). */
function restingRotation(segmentIndex: number): number {
  const segmentCenter = segmentIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
  return 360 - segmentCenter;
}

export function useSpinWheel() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phase, setPhase] = useState<"email" | "spin" | "result">("email");
  const [email, setEmail] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load stored state on mount
  useEffect(() => {
    const stored = getStoredState();
    if (stored.hasSpun && stored.result) {
      setHasSpun(true);
      setResult(stored.result);
      setPhase("result");
      setRotation(restingRotation(stored.result.segmentIndex));
    }
  }, []);

  // Auto-popup: 5 sec delay on first visit
  useEffect(() => {
    const stored = getStoredState();
    if (stored.hasSpun) return;
    if (
      stored.dismissedAt &&
      Date.now() - stored.dismissedAt < 24 * 60 * 60 * 1000
    )
      return;

    const timer = setTimeout(() => {
      setIsModalOpen(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const openModal = useCallback(() => {
    const stored = getStoredState();
    if (stored.hasSpun && stored.result) {
      setResult(stored.result);
      setPhase("result");
      setRotation(restingRotation(stored.result.segmentIndex));
    } else {
      setPhase("email");
    }
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setError(null);
    if (!hasSpun) {
      const stored = getStoredState();
      stored.dismissedAt = Date.now();
      setStoredState(stored);
    }
  }, [hasSpun]);

  const spin = useCallback(async () => {
    if (!email || spinning || hasSpun) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/spin-wheel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al girar. Intent\u00e1 de nuevo.");
        setLoading(false);
        return;
      }

      // Calculate landing rotation
      const offset = (Math.random() - 0.5) * (SEGMENT_ANGLE * 0.6);
      const segmentCenter =
        data.segmentIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2 + offset;
      const targetAngle = 360 - segmentCenter;
      const fullSpins = 5 + Math.floor(Math.random() * 3);
      const totalRotation = fullSpins * 360 + targetAngle;

      setPhase("spin");
      setLoading(false);
      setSpinning(true);
      setRotation(totalRotation);

      // Wait for animation to complete then show result
      setTimeout(() => {
        setSpinning(false);
        const spinResult: SpinResult = {
          segmentIndex: data.segmentIndex,
          code: data.code || null,
          discount: data.discount || 0,
        };
        setResult(spinResult);
        setHasSpun(true);
        setStoredState({
          hasSpun: true,
          result: spinResult,
          dismissedAt: null,
        });
        setPhase("result");
      }, 5200);
    } catch {
      setError("Error de conexi\u00f3n. Intent\u00e1 de nuevo.");
      setLoading(false);
    }
  }, [email, spinning, hasSpun]);

  const copyCode = useCallback(async () => {
    if (!result?.code) return;
    try {
      await navigator.clipboard.writeText(result.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback — silently fail
    }
  }, [result]);

  return {
    isModalOpen,
    phase,
    email,
    setEmail,
    spinning,
    rotation,
    result,
    error,
    hasSpun,
    loading,
    copied,
    openModal,
    closeModal,
    spin,
    copyCode,
  };
}
