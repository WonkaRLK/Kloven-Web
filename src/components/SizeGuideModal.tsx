"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  sizeType: string;
  category: string;
}

const REMERA_BUZO_SIZES = [
  { talle: "S", ancho: 48, largo: 68 },
  { talle: "M", ancho: 51, largo: 70 },
  { talle: "L", ancho: 54, largo: 72 },
  { talle: "XL", ancho: 57, largo: 74 },
  { talle: "XXL", ancho: 60, largo: 76 },
];

const PANTALON_SIZES = [
  { talle: "S", cintura: 38, largo: 100 },
  { talle: "M", cintura: 40, largo: 102 },
  { talle: "L", cintura: 42, largo: 104 },
  { talle: "XL", cintura: 44, largo: 106 },
  { talle: "XXL", cintura: 46, largo: 108 },
];

const SHOE_SIZES = [
  { ar: 36, eur: 36, us: 4, cm: 22.5 },
  { ar: 37, eur: 37, us: 5, cm: 23.5 },
  { ar: 38, eur: 38, us: 6, cm: 24 },
  { ar: 39, eur: 39, us: 7, cm: 25 },
  { ar: 40, eur: 40, us: 8, cm: 25.5 },
  { ar: 41, eur: 41, us: 9, cm: 26.5 },
  { ar: 42, eur: 42, us: 10, cm: 27 },
  { ar: 43, eur: 43, us: 11, cm: 28 },
  { ar: 44, eur: 44, us: 12, cm: 28.5 },
];

function TShirtIllustration() {
  return (
    <svg viewBox="0 0 200 220" className="w-32 h-auto mx-auto mb-4 text-kloven-ash">
      {/* T-shirt outline */}
      <path
        d="M60 30 L40 50 L15 40 L30 80 L50 70 L50 200 L150 200 L150 70 L170 80 L185 40 L160 50 L140 30 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Collar */}
      <path
        d="M60 30 Q80 50 100 50 Q120 50 140 30"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Width arrow */}
      <line x1="50" y1="115" x2="150" y2="115" stroke="var(--color-kloven-gold)" strokeWidth="1.5" strokeDasharray="4 3" />
      <polygon points="50,112 55,115 50,118" fill="var(--color-kloven-gold)" />
      <polygon points="150,112 145,115 150,118" fill="var(--color-kloven-gold)" />
      <text x="100" y="110" textAnchor="middle" fill="var(--color-kloven-gold)" fontSize="11" fontWeight="bold">Ancho</text>
      {/* Length arrow */}
      <line x1="165" y1="35" x2="165" y2="200" stroke="var(--color-kloven-gold)" strokeWidth="1.5" strokeDasharray="4 3" />
      <polygon points="162,35 165,30 168,35" fill="var(--color-kloven-gold)" />
      <polygon points="162,200 165,205 168,200" fill="var(--color-kloven-gold)" />
      <text x="180" y="120" textAnchor="middle" fill="var(--color-kloven-gold)" fontSize="11" fontWeight="bold" transform="rotate(90 180 120)">Largo</text>
    </svg>
  );
}

function PantsIllustration() {
  return (
    <svg viewBox="0 0 180 260" className="w-28 h-auto mx-auto mb-4 text-kloven-ash">
      {/* Pants outline */}
      <path
        d="M40 10 L40 110 L20 250 L75 250 L90 130 L105 250 L160 250 L140 110 L140 10 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Waist arrow */}
      <line x1="40" y1="20" x2="140" y2="20" stroke="var(--color-kloven-gold)" strokeWidth="1.5" strokeDasharray="4 3" />
      <polygon points="40,17 45,20 40,23" fill="var(--color-kloven-gold)" />
      <polygon points="140,17 135,20 140,23" fill="var(--color-kloven-gold)" />
      <text x="90" y="15" textAnchor="middle" fill="var(--color-kloven-gold)" fontSize="11" fontWeight="bold">Cintura</text>
      {/* Length arrow */}
      <line x1="160" y1="10" x2="160" y2="250" stroke="var(--color-kloven-gold)" strokeWidth="1.5" strokeDasharray="4 3" />
      <polygon points="157,10 160,5 163,10" fill="var(--color-kloven-gold)" />
      <polygon points="157,250 160,255 163,250" fill="var(--color-kloven-gold)" />
      <text x="170" y="130" textAnchor="middle" fill="var(--color-kloven-gold)" fontSize="11" fontWeight="bold" transform="rotate(90 170 130)">Largo</text>
    </svg>
  );
}

