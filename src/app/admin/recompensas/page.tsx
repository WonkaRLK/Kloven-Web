"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  Gift,
  Plus,
  Trash2,
  Loader2,
  Save,
  X,
} from "lucide-react";
import type { Reward, RewardType } from "@/lib/types";

export default function AdminRecompensasPage() {
  const { token } = useAdminAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<RewardType>("discount_code");
  const [pointsCost, setPointsCost] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [active, setActive] = useState(true);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchRewards = async () => {
    const res = await fetch("/api/admin/rewards", { headers });
    const data = await res.json();
    setRewards(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRewards();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = () => {
    setName("");
    setDescription("");
    setType("discount_code");
    setPointsCost("");
    setDiscountPercent("");
    setMaxRedemptions("");
    setActive(true);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (reward: Reward) => {
    setEditingId(reward.id);
    setName(reward.name);
    setDescription(reward.description);
    setType(reward.type);
    setPointsCost(String(reward.points_cost));
    setDiscountPercent(String(reward.discount_percent));
    setMaxRedemptions(String(reward.max_redemptions));
    setActive(reward.active);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const body = {
      ...(editingId && { id: editingId }),
      name,
      description,
      type,
      points_cost: parseInt(pointsCost) || 0,
      discount_percent: parseInt(discountPercent) || 0,
      max_redemptions: parseInt(maxRedemptions) || 0,
      active,
    };

    const res = await fetch("/api/admin/rewards", {
      method: editingId ? "PUT" : "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (res.ok) {
      await fetchRewards();
      resetForm();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar esta recompensa?")) return;
    await fetch("/api/admin/rewards", {
      method: "DELETE",
      headers,
      body: JSON.stringify({ id }),
    });
    await fetchRewards();
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">
            Recompensas
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gestion de recompensas del programa de puntos
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-black text-white px-4 py-2 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 p-6 mb-8 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">
              {editingId ? "Editar" : "Nueva"} Recompensa
            </h2>
            <button onClick={resetForm}>
              <X className="w-5 h-5 text-gray-400 hover:text-black" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">
                Nombre
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-black"
                placeholder="10% de descuento"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as RewardType)}
                className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-black"
              >
                <option value="discount_code">Codigo de descuento</option>
                <option value="free_product">Producto gratis</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">
                Costo en puntos
              </label>
              <input
                type="number"
                value={pointsCost}
                onChange={(e) => setPointsCost(e.target.value)}
                className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-black"
                placeholder="500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">
                Descuento % (si aplica)
              </label>
              <input
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-black"
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">
                Max canjes (0 = ilimitado)
              </label>
              <input
                type="number"
                value={maxRedemptions}
                onChange={(e) => setMaxRedemptions(e.target.value)}
                className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-black"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">
                Descripcion
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-black"
                placeholder="Opcional"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              Activa
            </label>
            <button
              onClick={handleSave}
              disabled={saving || !name || !pointsCost}
              className="bg-black text-white px-6 py-2 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50 ml-auto"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : rewards.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <Gift className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No hay recompensas creadas.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-bold uppercase text-gray-500">
                <th className="pb-3 pr-4">Nombre</th>
                <th className="pb-3 pr-4">Tipo</th>
                <th className="pb-3 pr-4">Puntos</th>
                <th className="pb-3 pr-4">Descuento</th>
                <th className="pb-3 pr-4">Canjes</th>
                <th className="pb-3 pr-4">Estado</th>
                <th className="pb-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rewards.map((reward) => (
                <tr
                  key={reward.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 pr-4 font-medium">{reward.name}</td>
                  <td className="py-3 pr-4">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {reward.type === "discount_code"
                        ? "Descuento"
                        : "Producto"}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-bold">{reward.points_cost}</td>
                  <td className="py-3 pr-4">
                    {reward.discount_percent > 0
                      ? `${reward.discount_percent}%`
                      : "-"}
                  </td>
                  <td className="py-3 pr-4">
                    {reward.current_redemptions}
                    {reward.max_redemptions > 0
                      ? ` / ${reward.max_redemptions}`
                      : ""}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`text-xs font-bold ${
                        reward.active ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {reward.active ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(reward)}
                        className="text-xs font-bold text-black hover:text-blue-600 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(reward.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
