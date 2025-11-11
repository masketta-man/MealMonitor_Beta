/*
  # Add Ingredients to New Recipes

  Links all 20 new recipes to their ingredients in the recipe_ingredients table.
  This is a continuation of migration 20251111000000_add_healthy_varied_recipes.sql
*/

-- Recipe 3: Overnight Oats with Berries
DO $$
DECLARE
  recipe_id uuid := 'a10e8400-e29b-41d4-a716-446655440003';
BEGIN
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1/2 cup' FROM ingredients WHERE name = 'Rolled Oats' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 tbsp' FROM ingredients WHERE name = 'Chia Seeds' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '3/4 cup' FROM ingredients WHERE name = 'Almond Milk' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 cup' FROM ingredients WHERE name = 'Mixed Berries' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 whole' FROM ingredients WHERE name = 'Banana' LIMIT 1
  ON CONFLICT DO NOTHING;
END $$;

-- Recipe 4: Veggie Scramble
DO $$
DECLARE
  recipe_id uuid := 'a10e8400-e29b-41d4-a716-446655440004';
BEGIN
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '3 eggs' FROM ingredients WHERE name = 'Eggs' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 whole' FROM ingredients WHERE name = 'Bell Pepper' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 cup' FROM ingredients WHERE name = 'Spinach' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1/2 cup' FROM ingredients WHERE name = 'Cherry Tomatoes' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1/4 whole' FROM ingredients WHERE name = 'Onion' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 tsp' FROM ingredients WHERE name = 'Olive Oil' LIMIT 1
  ON CONFLICT DO NOTHING;
END $$;

-- Recipe 5: Banana Protein Smoothie Bowl
DO $$
DECLARE
  recipe_id uuid := 'a10e8400-e29b-41d4-a716-446655440005';
BEGIN
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '2 whole' FROM ingredients WHERE name = 'Banana' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 scoop' FROM ingredients WHERE name = 'Protein Powder' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1/2 cup' FROM ingredients WHERE name = 'Almond Milk' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 tbsp' FROM ingredients WHERE name = 'Peanut Butter' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1/4 cup' FROM ingredients WHERE name = 'Granola' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1/2 cup' FROM ingredients WHERE name = 'Mixed Berries' LIMIT 1
  ON CONFLICT DO NOTHING;
END $$;

-- Recipe 6: Mediterranean Quinoa Bowl
DO $$
DECLARE
  recipe_id uuid := 'a10e8400-e29b-41d4-a716-446655440006';
BEGIN
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 cup' FROM ingredients WHERE name = 'Quinoa' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 whole' FROM ingredients WHERE name = 'Cucumber' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 cup' FROM ingredients WHERE name = 'Cherry Tomatoes' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1/2 cup' FROM ingredients WHERE name = 'Feta Cheese' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1/4 cup' FROM ingredients WHERE name = 'Olives' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 cup' FROM ingredients WHERE name = 'Chickpeas' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 whole' FROM ingredients WHERE name = 'Lemon' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '2 tbsp' FROM ingredients WHERE name = 'Olive Oil' LIMIT 1
  ON CONFLICT DO NOTHING;
END $$;

-- Recipe 7: Grilled Chicken Caesar Salad
DO $$
DECLARE
  recipe_id uuid := 'a10e8400-e29b-41d4-a716-446655440007';
BEGIN
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '6 oz' FROM ingredients WHERE name = 'Chicken Breast' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '2 cups' FROM ingredients WHERE name = 'Romaine Lettuce' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1/4 cup' FROM ingredients WHERE name = 'Parmesan Cheese' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1/4 cup' FROM ingredients WHERE name = 'Greek Yogurt' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 whole' FROM ingredients WHERE name = 'Lemon' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '2 cloves' FROM ingredients WHERE name = 'Garlic' LIMIT 1
  ON CONFLICT DO NOTHING;
END $$;

-- Recipe 8: Baked Salmon with Asparagus
DO $$
DECLARE
  recipe_id uuid := 'a10e8400-e29b-41d4-a716-446655440008';
BEGIN
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '6 oz' FROM ingredients WHERE name = 'Salmon' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 cup' FROM ingredients WHERE name = 'Asparagus' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 whole' FROM ingredients WHERE name = 'Lemon' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '2 cloves' FROM ingredients WHERE name = 'Garlic' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 tbsp' FROM ingredients WHERE name = 'Olive Oil' LIMIT 1
  ON CONFLICT DO NOTHING;
