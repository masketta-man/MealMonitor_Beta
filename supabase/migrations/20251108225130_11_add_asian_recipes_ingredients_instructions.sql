/*
  # Asian Recipes - Ingredients and Instructions Part 1

  Adds detailed ingredients and cooking instructions for Asian recipes.

  ## Security
  - No RLS changes needed (inherits from existing policies)
*/

-- =============================================
-- PAD THAI - Ingredients
-- =============================================
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
SELECT 
  '550e8400-e29b-41d4-a716-446655440020',
  id,
  amount
FROM (VALUES
  ((SELECT id FROM ingredients WHERE name = 'Rice noodles'), '200g dried pad thai noodles'),
  ((SELECT id FROM ingredients WHERE name = 'Shrimp'), '200g, peeled and deveined'),
  ((SELECT id FROM ingredients WHERE name = 'Tofu'), '100g, cubed'),
  ((SELECT id FROM ingredients WHERE name = 'Eggs'), '2 eggs'),
  ((SELECT id FROM ingredients WHERE name = 'Bean sprouts'), '1 cup'),
  ((SELECT id FROM ingredients WHERE name = 'Green onions'), '3 stalks, cut into 2-inch pieces'),
  ((SELECT id FROM ingredients WHERE name = 'Garlic'), '3 cloves, minced'),
  ((SELECT id FROM ingredients WHERE name = 'Tamarind paste'), '2 tablespoons'),
  ((SELECT id FROM ingredients WHERE name = 'Fish sauce'), '3 tablespoons'),
  ((SELECT id FROM ingredients WHERE name = 'Palm sugar'), '2 tablespoons'),
  ((SELECT id FROM ingredients WHERE name = 'Lime'), '2 limes, cut into wedges'),
  ((SELECT id FROM ingredients WHERE name = 'Peanuts'), '1/4 cup crushed'),
  ((SELECT id FROM ingredients WHERE name = 'Thai chilies'), '2 pieces, sliced'),
  ((SELECT id FROM ingredients WHERE name = 'Vegetable oil'), '3 tablespoons')
) AS t(id, amount)
WHERE id IS NOT NULL
ON CONFLICT DO NOTHING;

-- PAD THAI - Instructions
INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes) VALUES
  ('550e8400-e29b-41d4-a716-446655440020', 1, 'Soak rice noodles in warm water for 20-30 minutes until pliable. Drain well.', NULL),
  ('550e8400-e29b-41d4-a716-446655440020', 2, 'Mix tamarind paste, fish sauce, and palm sugar in a small bowl. Stir until sugar dissolves.', NULL),
  ('550e8400-e29b-41d4-a716-446655440020', 3, 'Heat 2 tablespoons oil in a wok over high heat. Add tofu and fry until golden, about 3 minutes. Remove and set aside.', 3),
  ('550e8400-e29b-41d4-a716-446655440020', 4, 'Add remaining oil to wok. Cook shrimp until pink, about 2 minutes. Remove and set aside.', 2),
  ('550e8400-e29b-41d4-a716-446655440020', 5, 'Add garlic to the wok and stir-fry for 30 seconds until fragrant.', NULL),
  ('550e8400-e29b-41d4-a716-446655440020', 6, 'Push ingredients to the side. Crack eggs into the wok and scramble until mostly set, about 1 minute.', 1),
  ('550e8400-e29b-41d4-a716-446655440020', 7, 'Add drained noodles and the sauce mixture. Toss everything together for 2-3 minutes until noodles are tender.', 3),
  ('550e8400-e29b-41d4-a716-446655440020', 8, 'Add tofu, shrimp, bean sprouts, and green onions. Toss for 1 minute.', 1),
  ('550e8400-e29b-41d4-a716-446655440020', 9, 'Serve immediately, garnished with crushed peanuts, lime wedges, and Thai chilies.', NULL)
ON CONFLICT DO NOTHING;

-- =============================================
-- CHICKEN TERIYAKI - Ingredients
-- =============================================
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
SELECT 
  '550e8400-e29b-41d4-a716-446655440021',
  id,
  amount
