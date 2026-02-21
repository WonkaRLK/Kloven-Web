"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, X, Minus, Plus, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getShippingInfo } from "@/lib/shipping";

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
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all duration-500 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 transform transition-transform duration-500 shadow-2xl flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <h2 className="text-xl font-black uppercase tracking-wide flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Tu Carrito ({totalItems})
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-6 animate-fade-in">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 opacity-20" />
              </div>
              <div>
                <p className="text-lg font-medium mb-1">
                  Tu carrito esta vacio
                </p>
                <p className="text-sm">Mira nuestros nuevos ingresos!</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-black font-bold border-b-2 border-black pb-1 hover:text-kloven-red hover:border-kloven-red transition-colors"
              >
                Volver a la tienda
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.variant.id} className="flex gap-4 animate-slide-up">
                <div className="w-24 h-32 bg-gray-100 flex-shrink-0 overflow-hidden relative">
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
                      <h3 className="font-bold text-sm pr-4">
                        {item.product.name}
                      </h3>
                      <button
                        onClick={() => removeFromCart(item.variant.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-wider">
                      Talle: {item.variant.size} | Color: {item.variant.color}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-gray-200 rounded-sm">
                      <button
                        onClick={() =>
                          updateQuantity(item.variant.id, item.quantity - 1)
                        }
                        className="px-2 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-sm font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.variant.id, item.quantity + 1)
                        }
                        className="px-2 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50"
                        disabled={item.quantity >= item.variant.stock}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-bold text-sm">
                      ${(item.product.price * item.quantity).toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 bg-gray-50 border-t border-gray-100 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            {/* Promo code */}
            <div className="mb-6">
              <label className="text-xs font-bold uppercase text-gray-500 mb-2 block">
                Codigo de Descuento
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="EJ: KLOVEN10"
                  className="flex-1 border border-gray-300 px-3 py-2 text-sm uppercase focus:outline-none focus:border-black"
                />
                <button
                  onClick={handleApplyPromo}
                  disabled={validatingPromo}
                  className="bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {validatingPromo ? "..." : "Aplicar"}
                </button>
              </div>
              {promoError && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {promoError}
                </p>
              )}
              {promoSuccess && (
                <p className="text-green-600 text-xs mt-1 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" /> {promoSuccess}
                </p>
              )}
            </div>

            <div className="space-y-2 mb-6 text-sm">
              <div className="flex justify-between items-center text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString("es-AR")}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-green-600 font-medium">
                  <span>Descuento</span>
                  <span>-${discountAmount.toLocaleString("es-AR")}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-gray-600">
                <span>Envio</span>
                <span>
                  {shipping.isFree ? (
                    <span className="text-green-600 font-medium">Gratis</span>
                  ) : (
                    `$${shipping.cost.toLocaleString("es-AR")}`
                  )}
                </span>
              </div>
              {!shipping.isFree && shipping.remaining > 0 && (
                <p className="text-xs text-gray-400">
                  Envio gratis a partir de $
                  {shipping.freeThreshold.toLocaleString("es-AR")} (faltan $
                  {shipping.remaining.toLocaleString("es-AR")})
                </p>
              )}
              <div className="flex justify-between items-center text-lg font-black border-t border-gray-200 pt-2 mt-2">
                <span>Total</span>
                <span>${total.toLocaleString("es-AR")}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="w-full bg-kloven-red text-white py-4 font-bold uppercase tracking-widest hover:bg-red-700 transition-all hover:shadow-lg block text-center"
            >
              Iniciar Compra
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
