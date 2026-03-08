"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import TiendaSection from "@/components/TiendaSection";

export default function TiendaPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-28 flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-kloven-ash" />
        </div>
      }
    >
      <TiendaSection title="Tienda" />
    </Suspense>
  );
}
