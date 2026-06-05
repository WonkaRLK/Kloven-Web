"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Loader2, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { FLAT_FEE } from "@/lib/shipping";
import type { CartItem } from "@/lib/types";

function getItemKey(item: CartItem): string {
  return item.type === "combo" ? item.comboId : item.variant.id;
}

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [installments, setInstallments] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const promoAutoApplied = useRef(false);

  // Auto-fill promo code and email from spin wheel
  useEffect(() => {
    try {
      const raw = localStorage.getItem("kloven_spin_wheel");
      if (!raw) return;
      const stored = JSON.parse(raw);
      if (stored.email && !email) {
        setEmail(stored.email);
      }
      if (stored.result?.code && !promoCode && !promoAutoApplied.current) {
        setPromoCode(stored.result.code);
        promoAutoApplied.current = true;
      }
    } catch {
      // ignore
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-apply promo code once it's been auto-filled
  useEffect(() => {
    if (promoAutoApplied.current && promoCode && !discount && !validatingPromo) {
      promoAutoApplied.current = false;
      handleApplyPromo();
    }
  }, [promoCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const [shippingCost, setShippingCost] = useState(FLAT_FEE);
  const [shippingLabel, setShippingLabel] = useState<string | null>(null);
  const [calculatingShipping, setCalculatingShipping] = useState(false);

  useEffect(() => {
    if (!/^\d{4}$/.test(zip)) {
      setShippingCost(FLAT_FEE);
      setShippingLabel(null);
      return;
    }
    const cpAtTrigger = zip;
    setCalculatingShipping(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/shipping/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cp_destino: cpAtTrigger }),
        });
        const data = await res.json();
        setZip((current) => {
          if (current === cpAtTrigger) {
            setShippingCost(data.cost);
            setShippingLabel(data.label ?? null);
          }
          return current;
        });
      } catch {
        // silent fallback
      } finally {
        setCalculatingShipping(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [zip]); // eslint-disable-line react-hooks/exhaustive-deps

  const discountAmount = Math.round(subtotal * discount);
  const afterDiscount = subtotal - discountAmount;
  const total = afterDiscount + shippingCost;

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
        setPromoSuccess(`Descuento del ${data.discount_percent}% aplicado!`);
      } else {
        setDiscount(0);
        setPromoError("Codigo invalido o expirado");
      }
    } catch {
      setPromoError("Error al validar");
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const checkoutItems = items.map((item) => {
        if (item.type === "combo") {
          return {
            product_id: item.product.id,
            is_combo: true,
            combo_selections: item.comboSelections.map((s) => ({
              product_id: s.product_id,
              variant_id: s.variant_id,
              quantity: s.quantity,
            })),
            quantity: item.quantity,
          };
        }
        return {
          product_id: item.product.id,
          variant_id: item.variant.id,
          quantity: item.quantity,
        };
      });

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: checkoutItems,
          name,
          email,
          phone,
          address,
          city,
          zip,
          promo_code: promoCode.trim() || undefined,
          user_id: user?.id,
          installments: installments > 1 ? installments : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al procesar el pago");
        setSubmitting(false);
        return;
      }

      if (data.init_point) {
        sessionStorage.setItem("kloven_order_id", data.order_id);
        sessionStorage.setItem("kloven_order_email", email.trim());
        if (data.tracking_token) {
          sessionStorage.setItem("kloven_tracking_token", data.tracking_token);
        }
        window.location.href = data.init_point;
      } else {
        setError("No se pudo iniciar el pago");
        setSubmitting(false);
      }
    } catch {
      setError("Error de conexion");
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-28 container mx-auto px-4 text-center py-32">
        <p className="text-kloven-ash text-lg mb-4">Tu carrito esta vacio</p>
        <Link
          href="/tienda"
          className="text-kloven-white font-bold border-b-2 border-kloven-gold pb-1"
        >
          Ir a la tienda
        </Link>
      </div>
    );
  }

  const inputClasses =
    "w-full bg-kloven-carbon border border-kloven-smoke p-3 text-sm text-kloven-white placeholder-kloven-ash focus:outline-none focus:border-kloven-gold transition-colors";

  return (
    <div className="pt-28 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link
          href="/tienda"
          className="inline-flex items-center gap-2 text-sm text-kloven-ash hover:text-kloven-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Seguir comprando
        </Link>

        <h1 className="font-heading text-4xl uppercase tracking-wider mb-10 text-kloven-white">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
            <div>
              <h2 className="font-heading text-2xl uppercase tracking-wider mb-4 text-kloven-white">
                Datos personales
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1 tracking-widest text-kloven-ash">
                    Nombre completo
                  </label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClasses}
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1 tracking-widest text-kloven-ash">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClasses}
                    placeholder="tu@email.com"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-[10px] font-bold uppercase mb-1 tracking-widest text-kloven-ash">
                  Telefono
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClasses}
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div>
              <h2 className="font-heading text-2xl uppercase tracking-wider mb-4 text-kloven-white">
                Direccion de envio
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1 tracking-widest text-kloven-ash">
                    Direccion
                  </label>
                  <input
                    required
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={inputClasses}
                    placeholder="Calle y altura"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1 tracking-widest text-kloven-ash">
                      Ciudad
                    </label>
                    <input
                      required
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={inputClasses}
                      placeholder="Ciudad"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1 tracking-widest text-kloven-ash">
                      Codigo Postal
                    </label>
                    <input
                      required
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
                      className={inputClasses}
                      placeholder="CP"
                      maxLength={4}
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Promo */}
            <div>
              <label className="text-xs font-bold uppercase text-kloven-ash mb-2 block">
                Codigo de Descuento
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="EJ: KLOVEN10"
                  className="flex-1 bg-kloven-carbon border border-kloven-smoke px-3 py-2 text-sm uppercase text-kloven-white placeholder-kloven-ash focus:outline-none focus:border-kloven-gold transition-colors"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={validatingPromo}
                  className="bg-kloven-gold text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-kloven-gold/80 transition-colors disabled:opacity-50"
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

            {error && (
              <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-3 text-sm rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || calculatingShipping}
              className="w-full bg-kloven-gold text-white py-4 font-bold uppercase tracking-widest hover:bg-kloven-gold/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_30px_rgba(166,124,46,0.3)]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                `Pagar $${total.toLocaleString("es-AR")}`
              )}
            </button>
          </form>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-kloven-dark p-4 sm:p-6 border border-kloven-smoke lg:sticky lg:top-28">
              <h2 className="font-heading text-2xl uppercase tracking-wider mb-6 text-kloven-white">
                Tu Pedido
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => {
                  const key = getItemKey(item);
                  return (
                    <div key={key} className="flex gap-3">
                      <div className="w-16 h-20 bg-kloven-carbon flex-shrink-0 overflow-hidden relative border border-kloven-smoke">
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                        {item.type === "combo" && (
                          <span className="absolute top-0.5 left-0.5 bg-purple-600 text-white text-[7px] font-bold px-1 py-0.5 rounded flex items-center gap-0.5">
                            <Package className="w-2 h-2" />
                          </span>
                        )}
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="font-bold text-kloven-white">
                          {item.product.name}
                        </p>
                        {item.type === "regular" ? (
                          <p className="text-kloven-ash text-xs">
                            {item.variant.size} / {item.variant.color} x{" "}
                            {item.quantity}
                          </p>
                        ) : (
                          <div className="space-y-0.5">
                            {item.comboSelections.map((sel) => (
                              <p
                                key={sel.variant_id}
                                className="text-kloven-ash text-xs"
                              >
                                {sel.product_name}: {sel.size}/{sel.color}
                              </p>
                            ))}
                            <p className="text-kloven-ash text-xs">
                              x {item.quantity}
                            </p>
                          </div>
                        )}
                        <p className="font-bold mt-1 text-kloven-white">
                          ${(item.product.price * item.quantity).toLocaleString("es-AR")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 text-sm border-t border-kloven-smoke pt-4">
                <div className="flex justify-between text-kloven-ash">
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString("es-AR")}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-400 font-medium">
                    <span>Descuento</span>
                    <span>-${discountAmount.toLocaleString("es-AR")}</span>
                  </div>
                )}
                <div className="flex justify-between text-kloven-ash">
                  <span>Envio</span>
                  <div className="text-right">
                    {calculatingShipping ? (
                      <span className="text-xs animate-pulse">Calculando...</span>
                    ) : (
                      <>
                        <span>${shippingCost.toLocaleString("es-AR")}</span>
                        {shippingLabel && (
                          <span className="block text-[10px] text-kloven-ash/60">{shippingLabel}</span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-xl font-black border-t border-kloven-smoke pt-3 mt-3 text-kloven-white">
                  <span>Total</span>
                  <span>${total.toLocaleString("es-AR")}</span>
                </div>
                <div className="flex justify-between text-xs text-kloven-ash pt-1">
                  <span>Transferencia / Efectivo</span>
                  <span className="text-kloven-white font-semibold">${total.toLocaleString("es-AR")}</span>
                </div>
              </div>

              {/* Installments selector */}
              <div className="mt-5 pt-5 border-t border-kloven-smoke">
                <p className="text-[10px] font-bold uppercase tracking-widest text-kloven-ash mb-3">
                  Cuotas con tarjeta de crédito
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 3, 6, 9, 12].map((n) => {
                    const monthlyTotal = n === 1
                      ? total
                      : Math.round(total * ([1,1.10,1.28,1.48,1.68][[1,3,6,9,12].indexOf(n)]) / n) * n;
                    const monthly = n === 1
                      ? total
                      : Math.round(total * ([1,1.10,1.28,1.48,1.68][[1,3,6,9,12].indexOf(n)]) / n);
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setInstallments(n)}
                        className={`text-left px-3 py-2.5 border text-xs transition-colors ${
                          installments === n
                            ? "border-kloven-gold bg-kloven-gold/10 text-kloven-white"
                            : "border-kloven-smoke text-kloven-ash hover:border-kloven-ash"
                        }`}
                      >
                        <span className="font-bold block">
                          {n === 1 ? "1 pago" : `${n} cuotas`}
                        </span>
                        <span className="text-[11px]">
                          {n === 1
                            ? `$${total.toLocaleString("es-AR")}`
                            : `${n}x $${monthly.toLocaleString("es-AR")}`}
                        </span>
                        {n > 1 && (
                          <span className="text-[10px] text-kloven-ash block">
                            Total ${monthlyTotal.toLocaleString("es-AR")}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {installments > 1 && (
                  <p className="text-[10px] text-kloven-ash mt-2">
                    * Interés referencial. El monto final depende de tu tarjeta.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
