-- Kloven: agregar configuración de pagos a store_config
ALTER TABLE store_config
  ADD COLUMN IF NOT EXISTS transfer_discount_percent INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS installments_count INTEGER NOT NULL DEFAULT 0;
