"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ArrowLeft, Check, Package, Banknote, CreditCard } from "lucide-react";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";
import SizeGuideModal from "@/components/SizeGuideModal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { getSizesForType } from "@/lib/sizes";
import { useStoreConfig } from "@/context/StoreConfigContext";
import type {
  ProductWithVariants,
  ProductVariant,
  Product,
  Category,
  ComboVariantSelection,
  ComboItemWithProduct,
} from "@/lib/types";

const COLOR_MAP: Record<string, string> = {
  NEGRO: "#0a0a0a",
  BLANCO: "#f5f5f5",
  AZUL: "#2563eb",
  ROJO: "#dc2626",
  VERDE: "#16a34a",
  GRIS: "#6b7280",
  AMARILLO: "#eab308",
  NARANJA: "#ea580c",
  ROSA: "#ec4899",
  VIOLETA: "#7c3aed",
  CELESTE: "#38bdf8",
  BEIGE: "#d4b896",
  CAMEL: "#c19a6b",
  MARRON: "#92400e",
  CREMA: "#f5efe0",
  BORDO: "#7f1d1d",
  MILITAR: "#4a5a35",
};

function getColorSwatch(name: string): string {
  return COLOR_MAP[name.toUpperCase()] ?? "#888888";
}

// Per-product selection state for combo items
interface ComboProductSelection {
  productId: string;
  selectedColor: string | null;
  selectedSize: string | null;
  selectedVariant: ProductVariant | null;
}