FROM (VALUES
  ((SELECT id FROM ingredients WHERE name = 'Chicken thighs'), '600g, boneless and skinless'),
  ((SELECT id FROM ingredients WHERE name = 'Soy sauce'), '1/4 cup'),
  ((SELECT id FROM ingredients WHERE name = 'Brown sugar'), '2 tablespoons'),
  ((SELECT id FROM ingredients WHERE name = 'Ginger'), '1-inch piece, grated'),
  ((SELECT id FROM ingredients WHERE name = 'Garlic'), '3 cloves, minced'),
  ((SELECT id FROM ingredients WHERE name = 'Sesame oil'), '1 tablespoon'),
  ((SELECT id FROM ingredients WHERE name = 'Sesame seeds'), '1 tablespoon, for garnish'),
  ((SELECT id FROM ingredients WHERE name = 'Green onions'), '2 stalks, sliced for garnish'),
  ((SELECT id FROM ingredients WHERE name = 'Vegetable oil'), '2 tablespoons'),
  ((SELECT id FROM ingredients WHERE name = 'Cornstarch'), '1 tablespoon mixed with 2 tbsp water')
) AS t(id, amount)
WHERE id IS NOT NULL
ON CONFLICT DO NOTHING;

-- CHICKEN TERIYAKI - Instructions
INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes) VALUES
  ('550e8400-e29b-41d4-a716-446655440021', 1, 'In a bowl, whisk together soy sauce, brown sugar, ginger, garlic, and sesame oil to make the teriyaki sauce.', NULL),
  ('550e8400-e29b-41d4-a716-446655440021', 2, 'Cut chicken thighs into bite-sized pieces. Season lightly with salt.', NULL),
  ('550e8400-e29b-41d4-a716-446655440021', 3, 'Heat vegetable oil in a large pan or wok over medium-high heat.', 2),
  ('550e8400-e29b-41d4-a716-446655440021', 4, 'Add chicken pieces and cook until browned on all sides and cooked through, about 7-8 minutes.', 8),
  ('550e8400-e29b-41d4-a716-446655440021', 5, 'Pour the teriyaki sauce over the chicken. Bring to a simmer.', 2),
  ('550e8400-e29b-41d4-a716-446655440021', 6, 'Add the cornstarch slurry and stir constantly until the sauce thickens and becomes glossy, about 2 minutes.', 2),
  ('550e8400-e29b-41d4-a716-446655440021', 7, 'Remove from heat. Garnish with sesame seeds and green onions.', NULL),
  ('550e8400-e29b-41d4-a716-446655440021', 8, 'Serve hot over steamed rice with steamed vegetables.', NULL)
ON CONFLICT DO NOTHING;

-- =============================================
-- BEEF BULGOGI - Ingredients
-- =============================================
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
SELECT 
  '550e8400-e29b-41d4-a716-446655440022',
  id,
  amount
FROM (VALUES
  ((SELECT id FROM ingredients WHERE name = 'Beef sirloin'), '600g, thinly sliced'),
  ((SELECT id FROM ingredients WHERE name = 'Soy sauce'), '1/3 cup'),
  ((SELECT id FROM ingredients WHERE name = 'Brown sugar'), '3 tablespoons'),
  ((SELECT id FROM ingredients WHERE name = 'Sesame oil'), '2 tablespoons'),
  ((SELECT id FROM ingredients WHERE name = 'Garlic'), '6 cloves, minced'),
  ((SELECT id FROM ingredients WHERE name = 'Ginger'), '1-inch piece, grated'),
  ((SELECT id FROM ingredients WHERE name = 'Onions'), '1 medium, sliced'),
  ((SELECT id FROM ingredients WHERE name = 'Green onions'), '4 stalks, cut into 2-inch pieces'),
  ((SELECT id FROM ingredients WHERE name = 'Carrots'), '1 medium, julienned'),
  ((SELECT id FROM ingredients WHERE name = 'Sesame seeds'), '1 tablespoon'),
  ((SELECT id FROM ingredients WHERE name = 'Black pepper'), '1/2 teaspoon'),
  ((SELECT id FROM ingredients WHERE name = 'Vegetable oil'), '2 tablespoons')
) AS t(id, amount)
WHERE id IS NOT NULL
ON CONFLICT DO NOTHING;

