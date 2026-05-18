"use client";

import { useEffect } from "react";

export default function DropPoller() {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/store-status");
        if (!res.ok) return;
        const { open } = await res.json();
        if (open) window.location.href = "/";
      } catch {
        // silencioso, reintenta en el próximo tick
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
