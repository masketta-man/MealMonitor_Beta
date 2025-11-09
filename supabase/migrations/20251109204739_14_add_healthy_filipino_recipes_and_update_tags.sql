/*
  # Add Healthy Filipino Recipes and Update Recipe Tags

  ## Summary
  This migration expands the recipe database with new healthy Filipino recipes and updates tags for all existing recipes to improve categorization and searchability.

  ## Changes Made

  ### 1. New Healthy Filipino Recipes Added:
  - **Pinakbet** (Vegetable Stew) - Vegetarian, healthy Filipino classic
  - **Grilled Bangus** (Milkfish) - High-protein, omega-3 rich
  - **Ginataang Gulay** (Vegetables in Coconut Milk) - Vegan option
  - **Ensaladang Talong** (Eggplant Salad) - Low-calorie side dish
  - **Nilagang Baka** (Beef Soup) - Nutritious comfort food
  - **Steamed Lapu-Lapu** (Grouper) - Low-fat, high-protein
  - **Ginisang Monggo** (Mung Bean Stew) - High-fiber, plant-based protein
  - **Inihaw na Liempo** (Grilled Pork Belly) - Filipino BBQ favorite
  - **Chicken Inasal** - Grilled chicken with Filipino spices
  - **Ukoy** (Shrimp Fritters) - Traditional Filipino snack

  ### 2. Tag Updates for Existing Recipes:
  - Added cuisine type tags (Filipino, Thai, Korean, Japanese, etc.)
  - Added dietary tags (High-Protein, Low-Carb, Vegetarian, Vegan, Healthy, etc.)
  - All tags use standardized capitalization (title case with hyphens)
  - Tags are categorized as 'dietary', 'cuisine', or 'other'

  ## Security
  - Uses existing RLS policies on recipes and recipe_tags tables
  - All inserts use proper UUID generation
  - No changes to security policies required
*/

-- =============================================
-- INSERT NEW HEALTHY FILIPINO RECIPES
-- =============================================

-- Recipe 1: Pinakbet (Vegetable Stew)
DO $$
DECLARE
  recipe_uuid uuid := '550e8400-e29b-41d4-a716-446655440028';
  tomato_id uuid;
  eggplant_id uuid;
  garlic_id uuid;
  onion_id uuid;
BEGIN
  -- Check if recipe already exists
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    -- Insert recipe
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Pinakbet',
      'A healthy Filipino vegetable stew with eggplant, squash, okra, and string beans in a savory shrimp paste sauce. Packed with vitamins and fiber.',
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=500',
      30,
      'Intermediate',
      'Lunch',
      'Filipino',
      180,
      8,
      25,
      6,
      70,
      9.0
    );

    -- Get ingredient IDs
    SELECT id INTO tomato_id FROM ingredients WHERE name = 'Tomato' LIMIT 1;
    SELECT id INTO eggplant_id FROM ingredients WHERE name = 'Eggplant' LIMIT 1;
    SELECT id INTO garlic_id FROM ingredients WHERE name = 'Garlic' LIMIT 1;
    SELECT id INTO onion_id FROM ingredients WHERE name = 'Onion' LIMIT 1;

    -- Add ingredients if they exist
    IF tomato_id IS NOT NULL THEN
      INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) VALUES (recipe_uuid, tomato_id, '2 medium');
    END IF;
    IF eggplant_id IS NOT NULL THEN
      INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) VALUES (recipe_uuid, eggplant_id, '2 pieces');
    END IF;
    IF garlic_id IS NOT NULL THEN
      INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) VALUES (recipe_uuid, garlic_id, '4 cloves');
    END IF;
    IF onion_id IS NOT NULL THEN
      INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) VALUES (recipe_uuid, onion_id, '1 medium');
    END IF;

    -- Add instructions
    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'Sauté garlic and onion in a large pan until fragrant.', 3),
      (recipe_uuid, 2, 'Add tomatoes and cook until softened.', 5),
      (recipe_uuid, 3, 'Add squash and cook for 5 minutes.', 5),
      (recipe_uuid, 4, 'Add eggplant, okra, and string beans. Add shrimp paste and water.', 2),
      (recipe_uuid, 5, 'Cover and simmer until vegetables are tender.', 10),
      (recipe_uuid, 6, 'Season with salt and pepper. Serve hot with rice.', 0);

    -- Add tags
    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'Filipino', 'cuisine'),
      (recipe_uuid, 'Vegetarian', 'dietary'),
      (recipe_uuid, 'High-Fiber', 'dietary'),
      (recipe_uuid, 'Healthy', 'dietary');
  END IF;
