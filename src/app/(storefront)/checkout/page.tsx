"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { getShippingInfo } from "@/lib/shipping";

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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            product_id: i.product.id,
            variant_id: i.variant.id,
            quantity: i.quantity,
          })),
          name,
          email,
          phone,
          address,
          city,
          zip,
          promo_code: promoCode.trim() || undefined,
          user_id: user?.id,
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
          className="text-kloven-white font-bold border-b-2 border-kloven-red pb-1"
        >
          Ir a la tienda
        </Link>
      </div>
    );
  }

  const inputClasses =
    "w-full bg-kloven-carbon border border-kloven-smoke p-3 text-sm text-kloven-white placeholder-kloven-ash focus:outline-none focus:border-kloven-red transition-colors";

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
                      onChange={(e) => setZip(e.target.value)}
                      className={inputClasses}
                      placeholder="CP"
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
                  className="flex-1 bg-kloven-carbon border border-kloven-smoke px-3 py-2 text-sm uppercase text-kloven-white placeholder-kloven-ash focus:outline-none focus:border-kloven-red transition-colors"
                />
                <button
                  type="button"
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

            {error && (
              <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-3 text-sm rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-kloven-red text-white py-4 font-bold uppercase tracking-widest hover:bg-kloven-red-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50 glow-red"
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
                {items.map((item) => (
                  <div key={item.variant.id} className="flex gap-3">
                    <div className="w-16 h-20 bg-kloven-carbon flex-shrink-0 overflow-hidden relative border border-kloven-smoke">
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-bold text-kloven-white">
                        {item.product.name}
                      </p>
                      <p className="text-kloven-ash text-xs">
                        {item.variant.size} / {item.variant.color} x{" "}
                        {item.quantity}
                      </p>
                      <p className="font-bold mt-1 text-kloven-white">
                        ${(item.product.price * item.quantity).toLocaleString("es-AR")}
                      </p>
                    </div>
                  </div>
                ))}
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
                  <span>
                    {shipping.isFree ? (
                      <span className="text-green-400 font-medium">
                        Gratis
                      </span>
                    ) : (
                      `$${shipping.cost.toLocaleString("es-AR")}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-black border-t border-kloven-smoke pt-3 mt-3 text-kloven-white">
                  <span>Total</span>
                  <span>${total.toLocaleString("es-AR")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
