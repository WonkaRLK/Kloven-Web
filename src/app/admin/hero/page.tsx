"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Loader2, Trash2, Upload, GripVertical, ImageIcon } from "lucide-react";

export default function AdminHeroPage() {
  const { token } = useAdminAuth();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    fetch("/api/admin/hero", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setImages(data.images || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const saveImages = async (newImages: string[]) => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/hero", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ images: newImages }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      setSuccess("Guardado correctamente");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("No se pudo guardar");
    }
    setSaving(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setError("");

    const uploaded: string[] = [];

    for (const file of files) {
      try {
        // Server compresses + resizes to WebP before storing in Supabase.
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "hero");

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const { publicUrl, error: uploadError } = await res.json();
        if (uploadError) throw new Error(uploadError);

        uploaded.push(publicUrl);
      } catch {
        setError(`No se pudo subir ${file.name}`);
      }
    }

    if (uploaded.length > 0) {
      const newImages = [...images, ...uploaded];
      setImages(newImages);
      await saveImages(newImages);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (url: string) => {
    const newImages = images.filter((img) => img !== url);
    setImages(newImages);
    await saveImages(newImages);
  };

  const moveImage = async (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= images.length) return;
    const updated = [...images];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setImages(updated);
    await saveImages(updated);
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Imágenes del Hero</h1>
          <p className="text-gray-500 text-sm mt-1">
            {images.length} imagen{images.length !== 1 ? "es" : ""} · se muestran en la galería del inicio
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-black text-white px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-kloven-red transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          Subir imágenes
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 text-sm rounded mb-6">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 p-3 text-sm rounded mb-6">
          {success}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : images.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-lg py-20 flex flex-col items-center gap-4 text-gray-400">
          <ImageIcon className="w-12 h-12" />
          <p className="text-sm font-medium">No hay imágenes cargadas</p>
          <p className="text-xs">Se usarán las imágenes por defecto del hero</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 text-black font-bold text-sm underline underline-offset-2"
          >
            Subir imágenes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {images.map((url, index) => (
            <div
              key={url}
              className="group relative bg-gray-50 border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="relative aspect-[3/4]">
                <Image
                  src={url}
                  alt={`Hero ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
              </div>

              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => moveImage(index, -1)}
                  disabled={index === 0}
                  className="p-2 bg-white rounded-lg text-gray-700 hover:text-black disabled:opacity-30"
                  title="Mover izquierda"
                >
                  <GripVertical className="w-4 h-4 rotate-90" />
                </button>
                <button
                  onClick={() => handleDelete(url)}
                  disabled={saving}
                  className="p-2 bg-white rounded-lg text-red-500 hover:text-red-700"
                  title="Eliminar"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => moveImage(index, 1)}
                  disabled={index === images.length - 1}
                  className="p-2 bg-white rounded-lg text-gray-700 hover:text-black disabled:opacity-30"
                  title="Mover derecha"
                >
                  <GripVertical className="w-4 h-4 rotate-[270deg]" />
                </button>
              </div>

              <div className="p-2 text-center text-xs text-gray-400 font-mono">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-gray-400 mt-6">
          Tip: pasá el mouse sobre una imagen para mover o eliminar. Los cambios se guardan automáticamente.
        </p>
      )}
    </div>
  );
}
