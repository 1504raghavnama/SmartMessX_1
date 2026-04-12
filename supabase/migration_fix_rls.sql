-- ============================================================
-- SmartMessX - Migration: Fix RLS Policy Recursion
-- Run this in Supabase SQL Editor to fix the login issue
-- This script drops ALL existing policies and recreates them
-- using auth.jwt() metadata instead of querying profiles table.
-- ============================================================

-- ============================================================
-- DROP ALL EXISTING POLICIES
-- ============================================================

-- profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Owners can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.profiles;

-- plans
DROP POLICY IF EXISTS "Anyone can read plans" ON public.plans;
DROP POLICY IF EXISTS "Owners can manage plans" ON public.plans;

-- mess_info
DROP POLICY IF EXISTS "Anyone can read mess_info" ON public.mess_info;
DROP POLICY IF EXISTS "Owners can update mess_info" ON public.mess_info;

-- menu_items
DROP POLICY IF EXISTS "Anyone can read menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "Owners can manage menu_items" ON public.menu_items;

-- daily_menus
DROP POLICY IF EXISTS "Anyone can read daily_menus" ON public.daily_menus;
DROP POLICY IF EXISTS "Owners can manage daily_menus" ON public.daily_menus;

-- festival_menus
DROP POLICY IF EXISTS "Anyone can read festival_menus" ON public.festival_menus;
DROP POLICY IF EXISTS "Owners can manage festival_menus" ON public.festival_menus;

-- enrollments
DROP POLICY IF EXISTS "Students can read own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Students can insert own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Owners can read all enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Owners can manage enrollments" ON public.enrollments;

-- attendance
DROP POLICY IF EXISTS "Students can read own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Students can insert own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Students can update own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Owners can read all attendance" ON public.attendance;
DROP POLICY IF EXISTS "Owners can manage attendance" ON public.attendance;

-- payments
DROP POLICY IF EXISTS "Students can read own payments" ON public.payments;
DROP POLICY IF EXISTS "Students can insert own payments" ON public.payments;
DROP POLICY IF EXISTS "Owners can read all payments" ON public.payments;
DROP POLICY IF EXISTS "Owners can manage payments" ON public.payments;

-- demand_predictions
DROP POLICY IF EXISTS "Anyone can read demand_predictions" ON public.demand_predictions;
DROP POLICY IF EXISTS "Owners can manage demand_predictions" ON public.demand_predictions;

-- offers
DROP POLICY IF EXISTS "Anyone can read active offers" ON public.offers;
DROP POLICY IF EXISTS "Owners can manage offers" ON public.offers;

-- ============================================================
-- RECREATE ALL POLICIES (using JWT metadata, NO recursion)
-- ============================================================

-- ---- PROFILES ----
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Owners can read all profiles"
  ON public.profiles FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'owner'
  );

CREATE POLICY "Allow insert for authenticated users"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ---- PLANS ----
CREATE POLICY "Anyone can read plans"
  ON public.plans FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage plans"
  ON public.plans FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'owner'
  );

-- ---- MESS_INFO ----
CREATE POLICY "Anyone can read mess_info"
  ON public.mess_info FOR SELECT
  USING (true);

CREATE POLICY "Owners can update mess_info"
  ON public.mess_info FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'owner'
  );

-- ---- MENU_ITEMS ----
CREATE POLICY "Anyone can read menu_items"
  ON public.menu_items FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage menu_items"
  ON public.menu_items FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'owner'
  );

-- ---- DAILY_MENUS ----
CREATE POLICY "Anyone can read daily_menus"
  ON public.daily_menus FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage daily_menus"
  ON public.daily_menus FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'owner'
  );

-- ---- FESTIVAL_MENUS ----
CREATE POLICY "Anyone can read festival_menus"
  ON public.festival_menus FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage festival_menus"
  ON public.festival_menus FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'owner'
  );

-- ---- ENROLLMENTS ----
CREATE POLICY "Students can read own enrollments"
  ON public.enrollments FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own enrollments"
  ON public.enrollments FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Owners can read all enrollments"
  ON public.enrollments FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'owner'
  );

CREATE POLICY "Owners can manage enrollments"
  ON public.enrollments FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'owner'
  );

-- ---- ATTENDANCE ----
CREATE POLICY "Students can read own attendance"
  ON public.attendance FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own attendance"
  ON public.attendance FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own attendance"
  ON public.attendance FOR UPDATE
  USING (auth.uid() = student_id);

CREATE POLICY "Owners can read all attendance"
  ON public.attendance FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'owner'
  );

CREATE POLICY "Owners can manage attendance"
  ON public.attendance FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'owner'
  );

-- ---- PAYMENTS ----
CREATE POLICY "Students can read own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Owners can read all payments"
  ON public.payments FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'owner'
  );

CREATE POLICY "Owners can manage payments"
  ON public.payments FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'owner'
  );

-- ---- DEMAND_PREDICTIONS ----
CREATE POLICY "Anyone can read demand_predictions"
  ON public.demand_predictions FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage demand_predictions"
  ON public.demand_predictions FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'owner'
  );

-- ---- OFFERS ----
CREATE POLICY "Anyone can read active offers"
  ON public.offers FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage offers"
  ON public.offers FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'owner'
  );

-- ============================================================
-- FIX TRIGGER: Ensure handle_new_user uses ON CONFLICT DO NOTHING
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, enrolled)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- DONE! Login should now work without recursion errors.
-- ============================================================
