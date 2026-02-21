"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Loader2, Plus } from "lucide-react";
import type { PromoCode } from "@/lib/types";

export default function AdminPromosPage() {
  const { token } = useAdminAuth();
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("10");
  const [maxUses, setMaxUses] = useState("0");
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchPromos = async () => {
    try {
      const res = await fetch("/api/admin/promo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPromos(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchPromos();
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/promo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code,
          discount_percent: parseInt(discountPercent, 10),
          max_uses: parseInt(maxUses, 10),
          expires_at: expiresAt || null,
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setCode("");
        setDiscountPercent("10");
        setMaxUses("0");
        setExpiresAt("");
        fetchPromos();
      }
    } catch {
      // ignore
    }
    setSaving(false);
  };

  const toggleActive = async (promo: PromoCode) => {
    try {
      await fetch("/api/admin/promo", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: promo.id, active: !promo.active }),
      });
      setPromos(
        promos.map((p) =>
          p.id === promo.id ? { ...p, active: !p.active } : p
        )
      );
    } catch {
      // ignore
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Codigos Promo
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {promos.length} codigos en total
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-black text-white px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-kloven-red transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-gray-200 rounded-lg p-6 mb-8 max-w-xl space-y-4"
        >
          <h2 className="font-black uppercase tracking-wide text-sm">
            Nuevo Codigo
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1 tracking-widest">
                Codigo
              </label>
              <input
                required
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full bg-gray-50 border border-gray-200 p-3 text-sm uppercase focus:outline-none focus:border-black"
                placeholder="EJ: KLOVEN10"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1 tracking-widest">
                Descuento %
              </label>
              <input
                required
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:outline-none focus:border-black"
                min={1}
                max={100}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1 tracking-widest">
                Max usos (0 = ilimitado)
              </label>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:outline-none focus:border-black"
                min={0}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1 tracking-widest">
                Expira (opcional)
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:outline-none focus:border-black"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-kloven-red transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Crear"
            )}
          </button>
        </form>
      )}

      {/* Table */}
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
                  Codigo
                </th>
                <th className="text-left p-4 font-bold uppercase text-[10px] tracking-widest text-gray-500">
                  Descuento
                </th>
                <th className="text-left p-4 font-bold uppercase text-[10px] tracking-widest text-gray-500 hidden sm:table-cell">
                  Usos
                </th>
                <th className="text-left p-4 font-bold uppercase text-[10px] tracking-widest text-gray-500 hidden md:table-cell">
                  Expira
                </th>
                <th className="text-left p-4 font-bold uppercase text-[10px] tracking-widest text-gray-500">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {promos.map((promo) => (
                <tr
                  key={promo.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 font-mono font-bold">{promo.code}</td>
                  <td className="p-4">{promo.discount_percent}%</td>
                  <td className="p-4 hidden sm:table-cell">
                    {promo.current_uses}/{promo.max_uses || "∞"}
                  </td>
                  <td className="p-4 hidden md:table-cell text-gray-500 text-xs">
                    {promo.expires_at
                      ? new Date(promo.expires_at).toLocaleDateString("es-AR")
                      : "Sin expiracion"}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleActive(promo)}
                      className={`text-xs font-bold uppercase px-3 py-1 rounded transition-colors ${
                        promo.active
                          ? "bg-green-50 text-green-600 hover:bg-green-100"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                      {promo.active ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {promos.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p>No hay codigos promo</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
