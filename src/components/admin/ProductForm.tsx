"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Loader2, Plus, Trash2, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import type { Category, ProductWithVariants } from "@/lib/types";
import { getSizesForType, CLOTHING_SIZES, generateNumericSizes, detectSizeMode } from "@/lib/sizes";

interface Variant {
  size: string;
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

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});
  }, []);

  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [compareAtPrice, setCompareAtPrice] = useState(
    product?.compare_at_price?.toString() || ""
  );
  const [category, setCategory] = useState(
    product?.category || ""
  );
  const [images, _setImages] = useState<string[]>(
    product?.images?.length ? product.images : product?.image_url ? [product.image_url] : []
  );
  const imagesRef = useRef(images);
  const setImages = (updater: string[] | ((prev: string[]) => string[])) => {
    _setImages((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      imagesRef.current = next;
      return next;
    });
  };
  const [material, setMaterial] = useState(product?.material || "");
  const [fit, setFit] = useState(product?.fit || "");
  const [featured, setFeatured] = useState(product?.featured || false);
  const [active, setActive] = useState(product?.active !== false);

  const existingVariantSizes = product?.product_variants?.map((v) => v.size) || [];
  const detectedMode = detectSizeMode(existingVariantSizes);

  const selectedCategory = categories.find((c) => c.slug === category);
  const defaultMode = isEdit
    ? detectedMode
    : selectedCategory?.size_type === "shoes"
      ? "numeric"
      : "letters";

  const [sizeMode, setSizeMode] = useState<"letters" | "numeric">(defaultMode);
  const [sizeMin, setSizeMin] = useState(() => {
    if (detectedMode === "numeric" && existingVariantSizes.length > 0) {
      const nums = existingVariantSizes.map(Number).filter((n) => !isNaN(n));
      return nums.length > 0 ? Math.min(...nums) : 35;
    }
    return 35;
  });
  const [sizeMax, setSizeMax] = useState(() => {
    if (detectedMode === "numeric" && existingVariantSizes.length > 0) {
      const nums = existingVariantSizes.map(Number).filter((n) => !isNaN(n));
      return nums.length > 0 ? Math.max(...nums) : 45;
    }
    return 45;
  });

  const sizes =
    sizeMode === "numeric"
      ? generateNumericSizes(sizeMin, sizeMax)
      : selectedCategory
        ? getSizesForType(selectedCategory.size_type)
        : CLOTHING_SIZES;

  // Sync sizeMode when category changes (only for new products)
  useEffect(() => {
    if (!isEdit && selectedCategory) {
      const newMode = selectedCategory.size_type === "shoes" ? "numeric" : "letters";
      setSizeMode(newMode as "letters" | "numeric");
    }
  }, [selectedCategory, isEdit]);

  const [variants, setVariants] = useState<Variant[]>(
    product?.product_variants?.map((v) => ({
      size: v.size,
      color: v.color,
      stock: v.stock,
      sku: v.sku,
    })) || [{ size: "M", color: "Negro", stock: 10, sku: "" }]
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removingBg, setRemovingBg] = useState(false);
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

  // Remove background from image via remove.bg
  const removeBg = async (imageUrl: string): Promise<string> => {
    const res = await fetch("/api/admin/remove-bg", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ imageUrl }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error quitando fondo");
    return data.publicUrl;
  };

  // Upload images (supports multiple files) + auto remove background
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
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

        const uploadRes = await fetch(data.signedUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!uploadRes.ok) throw new Error("Error al subir " + file.name);

        uploadedUrls.push(data.publicUrl);
      }

      // Add originals immediately so the user sees them
      setImages([...imagesRef.current, ...uploadedUrls]);
      setUploading(false);

      // Now process background removal
      setRemovingBg(true);
      for (const originalUrl of uploadedUrls) {
        try {
          const processedUrl = await removeBg(originalUrl);
          // Replace original with processed version
          setImages((prev) =>
            prev.map((url) => (url === originalUrl ? processedUrl : url))
          );
        } catch {
          // If remove-bg fails, keep the original — don't break the flow
          console.warn("No se pudo quitar el fondo, se mantiene la original");
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al subir imagen"
      );
    } finally {
      setUploading(false);
      setRemovingBg(false);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
      return copy;
    });
  };

  // Add/remove variants
  const addVariant = () => {
    setVariants([
      ...variants,
      { size: sizes[0], color: "Negro", stock: 10, sku: "" },
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
        compare_at_price: compareAtPrice ? parseInt(compareAtPrice, 10) : null,
        category,
        images,
        image_url: images[0] || "",
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

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
              Precio sin descuento
            </label>
            <input
              type="number"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
              placeholder="Opcional"
              className="w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase mb-1 tracking-widest">
              Categoria
            </label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 p-3 text-sm focus:outline-none focus:border-black transition-colors"
            >
              <option value="" disabled>
                Seleccionar...
              </option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
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

      {/* Images */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h2 className="font-black uppercase tracking-wide text-sm">
          Imagenes ({images.length})
        </h2>

        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((url, i) => (
              <div key={url + i} className="relative group">
                <div className="relative aspect-[3/4] bg-gray-100 rounded overflow-hidden">
                  <Image
                    src={url}
                    alt={`Imagen ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="192px"
                  />
                  {i === 0 && (
                    <span className="absolute top-1 left-1 bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      PRINCIPAL
                    </span>
                  )}
                </div>
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => moveImage(i, -1)}
                    disabled={i === 0}
                    className="bg-white/90 hover:bg-white rounded p-1 disabled:opacity-30"
                    title="Mover a la izquierda"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(i, 1)}
                    disabled={i === images.length - 1}
                    className="bg-white/90 hover:bg-white rounded p-1 disabled:opacity-30"
                    title="Mover a la derecha"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="bg-red-500/90 hover:bg-red-600 text-white rounded p-1"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={uploading || removingBg}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {uploading ? "Subiendo..." : "Subir imagenes"}
          </button>
          {removingBg && (
            <span className="inline-flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Quitando fondo...
            </span>
          )}
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

        {/* Size mode selector */}
        <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-3">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Tipo de talle
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sizeMode"
                checked={sizeMode === "letters"}
                onChange={() => setSizeMode("letters")}
                className="accent-kloven-red w-4 h-4"
              />
              <span className="text-sm font-medium">Letras (S, M, L, XL...)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sizeMode"
                checked={sizeMode === "numeric"}
                onChange={() => setSizeMode("numeric")}
                className="accent-kloven-red w-4 h-4"
              />
              <span className="text-sm font-medium">Numerico (35, 36, 37...)</span>
            </label>
          </div>
          {sizeMode === "numeric" && (
            <div className="flex items-center gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                  Desde
                </label>
                <input
                  type="number"
                  value={sizeMin}
                  onChange={(e) => setSizeMin(parseInt(e.target.value) || 0)}
                  className="bg-white border border-gray-200 p-2 text-sm w-20 focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                  Hasta
                </label>
                <input
                  type="number"
                  value={sizeMax}
                  onChange={(e) => setSizeMax(parseInt(e.target.value) || 0)}
                  className="bg-white border border-gray-200 p-2 text-sm w-20 focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <span className="text-xs text-gray-400 self-end pb-2">
                {sizes.length} talles disponibles
              </span>
            </div>
          )}
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
                      {sizes.map((s) => (
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
