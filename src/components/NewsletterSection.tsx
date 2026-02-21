"use client";

import ScrollReveal from "@/components/animations/ScrollReveal";

export default function NewsletterSection() {
  return (
    <section className="bg-kloven-dark text-kloven-white py-14 sm:py-24 px-4 text-center relative overflow-hidden">
      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E')] bg-repeat" />

      <ScrollReveal>
        <div className="max-w-3xl mx-auto relative z-10 p-6 sm:p-10 border border-kloven-smoke backdrop-blur-sm rounded-sm">
          <h2 className="font-heading text-5xl md:text-6xl uppercase mb-4 tracking-wider">
            Unite al Club
          </h2>
          <p className="text-kloven-ash mb-10 text-base sm:text-lg">
            Suscribite para recibir acceso anticipado a nuevos drops y un{" "}
            <span className="text-kloven-white font-bold">10% OFF</span> en tu
            primera compra con el codigo{" "}
            <span className="bg-kloven-red text-white px-2 py-0.5 font-bold">
              KLOVEN10
            </span>
            .
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="TU EMAIL"
              className="flex-1 bg-kloven-carbon border border-kloven-smoke p-3 sm:p-5 text-kloven-white placeholder-kloven-ash focus:outline-none focus:border-kloven-red focus:bg-kloven-smoke/50 transition-colors"
            />
            <button className="bg-kloven-red text-white px-6 py-3 sm:px-10 sm:py-5 font-bold uppercase tracking-widest hover:bg-kloven-red-dark transition-colors">
              Suscribirse
            </button>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