END $$;

-- Recipe 2: Grilled Bangus (Milkfish)
DO $$
DECLARE
  recipe_uuid uuid := '550e8400-e29b-41d4-a716-446655440029';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Grilled Bangus',
      'Filipino-style grilled milkfish stuffed with tomatoes and onions. A healthy, omega-3 rich dish that''s perfect for lunch or dinner.',
      'https://images.pexels.com/photos/1854657/pexels-photo-1854657.jpeg?auto=compress&cs=tinysrgb&w=500',
      40,
      'Intermediate',
      'Dinner',
      'Filipino',
      280,
      35,
      3,
      14,
      85,
      9.3
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'Clean and butterfly the milkfish. Marinate with calamansi juice, salt, and pepper for 20 minutes.', 20),
      (recipe_uuid, 2, 'Stuff the fish with sliced tomatoes and onions.', 5),
      (recipe_uuid, 3, 'Wrap fish in banana leaves or aluminum foil.', 3),
      (recipe_uuid, 4, 'Grill over medium heat for 15-20 minutes per side.', 35),
      (recipe_uuid, 5, 'Serve with soy sauce and calamansi dipping sauce.', 0);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'Filipino', 'cuisine'),
      (recipe_uuid, 'High-Protein', 'dietary'),
      (recipe_uuid, 'Omega-3', 'dietary'),
      (recipe_uuid, 'Low-Carb', 'dietary');
  END IF;
END $$;

-- Recipe 3: Ginataang Gulay (Vegetables in Coconut Milk)
DO $$
DECLARE
  recipe_uuid uuid := '550e8400-e29b-41d4-a716-446655440030';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Ginataang Gulay',
      'A creamy vegetable dish cooked in coconut milk with squash, string beans, and leafy greens. Vegan-friendly and full of flavor.',
      'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=500',
      25,
      'Beginner',
      'Lunch',
      'Filipino',
      220,
      6,
      20,
      15,
      65,
      8.5
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'Sauté garlic, onion, and ginger in oil until fragrant.', 3),
      (recipe_uuid, 2, 'Add squash and cook for 5 minutes.', 5),
      (recipe_uuid, 3, 'Pour in coconut milk and bring to a boil.', 5),
      (recipe_uuid, 4, 'Add string beans and simmer until vegetables are tender.', 8),
      (recipe_uuid, 5, 'Add leafy greens and cook for 2 more minutes.', 2),
      (recipe_uuid, 6, 'Season with salt and pepper. Serve with rice.', 0);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'Filipino', 'cuisine'),
      (recipe_uuid, 'Vegan', 'dietary'),
      (recipe_uuid, 'Vegetarian', 'dietary'),
      (recipe_uuid, 'Healthy', 'dietary');
  END IF;
END $$;

