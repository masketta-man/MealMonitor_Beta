/*
  # Add Asian Recipes - Part 2

  This migration adds more Asian recipes:
  - Tom Yum Soup (Thai)
  - Ramen Bowl (Japanese)
  - Bibimbap (Korean)

  ## Security
  - No RLS changes needed (inherits from existing policies)
*/

-- TOM YUM SOUP (Thai Hot & Sour Soup)
INSERT INTO recipes (id, title, description, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
VALUES (
  '550e8400-e29b-41d4-a716-446655440025',
  'Tom Yum Goong',
  'Iconic Thai hot and sour soup with shrimp, mushrooms, and aromatic herbs. A perfect balance of spicy, sour, and savory flavors.',
  30,
  'Intermediate',
  'Lunch',
  'Thai',
  220,
  26,
  14,
  6,
  25,
  9.2
) ON CONFLICT (id) DO NOTHING;

-- RAMEN BOWL (Japanese)
INSERT INTO recipes (id, title, description, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
VALUES (
  '550e8400-e29b-41d4-a716-446655440026',
  'Shoyu Ramen',
  'Japanese ramen in a flavorful soy sauce-based broth with tender pork, soft-boiled egg, and fresh toppings. Comfort in a bowl.',
  90,
  'Advanced',
  'Dinner',
  'Japanese',
  580,
  38,
  68,
  16,
  40,
  8.0
) ON CONFLICT (id) DO NOTHING;

-- BIBIMBAP (Korean Mixed Rice Bowl)
INSERT INTO recipes (id, title, description, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
VALUES (
  '550e8400-e29b-41d4-a716-446655440027',
  'Bibimbap',
  'Korean mixed rice bowl topped with seasoned vegetables, beef, fried egg, and gochujang sauce. A colorful and nutritious meal.',
  40,
  'Intermediate',
  'Lunch',
  'Korean',
  520,
  32,
  66,
  14,
  35,
  8.8
) ON CONFLICT (id) DO NOTHING;

-- Tom Yum Ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
SELECT 
  '550e8400-e29b-41d4-a716-446655440025',
  id,
  amount
FROM (VALUES
  ((SELECT id FROM ingredients WHERE name = 'Shrimp'), '400g, peeled and deveined'),
  ((SELECT id FROM ingredients WHERE name = 'Shiitake mushrooms'), '200g, sliced'),
  ((SELECT id FROM ingredients WHERE name = 'Lemongrass'), '3 stalks, bruised and cut'),
  ((SELECT id FROM ingredients WHERE name = 'Galangal'), '4 slices'),
  ((SELECT id FROM ingredients WHERE name = 'Kaffir lime leaves'), '6 leaves'),
  ((SELECT id FROM ingredients WHERE name = 'Thai chilies'), '3-5 pieces'),
  ((SELECT id FROM ingredients WHERE name = 'Lime'), '3 limes, juiced'),
  ((SELECT id FROM ingredients WHERE name = 'Fish sauce'), '3 tablespoons'),
  ((SELECT id FROM ingredients WHERE name = 'Tomatoes'), '2 medium, quartered'),
  ((SELECT id FROM ingredients WHERE name = 'Onions'), '1 small, sliced'),
  ((SELECT id FROM ingredients WHERE name = 'Cilantro'), 'For garnish'),
  ((SELECT id FROM ingredients WHERE name = 'Thai chili paste'), '2 tablespoons (Nam Prik Pao)')
) AS t(id, amount)
WHERE id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Tom Yum Instructions
INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes) VALUES
  ('550e8400-e29b-41d4-a716-446655440025', 1, 'In a pot, bring 6 cups of water to a boil.', 5),
  ('550e8400-e29b-41d4-a716-446655440025', 2, 'Add lemongrass, galangal, and kaffir lime leaves. Simmer for 10 minutes to infuse flavors.', 10),
  ('550e8400-e29b-41d4-a716-446655440025', 3, 'Add Thai chili paste and stir well.', NULL),
  ('550e8400-e29b-41d4-a716-446655440025', 4, 'Add mushrooms, tomatoes, and onions. Cook for 3 minutes.', 3),
  ('550e8400-e29b-41d4-a716-446655440025', 5, 'Add shrimp and cook until they turn pink, about 3 minutes.', 3),
  ('550e8400-e29b-41d4-a716-446655440025', 6, 'Turn off heat. Add fish sauce, lime juice, and Thai chilies. Taste and adjust seasoning.', NULL),
  ('550e8400-e29b-41d4-a716-446655440025', 7, 'Garnish with fresh cilantro. Serve hot.', NULL)
ON CONFLICT DO NOTHING;

-- Ramen Ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
SELECT 
  '550e8400-e29b-41d4-a716-446655440026',
  id,
  amount
FROM (VALUES
  ((SELECT id FROM ingredients WHERE name = 'Pork belly'), '400g'),
  ((SELECT id FROM ingredients WHERE name = 'Ramen noodles'), '4 portions fresh ramen'),
  ((SELECT id FROM ingredients WHERE name = 'Eggs'), '4 eggs'),
  ((SELECT id FROM ingredients WHERE name = 'Soy sauce'), '1/2 cup'),
  ((SELECT id FROM ingredients WHERE name = 'Miso paste'), '2 tablespoons'),
  ((SELECT id FROM ingredients WHERE name = 'Ginger'), '2-inch piece, sliced'),
  ((SELECT id FROM ingredients WHERE name = 'Garlic'), '6 cloves, crushed'),
  ((SELECT id FROM ingredients WHERE name = 'Green onions'), '4 stalks, sliced'),
  ((SELECT id FROM ingredients WHERE name = 'Nori'), '4 sheets'),
  ((SELECT id FROM ingredients WHERE name = 'Sesame oil'), '2 tablespoons'),
  ((SELECT id FROM ingredients WHERE name = 'Bean sprouts'), '1 cup'),
  ((SELECT id FROM ingredients WHERE name = 'Corn'), '1 cup')
) AS t(id, amount)
WHERE id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Ramen Instructions
INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes) VALUES
  ('550e8400-e29b-41d4-a716-446655440026', 1, 'Prepare soft-boiled eggs: Boil eggs for 6-7 minutes, then transfer to ice water. Peel and marinate in soy sauce mixture.', 7),
  ('550e8400-e29b-41d4-a716-446655440026', 2, 'For the broth: In a large pot, add 8 cups water, ginger, garlic, and pork belly. Simmer for 45 minutes.', 45),
  ('550e8400-e29b-41d4-a716-446655440026', 3, 'Remove pork belly and slice thinly. Set aside.', NULL),
  ('550e8400-e29b-41d4-a716-446655440026', 4, 'Strain the broth. Add soy sauce, miso paste, and sesame oil. Mix well and keep warm.', NULL),
  ('550e8400-e29b-41d4-a716-446655440026', 5, 'Cook ramen noodles according to package instructions. Drain.', 3),
  ('550e8400-e29b-41d4-a716-446655440026', 6, 'Divide noodles among 4 bowls. Ladle hot broth over noodles.', NULL),
  ('550e8400-e29b-41d4-a716-446655440026', 7, 'Top each bowl with sliced pork belly, halved soft-boiled egg, green onions, nori, bean sprouts, and corn.', NULL),
  ('550e8400-e29b-41d4-a716-446655440026', 8, 'Serve immediately while hot.', NULL)
ON CONFLICT DO NOTHING;

-- Bibimbap Ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
SELECT 
  '550e8400-e29b-41d4-a716-446655440027',
  id,
  amount
FROM (VALUES
  ((SELECT id FROM ingredients WHERE name = 'Rice'), '4 cups cooked short-grain rice'),
  ((SELECT id FROM ingredients WHERE name = 'Beef sirloin'), '300g, thinly sliced'),
  ((SELECT id FROM ingredients WHERE name = 'Eggs'), '4 eggs'),
  ((SELECT id FROM ingredients WHERE name = 'Spinach'), '2 cups'),
  ((SELECT id FROM ingredients WHERE name = 'Bean sprouts'), '2 cups'),
  ((SELECT id FROM ingredients WHERE name = 'Carrots'), '1 cup, julienned'),
  ((SELECT id FROM ingredients WHERE name = 'Shiitake mushrooms'), '1 cup, sliced'),
  ((SELECT id FROM ingredients WHERE name = 'Cucumber'), '1, julienned'),
  ((SELECT id FROM ingredients WHERE name = 'Gochujang'), '4 tablespoons'),
  ((SELECT id FROM ingredients WHERE name = 'Sesame oil'), '3 tablespoons'),
  ((SELECT id FROM ingredients WHERE name = 'Soy sauce'), '2 tablespoons'),
  ((SELECT id FROM ingredients WHERE name = 'Garlic'), '4 cloves, minced'),
  ((SELECT id FROM ingredients WHERE name = 'Sesame seeds'), '2 tablespoons'),
  ((SELECT id FROM ingredients WHERE name = 'Vegetable oil'), '4 tablespoons')
) AS t(id, amount)
WHERE id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Bibimbap Instructions
INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes) VALUES
  ('550e8400-e29b-41d4-a716-446655440027', 1, 'Marinate beef with 1 tablespoon soy sauce, 1 tablespoon sesame oil, and half the garlic for 15 minutes.', NULL),
  ('550e8400-e29b-41d4-a716-446655440027', 2, 'Blanch spinach for 30 seconds, drain, and season with sesame oil and salt.', NULL),
  ('550e8400-e29b-41d4-a716-446655440027', 3, 'Blanch bean sprouts for 1 minute, drain, and season with sesame oil and salt.', 1),
  ('550e8400-e29b-41d4-a716-446655440027', 4, 'Sauté carrots with a little oil for 2 minutes until softened. Season with salt.', 2),
  ('550e8400-e29b-41d4-a716-446655440027', 5, 'Sauté mushrooms with remaining garlic until tender, about 3 minutes.', 3),
  ('550e8400-e29b-41d4-a716-446655440027', 6, 'Cook marinated beef in a hot pan until browned, about 3 minutes.', 3),
  ('550e8400-e29b-41d4-a716-446655440027', 7, 'Fry 4 eggs sunny-side up or over-easy.', 3),
  ('550e8400-e29b-41d4-a716-446655440027', 8, 'To assemble: Divide rice among 4 bowls. Arrange vegetables and beef in sections on top of the rice.', NULL),
  ('550e8400-e29b-41d4-a716-446655440027', 9, 'Place a fried egg on top of each bowl. Add 1 tablespoon gochujang and sprinkle with sesame seeds.', NULL),
  ('550e8400-e29b-41d4-a716-446655440027', 10, 'Mix everything together before eating. Serve hot.', NULL)
ON CONFLICT DO NOTHING;
