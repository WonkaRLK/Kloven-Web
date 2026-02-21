"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getShippingInfo } from "@/lib/shipping";

export default function CheckoutPage() {
  const { items, subtotal } = useCart();

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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al procesar el pago");
        setSubmitting(false);
        return;
      }

      if (data.init_point) {
        // Store order ID for success page
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
        <p className="text-gray-500 text-lg mb-4">Tu carrito esta vacio</p>
        <Link
          href="/tienda"
          className="text-black font-bold border-b-2 border-black pb-1"
        >
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link
          href="/tienda"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Seguir comprando
        </Link>

        <h1 className="text-3xl font-black uppercase tracking-tight mb-10">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
            <div>
              <h2 className="text-lg font-black uppercase tracking-wide mb-4">
                Datos personales
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1 tracking-widest">
                    Nombre completo
                  </label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:outline-none focus:border-black focus:bg-white transition-colors"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1 tracking-widest">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:outline-none focus:border-black focus:bg-white transition-colors"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-[10px] font-bold uppercase mb-1 tracking-widest">
                  Telefono
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:outline-none focus:border-black focus:bg-white transition-colors"
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-black uppercase tracking-wide mb-4">
                Direccion de envio
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1 tracking-widest">
                    Direccion
                  </label>
                  <input
                    required
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:outline-none focus:border-black focus:bg-white transition-colors"
                    placeholder="Calle y altura"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1 tracking-widest">
                      Ciudad
                    </label>
                    <input
                      required
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:outline-none focus:border-black focus:bg-white transition-colors"
                      placeholder="Ciudad"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1 tracking-widest">
                      Codigo Postal
                    </label>
                    <input
                      required
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:outline-none focus:border-black focus:bg-white transition-colors"
                      placeholder="CP"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Promo */}
            <div>
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
                  type="button"
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

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 text-sm rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-kloven-red transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
            <div className="bg-gray-50 p-6 border border-gray-100 sticky top-28">
              <h2 className="text-lg font-black uppercase tracking-wide mb-6">
                Tu Pedido
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.variant.id} className="flex gap-3">
                    <div className="w-16 h-20 bg-gray-200 flex-shrink-0 overflow-hidden relative">
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-bold">{item.product.name}</p>
                      <p className="text-gray-500 text-xs">
                        {item.variant.size} / {item.variant.color} x{" "}
                        {item.quantity}
                      </p>
                      <p className="font-bold mt-1">
                        ${(item.product.price * item.quantity).toLocaleString("es-AR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString("es-AR")}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Descuento</span>
                    <span>-${discountAmount.toLocaleString("es-AR")}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Envio</span>
                  <span>
                    {shipping.isFree ? (
                      <span className="text-green-600 font-medium">
                        Gratis
                      </span>
                    ) : (
                      `$${shipping.cost.toLocaleString("es-AR")}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-black border-t border-gray-200 pt-3 mt-3">
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