-- BEEF BULGOGI - Instructions
INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes) VALUES
  ('550e8400-e29b-41d4-a716-446655440022', 1, 'In a large bowl, mix soy sauce, brown sugar, sesame oil, garlic, ginger, and black pepper to make the marinade.', NULL),
  ('550e8400-e29b-41d4-a716-446655440022', 2, 'Add thinly sliced beef to the marinade. Mix well and refrigerate for at least 30 minutes (or up to 4 hours).', NULL),
  ('550e8400-e29b-41d4-a716-446655440022', 3, 'Heat 1 tablespoon of oil in a large skillet or wok over high heat.', 2),
  ('550e8400-e29b-41d4-a716-446655440022', 4, 'Working in batches, cook the marinated beef for 2-3 minutes per side until caramelized and cooked through. Do not overcrowd the pan.', 5),
  ('550e8400-e29b-41d4-a716-446655440022', 5, 'Remove cooked beef and set aside. Add remaining oil to the pan.', NULL),
  ('550e8400-e29b-41d4-a716-446655440022', 6, 'Stir-fry onions and carrots for 2-3 minutes until slightly softened.', 3),
  ('550e8400-e29b-41d4-a716-446655440022', 7, 'Return beef to the pan. Add green onions and toss everything together for 1 minute.', 1),
  ('550e8400-e29b-41d4-a716-446655440022', 8, 'Garnish with sesame seeds. Serve hot with rice and kimchi.', NULL)
ON CONFLICT DO NOTHING;

-- =============================================
-- PHO BO (Vietnamese Beef Pho) - Ingredients
-- =============================================
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
SELECT 
  '550e8400-e29b-41d4-a716-446655440023',
  id,
  amount
FROM (VALUES
  ((SELECT id FROM ingredients WHERE name = 'Beef short ribs'), '1 kg beef bones'),
  ((SELECT id FROM ingredients WHERE name = 'Beef sirloin'), '300g, thinly sliced for serving'),
  ((SELECT id FROM ingredients WHERE name = 'Rice noodles'), '400g fresh or dried pho noodles'),
  ((SELECT id FROM ingredients WHERE name = 'Onions'), '2 large, halved'),
  ((SELECT id FROM ingredients WHERE name = 'Ginger'), '3-inch piece, sliced'),
  ((SELECT id FROM ingredients WHERE name = 'Star anise'), '3 pieces'),
  ((SELECT id FROM ingredients WHERE name = 'Cinnamon'), '1 stick'),
  ((SELECT id FROM ingredients WHERE name = 'Fish sauce'), '1/4 cup'),
  ((SELECT id FROM ingredients WHERE name = 'Bean sprouts'), '2 cups'),
  ((SELECT id FROM ingredients WHERE name = 'Thai basil'), '1 bunch'),
  ((SELECT id FROM ingredients WHERE name = 'Cilantro'), '1 bunch'),
  ((SELECT id FROM ingredients WHERE name = 'Lime'), '4 limes, cut into wedges'),
  ((SELECT id FROM ingredients WHERE name = 'Thai chilies'), '4-5 pieces, sliced'),
  ((SELECT id FROM ingredients WHERE name = 'Green onions'), '4 stalks, sliced')
) AS t(id, amount)
WHERE id IS NOT NULL
ON CONFLICT DO NOTHING;

