/*
  # Update Challenge Time Limits and Add New Challenges

  ## Summary
  This migration updates the time limits (start_date and end_date) for existing challenges and adds 10 new diverse challenges to encourage healthy eating habits and engagement.

  ## Changes Made

  ### 1. Updated Time Limits for Existing Challenges
  - **Veggie Week**: Changed to 30-day challenge (1 month)
  - **Protein Power**: Changed to 14-day challenge (2 weeks)
  - **Breakfast Champion**: Changed to 21-day challenge (3 weeks)
  - **Hydration Hero**: Kept at 14 days but updated dates

  ### 2. New Challenges Added (10 challenges)
  - **Filipino Food Explorer** - Try 8 different Filipino recipes
  - **Meal Prep Master** - Prep meals for 5 days in advance
  - **Low-Calorie Champion** - Complete 10 low-calorie meals under 400 calories
  - **Seafood Sunday** - Cook 4 seafood-based meals
  - **No Sugar Week** - Avoid added sugars for 7 days
  - **Rainbow Plate** - Create 5 colorful meals with 5+ different colored ingredients
  - **Quick Cook Challenge** - Prepare 6 meals in under 30 minutes
  - **Traditional Tastes** - Cook 5 traditional family recipes
  - **Lean & Green** - Complete 10 vegetable-heavy, low-fat meals
  - **Spice Explorer** - Try 8 recipes with new spices you haven't used before

  ## Security
  - Uses existing RLS policies on challenges table
  - No security changes required
*/

-- =============================================
-- UPDATE TIME LIMITS FOR EXISTING CHALLENGES
-- =============================================

-- Update Veggie Week: 30-day challenge
UPDATE challenges
SET 
  start_date = now(),
  end_date = now() + interval '30 days',
  updated_at = now()
WHERE id = '650e8400-e29b-41d4-a716-446655440001';

-- Update Protein Power: 14-day challenge
UPDATE challenges
SET 
  start_date = now(),
  end_date = now() + interval '14 days',
  updated_at = now()
WHERE id = '650e8400-e29b-41d4-a716-446655440002';

-- Update Breakfast Champion: 21-day challenge
UPDATE challenges
SET 
  start_date = now(),
  end_date = now() + interval '21 days',
  updated_at = now()
WHERE id = '650e8400-e29b-41d4-a716-446655440003';

-- Update Hydration Hero: 14-day challenge
UPDATE challenges
SET 
  start_date = now(),
  end_date = now() + interval '14 days',
  updated_at = now()
WHERE id = '650e8400-e29b-41d4-a716-446655440004';

-- =============================================
-- ADD NEW CHALLENGES
-- =============================================

-- Challenge 1: Filipino Food Explorer
INSERT INTO challenges (
  id,
  title,
  description,
  long_description,
  category,
  total_tasks,
  reward_points,
  start_date,
  end_date,
  icon,
  color,
  bg_color,
  is_active
)
VALUES (
  '650e8400-e29b-41d4-a716-446655440005',
  'Filipino Food Explorer',
  'Discover Filipino cuisine by cooking 8 different Filipino recipes',
  'Embark on a culinary journey through the Philippines! This challenge encourages you to explore the rich flavors and diverse dishes of Filipino cuisine. From savory adobo to refreshing halo-halo, you''ll discover traditional recipes that have been passed down through generations. Perfect for expanding your cooking skills and cultural appreciation.',
  'Culture',
  8,
  350,
  now(),
  now() + interval '45 days',
  'restaurant',
  '#dc2626',
  '#fee2e2',
  true
) ON CONFLICT (id) DO NOTHING;

