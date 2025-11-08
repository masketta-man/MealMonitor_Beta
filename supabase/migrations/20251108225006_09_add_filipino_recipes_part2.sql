/*
  # Add Filipino Recipes - Part 2

  This migration adds more authentic Filipino recipes:
  - Kare-Kare (Peanut Stew)
  - Sisig (Sizzling Pork)
  - Tinola (Ginger Chicken Soup)
  - Lechon Kawali (Crispy Pork Belly)

  ## Security
  - No RLS changes needed (inherits from existing policies)
*/

-- 5. KARE-KARE (Filipino Peanut Stew)
INSERT INTO recipes (id, title, description, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
VALUES (
  '550e8400-e29b-41d4-a716-446655440014',
  'Kare-Kare',
  'A rich Filipino peanut-based stew with oxtail, tripe, and vegetables. Traditionally served with bagoong (shrimp paste) on the side.',
  120,
  'Advanced',
  'Dinner',
  'Filipino',
  520,
  42,
  26,
  32,
  40,
  7.8
) ON CONFLICT (id) DO NOTHING;

-- 6. SISIG (Sizzling Pork)
INSERT INTO recipes (id, title, description, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
VALUES (
  '550e8400-e29b-41d4-a716-446655440015',
  'Pork Sisig',
  'A Filipino favorite - crispy, tangy, and spicy chopped pork served on a sizzling plate. Perfect with beer and as a pulutan (appetizer).',
  50,
  'Intermediate',
  'Dinner',
  'Filipino',
  480,
  32,
  8,
  36,
  35,
  6.8
) ON CONFLICT (id) DO NOTHING;

-- 7. TINOLA (Ginger Chicken Soup)
INSERT INTO recipes (id, title, description, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
VALUES (
  '550e8400-e29b-41d4-a716-446655440016',
  'Chicken Tinola',
  'A light and comforting Filipino ginger chicken soup with green papaya and chili leaves. Perfect for cold days or when feeling under the weather.',
  40,
  'Beginner',
  'Lunch',
  'Filipino',
  280,
  34,
  18,
  8,
  25,
  8.8
) ON CONFLICT (id) DO NOTHING;

-- 8. LECHON KAWALI (Crispy Pork Belly)
INSERT INTO recipes (id, title, description, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
VALUES (
  '550e8400-e29b-41d4-a716-446655440017',
  'Lechon Kawali',
  'Filipino-style crispy deep-fried pork belly. Boiled until tender then deep-fried to achieve an ultra-crispy skin with juicy meat.',
  90,
  'Intermediate',
  'Dinner',
  'Filipino',
  620,
  36,
  4,
  50,
  38,
  5.5
) ON CONFLICT (id) DO NOTHING;

-- Kare-Kare Ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
SELECT 
  '550e8400-e29b-41d4-a716-446655440014',
  id,
  amount
FROM (VALUES
  ((SELECT id FROM ingredients WHERE name = 'Beef short ribs'), '1 kg, cut into serving pieces'),
  ((SELECT id FROM ingredients WHERE name = 'Beef tripe'), '300g, cleaned and cut'),
  ((SELECT id FROM ingredients WHERE name = 'Onions'), '1 large, quartered'),
  ((SELECT id FROM ingredients WHERE name = 'Eggplant'), '2 medium, sliced'),
  ((SELECT id FROM ingredients WHERE name = 'Long beans'), '1 bundle, cut into 2-inch pieces'),
  ((SELECT id FROM ingredients WHERE name = 'Bok choy'), '1 bundle'),
  ((SELECT id FROM ingredients WHERE name = 'Peanut butter'), '1 cup'),
  ((SELECT id FROM ingredients WHERE name = 'Rice'), '1/2 cup ground toasted rice'),
  ((SELECT id FROM ingredients WHERE name = 'Shrimp paste'), 'For serving'),
  ((SELECT id FROM ingredients WHERE name = 'Annatto seeds'), '2 tablespoons'),
  ((SELECT id FROM ingredients WHERE name = 'Garlic'), '6 cloves, minced'),
  ((SELECT id FROM ingredients WHERE name = 'Salt'), 'To taste')
) AS t(id, amount)
WHERE id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Kare-Kare Instructions
INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes) VALUES
  ('550e8400-e29b-41d4-a716-446655440014', 1, 'In a large pot, boil beef short ribs and tripe in 8 cups of water with onions. Skim off scum. Cook until meat is tender, about 1.5 hours.', 90),
  ('550e8400-e29b-41d4-a716-446655440014', 2, 'Meanwhile, soak annatto seeds in 1/2 cup warm water. Extract color by squeezing seeds, then discard seeds.', NULL),
  ('550e8400-e29b-41d4-a716-446655440014', 3, 'In a separate pan, toast ground rice until lightly browned and fragrant.', 3),
  ('550e8400-e29b-41d4-a716-446655440014', 4, 'Remove meat from broth. Reserve 4 cups of broth.', NULL),
  ('550e8400-e29b-41d4-a716-446655440014', 5, 'In the same pot, sauté garlic. Add the annatto water and reserved broth.', 2),
  ('550e8400-e29b-41d4-a716-446655440014', 6, 'Stir in peanut butter and toasted rice. Mix well until smooth. Simmer for 10 minutes, stirring frequently.', 10),
  ('550e8400-e29b-41d4-a716-446655440014', 7, 'Add meat back to the pot. Add eggplant and long beans. Cook for 5 minutes.', 5),
  ('550e8400-e29b-41d4-a716-446655440014', 8, 'Add bok choy and cook for 2 more minutes. Season with salt.', 2),
  ('550e8400-e29b-41d4-a716-446655440014', 9, 'Serve hot with rice and bagoong (shrimp paste) on the side.', NULL)
ON CONFLICT DO NOTHING;

-- Sisig Ingredients  
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
SELECT 
  '550e8400-e29b-41d4-a716-446655440015',
  id,
  amount
FROM (VALUES
  ((SELECT id FROM ingredients WHERE name = 'Pork belly'), '500g'),
  ((SELECT id FROM ingredients WHERE name = 'Pork liver'), '100g'),
  ((SELECT id FROM ingredients WHERE name = 'Onions'), '2 medium, chopped'),
  ((SELECT id FROM ingredients WHERE name = 'Thai chilies'), '3-4 pieces, chopped'),
  ((SELECT id FROM ingredients WHERE name = 'Calamansi'), '4-5 pieces (or 2 limes)'),
  ((SELECT id FROM ingredients WHERE name = 'Soy sauce'), '3 tablespoons'),
  ((SELECT id FROM ingredients WHERE name = 'Eggs'), '2 eggs'),
  ((SELECT id FROM ingredients WHERE name = 'Garlic'), '6 cloves, minced'),
  ((SELECT id FROM ingredients WHERE name = 'Bay leaves'), '2 leaves'),
  ((SELECT id FROM ingredients WHERE name = 'Black pepper'), '1 teaspoon'),
  ((SELECT id FROM ingredients WHERE name = 'Salt'), 'To taste')
) AS t(id, amount)
WHERE id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Sisig Instructions
INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes) VALUES
  ('550e8400-e29b-41d4-a716-446655440015', 1, 'Boil pork belly with bay leaves in water for 30 minutes until tender. Let cool, then chop into small pieces.', 30),
  ('550e8400-e29b-41d4-a716-446655440015', 2, 'Grill chopped pork belly until crispy and charred, about 10 minutes. Chop into finer pieces.', 10),
  ('550e8400-e29b-41d4-a716-446655440015', 3, 'Boil pork liver for 5 minutes, then chop finely.', 5),
  ('550e8400-e29b-41d4-a716-446655440015', 4, 'In a large pan or sizzling plate, sauté garlic and onions until fragrant.', 2),
  ('550e8400-e29b-41d4-a716-446655440015', 5, 'Add the crispy pork and liver. Mix well.', NULL),
  ('550e8400-e29b-41d4-a716-446655440015', 6, 'Add soy sauce, calamansi juice, chilies, and black pepper. Stir-fry for 3-4 minutes.', 4),
  ('550e8400-e29b-41d4-a716-446655440015', 7, 'Transfer to a sizzling plate. Top with a raw egg (optional).', NULL),
  ('550e8400-e29b-41d4-a716-446655440015', 8, 'Serve immediately while sizzling. Mix the egg into the sisig before eating.', NULL)
ON CONFLICT DO NOTHING;

-- Tinola Ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
SELECT 
  '550e8400-e29b-41d4-a716-446655440016',
  id,
  amount
FROM (VALUES
  ((SELECT id FROM ingredients WHERE name = 'Chicken thighs'), '800g, cut into pieces'),
  ((SELECT id FROM ingredients WHERE name = 'Ginger'), '2-inch piece, sliced'),
  ((SELECT id FROM ingredients WHERE name = 'Garlic'), '4 cloves, crushed'),
  ((SELECT id FROM ingredients WHERE name = 'Onions'), '1 medium, sliced'),
  ((SELECT id FROM ingredients WHERE name = 'Green papaya'), '2 cups, sliced (or chayote)'),
  ((SELECT id FROM ingredients WHERE name = 'Water spinach'), '2 cups'),
  ((SELECT id FROM ingredients WHERE name = 'Fish sauce'), '3 tablespoons'),
  ((SELECT id FROM ingredients WHERE name = 'Thai chilies'), '2-3 pieces'),
  ((SELECT id FROM ingredients WHERE name = 'Vegetable oil'), '2 tablespoons')
) AS t(id, amount)
WHERE id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Tinola Instructions
INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes) VALUES
  ('550e8400-e29b-41d4-a716-446655440016', 1, 'Heat oil in a pot. Sauté ginger, garlic, and onions until fragrant, about 2 minutes.', 2),
  ('550e8400-e29b-41d4-a716-446655440016', 2, 'Add chicken pieces and cook until lightly browned, about 5 minutes.', 5),
  ('550e8400-e29b-41d4-a716-446655440016', 3, 'Add fish sauce and stir for 1 minute.', 1),
  ('550e8400-e29b-41d4-a716-446655440016', 4, 'Pour in 6 cups of water. Bring to a boil, then reduce heat and simmer for 20 minutes until chicken is cooked through.', 20),
  ('550e8400-e29b-41d4-a716-446655440016', 5, 'Add green papaya and Thai chilies. Cook for 5 minutes until papaya is tender.', 5),
  ('550e8400-e29b-41d4-a716-446655440016', 6, 'Add water spinach and cook for 2 more minutes until wilted.', 2),
  ('550e8400-e29b-41d4-a716-446655440016', 7, 'Adjust seasoning with more fish sauce if needed. Serve hot with rice.', NULL)
ON CONFLICT DO NOTHING;

-- Lechon Kawali Ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
SELECT 
  '550e8400-e29b-41d4-a716-446655440017',
  id,
  amount
FROM (VALUES
  ((SELECT id FROM ingredients WHERE name = 'Pork belly'), '1 kg, skin on'),
  ((SELECT id FROM ingredients WHERE name = 'Bay leaves'), '3 leaves'),
  ((SELECT id FROM ingredients WHERE name = 'Black peppercorns'), '1 tablespoon'),
  ((SELECT id FROM ingredients WHERE name = 'Garlic'), '1 head, crushed'),
  ((SELECT id FROM ingredients WHERE name = 'Salt'), '2 tablespoons'),
  ((SELECT id FROM ingredients WHERE name = 'Vegetable oil'), 'For deep frying')
) AS t(id, amount)
WHERE id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Lechon Kawali Instructions
INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes) VALUES
  ('550e8400-e29b-41d4-a716-446655440017', 1, 'Rub pork belly all over with 1 tablespoon salt. Let sit for 30 minutes.', NULL),
  ('550e8400-e29b-41d4-a716-446655440017', 2, 'In a large pot, add pork belly, remaining salt, bay leaves, peppercorns, and garlic. Cover with water.', NULL),
  ('550e8400-e29b-41d4-a716-446655440017', 3, 'Bring to a boil, then reduce heat and simmer for 45-50 minutes until pork is tender.', 50),
  ('550e8400-e29b-41d4-a716-446655440017', 4, 'Remove pork from water and pat completely dry with paper towels. Let air-dry for 30 minutes or refrigerate for 2 hours for extra crispiness.', NULL),
  ('550e8400-e29b-41d4-a716-446655440017', 5, 'Heat a large amount of oil (about 2-3 inches deep) in a wok or deep pan to 350°F (175°C).', 5),
  ('550e8400-e29b-41d4-a716-446655440017', 6, 'Carefully lower the pork belly into the hot oil, skin side down. Be careful of splatter.', NULL),
  ('550e8400-e29b-41d4-a716-446655440017', 7, 'Fry for 10-15 minutes per side until skin is golden brown and crispy. Use a splatter screen if available.', 25),
  ('550e8400-e29b-41d4-a716-446655440017', 8, 'Remove and drain on paper towels for 5 minutes.', 5),
  ('550e8400-e29b-41d4-a716-446655440017', 9, 'Cut into serving pieces. Serve with liver sauce or spiced vinegar dipping sauce.', NULL)
ON CONFLICT DO NOTHING;
