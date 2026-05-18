"use client";

import { useEffect } from "react";

export default function DropPoller() {
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/store-status");
        if (!res.ok) return;
        const { open } = await res.json();
        if (open) window.location.href = "/";
      } catch {
        // silencioso, reintenta en el próximo tick
      }
    };

    const interval = setInterval(check, 3_000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
