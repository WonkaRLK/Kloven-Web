-- Kloven Streetwear: Security SQL
-- Run this in Supabase Dashboard > SQL Editor

-- Drop overly permissive policies (service role bypasses RLS anyway)
DROP POLICY IF EXISTS "Service role full access orders" ON orders;
DROP POLICY IF EXISTS "Service role full access order_items" ON order_items;
DROP POLICY IF EXISTS "Service role full access promo_codes" ON promo_codes;

-- Atomic stock decrement function (prevents race conditions)
CREATE OR REPLACE FUNCTION decrement_stock_batch(p_items JSONB)
RETURNS VOID AS $$
DECLARE
  item JSONB;
  current_stock INTEGER;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT stock INTO current_stock
    FROM product_variants
    WHERE id = (item->>'variant_id')::UUID
    FOR UPDATE;

    IF current_stock IS NULL THEN
      RAISE EXCEPTION 'Variant % not found', item->>'variant_id';
    END IF;

    IF current_stock < (item->>'quantity')::INTEGER THEN
      RAISE EXCEPTION 'Insufficient stock for variant %', item->>'variant_id';
    END IF;

    UPDATE product_variants
    SET stock = stock - (item->>'quantity')::INTEGER
    WHERE id = (item->>'variant_id')::UUID;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Atomic stock restore function
CREATE OR REPLACE FUNCTION restore_stock(p_variant_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE product_variants
  SET stock = stock + p_quantity
  WHERE id = p_variant_id;
END;
$$ LANGUAGE plpgsql;
