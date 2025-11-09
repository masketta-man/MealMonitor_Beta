/*
  # Add Complete Ingredients for New Filipino Recipes

  ## Summary
  This migration adds all missing ingredients to the 10 new healthy Filipino recipes that were added in the previous migration.

  ## Changes Made
  - Adds complete ingredient lists for all 10 new recipes
  - Creates new ingredients: Grouper, Mung beans, Banana ketchup, Sweet potato, Squash, String beans
  - Links all ingredients to their respective recipes with proper amounts
  - Uses correct category values: Fruits, Vegetables, Protein, Dairy, Grains, Pantry

  ## Security
  - Uses existing RLS policies
  - No security changes required
*/

-- =============================================
-- ADD NEW INGREDIENTS
-- =============================================
INSERT INTO ingredients (name, category) 
VALUES 
  ('Grouper', 'Protein'),
  ('Mung beans', 'Protein'),
  ('Banana ketchup', 'Pantry'),
  ('Sweet potato', 'Vegetables'),
  ('Squash', 'Vegetables'),
  ('String beans', 'Vegetables')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- ADD INGREDIENTS FOR PINAKBET
-- =============================================
DO $$
DECLARE
  recipe_uuid uuid := '550e8400-e29b-41d4-a716-446655440028';
BEGIN
  -- Add tomatoes (already exists from migration)
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '3 medium, quartered' 
  FROM ingredients WHERE name = 'Tomatoes'
  ON CONFLICT DO NOTHING;
  
  -- Add squash
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1 cup, cubed' 
  FROM ingredients WHERE name = 'Squash'
  ON CONFLICT DO NOTHING;
  
  -- Add shrimp paste
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '2 tablespoons' 
  FROM ingredients WHERE name = 'Shrimp paste'
  ON CONFLICT DO NOTHING;
  
  -- Add okra
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '10 pieces' 
  FROM ingredients WHERE name = 'Okra'
  ON CONFLICT DO NOTHING;
  
  -- Add string beans
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1 cup, cut into 2-inch pieces' 
  FROM ingredients WHERE name = 'String beans'
  ON CONFLICT DO NOTHING;
  
  -- Add salt
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, 'to taste' 
  FROM ingredients WHERE name = 'Salt'
  ON CONFLICT DO NOTHING;
END $$;

-- =============================================
-- ADD INGREDIENTS FOR GRILLED BANGUS
-- =============================================
DO $$
DECLARE
  recipe_uuid uuid := '550e8400-e29b-41d4-a716-446655440029';
BEGIN
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1 whole fish (about 500g)' 
  FROM ingredients WHERE name = 'Milkfish'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '6 pieces' 
  FROM ingredients WHERE name = 'Calamansi'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '2 medium, sliced' 
  FROM ingredients WHERE name = 'Tomatoes'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1 large, sliced' 
  FROM ingredients WHERE name = 'Onions'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1 teaspoon' 
  FROM ingredients WHERE name = 'Salt'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1/2 teaspoon' 
  FROM ingredients WHERE name = 'Black pepper'
  ON CONFLICT DO NOTHING;
END $$;

-- =============================================
-- ADD INGREDIENTS FOR GINATAANG GULAY
-- =============================================
DO $$
DECLARE
  recipe_uuid uuid := '550e8400-e29b-41d4-a716-446655440030';
BEGIN
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '2 cups' 
  FROM ingredients WHERE name = 'Coconut milk'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '4 cloves, minced' 
  FROM ingredients WHERE name = 'Garlic'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1 medium, chopped' 
  FROM ingredients WHERE name = 'Onions'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '2 tablespoons, sliced' 
  FROM ingredients WHERE name = 'Ginger'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1 cup, cubed' 
  FROM ingredients WHERE name = 'Squash'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1 cup, cut into 2-inch pieces' 
  FROM ingredients WHERE name = 'String beans'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '2 cups' 
  FROM ingredients WHERE name = 'Water spinach'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, 'to taste' 
  FROM ingredients WHERE name = 'Salt'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, 'to taste' 
  FROM ingredients WHERE name = 'Black pepper'
  ON CONFLICT DO NOTHING;
END $$;

-- =============================================
-- ADD INGREDIENTS FOR ENSALADANG TALONG
-- =============================================
DO $$
DECLARE
  recipe_uuid uuid := '550e8400-e29b-41d4-a716-446655440031';
BEGIN
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '3 large eggplants' 
  FROM ingredients WHERE name = 'Eggplant'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '2 medium, diced' 
  FROM ingredients WHERE name = 'Tomatoes'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1 medium, diced' 
  FROM ingredients WHERE name = 'Onions'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '3 tablespoons' 
  FROM ingredients WHERE name ILIKE '%vinegar%'
  LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1 tablespoon' 
  FROM ingredients WHERE name = 'Fish sauce'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, 'to taste' 
  FROM ingredients WHERE name = 'Salt'
  ON CONFLICT DO NOTHING;
END $$;

-- =============================================
-- ADD INGREDIENTS FOR NILAGANG BAKA
-- =============================================
DO $$
DECLARE
  recipe_uuid uuid := '550e8400-e29b-41d4-a716-446655440032';
BEGIN
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1 kg beef shank' 
  FROM ingredients WHERE name = 'Beef short ribs'
  LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '2 medium, quartered' 
  FROM ingredients WHERE name = 'Onions'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1 tablespoon' 
  FROM ingredients WHERE name = 'Black peppercorns'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1/2 head, quartered' 
  FROM ingredients WHERE name ILIKE '%cabbage%'
  LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '2 ears, cut into thirds' 
  FROM ingredients WHERE name = 'Corn'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '4 bunches' 
  FROM ingredients WHERE name = 'Bok choy'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '2 tablespoons' 
  FROM ingredients WHERE name = 'Fish sauce'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, 'to taste' 
  FROM ingredients WHERE name = 'Salt'
  ON CONFLICT DO NOTHING;
