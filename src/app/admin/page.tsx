"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Crown,
  Loader2,
  Package,
  ShoppingCart,
  DollarSign,
  Plus,
  Zap,
  ZapOff,
  Clock,
  Save,
  ExternalLink,
  CreditCard,
} from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";

interface Stats {
  totalProducts: number;
  pendingOrders: number;
  monthRevenue: number;
}

interface StoreConfig {
  drop_mode_active: boolean;
  drop_opens_at: string | null;
  drop_title: string;
  drop_message: string;
}

function toLocalDatetimeInput(isoString: string | null): string {
  if (!isoString) return "";
  // Convert UTC ISO to local datetime-local input value
  const d = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function DropModeCard({ token }: { token: string }) {
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);

  // Local form state
  const [countdownEnabled, setCountdownEnabled] = useState(false);
  const [opensAtInput, setOpensAtInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [messageInput, setMessageInput] = useState("");

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/store-config", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data: StoreConfig = await res.json();
      setConfig(data);
      setCountdownEnabled(!!data.drop_opens_at);
      setOpensAtInput(toLocalDatetimeInput(data.drop_opens_at));
      setTitleInput(data.drop_title);
      setMessageInput(data.drop_message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  const toggle = async () => {
    if (!config) return;
    setToggling(true);
    const turningOff = config.drop_mode_active;
    try {
      const body: Partial<StoreConfig> = { drop_mode_active: !config.drop_mode_active };
      // Al apagar, limpiar el countdown para no dejar fechas viejas
      if (turningOff) body.drop_opens_at = null;
      const res = await fetch("/api/admin/store-config", {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const updated: StoreConfig = await res.json();
        setConfig(updated);
        if (turningOff) {
          setCountdownEnabled(false);
          setOpensAtInput("");
        }
      }
    } finally {
      setToggling(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const opensAt = countdownEnabled && opensAtInput
        ? new Date(opensAtInput).toISOString()
        : null;
      const res = await fetch("/api/admin/store-config", {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          drop_opens_at: opensAt,
          drop_title: titleInput,
          drop_message: messageInput,
        }),
      });
      if (res.ok) {
        const updated: StoreConfig = await res.json();
        setConfig(updated);
        setCountdownEnabled(!!updated.drop_opens_at);
        setOpensAtInput(toLocalDatetimeInput(updated.drop_opens_at));
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-center h-32">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  const isActive = config?.drop_mode_active ?? false;

  return (
    <div className={`border rounded-lg overflow-hidden transition-all ${isActive ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"}`}>
      {/* Header row */}
      <div className="flex items-center justify-between p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? "bg-red-100" : "bg-gray-100"}`}>
            {isActive ? <Zap className="w-5 h-5 text-red-600" /> : <ZapOff className="w-5 h-5 text-gray-500" />}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Modo Drop</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {isActive
                ? config?.drop_opens_at
                  ? `Countdown activo · Abre ${new Date(config.drop_opens_at).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}`
                  : "Tienda pausada — sin countdown"
                : "Tienda abierta normalmente"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isActive && (
            <a
              href="/drop"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
            >
              Ver <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <button
            onClick={toggle}
            disabled={toggling}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 rounded ${
              isActive
                ? "bg-black text-white hover:bg-red-700"
                : "bg-black text-white hover:bg-kloven-red"
            } disabled:opacity-50`}
          >
            {toggling ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : isActive ? (
              "Abrir tienda"
            ) : (
              "Pausar tienda"
            )}
          </button>
        </div>
      </div>

      {/* Config panel */}
      <div className="border-t border-gray-200 bg-gray-50 px-5 sm:px-6 py-5 space-y-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Configuración del drop
        </p>

        {/* Title */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
            Título
          </label>
          <input
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            className="w-full bg-white border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors rounded"
            placeholder="Nuevo drop en camino"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
            Mensaje
          </label>
          <textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            rows={2}
            className="w-full bg-white border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors rounded resize-none"
            placeholder="Estamos preparando algo especial. Volvé pronto."
          />
        </div>

        {/* Countdown toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Countdown de apertura</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setCountdownEnabled(!countdownEnabled);
              if (countdownEnabled) setOpensAtInput("");
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${countdownEnabled ? "bg-black" : "bg-gray-300"}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${countdownEnabled ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </div>

        {/* Datetime picker */}
        {countdownEnabled && (
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
              Fecha y hora de apertura
            </label>
            <input
              type="datetime-local"
              value={opensAtInput}
              onChange={(e) => setOpensAtInput(e.target.value)}
              className="w-full bg-white border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors rounded"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              La tienda se abre automáticamente en ese horario.
            </p>
          </div>
        )}

        {/* Save */}
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-kloven-red transition-colors rounded disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
          Guardar configuración
        </button>
      </div>
    </div>
  );
}

function PaymentConfigCard({ token }: { token: string }) {
  const [transfer, setTransfer] = useState("");
  const [installments, setInstallments] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  useEffect(() => {
    fetch("/api/admin/store-config", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setTransfer(data.transfer_discount_percent > 0 ? String(data.transfer_discount_percent) : "");
        setInstallments(data.installments_count > 0 ? String(data.installments_count) : "");
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/store-config", {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          transfer_discount_percent: transfer ? parseInt(transfer) : 0,
          installments_count: installments ? parseInt(installments) : 0,
        }),
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-center h-24">
      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-gray-100">
        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
          <CreditCard className="w-4 h-4 text-gray-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Métodos de pago</p>
          <p className="text-xs text-gray-500">Se muestra en las cards y páginas de producto</p>
        </div>
      </div>

      <div className="px-5 sm:px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
            Descuento por Transferencia (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={transfer}
            onChange={(e) => setTransfer(e.target.value)}
            placeholder="0 = desactivado"
            className="w-full bg-gray-50 border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors rounded"
          />
          <p className="text-xs text-gray-400 mt-1">
            {transfer && parseInt(transfer) > 0
              ? `Muestra precio con ${transfer}% de descuento`
              : "No se muestra descuento"}
          </p>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">
            Cuotas sin interés
          </label>
          <input
            type="number"
            min="0"
            max="48"
            value={installments}
            onChange={(e) => setInstallments(e.target.value)}
            placeholder="0 = desactivado"
            className="w-full bg-gray-50 border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors rounded"
          />
          <p className="text-xs text-gray-400 mt-1">
            {installments && parseInt(installments) > 0
              ? `Muestra ${installments} cuotas sin interés`
              : "No se muestran cuotas"}
          </p>
        </div>
      </div>

      <div className="px-5 sm:px-6 pb-5">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-kloven-red transition-colors rounded disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
          Guardar
        </button>
      </div>
    </div>
  );
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
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">
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
            {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ingresar"}
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
          <p className="text-gray-500 text-sm mt-1">Resumen general de la tienda</p>
        </div>
      </div>

      {/* Drop Mode */}
      <div className="mb-6">
        <DropModeCard token={token!} />
      </div>

      {/* Payment Config */}
      <div className="mb-10">
        <PaymentConfigCard token={token!} />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-gray-200 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Productos</span>
          </div>
          <p className="text-3xl font-black">{stats?.totalProducts ?? "-"}</p>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Pedidos Pendientes</span>
          </div>
          <p className="text-3xl font-black">{stats?.pendingOrders ?? "-"}</p>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Ingresos del Mes</span>
          </div>
          <p className="text-3xl font-black">
            {stats ? `$${stats.monthRevenue.toLocaleString("es-AR")}` : "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
