"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Copy, Check } from "lucide-react";
import RouletteWheel from "./RouletteWheel";

interface SpinWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  phase: "email" | "spin" | "result";
  email: string;
  onEmailChange: (email: string) => void;
  onSpin: () => void;
  spinning: boolean;
  rotation: number;
  result: { segmentIndex: number; code: string | null; discount: number } | null;
  error: string | null;
  loading: boolean;
  copied: boolean;
  onCopy: () => void;
}

export default function SpinWheelModal({
  isOpen,
  onClose,
  phase,
  email,
  onEmailChange,
  onSpin,
  spinning,
  rotation,
  result,
  error,
  loading,
  copied,
  onCopy,
}: SpinWheelModalProps) {
  // Lock body scroll
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

  // Close on Escape (disabled while spinning)
  useEffect(() => {
    if (!isOpen || spinning) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, spinning, onClose]);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={spinning ? undefined : onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-black/40 backdrop-blur-xl border border-white/10 w-full max-w-sm min-h-[520px] max-h-[90vh] overflow-y-auto z-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Close button — hidden while spinning */}
            {!spinning && (
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-10 text-kloven-ash hover:text-kloven-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="p-6 flex flex-col justify-center min-h-[inherit]">
              {/* Header */}
              <div className="text-center mb-4">
                <Gift className="w-8 h-8 text-kloven-red mx-auto mb-2" />
                <h2 className="font-heading text-xl tracking-wider text-kloven-white uppercase">
                  Gir&aacute; para ganar
                </h2>
                <p className="text-sm text-kloven-ash mt-1">
                  {phase === "email" &&
                    "Ingres\u00e1 tu email y gir\u00e1 la ruleta para ganar un descuento."}
                  {phase === "spin" && "\u00a1Buena suerte!"}
                  {phase === "result" &&
                    (result?.discount
                      ? "\u00a1Felicitaciones!"
                      : "\u00a1Ser\u00e1 la pr\u00f3xima!")}
                </p>
              </div>

              {/* Phase: Email — show wheel with blur overlay */}
              {phase === "email" && (
                <>
                  <div className="mb-4">
                    <RouletteWheel rotation={0} spinning={false} />
                  </div>
                  <div className="space-y-3 bg-white/5 border border-kloven-red/30 p-4 rounded-sm">
                    <p className="text-center text-sm text-kloven-white font-heading uppercase tracking-wider">
                      Ingres&aacute; tu email para girar
                    </p>
                    <input
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => onEmailChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && isValidEmail && !loading) onSpin();
                      }}
                      className="w-full bg-black/40 border-2 border-kloven-red/50 px-4 py-3 text-kloven-white placeholder:text-kloven-ash/50 focus:outline-none focus:border-kloven-red transition-colors text-center text-lg"
                    />
                    {error && (
                      <p className="text-kloven-red text-sm">{error}</p>
                    )}
                    <button
                      onClick={onSpin}
                      disabled={!isValidEmail || loading}
                      className="w-full bg-kloven-red text-white py-3.5 font-heading uppercase tracking-wider text-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[0_0_20px_rgba(217,4,41,0.3)]"
                    >
                      {loading ? "Cargando..." : "Girar la ruleta"}
                    </button>
                    <p className="text-[10px] text-kloven-ash/60 text-center">
                      No compartimos tu email con nadie.
                    </p>
                  </div>
                </>
              )}

              {/* Phase: Spin (wheel animating) */}
              {phase === "spin" && (
                <RouletteWheel rotation={rotation} spinning={spinning} />
              )}

              {/* Phase: Result */}
              {phase === "result" && result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="text-center"
                >
                  {result.discount > 0 ? (
                    <>
                      <p className="text-3xl font-heading text-kloven-red uppercase tracking-wider mb-2">
                        &iexcl;{result.discount}% OFF!
                      </p>
                      <p className="text-sm text-kloven-ash mb-3">
                        Tu c&oacute;digo de descuento:
                      </p>
                      <div className="flex items-center justify-center gap-2 bg-kloven-dark border border-kloven-smoke px-4 py-3">
                        <span className="text-kloven-white font-mono text-lg tracking-widest">
                          {result.code}
                        </span>
                        <button
                          onClick={onCopy}
                          className="text-kloven-ash hover:text-kloven-red transition-colors"
                          title="Copiar c&oacute;digo"
                        >
                          {copied ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-kloven-ash mt-2">
                        V&aacute;lido por 72 horas. Uso &uacute;nico.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-heading text-kloven-ash uppercase tracking-wider mb-2">
                        Perdiste :(
                      </p>
                      <p className="text-sm text-kloven-ash">
                        &iexcl;No te desanimes! Segu&iacute; visitando nuestra
                        tienda.
                      </p>
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