END $$;

-- Recipe 9: Turkey & Sweet Potato Chili
DO $$
DECLARE
  recipe_id uuid := 'a10e8400-e29b-41d4-a716-446655440009';
BEGIN
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 lb' FROM ingredients WHERE name = 'Ground Turkey' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '2 cups' FROM ingredients WHERE name = 'Sweet Potato' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 can' FROM ingredients WHERE name = 'Black Beans' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '2 cups' FROM ingredients WHERE name = 'Tomato' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 whole' FROM ingredients WHERE name = 'Onion' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 whole' FROM ingredients WHERE name = 'Bell Pepper' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '3 cloves' FROM ingredients WHERE name = 'Garlic' LIMIT 1
  ON CONFLICT DO NOTHING;
END $$;

-- Recipe 10: Zucchini Noodles with Pesto
DO $$
DECLARE
  recipe_id uuid := 'a10e8400-e29b-41d4-a716-446655440010';
BEGIN
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '3 medium' FROM ingredients WHERE name = 'Zucchini' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 cup' FROM ingredients WHERE name = 'Basil' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1/4 cup' FROM ingredients WHERE name = 'Pine Nuts' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1/4 cup' FROM ingredients WHERE name = 'Parmesan Cheese' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1/4 cup' FROM ingredients WHERE name = 'Olive Oil' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 cup' FROM ingredients WHERE name = 'Cherry Tomatoes' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '2 cloves' FROM ingredients WHERE name = 'Garlic' LIMIT 1
  ON CONFLICT DO NOTHING;
END $$;

-- Recipe 11: Teriyaki Tofu Stir-Fry
DO $$
DECLARE
  recipe_id uuid := 'a10e8400-e29b-41d4-a716-446655440011';
BEGIN
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '14 oz' FROM ingredients WHERE name = 'Tofu' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '2 cups' FROM ingredients WHERE name = 'Broccoli' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 whole' FROM ingredients WHERE name = 'Bell Pepper' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1/4 cup' FROM ingredients WHERE name = 'Soy Sauce' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '2 tbsp' FROM ingredients WHERE name = 'Honey' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 tbsp' FROM ingredients WHERE name = 'Ginger' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '2 cloves' FROM ingredients WHERE name = 'Garlic' LIMIT 1
  ON CONFLICT DO NOTHING;
END $$;

-- Recipe 12: Lentil Curry
DO $$
DECLARE
  recipe_id uuid := 'a10e8400-e29b-41d4-a716-446655440012';
BEGIN
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 cup' FROM ingredients WHERE name = 'Red Lentils' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 can' FROM ingredients WHERE name = 'Coconut Milk' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '2 cups' FROM ingredients WHERE name = 'Tomato' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 whole' FROM ingredients WHERE name = 'Onion' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '3 cloves' FROM ingredients WHERE name = 'Garlic' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '2 tbsp' FROM ingredients WHERE name = 'Curry Powder' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 tbsp' FROM ingredients WHERE name = 'Ginger' LIMIT 1
  ON CONFLICT DO NOTHING;
END $$;

-- Recipe 13: Shrimp Taco Bowl
DO $$
DECLARE
  recipe_id uuid := 'a10e8400-e29b-41d4-a716-446655440013';
BEGIN
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '8 oz' FROM ingredients WHERE name = 'Shrimp' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 cup' FROM ingredients WHERE name = 'Rice' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 cup' FROM ingredients WHERE name = 'Black Beans' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1/2 cup' FROM ingredients WHERE name = 'Corn' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 whole' FROM ingredients WHERE name = 'Avocado' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '2 whole' FROM ingredients WHERE name = 'Lime' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1/4 cup' FROM ingredients WHERE name = 'Cilantro' LIMIT 1
  ON CONFLICT DO NOTHING;
END $$;

-- Recipe 14: Chicken Pho
DO $$
DECLARE
  recipe_id uuid := 'a10e8400-e29b-41d4-a716-446655440014';