END $$;

-- =============================================
-- ADD INGREDIENTS FOR STEAMED LAPU-LAPU
-- =============================================
DO $$
DECLARE
  recipe_uuid uuid := '550e8400-e29b-41d4-a716-446655440033';
BEGIN
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1 whole fish (500-700g)' 
  FROM ingredients WHERE name = 'Grouper'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '3 tablespoons, julienned' 
  FROM ingredients WHERE name = 'Ginger'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '4 cloves, minced' 
  FROM ingredients WHERE name = 'Garlic'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '3 tablespoons' 
  FROM ingredients WHERE name = 'Soy sauce'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1 tablespoon' 
  FROM ingredients WHERE name = 'Sesame oil'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '3 stalks, chopped' 
  FROM ingredients WHERE name = 'Green onions'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1 teaspoon' 
  FROM ingredients WHERE name = 'Salt'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1/2 teaspoon' 
  FROM ingredients WHERE name = 'Black pepper'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '2 tablespoons' 
  FROM ingredients WHERE name = 'Vegetable oil'
  ON CONFLICT DO NOTHING;
END $$;

-- =============================================
-- ADD INGREDIENTS FOR GINISANG MONGGO
-- =============================================
DO $$
DECLARE
  recipe_uuid uuid := '550e8400-e29b-41d4-a716-446655440034';
BEGIN
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1 cup, dried' 
  FROM ingredients WHERE name = 'Mung beans'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '4 cloves, minced' 
  FROM ingredients WHERE name = 'Garlic'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1 medium, chopped' 
  FROM ingredients WHERE name = 'Onions'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '2 medium, chopped' 
  FROM ingredients WHERE name = 'Tomatoes'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '200g (optional)' 
  FROM ingredients WHERE name = 'Ground pork'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1 cup, sliced' 
  FROM ingredients WHERE name = 'Bitter melon'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '2 tablespoons' 
  FROM ingredients WHERE name = 'Fish sauce'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, 'to taste' 
  FROM ingredients WHERE name = 'Black pepper'
  ON CONFLICT DO NOTHING;
END $$;

-- =============================================
-- ADD INGREDIENTS FOR CHICKEN INASAL
-- =============================================
DO $$
DECLARE
  recipe_uuid uuid := '550e8400-e29b-41d4-a716-446655440035';
BEGIN
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1 kg chicken pieces' 
  FROM ingredients WHERE name = 'Chicken thighs'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '10 pieces, juiced' 
  FROM ingredients WHERE name = 'Calamansi'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1/4 cup' 
  FROM ingredients WHERE name ILIKE '%vinegar%'
  LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '2 stalks, chopped' 
  FROM ingredients WHERE name = 'Lemongrass'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '8 cloves, minced' 
  FROM ingredients WHERE name = 'Garlic'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '2 tablespoons, minced' 
  FROM ingredients WHERE name = 'Ginger'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '2 tablespoons (for oil)' 
  FROM ingredients WHERE name = 'Annatto seeds'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1 tablespoon' 
  FROM ingredients WHERE name = 'Salt'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1 teaspoon' 
  FROM ingredients WHERE name = 'Black pepper'
  ON CONFLICT DO NOTHING;
END $$;

-- =============================================
-- ADD INGREDIENTS FOR INIHAW NA LIEMPO
-- =============================================
DO $$
DECLARE
  recipe_uuid uuid := '550e8400-e29b-41d4-a716-446655440036';
BEGIN
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1 kg, sliced' 
  FROM ingredients WHERE name = 'Pork belly'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1/2 cup' 
  FROM ingredients WHERE name = 'Soy sauce'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '8 pieces, juiced' 
  FROM ingredients WHERE name = 'Calamansi'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1/4 cup' 
  FROM ingredients WHERE name = 'Banana ketchup'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '6 cloves, minced' 
  FROM ingredients WHERE name = 'Garlic'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '3 tablespoons' 
  FROM ingredients WHERE name = 'Brown sugar'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1 teaspoon' 
  FROM ingredients WHERE name = 'Black pepper'
  ON CONFLICT DO NOTHING;
END $$;

-- =============================================
-- ADD INGREDIENTS FOR UKOY
-- =============================================
DO $$
DECLARE
  recipe_uuid uuid := '550e8400-e29b-41d4-a716-446655440037';
BEGIN
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1 cup' 
  FROM ingredients WHERE name = 'Flour'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1/4 cup' 
  FROM ingredients WHERE name = 'Cornstarch'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '200g small shrimp' 
  FROM ingredients WHERE name = 'Shrimp'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1 cup, grated' 
  FROM ingredients WHERE name = 'Sweet potato'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1 cup' 
  FROM ingredients WHERE name = 'Bean sprouts'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1 teaspoon' 
  FROM ingredients WHERE name = 'Salt'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, '1/2 teaspoon' 
  FROM ingredients WHERE name = 'Black pepper'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, 'for frying' 
  FROM ingredients WHERE name = 'Vegetable oil'
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
  SELECT recipe_uuid, id, 'for dipping sauce' 
  FROM ingredients WHERE name ILIKE '%vinegar%'
  LIMIT 1
  ON CONFLICT DO NOTHING;
END $$;
