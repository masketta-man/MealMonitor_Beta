/*
  # Filipino Recipes - Ingredients and Instructions

  This migration adds ingredients and detailed cooking instructions for Filipino recipes.

  ## Security
  - No RLS changes needed (inherits from existing policies)
*/

-- =============================================
-- ADOBO - Ingredients
-- =============================================
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
SELECT 
  '550e8400-e29b-41d4-a716-446655440010',
  id,
  amount
FROM (VALUES
  ((SELECT id FROM ingredients WHERE name = 'Chicken thighs'), '1 kg, cut into pieces'),
  ((SELECT id FROM ingredients WHERE name = 'Soy sauce'), '1/2 cup'),
  ((SELECT id FROM ingredients WHERE name = 'White vinegar'), '1/3 cup'),
  ((SELECT id FROM ingredients WHERE name = 'Garlic'), '8 cloves, minced'),
  ((SELECT id FROM ingredients WHERE name = 'Bay leaves'), '3 leaves'),
  ((SELECT id FROM ingredients WHERE name = 'Black peppercorns'), '1 teaspoon'),
  ((SELECT id FROM ingredients WHERE name = 'Onions'), '1 large, sliced'),
  ((SELECT id FROM ingredients WHERE name = 'Vegetable oil'), '2 tablespoons')
) AS t(id, amount)
WHERE id IS NOT NULL
ON CONFLICT DO NOTHING;

-- ADOBO - Instructions
INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes) VALUES
  ('550e8400-e29b-41d4-a716-446655440010', 1, 'In a large bowl, combine chicken pieces with soy sauce, vinegar, minced garlic, bay leaves, and peppercorns. Marinate for at least 30 minutes (or up to 2 hours in the refrigerator).', NULL),
  ('550e8400-e29b-41d4-a716-446655440010', 2, 'Heat oil in a large pot or wok over medium-high heat.', 2),
  ('550e8400-e29b-41d4-a716-446655440010', 3, 'Remove chicken from marinade (reserve the marinade) and brown the chicken pieces on all sides, about 5-7 minutes.', 7),
  ('550e8400-e29b-41d4-a716-446655440010', 4, 'Add the sliced onions and cook for 2 minutes until softened.', 2),
  ('550e8400-e29b-41d4-a716-446655440010', 5, 'Pour in the reserved marinade and add 1 cup of water. Bring to a boil.', 5),
  ('550e8400-e29b-41d4-a716-446655440010', 6, 'Reduce heat to low, cover, and simmer for 30-35 minutes until chicken is tender and cooked through.', 35),
  ('550e8400-e29b-41d4-a716-446655440010', 7, 'Uncover and increase heat to medium. Cook for an additional 5-10 minutes to reduce and thicken the sauce.', 10),
  ('550e8400-e29b-41d4-a716-446655440010', 8, 'Taste and adjust seasoning if needed. Serve hot over steamed rice.', NULL)
ON CONFLICT DO NOTHING;

-- =============================================
-- SINIGANG - Ingredients
-- =============================================
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
SELECT 
  '550e8400-e29b-41d4-a716-446655440011',
  id,
  amount
FROM (VALUES
  ((SELECT id FROM ingredients WHERE name = 'Pork belly'), '500g, cut into chunks'),
  ((SELECT id FROM ingredients WHERE name = 'Tamarind paste'), '2 tablespoons (or fresh tamarind)'),
  ((SELECT id FROM ingredients WHERE name = 'Tomatoes'), '2 medium, quartered'),
  ((SELECT id FROM ingredients WHERE name = 'Onions'), '1 medium, sliced'),
  ((SELECT id FROM ingredients WHERE name = 'Daikon radish'), '1 cup, sliced'),
  ((SELECT id FROM ingredients WHERE name = 'Eggplant'), '1 large, sliced'),
  ((SELECT id FROM ingredients WHERE name = 'Water spinach'), '1 bunch, cut into 2-inch pieces'),
  ((SELECT id FROM ingredients WHERE name = 'Green beans'), '1 cup, cut into 2-inch pieces'),
  ((SELECT id FROM ingredients WHERE name = 'Green onions'), '2 stalks, chopped'),
  ((SELECT id FROM ingredients WHERE name = 'Fish sauce'), '2 tablespoons'),
  ((SELECT id FROM ingredients WHERE name = 'Thai chilies'), '2-3 pieces')
) AS t(id, amount)
WHERE id IS NOT NULL
ON CONFLICT DO NOTHING;

