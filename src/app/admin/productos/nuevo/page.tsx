"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";

export default function NuevoProductoPage() {
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
        Nuevo Producto
      </h1>

      <ProductForm />
    </div>
  );
}
