"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import type { Category, Size, ProductWithVariants } from "@/lib/types";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "remeras", label: "Remeras" },
  { value: "buzos", label: "Hoodies & Buzos" },
  { value: "pantalones", label: "Pantalones" },
  { value: "accesorios", label: "Accesorios" },
];

const SIZES: Size[] = ["S", "M", "L", "XL", "XXL"];

interface Variant {
  size: Size;
  color: string;
  stock: number;
  sku: string;
}

interface ProductFormProps {
  product?: ProductWithVariants;
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const { token } = useAdminAuth();
  const isEdit = !!product;

  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [category, setCategory] = useState<Category>(
    product?.category || "remeras"
  );
  const [imageUrl, setImageUrl] = useState(product?.image_url || "");
  const [material, setMaterial] = useState(product?.material || "");
  const [fit, setFit] = useState(product?.fit || "");
  const [featured, setFeatured] = useState(product?.featured || false);
  const [active, setActive] = useState(product?.active !== false);

  const [variants, setVariants] = useState<Variant[]>(
    product?.product_variants?.map((v) => ({
      size: v.size,
      color: v.color,
      stock: v.stock,
      sku: v.sku,
    })) || [{ size: "M", color: "Negro", stock: 10, sku: "" }]
  );

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit || !product?.slug) {
      setSlug(generateSlug(val));
    }
  };

  // Upload image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Get signed URL
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Upload directly to Supabase
      const uploadRes = await fetch(data.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      setImageUrl(data.publicUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al subir imagen"
      );
    } finally {
      setUploading(false);
    }
  };

  // Add/remove variants
  const addVariant = () => {
    setVariants([
      ...variants,
      { size: "M", color: "Negro", stock: 10, sku: "" },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (
    index: number,
    field: keyof Variant,
    value: string | number
  ) => {
    setVariants(
      variants.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  // Save
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        name,
        slug,
        description,
        price: parseInt(price, 10),
        category,
        image_url: imageUrl,
        material,
        fit,
        featured,
        active,
        variants,
      };

      const url = isEdit
        ? `/api/admin/products/${product!.id}`
        : "/api/admin/products";

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push("/admin/productos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 text-sm rounded">
          {error}
        </div>
      )}

      {/* Basic info */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h2 className="font-black uppercase tracking-wide text-sm">
          Informacion basica
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase mb-1 tracking-widest">
              Nombre
            </label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:outline-none focus:border-black transition-colors"
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
              className="w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase mb-1 tracking-widest">
            Descripcion
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:outline-none focus:border-black transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase mb-1 tracking-widest">
              Precio (ARS)
            </label>
            <input
              required
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase mb-1 tracking-widest">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:outline-none focus:border-black transition-colors"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase mb-1 tracking-widest">
              Fit
            </label>
            <input
              type="text"
              value={fit}
              onChange={(e) => setFit(e.target.value)}
              placeholder="Ej: Oversize"
              className="w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase mb-1 tracking-widest">
            Material
          </label>
          <input
            type="text"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            placeholder="Ej: Algodon 24/1 peinado"
            className="w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="accent-kloven-red w-4 h-4"
            />
            <span className="text-sm font-medium">Destacado</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="accent-kloven-red w-4 h-4"
            />
            <span className="text-sm font-medium">Activo</span>
          </label>
        </div>
      </div>

      {/* Image */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h2 className="font-black uppercase tracking-wide text-sm">Imagen</h2>

        {imageUrl && (
          <div className="relative w-48 h-64 bg-gray-100 rounded overflow-hidden">
            <Image
              src={imageUrl}
              alt="Preview"
              fill
              className="object-cover"
              sizes="192px"
            />
          </div>
        )}

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer transition-colors text-sm font-medium">
            <Upload className="w-4 h-4" />
            {uploading ? "Subiendo..." : "Subir imagen"}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
          <span className="text-xs text-gray-400">o</span>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="URL de imagen"
            className="flex-1 bg-gray-50 border border-gray-200 p-2 text-sm focus:outline-none focus:border-black transition-colors"
          />
        </div>
      </div>

      {/* Variants */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-black uppercase tracking-wide text-sm">
            Variantes ({variants.length})
          </h2>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-1 text-sm font-medium text-kloven-red hover:underline"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-2 font-bold uppercase text-[10px] tracking-widest text-gray-500">
                  Talle
                </th>
                <th className="text-left p-2 font-bold uppercase text-[10px] tracking-widest text-gray-500">
                  Color
                </th>
                <th className="text-left p-2 font-bold uppercase text-[10px] tracking-widest text-gray-500">
                  Stock
                </th>
                <th className="text-left p-2 font-bold uppercase text-[10px] tracking-widest text-gray-500">
                  SKU
                </th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {variants.map((v, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="p-2">
                    <select
                      value={v.size}
                      onChange={(e) =>
                        updateVariant(i, "size", e.target.value)
                      }
                      className="bg-gray-50 border border-gray-200 p-2 text-sm w-20"
                    >
                      {SIZES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={v.color}
                      onChange={(e) =>
                        updateVariant(i, "color", e.target.value)
                      }
                      className="bg-gray-50 border border-gray-200 p-2 text-sm w-28"
                      placeholder="Color"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) =>
                        updateVariant(i, "stock", parseInt(e.target.value) || 0)
                      }
                      className="bg-gray-50 border border-gray-200 p-2 text-sm w-20"
                      min={0}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) =>
                        updateVariant(i, "sku", e.target.value)
                      }
                      className="bg-gray-50 border border-gray-200 p-2 text-sm w-28"
                      placeholder="Opcional"
                    />
                  </td>
                  <td className="p-2">
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(i)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={saving}
        className="bg-black text-white px-8 py-3 font-bold uppercase tracking-widest hover:bg-kloven-red transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Guardando...
          </>
        ) : isEdit ? (
          "Guardar Cambios"
        ) : (
          "Crear Producto"
        )}
      </button>
    </form>
  );
}
