export type Category = "remeras" | "buzos" | "pantalones" | "accesorios";

export const categoryLabels: Record<Category, string> = {
  remeras: "Remeras",
  buzos: "Hoodies & Buzos",
  pantalones: "Pantalones",
  accesorios: "Accesorios",
};

export type Size = "S" | "M" | "L" | "XL" | "XXL";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: Category;
  image_url: string;
  material: string;
  fit: string;
  featured: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: Size;
  color: string;
  stock: number;
  sku: string;
  active: boolean;
}

export interface ProductWithVariants extends Product {
  product_variants: ProductVariant[];
}

export type OrderStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "in_process"
  | "cancelled"
  | "refunded";

export interface Order {
  id: string;
  user_id: string | null;
  status: OrderStatus;
  mp_payment_id: string | null;
  mp_status: string | null;
  payer_name: string;
  payer_email: string;
  payer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_zip: string;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  promo_code_used: string | null;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  size: string;
  color: string;
  quantity: number;
  unit_price: number;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export interface PromoCode {
  id: string;
  code: string;
  discount_percent: number;
  max_uses: number;
  current_uses: number;
  expires_at: string | null;
  active: boolean;
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}
