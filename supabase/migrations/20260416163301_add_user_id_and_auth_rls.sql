/*
  # Add user_id for multi-user data isolation

  ## Overview
  Adds `user_id` column to all data tables so each MR's data is
  completely isolated. Updates RLS to enforce per-user access only.

  ## Changes

  ### Modified Tables
  - `doctors`: Added `user_id uuid` FK to auth.users
  - `medicines`: Added `user_id uuid` FK to auth.users
  - `orders`: Added `user_id uuid` FK to auth.users
  - `order_items`: Added `user_id uuid` FK to auth.users

  ## Security
  - Dropped all old `anon` policies (open access)
  - Added `authenticated` policies: users can only see/modify their own records
  - RLS enforces strict per-user data isolation
*/

ALTER TABLE doctors ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

DROP POLICY IF EXISTS "Allow anon select on doctors" ON doctors;
DROP POLICY IF EXISTS "Allow anon insert on doctors" ON doctors;
DROP POLICY IF EXISTS "Allow anon update on doctors" ON doctors;
DROP POLICY IF EXISTS "Allow anon select on medicines" ON medicines;
DROP POLICY IF EXISTS "Allow anon insert on medicines" ON medicines;
DROP POLICY IF EXISTS "Allow anon update on medicines" ON medicines;
DROP POLICY IF EXISTS "Allow anon select on orders" ON orders;
DROP POLICY IF EXISTS "Allow anon insert on orders" ON orders;
DROP POLICY IF EXISTS "Allow anon update on orders" ON orders;
DROP POLICY IF EXISTS "Allow anon delete on orders" ON orders;
DROP POLICY IF EXISTS "Allow anon select on order_items" ON order_items;
DROP POLICY IF EXISTS "Allow anon insert on order_items" ON order_items;
DROP POLICY IF EXISTS "Allow anon update on order_items" ON order_items;
DROP POLICY IF EXISTS "Allow anon delete on order_items" ON order_items;

CREATE POLICY "Users can view own doctors"
  ON doctors FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own doctors"
  ON doctors FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own doctors"
  ON doctors FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own medicines"
  ON medicines FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medicines"
  ON medicines FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medicines"
  ON medicines FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own orders"
  ON orders FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own order_items"
  ON order_items FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own order_items"
  ON order_items FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own order_items"
  ON order_items FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own order_items"
  ON order_items FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
