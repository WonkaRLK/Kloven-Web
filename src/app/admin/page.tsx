"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Crown,
  Loader2,
  Package,
  ShoppingCart,
  DollarSign,
  Plus,
} from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";

interface Stats {
  totalProducts: number;
  pendingOrders: number;
  monthRevenue: number;
}

export default function AdminDashboard() {
  const { isAuthenticated, login, token } = useAdminAuth();
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    const result = await login(password);
    if (!result.success) {
      setLoginError(result.error || "Error");
    }
    setLoginLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    // Fetch stats
    Promise.all([
      fetch("/api/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
      fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
    ])
      .then(([products, orders]) => {
        const prods = Array.isArray(products) ? products : [];
        const ords = Array.isArray(orders) ? orders : [];

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const monthRevenue = ords
          .filter(
            (o: { status: string; created_at: string }) =>
              o.status === "approved" &&
              new Date(o.created_at) >= monthStart
          )
          .reduce(
            (sum: number, o: { total: number }) => sum + (o.total || 0),
            0
          );

        setStats({
          totalProducts: prods.length,
          pendingOrders: ords.filter(
            (o: { status: string }) => o.status === "pending"
          ).length,
          monthRevenue,
        });
      })
      .catch(() => {});
  }, [isAuthenticated, token]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm space-y-6"
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Crown className="w-8 h-8" />
              <span className="text-3xl font-black tracking-tighter uppercase">
                Kloven<span className="text-kloven-red">.</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm">Panel de Administracion</p>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase mb-1 tracking-widest">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:outline-none focus:border-black focus:bg-white transition-colors"
              placeholder="Ingresa la password"
              required
            />
          </div>

          {loginError && (
            <p className="text-red-500 text-sm text-center">{loginError}</p>
          )}

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full bg-black text-white py-3 font-bold uppercase tracking-widest hover:bg-kloven-red transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loginLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Ingresar"
            )}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Resumen general de la tienda
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="bg-black text-white px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-kloven-red transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-gray-200 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">
              Productos
            </span>
          </div>
          <p className="text-3xl font-black">
            {stats?.totalProducts ?? "-"}
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">
              Pedidos Pendientes
            </span>
          </div>
          <p className="text-3xl font-black">
            {stats?.pendingOrders ?? "-"}
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">
              Ingresos del Mes
            </span>
          </div>
          <p className="text-3xl font-black">
            {stats
              ? `$${stats.monthRevenue.toLocaleString("es-AR")}`
              : "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
