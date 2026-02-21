"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import type { OrderWithItems, OrderStatus } from "@/lib/types";

const STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pendiente" },
  { value: "approved", label: "Aprobado" },
  { value: "in_process", label: "En proceso" },
  { value: "rejected", label: "Rechazado" },
  { value: "cancelled", label: "Cancelado" },
  { value: "refunded", label: "Reembolsado" },
];

export default function AdminPedidoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAdminAuth();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/admin/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setOrder(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, token]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!data.error) {
        setOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
      }
    } catch {
      // ignore
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-10 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 lg:p-10 text-center py-20">
        <p className="text-gray-500 mb-4">Orden no encontrada</p>
        <Link href="/admin/pedidos" className="text-black font-bold underline">
          Volver
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-3xl">
      <Link
        href="/admin/pedidos"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a pedidos
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black tracking-tight">
          Pedido #{order.id.slice(0, 8)}
        </h1>
        <select
          value={order.status}
          onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
          disabled={updating}
          className="bg-gray-50 border border-gray-200 p-2 text-sm font-medium focus:outline-none focus:border-black transition-colors"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Client info */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="font-black uppercase tracking-wide text-sm mb-4">
          Datos del cliente
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 block text-xs uppercase tracking-widest">
              Nombre
            </span>
            <span className="font-medium">{order.payer_name}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs uppercase tracking-widest">
              Email
            </span>
            <span className="font-medium">{order.payer_email}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs uppercase tracking-widest">
              Telefono
            </span>
            <span className="font-medium">{order.payer_phone || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs uppercase tracking-widest">
              Direccion
            </span>
            <span className="font-medium">
              {order.shipping_address}, {order.shipping_city} (
              {order.shipping_zip})
            </span>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="font-black uppercase tracking-wide text-sm mb-4">
          Items
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left pb-2 text-xs uppercase tracking-widest text-gray-500">
                Producto
              </th>
              <th className="text-left pb-2 text-xs uppercase tracking-widest text-gray-500">
                Talle/Color
              </th>
              <th className="text-right pb-2 text-xs uppercase tracking-widest text-gray-500">
                Cant.
              </th>
              <th className="text-right pb-2 text-xs uppercase tracking-widest text-gray-500">
                Precio
              </th>
            </tr>
          </thead>
          <tbody>
            {order.order_items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-3 font-medium">{item.product_name}</td>
                <td className="py-3 text-gray-500">
                  {item.size} / {item.color}
                </td>
                <td className="py-3 text-right">{item.quantity}</td>
                <td className="py-3 text-right font-bold">
                  ${(item.unit_price * item.quantity).toLocaleString("es-AR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>${order.subtotal.toLocaleString("es-AR")}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>
                Descuento{" "}
                {order.promo_code_used && `(${order.promo_code_used})`}
              </span>
              <span>-${order.discount_amount.toLocaleString("es-AR")}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Envio</span>
            <span>
              {order.shipping_cost === 0
                ? "Gratis"
                : `$${order.shipping_cost.toLocaleString("es-AR")}`}
            </span>
          </div>
          <div className="flex justify-between text-xl font-black border-t border-gray-200 pt-3 mt-3">
            <span>Total</span>
            <span>${order.total.toLocaleString("es-AR")}</span>
          </div>
        </div>

        {order.mp_payment_id && (
          <p className="text-xs text-gray-400 mt-4">
            MercadoPago ID: {order.mp_payment_id}
          </p>
        )}
      </div>
    </div>
  );
}