-- Recipe 4: Ensaladang Talong (Eggplant Salad)
DO $$
DECLARE
  recipe_uuid uuid := '550e8400-e29b-41d4-a716-446655440031';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Ensaladang Talong',
      'A refreshing Filipino eggplant salad with tomatoes and onions in a tangy vinegar dressing. Low-calorie and perfect as a side dish.',
      'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=500',
      15,
      'Beginner',
      'Lunch',
      'Filipino',
      80,
      3,
      12,
      2,
      45,
      8.8
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'Grill or roast eggplants until skin is charred and flesh is soft.', 15),
      (recipe_uuid, 2, 'Peel off the skin and mash the eggplant flesh lightly.', 3),
      (recipe_uuid, 3, 'Add diced tomatoes, onions, and salted eggs if desired.', 2),
      (recipe_uuid, 4, 'Mix with vinegar, fish sauce, and a pinch of salt.', 1),
      (recipe_uuid, 5, 'Chill before serving for best flavor.', 0);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'Filipino', 'cuisine'),
      (recipe_uuid, 'Vegetarian', 'dietary'),
      (recipe_uuid, 'Low-Calorie', 'dietary'),
      (recipe_uuid, 'Healthy', 'dietary');
  END IF;
END $$;

-- Recipe 5: Nilagang Baka (Beef Soup)
DO $$
DECLARE
  recipe_uuid uuid := '550e8400-e29b-41d4-a716-446655440032';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Nilagang Baka',
      'A comforting Filipino beef soup with vegetables. Nutritious and perfect for cold days or when you need a hearty meal.',
      'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=500',
      90,
      'Intermediate',
      'Dinner',
      'Filipino',
      350,
      28,
      30,
      12,
      80,
      8.2
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'Boil beef shank in water with onions and peppercorns for 1.5 hours or until tender.', 90),
      (recipe_uuid, 2, 'Skim off any foam that rises to the surface.', 0),
      (recipe_uuid, 3, 'Add potatoes, cabbage, and corn. Cook until vegetables are tender.', 15),
      (recipe_uuid, 4, 'Add bok choy or pechay and cook for 2 more minutes.', 2),
      (recipe_uuid, 5, 'Season with salt and fish sauce. Serve hot with rice and fish sauce on the side.', 0);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'Filipino', 'cuisine'),
      (recipe_uuid, 'High-Protein', 'dietary');
  END IF;
END $$;

-- Recipe 6: Steamed Lapu-Lapu (Grouper)
DO $$
DECLARE
  recipe_uuid uuid := '550e8400-e29b-41d4-a716-446655440033';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Steamed Lapu-Lapu',
      'Chinese-Filipino style steamed grouper with ginger, soy sauce, and sesame oil. Low-fat, high-protein, and incredibly flavorful.',
      'https://images.pexels.com/photos/262959/pexels-photo-262959.jpeg?auto=compress&cs=tinysrgb&w=500',
      30,
      'Intermediate',
      'Dinner',
      'Filipino',
      210,
      38,
      2,
      6,
      90,
      9.5
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'Clean the grouper and make diagonal cuts on both sides.', 5),
      (recipe_uuid, 2, 'Season fish with salt, pepper, and place ginger slices inside and on top.', 3),
      (recipe_uuid, 3, 'Steam fish over boiling water for 15-20 minutes or until cooked through.', 20),
      (recipe_uuid, 4, 'Heat oil in a small pan and add minced garlic until fragrant.', 2),
      (recipe_uuid, 5, 'Pour hot oil over the steamed fish. Drizzle with soy sauce and sesame oil.', 1),
      (recipe_uuid, 6, 'Garnish with spring onions and serve immediately.', 0);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'Filipino', 'cuisine'),
      (recipe_uuid, 'High-Protein', 'dietary'),
      (recipe_uuid, 'Low-Fat', 'dietary'),
      (recipe_uuid, 'Low-Carb', 'dietary'),
      (recipe_uuid, 'Healthy', 'dietary');
  END IF;
END $$;

