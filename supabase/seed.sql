-- ============================================================
-- SmartMessX - Seed Data
-- Run this AFTER schema.sql in your Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. MESS INFO (single row)
-- ============================================================
INSERT INTO public.mess_info (name, description, address, timing_breakfast, timing_lunch, timing_dinner, contact, capacity, current_enrolled, festival_mode)
VALUES (
  'SmartMessX – College Mess',
  'A modern, hygienic, and well-managed mess facility providing nutritious and delicious meals to students. We focus on quality ingredients, balanced nutrition, and variety in our daily meals.',
  'Block C, University Campus, Knowledge Park, Bangalore - 560001',
  '7:30 AM – 9:30 AM',
  '12:00 PM – 2:00 PM',
  '7:00 PM – 9:00 PM',
  '+91 98765 00000',
  200,
  0,
  false
);

-- ============================================================
-- 2. PLANS
-- ============================================================
INSERT INTO public.plans (slug, name, days, price, per_day) VALUES
  ('weekly',    'Weekly',    7,  1400,  200),
  ('monthly',   'Monthly',   30, 4500,  150),
  ('quarterly', 'Quarterly', 90, 12000, 133);

-- ============================================================
-- 3. MENU ITEMS
-- ============================================================
-- Breakfast items
INSERT INTO public.menu_items (id, name, description, is_veg) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Poha', 'Flattened rice with peanuts & vegetables', true),
  ('a0000001-0000-0000-0000-000000000002', 'Paratha', 'Stuffed wheat flatbread with curd', true),
  ('a0000001-0000-0000-0000-000000000003', 'Tea / Coffee', NULL, true),
  ('a0000001-0000-0000-0000-000000000004', 'Boiled Eggs', '2 boiled eggs', false);

-- Lunch items
INSERT INTO public.menu_items (id, name, description, is_veg) VALUES
  ('a0000002-0000-0000-0000-000000000001', 'Dal Tadka', 'Yellow lentil with tempering', true),
  ('a0000002-0000-0000-0000-000000000002', 'Jeera Rice', 'Cumin flavored basmati rice', true),
  ('a0000002-0000-0000-0000-000000000003', 'Aloo Gobi', 'Potato & cauliflower curry', true),
  ('a0000002-0000-0000-0000-000000000004', 'Chapati', '4 pieces', true),
  ('a0000002-0000-0000-0000-000000000005', 'Salad & Papad', NULL, true);

-- Dinner items
INSERT INTO public.menu_items (id, name, description, is_veg) VALUES
  ('a0000003-0000-0000-0000-000000000001', 'Paneer Butter Masala', 'Cottage cheese in rich gravy', true),
  ('a0000003-0000-0000-0000-000000000002', 'Steamed Rice', NULL, true),
  ('a0000003-0000-0000-0000-000000000003', 'Mixed Veg', 'Seasonal vegetables', true),
  ('a0000003-0000-0000-0000-000000000004', 'Roti', '4 pieces', true),
  ('a0000003-0000-0000-0000-000000000005', 'Gulab Jamun', 'Sweet dessert', true);

-- Festival breakfast items
INSERT INTO public.menu_items (id, name, description, is_veg) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'Chole Bhature', 'Chickpea curry with fried bread', true),
  ('b0000001-0000-0000-0000-000000000002', 'Lassi', 'Sweet yogurt drink', true);

-- Festival lunch items
INSERT INTO public.menu_items (id, name, description, is_veg) VALUES
  ('b0000002-0000-0000-0000-000000000001', 'Biryani', 'Hyderabadi style', true),
  ('b0000002-0000-0000-0000-000000000002', 'Raita', NULL, true),
  ('b0000002-0000-0000-0000-000000000003', 'Paneer Tikka', NULL, true),
  ('b0000002-0000-0000-0000-000000000004', 'Kheer', 'Rice pudding', true);

-- Festival dinner items
INSERT INTO public.menu_items (id, name, description, is_veg) VALUES
  ('b0000003-0000-0000-0000-000000000001', 'Butter Chicken', NULL, false),
  ('b0000003-0000-0000-0000-000000000002', 'Naan', 'Butter naan', true),
  ('b0000003-0000-0000-0000-000000000003', 'Dal Makhani', NULL, true),
  ('b0000003-0000-0000-0000-000000000004', 'Ice Cream', NULL, true);

-- ============================================================
-- 4. DAILY MENUS (today's date)
-- ============================================================
INSERT INTO public.daily_menus (menu_date, meal_type, menu_item_id) VALUES
  (CURRENT_DATE, 'breakfast', 'a0000001-0000-0000-0000-000000000001'),
  (CURRENT_DATE, 'breakfast', 'a0000001-0000-0000-0000-000000000002'),
  (CURRENT_DATE, 'breakfast', 'a0000001-0000-0000-0000-000000000003'),
  (CURRENT_DATE, 'breakfast', 'a0000001-0000-0000-0000-000000000004'),
  (CURRENT_DATE, 'lunch', 'a0000002-0000-0000-0000-000000000001'),
  (CURRENT_DATE, 'lunch', 'a0000002-0000-0000-0000-000000000002'),
  (CURRENT_DATE, 'lunch', 'a0000002-0000-0000-0000-000000000003'),
  (CURRENT_DATE, 'lunch', 'a0000002-0000-0000-0000-000000000004'),
  (CURRENT_DATE, 'lunch', 'a0000002-0000-0000-0000-000000000005'),
  (CURRENT_DATE, 'dinner', 'a0000003-0000-0000-0000-000000000001'),
  (CURRENT_DATE, 'dinner', 'a0000003-0000-0000-0000-000000000002'),
  (CURRENT_DATE, 'dinner', 'a0000003-0000-0000-0000-000000000003'),
  (CURRENT_DATE, 'dinner', 'a0000003-0000-0000-0000-000000000004'),
  (CURRENT_DATE, 'dinner', 'a0000003-0000-0000-0000-000000000005');

-- ============================================================
-- 5. FESTIVAL MENUS
-- ============================================================
INSERT INTO public.festival_menus (meal_type, menu_item_id) VALUES
  ('breakfast', 'b0000001-0000-0000-0000-000000000001'),
  ('breakfast', 'b0000001-0000-0000-0000-000000000002'),
  ('lunch', 'b0000002-0000-0000-0000-000000000001'),
  ('lunch', 'b0000002-0000-0000-0000-000000000002'),
  ('lunch', 'b0000002-0000-0000-0000-000000000003'),
  ('lunch', 'b0000002-0000-0000-0000-000000000004'),
  ('dinner', 'b0000003-0000-0000-0000-000000000001'),
  ('dinner', 'b0000003-0000-0000-0000-000000000002'),
  ('dinner', 'b0000003-0000-0000-0000-000000000003'),
  ('dinner', 'b0000003-0000-0000-0000-000000000004');

-- ============================================================
-- 6. DEMAND PREDICTIONS
-- ============================================================
INSERT INTO public.demand_predictions (day, expected, actual) VALUES
  ('Mon', 130, 125),
  ('Tue', 135, 138),
  ('Wed', 128, 122),
  ('Thu', 140, 142),
  ('Fri', 120, 115),
  ('Sat', 90, 88),
  ('Sun', 85, 82);

-- ============================================================
-- 7. SAMPLE OFFERS
-- ============================================================
INSERT INTO public.offers (title, description, active, valid_till) VALUES
  ('Festival Special - 20% Off', 'Get 20% off on quarterly plans during Diwali week', true, '2026-04-20'),
  ('Refer a Friend', 'Get ₹200 off when you refer a friend', true, '2026-05-01');