-- Challenge 2: Meal Prep Master
INSERT INTO challenges (
  id,
  title,
  description,
  long_description,
  category,
  total_tasks,
  reward_points,
  start_date,
  end_date,
  icon,
  color,
  bg_color,
  is_active
)
VALUES (
  '650e8400-e29b-41d4-a716-446655440006',
  'Meal Prep Master',
  'Prep all your meals for 5 consecutive days in advance',
  'Master the art of meal prepping! Plan, shop, and prepare all your meals for 5 days in advance. This challenge will help you save time during busy weekdays, reduce food waste, maintain portion control, and stick to your nutrition goals. Learn efficient batch cooking techniques and proper food storage methods.',
  'Productivity',
  5,
  200,
  now(),
  now() + interval '30 days',
  'time',
  '#7c3aed',
  '#f3e8ff',
  true
) ON CONFLICT (id) DO NOTHING;

-- Challenge 3: Low-Calorie Champion
INSERT INTO challenges (
  id,
  title,
  description,
  long_description,
  category,
  total_tasks,
  reward_points,
  start_date,
  end_date,
  icon,
  color,
  bg_color,
  is_active
)
VALUES (
  '650e8400-e29b-41d4-a716-446655440007',
  'Low-Calorie Champion',
  'Complete 10 delicious meals under 400 calories each',
  'Prove that healthy eating doesn''t mean sacrificing flavor! Create 10 satisfying meals that are each under 400 calories. This challenge will teach you how to use nutrient-dense ingredients, control portions effectively, and prepare filling meals that support weight management goals without leaving you hungry.',
  'Nutrition',
  10,
  300,
  now(),
  now() + interval '30 days',
  'fitness',
  '#10b981',
  '#d1fae5',
  true
) ON CONFLICT (id) DO NOTHING;

-- Challenge 4: Seafood Sunday
INSERT INTO challenges (
  id,
  title,
  description,
  long_description,
  category,
  total_tasks,
  reward_points,
  start_date,
  end_date,
  icon,
  color,
  bg_color,
  is_active
)
VALUES (
  '650e8400-e29b-41d4-a716-446655440008',
  'Seafood Sunday',
  'Cook 4 seafood-based meals rich in omega-3',
  'Dive into the health benefits of seafood! Prepare 4 meals featuring fish or shellfish that are rich in omega-3 fatty acids, high-quality protein, and essential nutrients. This challenge will help you incorporate more heart-healthy seafood into your diet while exploring different cooking methods from grilling to steaming.',
  'Nutrition',
  4,
  180,
  now(),
  now() + interval '28 days',
  'fish',
  '#0891b2',
  '#cffafe',
  true
) ON CONFLICT (id) DO NOTHING;

-- Challenge 5: No Sugar Week
INSERT INTO challenges (
  id,
  title,
  description,
  long_description,
  category,
  total_tasks,
  reward_points,
  start_date,
  end_date,
  icon,
  color,
  bg_color,
  is_active
)
VALUES (
  '650e8400-e29b-41d4-a716-446655440009',
  'No Sugar Week',
  'Avoid all added sugars for 7 consecutive days',
  'Take control of your sugar intake! For 7 days, eliminate all added sugars from your diet while focusing on natural, whole foods. This challenge will help you reset your taste buds, reduce cravings, stabilize energy levels, and become more aware of hidden sugars in processed foods. You''ll discover delicious alternatives and feel the difference.',
  'Wellness',
  7,
  400,
  now(),
  now() + interval '14 days',
  'close-circle',
  '#ef4444',
  '#fee2e2',
  true
) ON CONFLICT (id) DO NOTHING;

-- Challenge 6: Rainbow Plate
INSERT INTO challenges (
  id,
  title,
  description,
  long_description,
  category,
  total_tasks,
  reward_points,
  start_date,
  end_date,
  icon,
  color,
  bg_color,
  is_active
)
VALUES (
  '650e8400-e29b-41d4-a716-446655440010',
  'Rainbow Plate',
  'Create 5 colorful meals with 5+ different colored ingredients',
  'Eat the rainbow for optimal nutrition! Create 5 visually stunning meals that each include at least 5 different colored ingredients. Different colors represent different phytonutrients and antioxidants, so this challenge ensures you''re getting a wide variety of vitamins and minerals. Make your plate a work of art!',
  'Nutrition',
  5,
  220,
  now(),
  now() + interval '21 days',
  'color-palette',
  '#f97316',
  '#ffedd5',
  true
) ON CONFLICT (id) DO NOTHING;

