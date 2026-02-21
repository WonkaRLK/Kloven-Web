"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ArrowLeft, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";
import ScrollReveal from "@/components/animations/ScrollReveal";
import type {
  ProductWithVariants,
  ProductVariant,
  Product,
  Size,
} from "@/lib/types";

const SIZES: Size[] = ["S", "M", "L", "XL", "XXL"];

export default function ProductoPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<ProductWithVariants | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [added, setAdded] = useState(false);
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setProduct(null);
        } else {
          setProduct(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    fetch(`/api/products?category=${product.category}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRelated(
            data.filter((p: Product) => p.id !== product.id).slice(0, 3)
          );
        }
      })
      .catch(() => {});
  }, [product]);

  useEffect(() => {
    if (!product || !selectedSize || !selectedColor) {
      setSelectedVariant(null);
      return;
    }
    const variant = product.product_variants.find(
      (v) => v.size === selectedSize && v.color === selectedColor
    );
    setSelectedVariant(variant || null);
  }, [product, selectedSize, selectedColor]);

  const availableColors = product
    ? [...new Set(product.product_variants.map((v) => v.color))]
    : [];

  const availableSizes = product
    ? [...new Set(product.product_variants.map((v) => v.size))]
    : [];

  const getStockForSizeColor = (size: Size, color: string) => {
    if (!product) return 0;
    const v = product.product_variants.find(
      (v) => v.size === size && v.color === color
    );
    return v?.stock || 0;
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant || selectedVariant.stock <= 0) return;
    addToCart(product, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="pt-28 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-[3/4] bg-kloven-dark" />
          <div className="space-y-4 py-8">
            <div className="h-4 bg-kloven-dark w-1/4" />
            <div className="h-8 bg-kloven-dark w-3/4" />
            <div className="h-6 bg-kloven-dark w-1/4" />
            <div className="h-20 bg-kloven-dark w-full mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-28 container mx-auto px-4 text-center py-32">
        <p className="text-kloven-ash text-lg mb-4">Producto no encontrado</p>
        <Link
          href="/tienda"
          className="text-kloven-white font-bold border-b-2 border-kloven-red pb-1"
        >
          Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20">
      <div className="container mx-auto px-4">
        <Link
          href="/tienda"
          className="inline-flex items-center gap-2 text-sm text-kloven-ash hover:text-kloven-red mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al catalogo
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12">
          {/* Image */}
          <ScrollReveal direction="left">
            <div className="aspect-[3/4] bg-kloven-dark overflow-hidden relative border border-kloven-smoke">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </ScrollReveal>

          {/* Info */}
          <ScrollReveal direction="right" delay={0.2}>
            <div className="py-4">
              <p className="text-xs text-kloven-ash uppercase tracking-widest mb-2">
                {product.category}
              </p>
              <h1 className="font-heading text-4xl md:text-5xl tracking-wider mb-4 text-kloven-white">
                {product.name}
              </h1>
              <p className="font-heading text-4xl text-kloven-red mb-6 tracking-wider">
                ${product.price.toLocaleString("es-AR")}
              </p>
              <p className="text-kloven-ash leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Material & Fit */}
              {(product.material || product.fit) && (
                <div className="flex gap-6 mb-8 text-sm">
                  {product.material && (
                    <div>
                      <span className="font-bold uppercase tracking-widest text-xs text-kloven-ash block mb-1">
                        Material
                      </span>
                      <span className="text-kloven-white">
                        {product.material}
                      </span>
                    </div>
                  )}
                  {product.fit && (
                    <div>
                      <span className="font-bold uppercase tracking-widest text-xs text-kloven-ash block mb-1">
                        Fit
                      </span>
                      <span className="text-kloven-white">{product.fit}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Color selector — thicker borders */}
              {availableColors.length > 0 && (
                <div className="mb-6">
                  <span className="font-bold uppercase tracking-widest text-xs text-kloven-ash block mb-3">
                    Color
                  </span>
                  <div className="flex gap-3">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 text-sm font-bold border-2 ${
                          selectedColor === color
                            ? "border-kloven-red bg-kloven-red text-white"
                            : "border-kloven-smoke text-kloven-white hover:border-kloven-red"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size selector — thicker borders */}
              <div className="mb-8">
                <span className="font-bold uppercase tracking-widest text-xs text-kloven-ash block mb-3">
                  Talle
                </span>
                <div className="flex flex-wrap gap-3">
                  {SIZES.map((size) => {
                    const isAvailable = availableSizes.includes(size);
                    const stock = selectedColor
                      ? getStockForSizeColor(size, selectedColor)
                      : 0;
                    const hasStock = selectedColor ? stock > 0 : isAvailable;

                    return (
                      <button
                        key={size}
                        onClick={() => hasStock && setSelectedSize(size)}
                        disabled={!hasStock}
                        className={`w-11 h-11 sm:w-14 sm:h-14 text-sm font-bold border-2 ${
                          selectedSize === size
                            ? "border-kloven-red bg-kloven-red text-white"
                            : hasStock
                            ? "border-kloven-smoke text-kloven-white hover:border-kloven-red"
                            : "border-kloven-smoke/50 text-kloven-smoke cursor-not-allowed line-through"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stock indicator */}
              {selectedVariant && (
                <div className="mb-6">
                  {selectedVariant.stock <= 0 ? (
                    <p className="text-red-400 text-sm font-medium">
                      Sin stock
                    </p>
                  ) : selectedVariant.stock <= 3 ? (
                    <p className="text-orange-400 text-sm font-medium">
                      Ultimas {selectedVariant.stock} unidades!
                    </p>
                  ) : (
                    <p className="text-green-400 text-sm font-medium">
                      En stock
                    </p>
                  )}
                </div>
              )}

              {/* Add to cart — hover shake instead of glow */}
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock <= 0}
                className={`w-full py-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2 ${
                  added
                    ? "bg-green-600 text-white"
                    : selectedVariant && selectedVariant.stock > 0
                    ? "bg-kloven-red text-white hover:bg-kloven-red-dark hover:animate-[cardShake_0.3s_steps(4)_infinite]"
                    : "bg-kloven-smoke text-kloven-ash cursor-not-allowed"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" />
                    Agregado!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    {!selectedSize || !selectedColor
                      ? "Selecciona talle y color"
                      : selectedVariant && selectedVariant.stock <= 0
                      ? "Sin stock"
                      : "Agregar al carrito"}
                  </>
                )}
              </button>
            </div>
          </ScrollReveal>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-24">
            <h2 className="font-heading text-3xl uppercase tracking-wider mb-10 text-kloven-white">
              Tambien te puede gustar
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 lg:gap-x-10 gap-y-10 sm:gap-y-16">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