export default function ProductoPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart, addComboToCart } = useCart();
  const { transferDiscountPercent, installmentsCount } = useStoreConfig();

  const [product, setProduct] = useState<ProductWithVariants | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [added, setAdded] = useState(false);
  const [related, setRelated] = useState<Product[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Combo selections state
  const [comboSelections, setComboSelections] = useState<
    Map<string, ComboProductSelection>
  >(new Map());

  // Zoom state
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }, []);

  const handleMouseEnter = useCallback(() => setIsZooming(true), []);
  const handleMouseLeave = useCallback(() => setIsZooming(false), []);

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setProduct(null);
        } else {
          setProduct(data);
          // Initialize combo selections
          if (data.is_combo && data.combo_items?.length) {
            const initial = new Map<string, ComboProductSelection>();
            for (const ci of data.combo_items) {
              initial.set(ci.product.id, {
                productId: ci.product.id,
                selectedColor: null,
                selectedSize: null,
                selectedVariant: null,
              });
            }
            setComboSelections(initial);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});
  }, []);

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

  const productCategory = categories.find((c) => c.slug === product?.category);
  const orderedSizes = productCategory
    ? getSizesForType(productCategory.size_type)
    : null;

  const availableColors = product
    ? [...new Set(product.product_variants.map((v) => v.color))]
    : [];

  const availableSizes = product
    ? [...new Set(product.product_variants.map((v) => v.size))]
    : [];

  const filteredByCanon = orderedSizes
    ? orderedSizes.filter((s) => availableSizes.includes(s))
    : [];
  const displaySizes =
    filteredByCanon.length > 0
      ? filteredByCanon
      : availableSizes.sort((a, b) => {
          const na = Number(a),
            nb = Number(b);
          if (!isNaN(na) && !isNaN(nb)) return na - nb;
          return a.localeCompare(b);
        });

  const getStockForSizeColor = (size: string, color: string) => {
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

  // Combo helpers
  const updateComboSelection = (
    productId: string,
    field: "selectedColor" | "selectedSize",
    value: string
  ) => {
    setComboSelections((prev) => {
      const next = new Map(prev);
      const current = next.get(productId);
      if (!current) return prev;
      const updated = { ...current, [field]: value };

      // Resolve variant
      const comboItem = product?.combo_items?.find(
        (ci) => ci.product.id === productId
      );
      if (comboItem && updated.selectedSize && updated.selectedColor) {
        const variant = comboItem.product.product_variants.find(
          (v) =>
            v.size === updated.selectedSize && v.color === updated.selectedColor
        );
        updated.selectedVariant = variant || null;
      } else {
        updated.selectedVariant = null;
      }

      next.set(productId, updated);
      return next;
    });
  };

  const allComboSelectionsComplete =
    product?.is_combo &&
    product.combo_items &&
    product.combo_items.length > 0 &&
    product.combo_items.every((ci) => {
      const sel = comboSelections.get(ci.product.id);
      return sel?.selectedVariant && sel.selectedVariant.stock > 0;
    });

  const handleAddComboToCart = () => {
    if (!product || !allComboSelectionsComplete) return;

    const selections: ComboVariantSelection[] = product.combo_items!.map(
      (ci) => {
        const sel = comboSelections.get(ci.product.id)!;
        const variant = sel.selectedVariant!;
        return {
          product_id: ci.product.id,
          product_name: ci.product.name,
          variant_id: variant.id,
          size: variant.size,
          color: variant.color,
          quantity: ci.quantity,
          stock: variant.stock,
          image_url: ci.product.image_url,
        };
      }
    );

    addComboToCart(product, selections);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] animate-pulse">
          <div className="h-[85vh] bg-kloven-dark mx-6 md:mx-12" />
          <div className="space-y-4 px-8 md:px-12 lg:px-16 py-8">
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
          className="text-kloven-white font-bold border-b-2 border-kloven-gold pb-1"
        >
          Volver a la tienda
        </Link>
      </div>
    );
  }

  const isCombo = product.is_combo && product.combo_items && product.combo_items.length > 0;

  return (
    <div className="pt-20 pb-20">
      {/* Breadcrumb */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 mb-6">
        <Link
          href="/tienda"
          className="inline-flex items-center gap-2 text-sm text-kloven-ash hover:text-kloven-gold"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al catalogo
        </Link>
      </div>

      {/* Product grid */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[3fr_2fr]">
          {/* Image gallery */}
          <ScrollReveal>
            <div className="flex gap-1 pl-6 md:pl-12 pr-4">
              {product.images?.length > 1 && (
                <div className="hidden md:flex flex-col gap-1.5 shrink-0 w-16">
                  {product.images.map((img, i) => (
                    <button
                      key={img + i}
                      onClick={() => setActiveImage(i)}
                      className={`relative aspect-square overflow-hidden border-2 transition-colors ${
                        activeImage === i
                          ? "border-kloven-gold"
                          : "border-kloven-smoke hover:border-kloven-ash"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex-1 flex flex-col gap-3">
                <div
                  ref={imageContainerRef}
                  onMouseMove={handleMouseMove}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="relative w-full h-[65vh] cursor-crosshair"
                >
                  <Image
                    src={
                      product.images?.length
                        ? product.images[activeImage]
                        : product.image_url
                    }
                    alt={product.name}
                    fill
                    priority
                    className="object-contain transition-transform duration-200 ease-out"
                    style={
                      isZooming
                        ? {
                            transform: "scale(2)",
                            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                          }
                        : undefined
                    }
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {isCombo && (
                    <span className="absolute top-3 right-3 bg-purple-600 text-white text-xs font-bold px-2.5 py-1 uppercase tracking-wider flex items-center gap-1 z-10">
                      <Package className="w-3.5 h-3.5" />
                      COMBO
                    </span>
                  )}
                </div>

                {product.images?.length > 1 && (
                  <div className="grid grid-cols-5 gap-2 md:hidden">
                    {product.images.map((img, i) => (
                      <button
                        key={img + i}
                        onClick={() => setActiveImage(i)}
                        className={`relative aspect-square overflow-hidden border-2 transition-colors ${
                          activeImage === i
                            ? "border-kloven-gold"
                            : "border-kloven-smoke hover:border-kloven-ash"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${product.name} ${i + 1}`}
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="80px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* Info */}
          <ScrollReveal delay={0.2}>
            <div className="px-8 md:px-12 lg:px-16 py-4 lg:max-h-[85vh] lg:overflow-y-auto">
              <p className="text-xs text-kloven-ash uppercase tracking-widest mb-2">
                {product.category}
                {isCombo && (
                  <span className="ml-2 text-purple-400">COMBO</span>
                )}
              </p>
              <h1 className="font-display text-4xl md:text-5xl font-black tracking-wider mb-4 text-kloven-white uppercase">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3 mb-6">
                <p className="font-display text-4xl font-black text-kloven-ash tracking-wider">
                  ${product.price.toLocaleString("es-AR")}
                </p>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <p className="font-display text-xl text-kloven-ash line-through">
                    ${product.compare_at_price.toLocaleString("es-AR")}
                  </p>
                )}
              </div>
              {/* Transferencia y cuotas */}
              {(transferDiscountPercent > 0 || installmentsCount > 0) && (
                <div className="flex flex-col gap-2 mb-6 border border-kloven-smoke rounded-xl p-4 bg-kloven-black/40">
                  {transferDiscountPercent > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <Banknote className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-emerald-400 font-bold text-base leading-tight">
                          ${Math.round(product.price * (1 - transferDiscountPercent / 100)).toLocaleString("es-AR")}
                        </p>
                        <p className="text-xs text-kloven-ash">con Transferencia o depósito bancario</p>
                      </div>
                    </div>
                  )}
                  {transferDiscountPercent > 0 && installmentsCount > 0 && (
                    <div className="border-t border-kloven-smoke/50" />
                  )}
                  {installmentsCount > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-5 h-5 text-sky-400" />
                      </div>
                      <div>
                        <p className="text-sky-400 font-bold text-base leading-tight">
                          {installmentsCount} cuotas sin interés
                        </p>
                        <p className="text-xs text-kloven-ash">de ${Math.round(product.price / installmentsCount).toLocaleString("es-AR")} c/u</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {product.description && !/^\s*env[ií]o\s+gr[aá]tis/i.test(product.description) && (
                <p className="text-kloven-ash leading-relaxed mb-8">
                  {product.description}
                </p>
              )}

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

              {/* COMBO LAYOUT: selectors per sub-product */}
              {isCombo ? (
                <>
                  <div className="mb-8">
                    <h3 className="font-bold uppercase tracking-widest text-xs text-kloven-ash mb-4">
                      Elegi talle y color para cada producto
                    </h3>
                    <div className="space-y-6">
                      {product.combo_items!.map((ci: ComboItemWithProduct) => {
                        const sel = comboSelections.get(ci.product.id);
                        const subColors = [
                          ...new Set(
                            ci.product.product_variants.map((v) => v.color)
                          ),
                        ];
                        const subSizes = [
                          ...new Set(
                            ci.product.product_variants.map((v) => v.size)
                          ),
                        ];
                        // Find category for sub-product to get ordered sizes
                        const subCategory = categories.find(
                          (c) => c.slug === ci.product.category
                        );
                        const subOrderedSizes = subCategory
                          ? getSizesForType(subCategory.size_type)
                          : null;
                        const subFilteredByCanon = subOrderedSizes
                          ? subOrderedSizes.filter((s) =>
                              subSizes.includes(s)
                            )
                          : [];
                        const subDisplaySizes =
                          subFilteredByCanon.length > 0
                            ? subFilteredByCanon
                            : subSizes.sort((a, b) => {
                                const na = Number(a),
                                  nb = Number(b);
                                if (!isNaN(na) && !isNaN(nb)) return na - nb;
                                return a.localeCompare(b);
                              });

                        const getSubStock = (size: string, color: string) => {
                          const v = ci.product.product_variants.find(
                            (v) => v.size === size && v.color === color
                          );
                          return v?.stock || 0;
                        };

                        return (
                          <div
                            key={ci.product.id}
                            className={`border rounded p-4 ${
                              sel?.selectedVariant
                                ? "border-green-500/50 bg-green-500/5"
                                : "border-kloven-smoke bg-kloven-carbon/50"
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-16 bg-kloven-dark rounded overflow-hidden relative flex-shrink-0 border border-kloven-smoke">
                                <Image
                                  src={ci.product.image_url}
                                  alt={ci.product.name}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              </div>
                              <div>
                                <p className="font-bold text-sm text-kloven-white">
                                  {ci.product.name}
                                  {ci.quantity > 1 && (
                                    <span className="text-kloven-ash ml-1">
                                      x{ci.quantity}
                                    </span>
                                  )}
                                </p>
                                {sel?.selectedVariant && (
                                  <p className="text-green-400 text-xs flex items-center gap-1 mt-0.5">
                                    <Check className="w-3 h-3" />
                                    {sel.selectedVariant.size} /{" "}
                                    {sel.selectedVariant.color}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Color selector */}
                            {subColors.length > 0 && (
                              <div className="mb-3">
                                <span className="font-bold uppercase tracking-widest text-[10px] text-kloven-ash block mb-2">
                                  Color
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {subColors.map((color) => {
                                    const swatch = getColorSwatch(color);
                                    const isSelected = sel?.selectedColor === color;
                                    const isLight = ["BLANCO", "CREMA", "AMARILLO", "CELESTE", "BEIGE"].includes(color.toUpperCase());
                                    return (
                                      <button
                                        key={color}
                                        type="button"
                                        title={color}
                                        onClick={() =>
                                          updateComboSelection(
                                            ci.product.id,
                                            "selectedColor",
                                            color
                                          )
                                        }
                                        className={`relative w-7 h-7 rounded-full transition-all ${
                                          isSelected
                                            ? "ring-2 ring-offset-1 ring-offset-kloven-black ring-kloven-gold scale-110"
                                            : "ring-1 ring-kloven-smoke hover:ring-kloven-gold hover:scale-105"
                                        }`}
                                        style={{ backgroundColor: swatch }}
                                      >
                                        {isSelected && (
                                          <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${isLight ? "text-black" : "text-white"}`}>
                                            ✓
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Size selector */}
                            <div>
                              <span className="font-bold uppercase tracking-widest text-[10px] text-kloven-ash block mb-2">
                                Talle
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {subDisplaySizes.map((size) => {
                                  const stock = sel?.selectedColor
                                    ? getSubStock(size, sel.selectedColor)
                                    : 0;
                                  const hasStock = sel?.selectedColor
                                    ? stock > 0
                                    : true;

                                  return (
                                    <button
                                      key={size}
                                      type="button"
                                      onClick={() =>
                                        hasStock &&
                                        updateComboSelection(
                                          ci.product.id,
                                          "selectedSize",
                                          size
                                        )
                                      }
                                      disabled={!hasStock}
                                      className={`w-10 h-10 text-xs font-bold border-2 ${
                                        sel?.selectedSize === size
                                          ? "border-kloven-gold bg-kloven-gold text-white"
                                          : hasStock
                                          ? "border-kloven-smoke text-kloven-white hover:border-kloven-gold"
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
                            {sel?.selectedVariant && (
                              <div className="mt-2">
                                {sel.selectedVariant.stock <= 0 ? (
                                  <p className="text-red-400 text-xs font-medium">
                                    Sin stock
                                  </p>
                                ) : sel.selectedVariant.stock <= 3 ? (
                                  <p className="text-orange-400 text-xs font-medium">
                                    Ultimas {sel.selectedVariant.stock}{" "}
                                    unidades!
                                  </p>
                                ) : (
                                  <p className="text-green-400 text-xs font-medium">
                                    En stock
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add combo to cart */}
                  {product.sold_out ? (
                    <button
                      disabled
                      className="w-full py-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2 bg-gray-700 text-gray-400 cursor-not-allowed opacity-70"
                    >
                      Sin Stock
                    </button>
                  ) : (
                  <button
                    onClick={handleAddComboToCart}
                    disabled={!allComboSelectionsComplete}
                    className={`w-full py-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2 ${
                      added
                        ? "bg-green-600 text-white"
                        : allComboSelectionsComplete
                        ? "bg-kloven-gold text-white hover:bg-kloven-gold/80 hover:animate-[cardShake_0.3s_steps(4)_infinite]"
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
                        <Package className="w-5 h-5" />
                        {allComboSelectionsComplete
                          ? "Agregar Combo al Carrito"
                          : "Selecciona talle y color para cada producto"}
                      </>
                    )}
                  </button>
                  )}
                </>
              ) : (
                <>
                  {/* REGULAR PRODUCT LAYOUT */}
                  {/* Color selector */}
                  {availableColors.length > 0 && (
                    <div className="mb-6">
                      <span className="font-bold uppercase tracking-widest text-xs text-kloven-ash block mb-3">
                        Color
                      </span>
                      <div className="flex gap-3 flex-wrap">
                        {availableColors.map((color) => {
                          const swatch = getColorSwatch(color);
                          const isSelected = selectedColor === color;
                          const isLight = ["BLANCO", "CREMA", "AMARILLO", "CELESTE", "BEIGE"].includes(color.toUpperCase());
                          return (
                            <button
                              key={color}
                              onClick={() => setSelectedColor(color)}
                              title={color}
                              className={`relative w-9 h-9 rounded-full transition-all ${
                                isSelected
                                  ? "ring-2 ring-offset-2 ring-offset-kloven-black ring-kloven-gold scale-110"
                                  : "ring-1 ring-kloven-smoke hover:ring-kloven-gold hover:scale-105"
                              }`}
                              style={{ backgroundColor: swatch }}
                            >
                              {isSelected && (
                                <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${isLight ? "text-black" : "text-white"}`}>
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {selectedColor && (
                        <p className="text-xs text-kloven-ash mt-2">{selectedColor}</p>
                      )}
                    </div>
                  )}

                  {/* Size selector */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold uppercase tracking-widest text-xs text-kloven-ash">
                        Talle
                      </span>
                      <button
                        onClick={() => setSizeGuideOpen(true)}
                        className="text-xs text-kloven-white underline underline-offset-2 hover:text-kloven-gold transition-colors"
                      >
                        Guia de talles
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {displaySizes.map((size) => {
                        const stock = selectedColor
                          ? getStockForSizeColor(size, selectedColor)
                          : 0;
                        const hasStock = selectedColor ? stock > 0 : true;

                        return (
                          <button
                            key={size}
                            onClick={() => hasStock && setSelectedSize(size)}
                            disabled={!hasStock}
                            className={`w-11 h-11 sm:w-14 sm:h-14 text-sm font-bold border-2 ${
                              selectedSize === size
                                ? "border-kloven-gold bg-kloven-gold text-white"
                                : hasStock
                                ? "border-kloven-smoke bg-kloven-black text-kloven-white hover:border-kloven-gold"
                                : "border-kloven-smoke/50 bg-kloven-black text-kloven-smoke cursor-not-allowed line-through"
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

                  {/* Add to cart */}
                  {product.sold_out ? (
                    <button
                      disabled
                      className="w-full py-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2 bg-gray-700 text-gray-400 cursor-not-allowed opacity-70"
                    >
                      Sin Stock
                    </button>
                  ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={!selectedVariant || selectedVariant.stock <= 0}
                    className={`w-full py-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2 ${
                      added
                        ? "bg-green-600 text-white"
                        : selectedVariant && selectedVariant.stock > 0
                        ? "bg-kloven-gold text-white hover:bg-kloven-gold/80 hover:animate-[cardShake_0.3s_steps(4)_infinite]"
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
                  )}
                </>
              )}
            </div>
          </ScrollReveal>
      </div>

      {/* SizeGuide + Related */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 mt-24">
        <SizeGuideModal
          isOpen={sizeGuideOpen}
          onClose={() => setSizeGuideOpen(false)}
          sizeType={productCategory?.size_type || "clothing"}
          category={product.category}
        />

        {/* Related products */}
        {related.length > 0 && (
          <div>
            <h2 className="font-heading text-3xl uppercase tracking-wider mb-10 text-kloven-white">
              Tambien te puede gustar
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-3 sm:gap-x-5 lg:gap-x-6 gap-y-8 sm:gap-y-10">
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
