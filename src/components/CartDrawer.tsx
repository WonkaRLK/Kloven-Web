"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, X, Minus, Plus, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getShippingInfo } from "@/lib/shipping";
import { motion, AnimatePresence } from "framer-motion";

export default function CartDrawer() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    totalItems,
    subtotal,
    isOpen,
    setIsOpen,
  } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [validatingPromo, setValidatingPromo] = useState(false);

  const discountAmount = Math.round(subtotal * discount);
  const afterDiscount = subtotal - discountAmount;
  const shipping = getShippingInfo(afterDiscount);
  const total = afterDiscount + shipping.cost;

  const handleApplyPromo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    setValidatingPromo(true);
    setPromoError("");
    setPromoSuccess("");

    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (data.valid) {
        setDiscount(data.discount_percent / 100);
        setPromoSuccess(
          `Descuento del ${data.discount_percent}% aplicado!`
        );
        setPromoError("");
      } else {
        setDiscount(0);
        setPromoError("Codigo invalido o expirado");
        setPromoSuccess("");
      }
    } catch {
      setPromoError("Error al validar");
    } finally {
      setValidatingPromo(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <motion.div
        className="fixed top-0 right-0 h-full w-full max-w-md bg-kloven-dark z-50 shadow-2xl flex flex-col border-l border-kloven-smoke"
        initial={false}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="p-6 border-b border-kloven-smoke flex items-center justify-between">
          <h2 className="font-heading text-2xl uppercase tracking-wider flex items-center gap-2 text-kloven-white">
            <ShoppingBag className="w-5 h-5" />
            Tu Carrito ({totalItems})
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-kloven-carbon rounded-full transition-colors group"
          >
            <X className="w-6 h-6 text-kloven-ash group-hover:text-kloven-white group-hover:rotate-90 transition-all" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-kloven-ash space-y-6">
              <div className="w-24 h-24 bg-kloven-carbon rounded-full flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 opacity-20" />
              </div>
              <div>
                <p className="text-lg font-medium mb-1 text-kloven-white">
                  Tu carrito esta vacio
                </p>
                <p className="text-sm">Mira nuestros nuevos ingresos!</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-kloven-white font-bold border-b-2 border-kloven-red pb-1 hover:text-kloven-red transition-colors"
              >
                Volver a la tienda
              </button>
            </div>
          ) : (
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={item.variant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-4"
                >
                  <div className="w-24 h-32 bg-kloven-carbon flex-shrink-0 overflow-hidden relative border border-kloven-smoke">
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-sm pr-4 text-kloven-white">
                          {item.product.name}
                        </h3>
                        <button
                          onClick={() => removeFromCart(item.variant.id)}
                          className="text-kloven-ash hover:text-kloven-red transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-kloven-ash text-[10px] mt-1 uppercase tracking-wider">
                        Talle: {item.variant.size} | Color: {item.variant.color}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-kloven-smoke rounded-sm">
                        <button
                          onClick={() =>
                            updateQuantity(item.variant.id, item.quantity - 1)
                          }
                          className="px-2 py-1 hover:bg-kloven-carbon transition-colors disabled:opacity-50 text-kloven-white"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-sm font-medium w-8 text-center text-kloven-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.variant.id, item.quantity + 1)
                          }
                          className="px-2 py-1 hover:bg-kloven-carbon transition-colors disabled:opacity-50 text-kloven-white"
                          disabled={item.quantity >= item.variant.stock}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-bold text-sm text-kloven-white">
                        ${(item.product.price * item.quantity).toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 bg-kloven-carbon border-t border-kloven-smoke">
            {/* Promo code */}
            <div className="mb-6">
              <label className="text-xs font-bold uppercase text-kloven-ash mb-2 block">
                Codigo de Descuento
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="EJ: KLOVEN10"
                  className="flex-1 bg-kloven-dark border border-kloven-smoke px-3 py-2 text-sm uppercase text-kloven-white placeholder-kloven-ash focus:outline-none focus:border-kloven-red transition-colors"
                />
                <button
                  onClick={handleApplyPromo}
                  disabled={validatingPromo}
                  className="bg-kloven-red text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-kloven-red-dark transition-colors disabled:opacity-50"
                >
                  {validatingPromo ? "..." : "Aplicar"}
                </button>
              </div>
              {promoError && (
                <p className="text-red-400 text-xs mt-1 font-medium">
                  {promoError}
                </p>
              )}
              {promoSuccess && (
                <p className="text-green-400 text-xs mt-1 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" /> {promoSuccess}
                </p>
              )}
            </div>

            <div className="space-y-2 mb-6 text-sm">
              <div className="flex justify-between items-center text-kloven-ash">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString("es-AR")}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-green-400 font-medium">
                  <span>Descuento</span>
                  <span>-${discountAmount.toLocaleString("es-AR")}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-kloven-ash">
                <span>Envio</span>
                <span>
                  {shipping.isFree ? (
                    <span className="text-green-400 font-medium">Gratis</span>
                  ) : (
                    `$${shipping.cost.toLocaleString("es-AR")}`
                  )}
                </span>
              </div>
              {!shipping.isFree && shipping.remaining > 0 && (
                <p className="text-xs text-kloven-ash">
                  Envio gratis a partir de $
                  {shipping.freeThreshold.toLocaleString("es-AR")} (faltan $
                  {shipping.remaining.toLocaleString("es-AR")})
                </p>
              )}
              <div className="flex justify-between items-center text-lg font-black border-t border-kloven-smoke pt-2 mt-2 text-kloven-white">
                <span>Total</span>
                <span>${total.toLocaleString("es-AR")}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="w-full bg-kloven-red text-white py-4 font-bold uppercase tracking-widest hover:bg-kloven-red-dark transition-all glow-red block text-center"
            >
              Iniciar Compra
            </Link>
          </div>
        )}
      </motion.div>
    </>
  );
}
