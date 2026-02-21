"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Loader2, Eye } from "lucide-react";
import type { Order, OrderStatus } from "@/lib/types";

const STATUS_LABELS: Record<OrderStatus, { label: string; classes: string }> = {
  pending: { label: "Pendiente", classes: "bg-yellow-50 text-yellow-700" },
  approved: { label: "Aprobado", classes: "bg-green-50 text-green-700" },
  in_process: { label: "En proceso", classes: "bg-blue-50 text-blue-700" },
  rejected: { label: "Rechazado", classes: "bg-red-50 text-red-700" },
  cancelled: { label: "Cancelado", classes: "bg-gray-100 text-gray-500" },
  refunded: { label: "Reembolsado", classes: "bg-purple-50 text-purple-700" },
};

export default function AdminPedidosPage() {
  const { token } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!token) return;
    fetch("/api/admin/orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-10">
        <h1 className="text-3xl font-black tracking-tight">Pedidos</h1>
        <p className="text-gray-500 text-sm mt-1">
          {orders.length} pedidos en total
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {[
          { id: "all", label: "Todos" },
          { id: "pending", label: "Pendientes" },
          { id: "approved", label: "Aprobados" },
          { id: "rejected", label: "Rechazados" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`text-xs font-bold uppercase tracking-widest px-4 py-2 rounded transition-colors ${
              filter === f.id
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left p-4 font-bold uppercase text-[10px] tracking-widest text-gray-500">
                  Orden
                </th>
                <th className="text-left p-4 font-bold uppercase text-[10px] tracking-widest text-gray-500 hidden sm:table-cell">
                  Cliente
                </th>
                <th className="text-left p-4 font-bold uppercase text-[10px] tracking-widest text-gray-500">
                  Total
                </th>
                <th className="text-left p-4 font-bold uppercase text-[10px] tracking-widest text-gray-500">
                  Estado
                </th>
                <th className="text-left p-4 font-bold uppercase text-[10px] tracking-widest text-gray-500 hidden md:table-cell">
                  Fecha
                </th>
                <th className="w-12" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const statusInfo =
                  STATUS_LABELS[order.status] || STATUS_LABELS.pending;
                return (
                  <tr
                    key={order.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4">
                      <span className="font-mono text-xs">
                        #{order.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <p className="font-medium">{order.payer_name}</p>
                      <p className="text-gray-400 text-xs">
                        {order.payer_email}
                      </p>
                    </td>
                    <td className="p-4 font-bold">
                      ${order.total.toLocaleString("es-AR")}
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-xs font-bold uppercase px-2 py-1 rounded ${statusInfo.classes}`}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="p-4 hidden md:table-cell text-gray-500 text-xs">
                      {new Date(order.created_at).toLocaleDateString("es-AR")}
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="p-2 text-gray-400 hover:text-black transition-colors inline-block"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p>No hay pedidos</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
