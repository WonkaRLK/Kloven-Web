"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative pt-24 pb-16 md:pt-40 md:pb-28 bg-gray-50 overflow-hidden">
      <div className="absolute top-0 right-0 w-2/3 h-full bg-gray-100 transform skew-x-12 translate-x-1/4" />
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center relative z-10">
        <div className="w-full md:w-1/2 mb-10 md:mb-0 pr-0 md:pr-12 animate-slide-up">
          <div className="inline-flex items-center gap-2 py-1 px-3 bg-black text-white text-xs font-bold uppercase tracking-widest mb-6 rounded-full">
            <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
            Nueva Coleccion 2026
          </div>
          <h1 className="text-5xl md:text-8xl font-black leading-[0.9] mb-8 tracking-tighter">
            REDEFINI <br />
            TU ESTILO <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-600 to-black">
              OVERSIZE & STREETWEAR
            </span>
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-md leading-relaxed">
            Disenos exclusivos con cortes amplios y telas premium. La comodidad
            se encuentra con el streetwear de vanguardia.
          </p>
          <Link
            href="/tienda"
            className="group inline-flex bg-black text-white px-10 py-5 font-bold uppercase tracking-widest hover:bg-kloven-red transition-colors duration-300 items-center gap-3 shadow-xl shadow-black/20"
          >
            Ver Catalogo
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="w-full md:w-1/2 relative">
          <div className="aspect-[4/5] bg-gray-200 overflow-hidden relative group shadow-2xl rounded-sm">
            <Image
              src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=1000"
              alt="Streetwear model"
              fill
              priority
              className="object-cover group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-6 left-6 text-white">
              <p className="font-bold uppercase tracking-widest text-sm">
                Edicion Limitada
              </p>
              <p className="text-xs opacity-80">Buenos Aires Cap.</p>
            </div>
          </div>
          {/* Decorative red square */}
          <div className="absolute -bottom-6 -right-6 w-32 h-32 border-4 border-kloven-red z-0 hidden md:block" />
        </div>
      </div>
    </div>
  );
}
