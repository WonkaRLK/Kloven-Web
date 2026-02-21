"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Loader2, Crown } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface OrderData {
  id: string;
  status: string;
  payer_name: string;
  payer_email: string;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  total: number;
  order_items: {
    product_name: string;
    size: string;
    color: string;
    quantity: number;
    unit_price: number;
  }[];
}

function CompraExitoContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    const externalRef =
      searchParams.get("external_reference") ||
      sessionStorage.getItem("kloven_order_id");

    if (!externalRef) {
      setLoading(false);
      return;
    }

    if (!cleared) {
      clearCart();
      setCleared(true);
      sessionStorage.removeItem("kloven_order_id");
    }

    let attempts = 0;
    const maxAttempts = 20;

    const poll = async () => {
      try {
        const res = await fetch(`/api/orders/${externalRef}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
          if (data.status === "approved" || attempts >= maxAttempts) {
            setLoading(false);
            return;
          }
        }
      } catch {
        // ignore
      }

      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(poll, 3000);
      } else {
        setLoading(false);
      }
    };

    poll();
  }, [searchParams, clearCart, cleared]);

  return (
    <div className="pt-28 pb-20 container mx-auto px-4 text-center max-w-2xl">
      <div className="relative inline-block mb-8">
        <div className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto">
          <Check className="w-16 h-16" />
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-black uppercase mb-4 tracking-tighter">
        Pedido Exitoso!
      </h1>
      <p className="text-gray-500 max-w-md mx-auto mb-10 text-lg">
        Recibiras un email con los detalles del envio. Bienvenido a la familia
        Kloven!
      </p>

      {loading ? (
        <div className="flex items-center justify-center gap-3 text-gray-500 mb-10">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Confirmando pago...</span>
        </div>
      ) : order ? (
        <div className="bg-gray-50 border border-gray-100 p-6 text-left mb-10 rounded-sm">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5" />
            <h2 className="font-black uppercase tracking-wide">
              Resumen del pedido
            </h2>
          </div>

          <div className="space-y-3 mb-4">
            {order.order_items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>
                  {item.product_name} ({item.size}/{item.color}) x{" "}
                  {item.quantity}
                </span>
                <span className="font-bold">
                  ${(item.unit_price * item.quantity).toLocaleString("es-AR")}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${order.subtotal.toLocaleString("es-AR")}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento</span>
                <span>
                  -${order.discount_amount.toLocaleString("es-AR")}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Envio</span>
              <span>
                {order.shipping_cost === 0
                  ? "Gratis"
                  : `$${order.shipping_cost.toLocaleString("es-AR")}`}
              </span>
            </div>
            <div className="flex justify-between font-black text-lg border-t border-gray-200 pt-2 mt-2">
              <span>Total</span>
              <span>${order.total.toLocaleString("es-AR")}</span>
            </div>
          </div>
        </div>
      ) : null}

      <Link
        href="/tienda"
        className="inline-block bg-black text-white px-10 py-4 font-bold uppercase tracking-widest hover:bg-kloven-red transition-colors shadow-lg"
      >
        Seguir comprando
      </Link>
    </div>
  );
}

export default function CompraExitoPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-28 pb-20 container mx-auto px-4 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
        </div>
      }
    >
      <CompraExitoContent />
    </Suspense>
  );
}
