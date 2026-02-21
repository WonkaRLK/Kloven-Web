-- =====================================================
-- KLOVEN POINTS SYSTEM - Schema SQL
-- Run this in the Supabase SQL Editor
-- =====================================================

-- 1. User Profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT DEFAULT '',
  points_balance INTEGER NOT NULL DEFAULT 0,
  total_points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role full access to profiles"
  ON user_profiles FOR ALL
  USING (auth.role() = 'service_role');

-- 2. Point transaction type enum
DO $$ BEGIN
  CREATE TYPE point_tx_type AS ENUM ('earn', 'redeem', 'expire', 'admin_adjust');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Point Transactions table
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type point_tx_type NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  reward_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON point_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to transactions"
  ON point_transactions FOR ALL
  USING (auth.role() = 'service_role');

-- 4. Reward type enum
DO $$ BEGIN
  CREATE TYPE reward_type AS ENUM ('discount_code', 'free_product');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 5. Rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  type reward_type NOT NULL,
  points_cost INTEGER NOT NULL CHECK (points_cost > 0),
  discount_percent INTEGER DEFAULT 0,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  max_redemptions INTEGER DEFAULT 0,
  current_redemptions INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active rewards"
  ON rewards FOR SELECT
  USING (active = true);

CREATE POLICY "Service role full access to rewards"
  ON rewards FOR ALL
  USING (auth.role() = 'service_role');

-- 6. Add FK to point_transactions.reward_id
ALTER TABLE point_transactions
  ADD CONSTRAINT fk_point_tx_reward
  FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE SET NULL;

-- 7. Add user_id FK to orders (if column exists but no FK)
DO $$ BEGIN
  ALTER TABLE orders
    ADD CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 8. Trigger: auto-create user_profiles on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 9. Function: award_points (idempotent by order_id)
CREATE OR REPLACE FUNCTION award_points(
  p_user_id UUID,
  p_order_id UUID,
  p_order_total INTEGER,
  p_points_per_unit INTEGER DEFAULT 1,
  p_unit_amount INTEGER DEFAULT 100
)
RETURNS VOID AS $$
DECLARE
  v_points INTEGER;
  v_existing UUID;
  v_new_balance INTEGER;
BEGIN
  -- Check idempotency: already awarded for this order?
  SELECT id INTO v_existing
  FROM point_transactions
  WHERE user_id = p_user_id AND order_id = p_order_id AND type = 'earn'
  LIMIT 1;

  IF v_existing IS NOT NULL THEN
    RETURN; -- Already awarded
  END IF;

  -- Calculate points: (total / unit_amount) * points_per_unit
  v_points := (p_order_total / p_unit_amount) * p_points_per_unit;

  IF v_points <= 0 THEN
    RETURN;
  END IF;

  -- Update balance
  UPDATE user_profiles
  SET
    points_balance = points_balance + v_points,
    total_points_earned = total_points_earned + v_points,
    updated_at = now()
  WHERE id = p_user_id
  RETURNING points_balance INTO v_new_balance;

  -- Record transaction
  INSERT INTO point_transactions (user_id, type, amount, balance_after, description, order_id)
  VALUES (p_user_id, 'earn', v_points, v_new_balance, 'Puntos por compra', p_order_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Function: redeem_reward (anti double-spend with SELECT FOR UPDATE)
CREATE OR REPLACE FUNCTION redeem_reward(
  p_user_id UUID,
  p_reward_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_reward rewards%ROWTYPE;
  v_profile user_profiles%ROWTYPE;
  v_new_balance INTEGER;
  v_promo_code TEXT;
  v_result JSONB;
BEGIN
  -- Lock the reward row
  SELECT * INTO v_reward
  FROM rewards
  WHERE id = p_reward_id AND active = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recompensa no encontrada o inactiva';
  END IF;

  -- Check max redemptions
  IF v_reward.max_redemptions > 0 AND v_reward.current_redemptions >= v_reward.max_redemptions THEN
    RAISE EXCEPTION 'Recompensa agotada';
  END IF;

  -- Lock the user profile
  SELECT * INTO v_profile
  FROM user_profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Perfil de usuario no encontrado';
  END IF;

  -- Check balance
  IF v_profile.points_balance < v_reward.points_cost THEN
    RAISE EXCEPTION 'Puntos insuficientes';
  END IF;

  -- Deduct points
  v_new_balance := v_profile.points_balance - v_reward.points_cost;

  UPDATE user_profiles
  SET points_balance = v_new_balance, updated_at = now()
  WHERE id = p_user_id;

  -- Increment redemptions
  UPDATE rewards
  SET current_redemptions = current_redemptions + 1
  WHERE id = p_reward_id;

  -- If discount_code type, create a promo code
  IF v_reward.type = 'discount_code' AND v_reward.discount_percent > 0 THEN
    v_promo_code := 'KP-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 8));

    INSERT INTO promo_codes (code, discount_percent, max_uses, current_uses, active)
    VALUES (v_promo_code, v_reward.discount_percent, 1, 0, true);
  END IF;

  -- Record transaction
  INSERT INTO point_transactions (user_id, type, amount, balance_after, description, reward_id)
  VALUES (p_user_id, 'redeem', -v_reward.points_cost, v_new_balance, 'Canje: ' || v_reward.name, p_reward_id);

  v_result := jsonb_build_object(
    'success', true,
    'points_deducted', v_reward.points_cost,
    'new_balance', v_new_balance,
    'promo_code', v_promo_code
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