function ShoeIllustration() {
  return (
    <svg viewBox="0 0 220 120" className="w-36 h-auto mx-auto mb-4 text-kloven-ash">
      {/* Shoe outline */}
      <path
        d="M30 80 Q30 30 70 25 L120 20 Q160 18 180 40 Q200 55 200 70 L200 90 Q180 95 30 95 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Sole */}
      <path
        d="M25 90 Q25 100 35 100 L195 100 Q205 100 205 90"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Length arrow */}
      <line x1="30" y1="110" x2="200" y2="110" stroke="var(--color-kloven-gold)" strokeWidth="1.5" strokeDasharray="4 3" />
      <polygon points="30,107 35,110 30,113" fill="var(--color-kloven-gold)" />
      <polygon points="200,107 195,110 200,113" fill="var(--color-kloven-gold)" />
      <text x="115" y="108" textAnchor="middle" fill="var(--color-kloven-gold)" fontSize="11" fontWeight="bold">cm</text>
    </svg>
  );
}

export default function SizeGuideModal({
  isOpen,
  onClose,
  sizeType,
  category,
}: SizeGuideModalProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const isShoes = sizeType === "shoes";
  const isPants = category === "pantalones";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-kloven-dark border border-kloven-smoke w-full max-w-lg max-h-[90vh] overflow-y-auto z-10"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-kloven-smoke">
              <h2 className="font-heading text-2xl tracking-wider text-kloven-white uppercase">
                Guia de Talles
              </h2>
              <button
                onClick={onClose}
                className="text-kloven-ash hover:text-kloven-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              {/* Illustration */}
              {isShoes ? (
                <ShoeIllustration />
              ) : isPants ? (
                <PantsIllustration />
              ) : (
                <TShirtIllustration />
              )}

              {/* Table */}
              {isShoes ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-kloven-smoke">
                        <th className="py-3 px-3 text-left text-xs font-bold uppercase tracking-widest text-kloven-ash">AR</th>
                        <th className="py-3 px-3 text-left text-xs font-bold uppercase tracking-widest text-kloven-ash">EUR</th>
                        <th className="py-3 px-3 text-left text-xs font-bold uppercase tracking-widest text-kloven-ash">US</th>
                        <th className="py-3 px-3 text-left text-xs font-bold uppercase tracking-widest text-kloven-ash">cm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SHOE_SIZES.map((row) => (
                        <tr key={row.ar} className="border-b border-kloven-smoke/50 hover:bg-kloven-smoke/20 transition-colors">
                          <td className="py-2.5 px-3 text-kloven-white font-bold">{row.ar}</td>
                          <td className="py-2.5 px-3 text-kloven-white">{row.eur}</td>
                          <td className="py-2.5 px-3 text-kloven-white">{row.us}</td>
                          <td className="py-2.5 px-3 text-kloven-white">{row.cm}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : isPants ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-kloven-smoke">
                        <th className="py-3 px-3 text-left text-xs font-bold uppercase tracking-widest text-kloven-ash">Talle</th>
                        <th className="py-3 px-3 text-left text-xs font-bold uppercase tracking-widest text-kloven-ash">Cintura (cm)</th>
                        <th className="py-3 px-3 text-left text-xs font-bold uppercase tracking-widest text-kloven-ash">Largo (cm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PANTALON_SIZES.map((row) => (
                        <tr key={row.talle} className="border-b border-kloven-smoke/50 hover:bg-kloven-smoke/20 transition-colors">
                          <td className="py-2.5 px-3 text-kloven-white font-bold">{row.talle}</td>
                          <td className="py-2.5 px-3 text-kloven-white">{row.cintura}</td>
                          <td className="py-2.5 px-3 text-kloven-white">{row.largo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-kloven-smoke">
                        <th className="py-3 px-3 text-left text-xs font-bold uppercase tracking-widest text-kloven-ash">Talle</th>
                        <th className="py-3 px-3 text-left text-xs font-bold uppercase tracking-widest text-kloven-ash">Ancho (cm)</th>
                        <th className="py-3 px-3 text-left text-xs font-bold uppercase tracking-widest text-kloven-ash">Largo (cm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {REMERA_BUZO_SIZES.map((row) => (
                        <tr key={row.talle} className="border-b border-kloven-smoke/50 hover:bg-kloven-smoke/20 transition-colors">
                          <td className="py-2.5 px-3 text-kloven-white font-bold">{row.talle}</td>
                          <td className="py-2.5 px-3 text-kloven-white">{row.ancho}</td>
                          <td className="py-2.5 px-3 text-kloven-white">{row.largo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tip */}
              <p className="text-xs text-kloven-ash mt-5 text-center italic">
                Si estas entre dos talles, te recomendamos elegir el mas grande.
              </p>
              <p className="text-[10px] text-kloven-smoke mt-2 text-center">
                Las medidas son aproximadas y pueden variar ligeramente.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