-- PHO BO - Instructions
INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes) VALUES
  ('550e8400-e29b-41d4-a716-446655440023', 1, 'Parboil beef bones in boiling water for 5 minutes. Drain and rinse bones to remove impurities.', 5),
  ('550e8400-e29b-41d4-a716-446655440023', 2, 'Char onions and ginger over an open flame or under a broiler until blackened. This adds depth to the broth.', 5),
  ('550e8400-e29b-41d4-a716-446655440023', 3, 'In a large stockpot, add bones and 4 liters of water. Bring to a boil, then reduce to a gentle simmer.', 10),
  ('550e8400-e29b-41d4-a716-446655440023', 4, 'Add charred onions, ginger, star anise, and cinnamon. Simmer for 1.5-2 hours, skimming off foam occasionally.', 120),
  ('550e8400-e29b-41d4-a716-446655440023', 5, 'Add fish sauce to the broth. Taste and adjust seasoning. Strain the broth through a fine-mesh sieve.', NULL),
  ('550e8400-e29b-41d4-a716-446655440023', 6, 'Cook rice noodles according to package instructions. Drain well.', NULL),
  ('550e8400-e29b-41d4-a716-446655440023', 7, 'To serve: Place noodles in bowls. Top with raw beef slices and green onions.', NULL),
  ('550e8400-e29b-41d4-a716-446655440023', 8, 'Ladle the piping hot broth over the beef (this will cook the raw beef slices).', NULL),
  ('550e8400-e29b-41d4-a716-446655440023', 9, 'Serve with bean sprouts, herbs, lime wedges, and chilies on the side. Let diners add their preferred garnishes.', NULL)
ON CONFLICT DO NOTHING;

-- =============================================
-- MAPO TOFU - Ingredients
-- =============================================
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
SELECT 
  '550e8400-e29b-41d4-a716-446655440024',
  id,
  amount
FROM (VALUES
  ((SELECT id FROM ingredients WHERE name = 'Tofu'), '400g soft tofu, cubed'),
  ((SELECT id FROM ingredients WHERE name = 'Ground pork'), '200g'),
  ((SELECT id FROM ingredients WHERE name = 'Garlic'), '4 cloves, minced'),
  ((SELECT id FROM ingredients WHERE name = 'Ginger'), '1-inch piece, minced'),
  ((SELECT id FROM ingredients WHERE name = 'Green onions'), '3 stalks, chopped'),
  ((SELECT id FROM ingredients WHERE name = 'Soy sauce'), '2 tablespoons'),
  ((SELECT id FROM ingredients WHERE name = 'Chili oil'), '2 tablespoons'),
  ((SELECT id FROM ingredients WHERE name = 'Gochugaru'), '1 tablespoon (or chili flakes)'),
  ((SELECT id FROM ingredients WHERE name = 'Cornstarch'), '1 tablespoon mixed with 3 tbsp water'),
  ((SELECT id FROM ingredients WHERE name = 'Vegetable oil'), '2 tablespoons'),
  ((SELECT id FROM ingredients WHERE name = 'Sichuan peppercorns'), '1 teaspoon, ground (optional)')
) AS t(id, amount)
WHERE id IS NOT NULL
ON CONFLICT DO NOTHING;

-- MAPO TOFU - Instructions
INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes) VALUES
  ('550e8400-e29b-41d4-a716-446655440024', 1, 'Cut tofu into 1-inch cubes. Blanch in boiling water for 2 minutes to remove excess water. Drain gently.', 2),
  ('550e8400-e29b-41d4-a716-446655440024', 2, 'Heat oil in a wok over high heat. Add ground pork and cook, breaking it up, until browned, about 5 minutes.', 5),
  ('550e8400-e29b-41d4-a716-446655440024', 3, 'Add garlic, ginger, and half the green onions. Stir-fry for 1 minute until fragrant.', 1),
  ('550e8400-e29b-41d4-a716-446655440024', 4, 'Add chili oil, gochugaru, and Sichuan peppercorns (if using). Stir for 30 seconds.', NULL),
  ('550e8400-e29b-41d4-a716-446655440024', 5, 'Add 1 cup of water and soy sauce. Bring to a simmer.', 2),
  ('550e8400-e29b-41d4-a716-446655440024', 6, 'Gently add tofu cubes. Simmer for 3-4 minutes, being careful not to break the tofu.', 4),
  ('550e8400-e29b-41d4-a716-446655440024', 7, 'Add cornstarch slurry and stir gently until sauce thickens, about 1 minute.', 1),
  ('550e8400-e29b-41d4-a716-446655440024', 8, 'Garnish with remaining green onions. Serve hot with steamed rice.', NULL)
ON CONFLICT DO NOTHING;
