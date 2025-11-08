/*
  # Add Asian Recipes - Part 1

  This migration adds diverse Asian recipes from different cuisines:
  - Pad Thai (Thai)
  - Chicken Teriyaki (Japanese)
  - Korean Beef Bulgogi (Korean)
  - Vietnamese Pho (Vietnamese)
  - Mapo Tofu (Chinese)

  ## Security
  - No RLS changes needed (inherits from existing policies)
*/

-- 1. PAD THAI (Thai Stir-Fried Noodles)
INSERT INTO recipes (id, title, description, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
VALUES (
  '550e8400-e29b-41d4-a716-446655440020',
  'Pad Thai',
  'Classic Thai stir-fried rice noodles with shrimp, tofu, egg, and a sweet-tangy tamarind sauce. Garnished with peanuts and lime.',
  30,
  'Intermediate',
  'Dinner',
  'Thai',
  520,
  28,
  64,
  18,
  35,
  7.8
) ON CONFLICT (id) DO NOTHING;

-- 2. CHICKEN TERIYAKI (Japanese)
INSERT INTO recipes (id, title, description, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
VALUES (
  '550e8400-e29b-41d4-a716-446655440021',
  'Chicken Teriyaki',
  'Tender chicken glazed with a sweet and savory teriyaki sauce. A Japanese favorite that is simple yet delicious.',
  25,
  'Beginner',
  'Dinner',
  'Japanese',
  380,
  42,
  28,
  10,
  32,
  8.5
) ON CONFLICT (id) DO NOTHING;

-- 3. KOREAN BEEF BULGOGI
INSERT INTO recipes (id, title, description, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
VALUES (
  '550e8400-e29b-41d4-a716-446655440022',
  'Beef Bulgogi',
  'Korean marinated beef - tender, slightly sweet, and savory. Grilled or pan-fried to perfection with vegetables.',
  35,
  'Intermediate',
  'Dinner',
  'Korean',
  440,
  36,
  20,
  24,
  35,
  8.2
) ON CONFLICT (id) DO NOTHING;

-- 4. VIETNAMESE PHO (Beef Noodle Soup)
INSERT INTO recipes (id, title, description, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
VALUES (
  '550e8400-e29b-41d4-a716-446655440023',
  'Pho Bo',
  'Traditional Vietnamese beef noodle soup with aromatic broth, rice noodles, and fresh herbs. A comforting and flavorful bowl.',
  120,
  'Advanced',
  'Lunch',
  'Vietnamese',
  450,
  32,
  52,
  12,
  38,
  8.8
) ON CONFLICT (id) DO NOTHING;

-- 5. MAPO TOFU (Chinese)
INSERT INTO recipes (id, title, description, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
VALUES (
  '550e8400-e29b-41d4-a716-446655440024',
  'Mapo Tofu',
  'Spicy Sichuan dish with silky tofu and ground pork in a fiery, numbing sauce. A beloved Chinese classic.',
  25,
  'Intermediate',
  'Dinner',
  'Chinese',
  340,
  24,
  16,
  22,
  28,
  7.5
) ON CONFLICT (id) DO NOTHING;