-- SINIGANG - Instructions
INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes) VALUES
  ('550e8400-e29b-41d4-a716-446655440011', 1, 'In a large pot, bring 8 cups of water to a boil. Add the pork belly chunks and cook for 5 minutes. Skim off any scum that rises to the surface.', 5),
  ('550e8400-e29b-41d4-a716-446655440011', 2, 'Add onions and tomatoes. Continue boiling for 20 minutes until pork is tender.', 20),
  ('550e8400-e29b-41d4-a716-446655440011', 3, 'Stir in the tamarind paste and fish sauce. Mix well to dissolve the tamarind.', NULL),
  ('550e8400-e29b-41d4-a716-446655440011', 4, 'Add the daikon radish and simmer for 5 minutes.', 5),
  ('550e8400-e29b-41d4-a716-446655440011', 5, 'Add eggplant and green beans. Cook for another 5 minutes until vegetables are tender but still have some bite.', 5),
  ('550e8400-e29b-41d4-a716-446655440011', 6, 'Add water spinach and Thai chilies. Cook for 2 more minutes.', 2),
  ('550e8400-e29b-41d4-a716-446655440011', 7, 'Taste and adjust sourness with more tamarind or fish sauce as needed.', NULL),
  ('550e8400-e29b-41d4-a716-446655440011', 8, 'Garnish with green onions. Serve hot with steamed rice.', NULL)
ON CONFLICT DO NOTHING;

-- =============================================
-- PANCIT CANTON - Ingredients
-- =============================================
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
SELECT 
  '550e8400-e29b-41d4-a716-446655440012',
  id,
  amount
FROM (VALUES
  ((SELECT id FROM ingredients WHERE name = 'Egg noodles'), '400g pancit canton noodles'),
  ((SELECT id FROM ingredients WHERE name = 'Chicken breast'), '300g, sliced thinly'),
  ((SELECT id FROM ingredients WHERE name = 'Shrimp'), '200g, peeled'),
  ((SELECT id FROM ingredients WHERE name = 'Cabbage'), '2 cups, shredded'),
  ((SELECT id FROM ingredients WHERE name = 'Carrots'), '1 cup, julienned'),
  ((SELECT id FROM ingredients WHERE name = 'Green beans'), '1 cup, cut diagonally'),
  ((SELECT id FROM ingredients WHERE name = 'Garlic'), '6 cloves, minced'),
  ((SELECT id FROM ingredients WHERE name = 'Onions'), '1 medium, sliced'),
  ((SELECT id FROM ingredients WHERE name = 'Soy sauce'), '1/4 cup'),
  ((SELECT id FROM ingredients WHERE name = 'Oyster sauce'), '2 tablespoons'),
  ((SELECT id FROM ingredients WHERE name = 'Vegetable oil'), '3 tablespoons')
) AS t(id, amount)
WHERE id IS NOT NULL
ON CONFLICT DO NOTHING;

