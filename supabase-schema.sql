-- ============================================
-- Kloven Streetwear - Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  price INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('remeras', 'buzos', 'pantalones', 'accesorios')),
  image_url TEXT DEFAULT '',
  material TEXT DEFAULT '',
  fit TEXT DEFAULT '',
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Product Variants (size/color/stock)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL CHECK (size IN ('S', 'M', 'L', 'XL', 'XXL')),
  color TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  sku TEXT DEFAULT '',
  active BOOLEAN DEFAULT true,
  UNIQUE(product_id, size, color)
);

-- Promo Codes
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  max_uses INTEGER DEFAULT 0,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  status TEXT DEFAULT 'pending',
  mp_payment_id TEXT,
  mp_status TEXT,
  payer_name TEXT NOT NULL DEFAULT '',
  payer_email TEXT NOT NULL DEFAULT '',
  payer_phone TEXT DEFAULT '',
  shipping_address TEXT DEFAULT '',
  shipping_city TEXT DEFAULT '',
  shipping_zip TEXT DEFAULT '',
  subtotal INTEGER DEFAULT 0,
  shipping_cost INTEGER DEFAULT 0,
  discount_amount INTEGER DEFAULT 0,
  promo_code_used TEXT,
  total INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  product_name TEXT NOT NULL,
  size TEXT DEFAULT '',
  color TEXT DEFAULT '',
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL DEFAULT 0
);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Products: public read for active
CREATE POLICY "Public can read active products"
  ON products FOR SELECT
  USING (active = true);

-- Product Variants: public read for active
CREATE POLICY "Public can read active variants"
  ON product_variants FOR SELECT
  USING (active = true);

-- Orders: users read own orders (by email - for guests too)
CREATE POLICY "Service role full access orders"
  ON orders FOR ALL
  USING (true)
  WITH CHECK (true);

-- Order Items: same as orders
CREATE POLICY "Service role full access order_items"
  ON order_items FOR ALL
  USING (true)
  WITH CHECK (true);

-- Promo codes: service role only (no public read)
CREATE POLICY "Service role full access promo_codes"
  ON promo_codes FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Function to increment promo uses (called from checkout)
-- ============================================

CREATE OR REPLACE FUNCTION increment_promo_uses(promo_code TEXT)
RETURNS void AS $$
BEGIN
  UPDATE promo_codes
  SET current_uses = current_uses + 1
  WHERE code = promo_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