-- Recipe 7: Ginisang Monggo (Mung Bean Stew)
DO $$
DECLARE
  recipe_uuid uuid := '550e8400-e29b-41d4-a716-446655440034';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Ginisang Monggo',
      'Filipino mung bean stew with vegetables and optional pork. High in fiber and plant-based protein, this is a Filipino comfort food staple.',
      'https://images.pexels.com/photos/8477839/pexels-photo-8477839.jpeg?auto=compress&cs=tinysrgb&w=500',
      45,
      'Beginner',
      'Lunch',
      'Filipino',
      240,
      14,
      35,
      5,
      70,
      8.7
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'Boil mung beans in water until soft and tender, about 30 minutes.', 30),
      (recipe_uuid, 2, 'In a separate pan, sauté garlic, onion, and tomatoes.', 5),
      (recipe_uuid, 3, 'Add pork (optional) and cook until browned.', 5),
      (recipe_uuid, 4, 'Add the cooked mung beans with its liquid to the pan.', 2),
      (recipe_uuid, 5, 'Add bitter melon or spinach and simmer for 5 minutes.', 5),
      (recipe_uuid, 6, 'Season with fish sauce and pepper. Serve with rice.', 0);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'Filipino', 'cuisine'),
      (recipe_uuid, 'High-Fiber', 'dietary'),
      (recipe_uuid, 'High-Protein', 'dietary'),
      (recipe_uuid, 'Healthy', 'dietary');
  END IF;
END $$;

-- Recipe 8: Chicken Inasal
DO $$
DECLARE
  recipe_uuid uuid := '550e8400-e29b-41d4-a716-446655440035';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Chicken Inasal',
      'Grilled chicken marinated in calamansi, lemongrass, and annatto. A famous Filipino dish from Bacolod that''s both healthy and flavorful.',
      'https://images.pexels.com/photos/1247755/pexels-photo-1247755.jpeg?auto=compress&cs=tinysrgb&w=500',
      240,
      'Intermediate',
      'Dinner',
      'Filipino',
      310,
      32,
      8,
      16,
      85,
      8.5
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'Combine calamansi juice, vinegar, lemongrass, garlic, ginger, annatto oil, salt, and pepper for marinade.', 10),
      (recipe_uuid, 2, 'Marinate chicken pieces for at least 4 hours or overnight.', 240),
      (recipe_uuid, 3, 'Grill chicken over medium-high heat, basting with remaining marinade.', 20),
      (recipe_uuid, 4, 'Cook until chicken is charred and fully cooked through.', 15),
      (recipe_uuid, 5, 'Serve with rice, chicken oil, and soy-vinegar dipping sauce.', 0);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'Filipino', 'cuisine'),
      (recipe_uuid, 'High-Protein', 'dietary');
  END IF;
END $$;

-- Recipe 9: Inihaw na Liempo (Grilled Pork Belly)
DO $$
DECLARE
  recipe_uuid uuid := '550e8400-e29b-41d4-a716-446655440036';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Inihaw na Liempo',
      'Filipino-style grilled pork belly marinated in a sweet and savory sauce. A popular dish for gatherings and celebrations.',
      'https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg?auto=compress&cs=tinysrgb&w=500',
      180,
      'Beginner',
      'Dinner',
      'Filipino',
      420,
      25,
      12,
      32,
      75,
      6.5
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'Mix soy sauce, calamansi juice, banana ketchup, garlic, pepper, and brown sugar for marinade.', 5),
      (recipe_uuid, 2, 'Marinate pork belly slices for at least 2 hours.', 120),
      (recipe_uuid, 3, 'Grill over medium heat for 8-10 minutes per side.', 20),
      (recipe_uuid, 4, 'Baste with remaining marinade while grilling.', 0),
      (recipe_uuid, 5, 'Serve with rice and spicy vinegar dipping sauce.', 0);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'Filipino', 'cuisine'),
      (recipe_uuid, 'High-Protein', 'dietary');
  END IF;
END $$;

