"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { ProductWithVariants } from "@/lib/types";

export default function AdminProductosPage() {
  const { token } = useAdminAuth();
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchProducts();
  }, [token]);

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar este producto?")) return;

    setDeleting(id);
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter((p) => p.id !== id));
    } catch {
      alert("Error al eliminar");
    }
    setDeleting(null);
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Productos</h1>
          <p className="text-gray-500 text-sm mt-1">
            {products.length} productos en total
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="bg-black text-white px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-kloven-red transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo
        </Link>
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
                  Producto
                </th>
                <th className="text-left p-4 font-bold uppercase text-[10px] tracking-widest text-gray-500 hidden sm:table-cell">
                  Categoria
                </th>
                <th className="text-left p-4 font-bold uppercase text-[10px] tracking-widest text-gray-500">
                  Precio
                </th>
                <th className="text-left p-4 font-bold uppercase text-[10px] tracking-widest text-gray-500 hidden md:table-cell">
                  Variantes
                </th>
                <th className="text-left p-4 font-bold uppercase text-[10px] tracking-widest text-gray-500 hidden md:table-cell">
                  Estado
                </th>
                <th className="w-24" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {p.image_url && (
                        <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden relative flex-shrink-0">
                          <Image
                            src={p.image_url}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-bold">{p.name}</p>
                        <p className="text-gray-400 text-xs">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell capitalize">
                    {p.category}
                  </td>
                  <td className="p-4 font-bold">
                    ${p.price.toLocaleString("es-AR")}
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    {p.product_variants?.length || 0}
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span
                      className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                        p.active
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {p.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/productos/${p.id}`}
                        className="p-2 text-gray-400 hover:text-black transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deleting === p.id}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                      >
                        {deleting === p.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p>No hay productos todavia</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