BEGIN
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '8 oz' FROM ingredients WHERE name = 'Chicken Breast' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '8 oz' FROM ingredients WHERE name = 'Rice Noodles' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '2 pieces' FROM ingredients WHERE name = 'Star Anise' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '2 tbsp' FROM ingredients WHERE name = 'Ginger' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 whole' FROM ingredients WHERE name = 'Onion' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1/4 cup' FROM ingredients WHERE name = 'Cilantro' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 whole' FROM ingredients WHERE name = 'Lime' LIMIT 1
  ON CONFLICT DO NOTHING;
END $$;

-- Recipe 15: Buddha Bowl
DO $$
DECLARE
  recipe_id uuid := 'a10e8400-e29b-41d4-a716-446655440015';
BEGIN
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 cup' FROM ingredients WHERE name = 'Quinoa' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 cup' FROM ingredients WHERE name = 'Chickpeas' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 cup' FROM ingredients WHERE name = 'Sweet Potato' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '2 cups' FROM ingredients WHERE name = 'Kale' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 whole' FROM ingredients WHERE name = 'Avocado' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1/4 cup' FROM ingredients WHERE name = 'Tahini' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 whole' FROM ingredients WHERE name = 'Lemon' LIMIT 1
  ON CONFLICT DO NOTHING;
END $$;

-- Recipe 16: Hummus with Veggies
DO $$
DECLARE
  recipe_id uuid := 'a10e8400-e29b-41d4-a716-446655440016';
BEGIN
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '2 cups' FROM ingredients WHERE name = 'Chickpeas' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1/4 cup' FROM ingredients WHERE name = 'Tahini' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '2 tbsp' FROM ingredients WHERE name = 'Lemon' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '2 cloves' FROM ingredients WHERE name = 'Garlic' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '2 medium' FROM ingredients WHERE name = 'Carrots' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '2 stalks' FROM ingredients WHERE name = 'Celery' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 whole' FROM ingredients WHERE name = 'Bell Pepper' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 whole' FROM ingredients WHERE name = 'Cucumber' LIMIT 1
  ON CONFLICT DO NOTHING;
END $$;

-- Recipe 17: Energy Balls
DO $$
DECLARE
  recipe_id uuid := 'a10e8400-e29b-41d4-a716-446655440017';
BEGIN
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 cup' FROM ingredients WHERE name = 'Dates' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1/2 cup' FROM ingredients WHERE name = 'Almonds' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1/2 cup' FROM ingredients WHERE name = 'Rolled Oats' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '2 tbsp' FROM ingredients WHERE name = 'Peanut Butter' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 tbsp' FROM ingredients WHERE name = 'Honey' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1/4 cup' FROM ingredients WHERE name = 'Dark Chocolate Chips' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 tbsp' FROM ingredients WHERE name = 'Chia Seeds' LIMIT 1
  ON CONFLICT DO NOTHING;
END $$;

-- Recipe 18: Greek Yogurt Dip
DO $$
DECLARE
  recipe_id uuid := 'a10e8400-e29b-41d4-a716-446655440018';
BEGIN
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '2 cups' FROM ingredients WHERE name = 'Greek Yogurt' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 whole' FROM ingredients WHERE name = 'Cucumber' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '2 tbsp' FROM ingredients WHERE name = 'Dill' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '2 cloves' FROM ingredients WHERE name = 'Garlic' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 whole' FROM ingredients WHERE name = 'Lemon' LIMIT 1
  ON CONFLICT DO NOTHING;
END $$;

-- Recipe 19: Roasted Chickpeas
DO $$
DECLARE
  recipe_id uuid := 'a10e8400-e29b-41d4-a716-446655440019';
BEGIN
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '2 cans' FROM ingredients WHERE name = 'Chickpeas' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '2 tbsp' FROM ingredients WHERE name = 'Olive Oil' LIMIT 1
  ON CONFLICT DO NOTHING;
END $$;

-- Recipe 20: Fruit & Nut Mix
DO $$
DECLARE
  recipe_id uuid := 'a10e8400-e29b-41d4-a716-446655440020';
BEGIN
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 cup' FROM ingredients WHERE name = 'Almonds' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1 cup' FROM ingredients WHERE name = 'Walnuts' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1/2 cup' FROM ingredients WHERE name = 'Dried Cranberries' LIMIT 1
  ON CONFLICT DO NOTHING;
  
  INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
  SELECT recipe_id, id, '1/4 cup' FROM ingredients WHERE name = 'Dark Chocolate Chips' LIMIT 1
  ON CONFLICT DO NOTHING;
END $$;
