-- ============================================
-- Kloven Drop Mode - store_config table
-- Run this in the Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS store_config (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  drop_mode_active BOOLEAN NOT NULL DEFAULT false,
  drop_opens_at TIMESTAMPTZ DEFAULT NULL,
  drop_title TEXT NOT NULL DEFAULT 'Nuevo drop en camino',
  drop_message TEXT NOT NULL DEFAULT 'Estamos preparando algo especial. Volvé pronto.',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Single row constraint enforced by CHECK (id = 1)
INSERT INTO store_config (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE store_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read store_config"
  ON store_config FOR SELECT USING (true);
