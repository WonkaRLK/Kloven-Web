"use client";

import { useEffect } from "react";

interface Props {
  opensAt: string | null;
}

export default function DropPoller({ opensAt }: Props) {
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/store-status");
        if (!res.ok) return;
        const data: { open: boolean; drop_opens_at: string | null } = await res.json();

        // Tienda abierta → ir a home
        if (data.open) {
          window.location.href = "/";
          return;
        }

        // Config cambió (countdown activado/desactivado/modificado) → recargar
        if (data.drop_opens_at !== opensAt) {
          window.location.reload();
        }
      } catch {
        // silencioso, reintenta en el próximo tick
      }
    };

    const interval = setInterval(check, 3_000);
    return () => clearInterval(interval);
  }, [opensAt]);

  return null;
}
