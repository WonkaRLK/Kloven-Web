"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  Pencil,
  Check,
  X,
} from "lucide-react";
import type { Category } from "@/lib/types";

export default function AdminCategoriasPage() {
  const { token } = useAdminAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sizeType, setSizeType] = useState("clothing");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Edit state
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editSizeType, setEditSizeType] = useState("clothing");

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchCategories();
  }, [token]);

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, slug: slug || generateSlug(name), size_type: sizeType }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowForm(false);
      setName("");
      setSlug("");
      setSizeType("clothing");
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear");
    }
    setSaving(false);
  };

  const startEdit = (cat: Category) => {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditSizeType(cat.size_type || "clothing");
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName("");
    setEditSlug("");
    setEditSizeType("clothing");
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, name: editName, slug: editSlug, size_type: editSizeType }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEditId(null);
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al editar");
    }
  };

  const toggleActive = async (cat: Category) => {
    try {
      await fetch("/api/admin/categories", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: cat.id, active: !cat.active }),
      });
      setCategories(
        categories.map((c) =>
          c.id === cat.id ? { ...c, active: !c.active } : c
        )
      );
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    setError("");

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    }
    setDeleting(null);
  };

  const moveCategory = async (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= categories.length) return;

    const updated = [...categories];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    // Update sort_order for both
    const promises = updated.map((cat, i) =>
      fetch("/api/admin/categories", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: cat.id, sort_order: i }),
      })
    );

    setCategories(updated.map((cat, i) => ({ ...cat, sort_order: i })));

    try {
      await Promise.all(promises);
    } catch {
      fetchCategories();
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Categorias</h1>
          <p className="text-gray-500 text-sm mt-1">
            {categories.length} categorias en total
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-black text-white px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-kloven-red transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 text-sm rounded mb-6">
          {error}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-gray-200 rounded-lg p-6 mb-8 max-w-xl space-y-4"
        >
          <h2 className="font-black uppercase tracking-wide text-sm">
            Nueva Categoria
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1 tracking-widest">
                Nombre
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSlug(generateSlug(e.target.value));
                }}
                className="w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:outline-none focus:border-black"
                placeholder="Ej: Camperas"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1 tracking-widest">
                Slug
              </label>
              <input
                required
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:outline-none focus:border-black"
                placeholder="camperas"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1 tracking-widest">
                Tipo de talle
              </label>
              <select
                value={sizeType}
                onChange={(e) => setSizeType(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:outline-none focus:border-black"
              >
                <option value="clothing">Ropa (S/M/L/XL/XXL)</option>
                <option value="shoes">Calzado (36-44)</option>
              </select>
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
                <th className="w-10 p-4" />
                <th className="text-left p-4 font-bold uppercase text-[10px] tracking-widest text-gray-500">
                  Nombre
                </th>
                <th className="text-left p-4 font-bold uppercase text-[10px] tracking-widest text-gray-500 hidden sm:table-cell">
                  Slug
                </th>
                <th className="text-left p-4 font-bold uppercase text-[10px] tracking-widest text-gray-500 hidden sm:table-cell">
                  Talles
                </th>
                <th className="text-left p-4 font-bold uppercase text-[10px] tracking-widest text-gray-500">
                  Estado
                </th>
                <th className="w-24 p-4" />
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, index) => (
                <tr
                  key={cat.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveCategory(index, -1)}
                        disabled={index === 0}
                        className="text-gray-400 hover:text-black disabled:opacity-20"
                        title="Subir"
                      >
                        <GripVertical className="w-4 h-4 rotate-180" />
                      </button>
                      <button
                        onClick={() => moveCategory(index, 1)}
                        disabled={index === categories.length - 1}
                        className="text-gray-400 hover:text-black disabled:opacity-20"
                        title="Bajar"
                      >
                        <GripVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    {editId === cat.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-gray-50 border border-gray-200 p-2 text-sm w-full focus:outline-none focus:border-black"
                      />
                    ) : (
                      <span className="font-bold">{cat.name}</span>
                    )}
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    {editId === cat.id ? (
                      <input
                        type="text"
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value)}
                        className="bg-gray-50 border border-gray-200 p-2 text-sm w-full font-mono focus:outline-none focus:border-black"
                      />
                    ) : (
                      <span className="font-mono text-gray-500">
                        {cat.slug}
                      </span>
                    )}
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    {editId === cat.id ? (
                      <select
                        value={editSizeType}
                        onChange={(e) => setEditSizeType(e.target.value)}
                        className="bg-gray-50 border border-gray-200 p-2 text-sm focus:outline-none focus:border-black"
                      >
                        <option value="clothing">Ropa</option>
                        <option value="shoes">Calzado</option>
                      </select>
                    ) : (
                      <span className="text-gray-500 text-xs">
                        {cat.size_type === "shoes" ? "Calzado" : "Ropa"}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleActive(cat)}
                      className={`text-xs font-bold uppercase px-3 py-1 rounded transition-colors ${
                        cat.active
                          ? "bg-green-50 text-green-600 hover:bg-green-100"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                      {cat.active ? "Activa" : "Inactiva"}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      {editId === cat.id ? (
                        <>
                          <button
                            onClick={() => handleEdit(cat.id)}
                            className="text-green-600 hover:text-green-700 p-1"
                            title="Guardar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-400 hover:text-gray-600 p-1"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(cat)}
                            className="text-gray-400 hover:text-black p-1"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            disabled={deleting === cat.id}
                            className="text-gray-400 hover:text-red-600 p-1 disabled:opacity-50"
                            title="Eliminar"
                          >
                            {deleting === cat.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {categories.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p>No hay categorias</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
