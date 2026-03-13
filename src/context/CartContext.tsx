"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type {
  Product,
  ProductVariant,
  CartItem,
  ComboVariantSelection,
} from "@/lib/types";

function getItemKey(item: CartItem): string {
  return item.type === "combo" ? item.comboId : item.variant.id;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variant: ProductVariant) => void;
  addComboToCart: (product: Product, selections: ComboVariantSelection[]) => void;
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "kloven_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage with migration
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsed = JSON.parse(saved) as any[];
        // Migrate old items without type
        const migrated: CartItem[] = parsed.map((item) => {
          if (!item.type) {
            return { ...item, type: "regular" as const };
          }
          return item as CartItem;
        });
        setItems(migrated);
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, loaded]);

  const addToCart = useCallback((product: Product, variant: ProductVariant) => {
    setItems((prev) => {
      const existing = prev.find(
        (item) => item.type === "regular" && item.variant.id === variant.id
      );
      if (existing && existing.type === "regular") {
        const newQty = Math.min(existing.quantity + 1, variant.stock);
        return prev.map((item) =>
          item.type === "regular" && item.variant.id === variant.id
            ? { ...item, quantity: newQty }
            : item
        );
      }
      return [...prev, { type: "regular" as const, product, variant, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const addComboToCart = useCallback(
    (product: Product, selections: ComboVariantSelection[]) => {
      const comboId = crypto.randomUUID();
      setItems((prev) => [
        ...prev,
        {
          type: "combo" as const,
          product,
          comboSelections: selections,
          quantity: 1,
          comboId,
        },
      ]);
      setIsOpen(true);
    },
    []
  );

  const removeFromCart = useCallback((key: string) => {
    setItems((prev) => prev.filter((item) => getItemKey(item) !== key));
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => getItemKey(item) !== key));
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (getItemKey(item) !== key) return item;
        if (item.type === "regular") {
          return { ...item, quantity: Math.min(quantity, item.variant.stock) };
        }
        // For combo, max = min stock among all selections
        const maxStock = Math.min(
          ...item.comboSelections.map((s) => Math.floor(s.stock / s.quantity))
        );
        return { ...item, quantity: Math.min(quantity, maxStock) };
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        addComboToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
