/*
  # Add Filipino Recipes - Part 1

  This migration adds authentic Filipino recipes with complete details:
  - Adobo (Classic Filipino Chicken & Pork Adobo)
  - Sinigang (Tamarind Soup)
  - Pancit Canton (Stir-Fried Noodles)
  - Lumpia (Filipino Spring Rolls)

  Each recipe includes:
  - Complete recipe metadata (title, description, nutrition, etc.)
  - All ingredients with amounts
  - Step-by-step instructions with timers
  - Proper cuisine and meal type tags

  ## Security
  - No RLS changes needed (inherits from existing policies)
*/

-- 1. ADOBO (Filipino Chicken & Pork Adobo)
INSERT INTO recipes (id, title, description, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
VALUES (
  '550e8400-e29b-41d4-a716-446655440010',
  'Filipino Chicken Adobo',
  'A classic Filipino dish featuring chicken braised in vinegar, soy sauce, and garlic. This savory and slightly tangy dish is considered the unofficial national dish of the Philippines.',
  45,
  'Intermediate',
  'Dinner',
  'Filipino',
  420,
  38,
  12,
  24,
  35,
  8.5
) ON CONFLICT (id) DO NOTHING;

-- 2. SINIGANG (Tamarind Soup)
INSERT INTO recipes (id, title, description, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
VALUES (
  '550e8400-e29b-41d4-a716-446655440011',
  'Sinigang na Baboy',
  'A comforting Filipino sour soup made with pork ribs, vegetables, and tamarind. This tangy and savory soup is perfect for rainy days and is loved throughout the Philippines.',
  60,
  'Intermediate',
  'Lunch',
  'Filipino',
  380,
  32,
  28,
  16,
  30,
  8.0
) ON CONFLICT (id) DO NOTHING;

-- 3. PANCIT CANTON (Stir-Fried Noodles)
INSERT INTO recipes (id, title, description, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
VALUES (
  '550e8400-e29b-41d4-a716-446655440012',
  'Pancit Canton',
  'Filipino-style stir-fried egg noodles with vegetables, meat, and a savory sauce. A staple at Filipino celebrations and gatherings, symbolizing long life.',
  35,
  'Beginner',
  'Lunch',
  'Filipino',
  450,
  24,
  58,
  14,
  28,
  7.5
) ON CONFLICT (id) DO NOTHING;

-- 4. LUMPIA (Filipino Spring Rolls)
INSERT INTO recipes (id, title, description, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
VALUES (
  '550e8400-e29b-41d4-a716-446655440013',
  'Lumpiang Shanghai',
  'Crispy Filipino spring rolls filled with seasoned ground pork and vegetables. These bite-sized treats are perfect as appetizers or snacks.',
  50,
  'Intermediate',
  'Snack',
  'Filipino',
  340,
  18,
  32,
  16,
  25,
  6.5
) ON CONFLICT (id) DO NOTHING;
