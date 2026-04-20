-- Kloven — critical webhook/email reliability fixes
-- Run this in the Supabase SQL editor (or via migration pipeline).

-- 1) Idempotency flag so we don't re-award loyalty points if the webhook
--    fires twice for the same payment.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS points_awarded BOOLEAN NOT NULL DEFAULT FALSE;

-- 2) Log of failures for manual review (email send failures, stock
--    restoration failures, etc). The webhook writes here when something
--    goes wrong so the admin has a trail.
CREATE TABLE IF NOT EXISTS webhook_failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  mp_payment_id TEXT,
  kind TEXT NOT NULL, -- 'email' | 'points' | 'stock_restore' | 'other'
  error_message TEXT,
  payload JSONB,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS webhook_failures_resolved_idx
  ON webhook_failures (resolved, created_at DESC);

CREATE INDEX IF NOT EXISTS webhook_failures_order_idx
  ON webhook_failures (order_id);

-- 3) Atomic stock restoration (mirrors decrement_stock_batch). Prevents
--    the half-restored-inventory situation if a loop crashes mid-way.
CREATE OR REPLACE FUNCTION restore_stock_batch(p_items JSONB)
RETURNS VOID AS $$
DECLARE
  item JSONB;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    UPDATE product_variants
    SET stock = stock + (item->>'quantity')::INT
    WHERE id = (item->>'variant_id')::UUID;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
