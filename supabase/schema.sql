-- ============================================================
-- SmartMessX - Supabase Database Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ============================================================
-- 1. PROFILES TABLE
-- Extends Supabase Auth users with app-specific fields
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'owner')),
  enrolled BOOLEAN NOT NULL DEFAULT false,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Owners can read all profiles
CREATE POLICY "Owners can read all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

-- Allow insert during signup (profile is created via trigger)
CREATE POLICY "Allow insert for authenticated users"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- 2. PLANS TABLE
-- ============================================================
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  days INTEGER NOT NULL,
  price INTEGER NOT NULL,
  per_day INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read plans"
  ON public.plans FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage plans"
  ON public.plans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

-- ============================================================
-- 3. MESS_INFO TABLE
-- ============================================================
CREATE TABLE public.mess_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  timing_breakfast TEXT NOT NULL DEFAULT '7:30 AM – 9:30 AM',
  timing_lunch TEXT NOT NULL DEFAULT '12:00 PM – 2:00 PM',
  timing_dinner TEXT NOT NULL DEFAULT '7:00 PM – 9:00 PM',
  contact TEXT NOT NULL DEFAULT '',
  capacity INTEGER NOT NULL DEFAULT 200,
  current_enrolled INTEGER NOT NULL DEFAULT 0,
  festival_mode BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mess_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read mess_info"
  ON public.mess_info FOR SELECT
  USING (true);

CREATE POLICY "Owners can update mess_info"
  ON public.mess_info FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

-- ============================================================
-- 4. MENU_ITEMS TABLE
-- ============================================================
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_veg BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read menu_items"
  ON public.menu_items FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage menu_items"
  ON public.menu_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

-- ============================================================
-- 5. DAILY_MENUS TABLE
-- ============================================================
CREATE TABLE public.daily_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE
);

ALTER TABLE public.daily_menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read daily_menus"
  ON public.daily_menus FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage daily_menus"
  ON public.daily_menus FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

-- ============================================================
-- 6. FESTIVAL_MENUS TABLE
-- ============================================================
CREATE TABLE public.festival_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE
);

ALTER TABLE public.festival_menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read festival_menus"
  ON public.festival_menus FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage festival_menus"
  ON public.festival_menus FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

-- ============================================================
-- 7. ENROLLMENTS TABLE
-- ============================================================
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  remaining_days INTEGER NOT NULL DEFAULT 0,
  total_paid INTEGER NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'upi',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own enrollments"
  ON public.enrollments FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own enrollments"
  ON public.enrollments FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Owners can read all enrollments"
  ON public.enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

CREATE POLICY "Owners can manage enrollments"
  ON public.enrollments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

-- ============================================================
-- 8. ATTENDANCE TABLE
-- ============================================================
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  breakfast BOOLEAN NOT NULL DEFAULT false,
  lunch BOOLEAN NOT NULL DEFAULT false,
  dinner BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'leave')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, date)
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

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
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

CREATE POLICY "Owners can manage attendance"
  ON public.attendance FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

-- ============================================================
-- 9. PAYMENTS TABLE
-- ============================================================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount INTEGER NOT NULL,
  method TEXT NOT NULL DEFAULT 'upi',
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'failed')),
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Owners can read all payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

CREATE POLICY "Owners can manage payments"
  ON public.payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

-- ============================================================
-- 10. DEMAND_PREDICTIONS TABLE
-- ============================================================
CREATE TABLE public.demand_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day TEXT NOT NULL,
  expected INTEGER NOT NULL DEFAULT 0,
  actual INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.demand_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read demand_predictions"
  ON public.demand_predictions FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage demand_predictions"
  ON public.demand_predictions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

-- ============================================================
-- 11. OFFERS TABLE
-- ============================================================
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  valid_till DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active offers"
  ON public.offers FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage offers"
  ON public.offers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_attendance_student_date ON public.attendance(student_id, date);
CREATE INDEX idx_payments_student ON public.payments(student_id);
CREATE INDEX idx_enrollments_student_active ON public.enrollments(student_id, is_active);
CREATE INDEX idx_daily_menus_date ON public.daily_menus(menu_date);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- ============================================================
-- TRIGGER: Auto-create profile on signup
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
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
