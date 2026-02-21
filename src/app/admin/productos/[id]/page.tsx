"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import ProductForm from "@/components/admin/ProductForm";
import type { ProductWithVariants } from "@/lib/types";

export default function EditarProductoPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAdminAuth();
  const [product, setProduct] = useState<ProductWithVariants | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/admin/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, token]);

  if (loading) {
    return (
      <div className="p-6 lg:p-10 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 lg:p-10 text-center py-20">
        <p className="text-gray-500 mb-4">Producto no encontrado</p>
        <Link href="/admin/productos" className="text-black font-bold underline">
          Volver
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <Link
        href="/admin/productos"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a productos
      </Link>

      <h1 className="text-3xl font-black tracking-tight mb-8">
        Editar Producto
      </h1>

      <ProductForm product={product} />
    </div>
  );
}
