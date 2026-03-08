"use client";

import { Suspense } from "react";
import Hero from "@/components/Hero";
import TiendaSection from "@/components/TiendaSection";
import NewsletterSection from "@/components/NewsletterSection";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-kloven-ash" />
          </div>
        }
      >
        <TiendaSection title="Tienda" showPaddingTop={false} />
      </Suspense>
      <NewsletterSection />
    </>
  );
}