-- Challenge 7: Quick Cook Challenge
INSERT INTO challenges (
  id,
  title,
  description,
  long_description,
  category,
  total_tasks,
  reward_points,
  start_date,
  end_date,
  icon,
  color,
  bg_color,
  is_active
)
VALUES (
  '650e8400-e29b-41d4-a716-446655440011',
  'Quick Cook Challenge',
  'Prepare 6 healthy meals in under 30 minutes each',
  'Master the art of quick, healthy cooking! Prepare 6 nutritious meals that each take 30 minutes or less from start to finish. Perfect for busy individuals who want to eat well without spending hours in the kitchen. Learn efficient prep techniques, smart shortcuts, and recipes that don''t compromise on nutrition or taste.',
  'Productivity',
  6,
  250,
  now(),
  now() + interval '20 days',
  'timer',
  '#8b5cf6',
  '#f5f3ff',
  true
) ON CONFLICT (id) DO NOTHING;

-- Challenge 8: Traditional Tastes
INSERT INTO challenges (
  id,
  title,
  description,
  long_description,
  category,
  total_tasks,
  reward_points,
  start_date,
  end_date,
  icon,
  color,
  bg_color,
  is_active
)
VALUES (
  '650e8400-e29b-41d4-a716-446655440012',
  'Traditional Tastes',
  'Cook 5 traditional family recipes or regional dishes',
  'Connect with your heritage through food! Prepare 5 traditional family recipes or regional dishes that have cultural significance. This challenge celebrates culinary traditions, helps preserve family recipes for future generations, and allows you to share your cultural heritage through the universal language of food.',
  'Culture',
  5,
  280,
  now(),
  now() + interval '35 days',
  'home',
  '#be123c',
  '#ffe4e6',
  true
) ON CONFLICT (id) DO NOTHING;

-- Challenge 9: Lean & Green
INSERT INTO challenges (
  id,
  title,
  description,
  long_description,
  category,
  total_tasks,
  reward_points,
  start_date,
  end_date,
  icon,
  color,
  bg_color,
  is_active
)
VALUES (
  '650e8400-e29b-41d4-a716-446655440013',
  'Lean & Green',
  'Complete 10 vegetable-heavy, low-fat meals',
  'Go lean and green for optimal health! Prepare 10 meals that are loaded with vegetables and low in fat, focusing on nutrient density and satiety. This challenge will help you increase your vegetable intake, reduce saturated fat consumption, and discover how delicious plant-forward eating can be.',
  'Fitness',
  10,
  320,
  now(),
  now() + interval '30 days',
  'leaf',
  '#059669',
  '#d1fae5',
  true
) ON CONFLICT (id) DO NOTHING;

-- Challenge 10: Spice Explorer
INSERT INTO challenges (
  id,
  title,
  description,
  long_description,
  category,
  total_tasks,
  reward_points,
  start_date,
  end_date,
  icon,
  color,
  bg_color,
  is_active
)
VALUES (
  '650e8400-e29b-41d4-a716-446655440014',
  'Spice Explorer',
  'Try 8 recipes using new spices you haven''t cooked with before',
  'Expand your culinary horizons! Step out of your comfort zone and try 8 recipes featuring spices you''ve never used before. From exotic spice blends to single aromatic ingredients, you''ll discover new flavor profiles, learn about different cuisines, and add excitement to your everyday cooking. Many spices also offer health benefits!',
  'Culture',
  8,
  290,
  now(),
  now() + interval '40 days',
  'flame',
  '#ea580c',
  '#fed7aa',
  true
) ON CONFLICT (id) DO NOTHING;