-- PANCIT CANTON - Instructions
INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes) VALUES
  ('550e8400-e29b-41d4-a716-446655440012', 1, 'Soak the pancit canton noodles in warm water for 5 minutes until slightly softened. Drain and set aside.', NULL),
  ('550e8400-e29b-41d4-a716-446655440012', 2, 'Heat 2 tablespoons of oil in a large wok or pan over high heat. Stir-fry chicken until cooked through, about 5 minutes. Remove and set aside.', 5),
  ('550e8400-e29b-41d4-a716-446655440012', 3, 'In the same wok, cook shrimp until pink, about 2 minutes. Remove and set aside with chicken.', 2),
  ('550e8400-e29b-41d4-a716-446655440012', 4, 'Add remaining oil. Sauté garlic and onions until fragrant, about 1 minute.', 1),
  ('550e8400-e29b-41d4-a716-446655440012', 5, 'Add carrots and green beans. Stir-fry for 2 minutes.', 2),
  ('550e8400-e29b-41d4-a716-446655440012', 6, 'Add cabbage and stir-fry for 1 minute.', 1),
  ('550e8400-e29b-41d4-a716-446655440012', 7, 'Add the drained noodles, soy sauce, and oyster sauce. Toss everything together for 3-4 minutes until noodles are tender and well-coated.', 4),
  ('550e8400-e29b-41d4-a716-446655440012', 8, 'Return chicken and shrimp to the wok. Toss to combine and heat through, about 1 minute.', 1),
  ('550e8400-e29b-41d4-a716-446655440012', 9, 'Serve hot with calamansi or lemon wedges on the side.', NULL)
ON CONFLICT DO NOTHING;

-- =============================================
-- LUMPIA - Ingredients
-- =============================================
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
SELECT 
  '550e8400-e29b-41d4-a716-446655440013',
  id,
  amount
FROM (VALUES
  ((SELECT id FROM ingredients WHERE name = 'Ground pork'), '500g'),
  ((SELECT id FROM ingredients WHERE name = 'Spring roll wrappers'), '25-30 pieces'),
  ((SELECT id FROM ingredients WHERE name = 'Carrots'), '1 cup, finely chopped'),
  ((SELECT id FROM ingredients WHERE name = 'Onions'), '1/2 cup, minced'),
  ((SELECT id FROM ingredients WHERE name = 'Garlic'), '4 cloves, minced'),
  ((SELECT id FROM ingredients WHERE name = 'Green onions'), '3 stalks, chopped'),
  ((SELECT id FROM ingredients WHERE name = 'Soy sauce'), '2 tablespoons'),
  ((SELECT id FROM ingredients WHERE name = 'Eggs'), '1 egg, beaten (for sealing)'),
  ((SELECT id FROM ingredients WHERE name = 'Salt'), '1 teaspoon'),
  ((SELECT id FROM ingredients WHERE name = 'Black pepper'), '1/2 teaspoon'),
  ((SELECT id FROM ingredients WHERE name = 'Vegetable oil'), 'For frying')
) AS t(id, amount)
WHERE id IS NOT NULL
ON CONFLICT DO NOTHING;

-- LUMPIA - Instructions
INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes) VALUES
  ('550e8400-e29b-41d4-a716-446655440013', 1, 'In a large bowl, mix together ground pork, carrots, onions, garlic, green onions, soy sauce, salt, and pepper. Mix well until thoroughly combined.', NULL),
  ('550e8400-e29b-41d4-a716-446655440013', 2, 'Separate the lumpia wrappers and cover with a damp cloth to prevent drying.', NULL),
  ('550e8400-e29b-41d4-a716-446655440013', 3, 'Place one wrapper on a clean surface with a corner pointing toward you (diamond shape).', NULL),
  ('550e8400-e29b-41d4-a716-446655440013', 4, 'Place about 1-2 tablespoons of filling in a line near the corner closest to you, about 2 inches from the edge.', NULL),
  ('550e8400-e29b-41d4-a716-446655440013', 5, 'Fold the bottom corner over the filling, then fold in the sides. Roll tightly toward the opposite corner.', NULL),
  ('550e8400-e29b-41d4-a716-446655440013', 6, 'Seal the edge with beaten egg. Repeat with remaining wrappers and filling.', NULL),
  ('550e8400-e29b-41d4-a716-446655440013', 7, 'Heat oil in a deep pan or wok to 350°F (175°C). The oil should be about 2 inches deep.', 5),
  ('550e8400-e29b-41d4-a716-446655440013', 8, 'Fry lumpia in batches, about 5-6 pieces at a time, turning occasionally until golden brown and crispy, about 3-4 minutes.', 4),
  ('550e8400-e29b-41d4-a716-446655440013', 9, 'Drain on paper towels. Serve hot with sweet chili sauce or banana ketchup.', NULL)
ON CONFLICT DO NOTHING;
