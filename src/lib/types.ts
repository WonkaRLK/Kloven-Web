export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  size_type: string;
  active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  category: string;
  image_url: string;
  images: string[];
  material: string;
  fit: string;
  featured: boolean;
  active: boolean;
  on_sale: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  is_combo?: boolean;
}

export interface ComboItem {
  id: string;
  combo_id: string;
  product_id: string;
  quantity: number;
  sort_order: number;
}

export interface ComboItemWithProduct extends ComboItem {
  product: ProductWithVariants;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
  active: boolean;
}

export interface ProductWithVariants extends Product {
  product_variants: ProductVariant[];
  combo_items?: ComboItemWithProduct[];
}

export type TiendaSortOption = "newest" | "price_asc" | "price_desc" | "name_asc";

export interface TiendaFilters {
  categories: string[];
  sizes: string[];
  colors: string[];
  tags: string[];
  onSale: boolean;
  minPrice: number | null;
  maxPrice: number | null;
  sort: TiendaSortOption;
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

export interface ComboVariantSelection {
  product_id: string;
  product_name: string;
  variant_id: string;
  size: string;
  color: string;
  quantity: number;
  stock: number;
  image_url: string;
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
  combo_variant_selections?: ComboVariantSelection[] | null;
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

export interface RegularCartItem {
  type: "regular";
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface ComboCartItem {
  type: "combo";
  product: Product;
  comboSelections: ComboVariantSelection[];
  quantity: number;
  comboId: string; // unique key per combo instance in cart
}

export type CartItem = RegularCartItem | ComboCartItem;

// Points system types

export interface UserProfile {
  id: string;
  display_name: string;
  avatar_url: string;
  points_balance: number;
  total_points_earned: number;
  created_at: string;
  updated_at: string;
}

export type PointTxType = "earn" | "redeem" | "expire" | "admin_adjust";

export interface PointTransaction {
  id: string;
  user_id: string;
  type: PointTxType;
  amount: number;
  balance_after: number;
  description: string;
  order_id: string | null;
  reward_id: string | null;
  created_at: string;
}

export type RewardType = "discount_code" | "free_product";

export interface Reward {
  id: string;
  name: string;
  description: string;
  type: RewardType;
  points_cost: number;
  discount_percent: number;
  product_id: string | null;
  max_redemptions: number;
  current_redemptions: number;
  active: boolean;
  created_at: string;
}