-- Recipe 10: Ukoy (Shrimp Fritters)
DO $$
DECLARE
  recipe_uuid uuid := '550e8400-e29b-41d4-a716-446655440037';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Ukoy',
      'Crispy Filipino shrimp and vegetable fritters. A traditional merienda (snack) that''s crunchy and satisfying.',
      'https://images.pexels.com/photos/566345/pexels-photo-566345.jpeg?auto=compress&cs=tinysrgb&w=500',
      25,
      'Intermediate',
      'Snack',
      'Filipino',
      280,
      12,
      25,
      15,
      60,
      7.2
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'Mix flour, cornstarch, salt, pepper, and water to make a batter.', 5),
      (recipe_uuid, 2, 'Add small shrimp, grated squash or sweet potato, and bean sprouts to batter.', 3),
      (recipe_uuid, 3, 'Heat oil in a pan for deep frying.', 5),
      (recipe_uuid, 4, 'Scoop batter mixture and carefully place in hot oil. Flatten slightly.', 0),
      (recipe_uuid, 5, 'Fry until golden brown and crispy, about 3-4 minutes per side.', 8),
      (recipe_uuid, 6, 'Serve hot with spiced vinegar dipping sauce.', 0);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'Filipino', 'cuisine');
  END IF;
END $$;

-- =============================================
-- UPDATE TAGS FOR EXISTING RECIPES
-- =============================================

-- Helper function to safely insert tags
CREATE OR REPLACE FUNCTION insert_tag_if_not_exists(p_recipe_id uuid, p_tag text, p_tag_type text)
RETURNS void AS $$
BEGIN
  INSERT INTO recipe_tags (recipe_id, tag, tag_type)
  SELECT p_recipe_id, p_tag, p_tag_type
  WHERE NOT EXISTS (
    SELECT 1 FROM recipe_tags 
    WHERE recipe_id = p_recipe_id AND tag = p_tag AND tag_type = p_tag_type
  );
END;
$$ LANGUAGE plpgsql;

-- Update existing recipes with proper tags

-- Lechon Kawali
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440017', 'Filipino', 'cuisine');
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440017', 'High-Protein', 'dietary');

-- Pad Thai
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440020', 'Thai', 'cuisine');
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440020', 'High-Protein', 'dietary');

-- Chicken Teriyaki
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440021', 'Japanese', 'cuisine');
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440021', 'High-Protein', 'dietary');

-- Beef Bulgogi
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440022', 'Korean', 'cuisine');
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440022', 'High-Protein', 'dietary');

-- Pho Bo
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440023', 'Vietnamese', 'cuisine');
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440023', 'High-Protein', 'dietary');

-- Mapo Tofu
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440024', 'Chinese', 'cuisine');
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440024', 'High-Protein', 'dietary');

-- Tom Yum Goong
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440025', 'Thai', 'cuisine');
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440025', 'Low-Calorie', 'dietary');

-- Shoyu Ramen
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440026', 'Japanese', 'cuisine');
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440026', 'High-Protein', 'dietary');

-- Bibimbap
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440027', 'Korean', 'cuisine');
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440027', 'Healthy', 'dietary');

-- Sinigang na Baboy
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440011', 'Filipino', 'cuisine');
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440011', 'High-Protein', 'dietary');

-- Filipino Chicken Adobo
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440010', 'Filipino', 'cuisine');
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440010', 'High-Protein', 'dietary');

-- Pancit Canton
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440012', 'Filipino', 'cuisine');

-- Lumpiang Shanghai
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440013', 'Filipino', 'cuisine');

-- Kare-Kare
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440014', 'Filipino', 'cuisine');
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440014', 'High-Protein', 'dietary');

-- Pork Sisig
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440015', 'Filipino', 'cuisine');
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440015', 'High-Protein', 'dietary');

-- Chicken Tinola
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440016', 'Filipino', 'cuisine');
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440016', 'High-Protein', 'dietary');
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440016', 'Healthy', 'dietary');

-- Add tags to recipes that already had some tags
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440002', 'Healthy', 'dietary');
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440003', 'Healthy', 'dietary');
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440005', 'Healthy', 'dietary');
SELECT insert_tag_if_not_exists('550e8400-e29b-41d4-a716-446655440006', 'Healthy', 'dietary');

-- Clean up helper function
DROP FUNCTION IF EXISTS insert_tag_if_not_exists(uuid, text, text);
