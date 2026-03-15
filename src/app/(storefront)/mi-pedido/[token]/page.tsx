"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Check, Package, Truck, MapPin, Loader2, AlertCircle } from "lucide-react";
import type { OrderStatus } from "@/lib/types";

interface TrackingOrder {
  id: string;
  status: OrderStatus;
  payer_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_zip: string;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  total: number;
  created_at: string;
  updated_at: string;
  order_items: {
    id: string;
    product_name: string;
    size: string;
    color: string;
    quantity: number;
    unit_price: number;
  }[];
}

const FULFILLMENT_STEPS = [
  { status: "approved", label: "Recibido", icon: Check },
  { status: "preparing", label: "En preparacion", icon: Package },
  { status: "shipped", label: "En camino", icon: Truck },
  { status: "delivered", label: "Entregado", icon: MapPin },
] as const;

function getStepIndex(status: OrderStatus): number {
  const map: Record<string, number> = {
    approved: 0,
    preparing: 1,
    shipped: 2,
    delivered: 3,
  };
  return map[status] ?? -1;
}

const NON_FULFILLMENT_MESSAGES: Partial<Record<OrderStatus, { title: string; desc: string }>> = {
  pending: { title: "Pago pendiente", desc: "Tu pago todavia no fue confirmado. Esto puede demorar unos minutos." },
  in_process: { title: "Pago en proceso", desc: "Tu pago esta siendo procesado por MercadoPago." },
  rejected: { title: "Pago rechazado", desc: "Tu pago fue rechazado. Podes intentar nuevamente desde la tienda." },
  cancelled: { title: "Pedido cancelado", desc: "Este pedido fue cancelado." },
  refunded: { title: "Pedido reembolsado", desc: "El importe de este pedido fue reembolsado." },
};

export default function TrackingPage() {
  const { token } = useParams<{ token: string }>();
  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/track/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="pt-28 pb-20 container mx-auto px-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-kloven-ash" />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="pt-28 pb-20 container mx-auto px-4 text-center max-w-md">
        <AlertCircle className="w-12 h-12 mx-auto text-kloven-ash mb-4" />
        <h1 className="font-heading text-3xl uppercase tracking-wider text-kloven-white mb-2">
          Pedido no encontrado
        </h1>
        <p className="text-kloven-ash mb-8">
          El link de seguimiento no es valido o el pedido ya no existe.
        </p>
        <Link
          href="/mi-pedido"
          className="text-kloven-gold font-bold text-sm underline"
        >
          Reenviar link de seguimiento
        </Link>
      </div>
    );
  }

  const currentStepIndex = getStepIndex(order.status);
  const isFulfillment = currentStepIndex >= 0;
  const nonFulfillmentInfo = NON_FULFILLMENT_MESSAGES[order.status];

  return (
    <div className="pt-28 pb-20 container mx-auto px-4 max-w-2xl">
      <h1 className="font-heading text-3xl sm:text-4xl uppercase tracking-wider text-kloven-white mb-2">
        Mi Pedido
      </h1>
      <p className="text-kloven-ash text-sm mb-10">
        Pedido #{order.id.slice(0, 8)} &mdash;{" "}
        {new Date(order.created_at).toLocaleDateString("es-AR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {/* Non-fulfillment status */}
      {!isFulfillment && nonFulfillmentInfo && (
        <div className="bg-kloven-dark border border-kloven-smoke p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-kloven-gold flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-kloven-white mb-1">{nonFulfillmentInfo.title}</h2>
              <p className="text-kloven-ash text-sm">{nonFulfillmentInfo.desc}</p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {isFulfillment && (
        <div className="bg-kloven-dark border border-kloven-smoke p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between relative">
            {/* Connector line */}
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-kloven-smoke" />
            <div
              className="absolute top-6 left-6 h-0.5 bg-kloven-gold transition-all duration-700"
              style={{
                width: `calc(${(Math.min(currentStepIndex, 3) / 3) * 100}% - 48px)`,
              }}
            />

            {FULFILLMENT_STEPS.map((step, i) => {
              const StepIcon = step.icon;
              const isCompleted = i < currentStepIndex;
              const isCurrent = i === currentStepIndex;
              const isFuture = i > currentStepIndex;

              return (
                <div key={step.status} className="relative z-10 flex flex-col items-center" style={{ width: "25%" }}>
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isCompleted
                        ? "bg-kloven-gold text-white"
                        : isCurrent
                        ? "bg-kloven-gold text-white animate-pulse"
                        : "bg-kloven-carbon border-2 border-kloven-smoke text-kloven-ash"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <StepIcon className={`w-5 h-5 ${isFuture ? "opacity-50" : ""}`} />
                    )}
                  </div>
                  <span
                    className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider mt-3 text-center ${
                      isCompleted || isCurrent ? "text-kloven-white" : "text-kloven-ash"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Order details */}
      <div className="bg-kloven-dark border border-kloven-smoke p-6 mb-8">
        <h2 className="font-heading text-xl uppercase tracking-wider text-kloven-white mb-4">
          Detalle del pedido
        </h2>

        <div className="space-y-3 mb-4">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-kloven-ash">
                {item.product_name}
                {item.size && ` (${item.size}/${item.color})`} x {item.quantity}
              </span>
              <span className="font-bold text-kloven-white">
                ${(item.unit_price * item.quantity).toLocaleString("es-AR")}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-kloven-smoke pt-3 space-y-1 text-sm">
          <div className="flex justify-between text-kloven-ash">
            <span>Subtotal</span>
            <span>${order.subtotal.toLocaleString("es-AR")}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-green-400">
              <span>Descuento</span>
              <span>-${order.discount_amount.toLocaleString("es-AR")}</span>
            </div>
          )}
          <div className="flex justify-between text-kloven-ash">
            <span>Envio</span>
            <span>
              {order.shipping_cost === 0
                ? "Gratis"
                : `$${order.shipping_cost.toLocaleString("es-AR")}`}
            </span>
          </div>
          <div className="flex justify-between font-black text-lg border-t border-kloven-smoke pt-2 mt-2 text-kloven-white">
            <span>Total</span>
            <span>${order.total.toLocaleString("es-AR")}</span>
          </div>
        </div>
      </div>

      {/* Shipping address */}
      <div className="bg-kloven-dark border border-kloven-smoke p-6 mb-8">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-kloven-ash mb-2">
          Direccion de envio
        </h2>
        <p className="text-kloven-white text-sm">
          {order.shipping_address}, {order.shipping_city} ({order.shipping_zip})
        </p>
      </div>

      <div className="text-center">
        <Link
          href="/tienda"
          className="inline-block bg-kloven-gold text-white px-8 py-3 font-bold uppercase tracking-widest hover:bg-kloven-gold/80 transition-colors text-sm"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
