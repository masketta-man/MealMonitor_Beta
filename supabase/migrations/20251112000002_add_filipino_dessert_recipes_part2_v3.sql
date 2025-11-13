/*
  # Add Filipino, International, and Dessert Recipes - Part 2 (v3 - NO DUPLICATES)
  
  More healthy recipes - all NEW (no duplicates):
  - Mango Chia Pudding
  - Baked Cinnamon Apples
  - Baked Turon (Banana Spring Rolls)
  - Healthy Halo-Halo
  - Healthy Pandan Coconut Cake
  - Filipino Fruit Salad with Yogurt
  - Healthy Matcha Brownies
*/

-- Helper function (same as part 1)
CREATE OR REPLACE FUNCTION insert_recipe_if_not_exists(
  p_title text, p_description text, p_meal_type text, p_cuisine_type text,
  p_difficulty text, p_prep_time integer,
  p_calories integer, p_protein integer, p_carbs integer, p_fat integer,
  p_nutrition_score numeric, p_points integer, p_image_url text,
  p_ingredients jsonb, p_instructions jsonb, p_tags jsonb
) RETURNS uuid AS $$
DECLARE
  v_recipe_id uuid;
  v_ingredient record;
  v_instruction record;
  v_tag record;
BEGIN
  SELECT id INTO v_recipe_id FROM recipes WHERE title = p_title;
  IF v_recipe_id IS NOT NULL THEN
    RAISE NOTICE 'Recipe "%" already exists, skipping...', p_title;
    RETURN v_recipe_id;
  END IF;
  
  INSERT INTO recipes (title, description, meal_type, cuisine_type, difficulty, prep_time, calories, protein, carbs, fat, nutrition_score, points, image_url)
  VALUES (p_title, p_description, p_meal_type, p_cuisine_type, p_difficulty, p_prep_time, p_calories, p_protein, p_carbs, p_fat, p_nutrition_score, p_points, p_image_url)
  RETURNING id INTO v_recipe_id;
  
  FOR v_ingredient IN SELECT * FROM jsonb_array_elements(p_ingredients) LOOP
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
    SELECT v_recipe_id, i.id, (v_ingredient.value->>'amount')::text
    FROM ingredients i WHERE LOWER(i.name) = LOWER((v_ingredient.value->>'name')::text)
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  FOR v_instruction IN SELECT * FROM jsonb_array_elements(p_instructions) LOOP
    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES (v_recipe_id, (v_instruction.value->>'step')::integer, (v_instruction.value->>'instruction')::text, (v_instruction.value->>'timer')::integer)
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  FOR v_tag IN SELECT * FROM jsonb_array_elements(p_tags) LOOP
    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES (v_recipe_id, (v_tag.value->>'tag')::text, (v_tag.value->>'type')::text)
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  RAISE NOTICE 'Recipe "%" created successfully', p_title;
  RETURN v_recipe_id;
END;
$$ LANGUAGE plpgsql;

-- Mango Chia Pudding (needs 4+ hours to set)
SELECT insert_recipe_if_not_exists(
  'Mango Chia Pudding',
  'Tropical chia pudding with fresh mango. High in omega-3s, fiber, and antioxidants. Make ahead!',
  'Breakfast', 'Asian', 'Beginner', 250, 240, 8, 32, 10, 9.0, 150,
  'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=400',
  '[{"name": "Chia Seeds", "amount": "1/4 cup"}, {"name": "Coconut Milk", "amount": "1 cup"}, {"name": "Honey", "amount": "2 tbsp"}, {"name": "Vanilla Extract", "amount": "1/2 tsp"}, {"name": "Mango", "amount": "1 cup, diced"}]'::jsonb,
  '[{"step": 1, "instruction": "Mix chia seeds, coconut milk, honey, and vanilla.", "timer": null}, {"step": 2, "instruction": "Refrigerate for at least 4 hours or overnight.", "timer": 240}, {"step": 3, "instruction": "Stir before serving and top with fresh mango.", "timer": null}]'::jsonb,
  '[{"tag": "Vegan", "type": "dietary"}, {"tag": "Vegetarian", "type": "dietary"}, {"tag": "Dairy-Free", "type": "dietary"}, {"tag": "Gluten-Free", "type": "dietary"}, {"tag": "Halal", "type": "dietary"}, {"tag": "Kosher", "type": "dietary"}, {"tag": "High-Fiber", "type": "dietary"}]'::jsonb
);

-- Baked Cinnamon Apples (prep + baking ~35 min total)
SELECT insert_recipe_if_not_exists(
  'Baked Cinnamon Apples',
  'Warm baked apples with cinnamon and walnuts. Naturally sweet and comforting.',
  'Snack', 'American', 'Beginner', 35, 160, 2, 34, 4, 8.5, 120,
  'https://images.unsplash.com/photo-1568571780765-9276ac8f100b?w=400',
  '[{"name": "Apple", "amount": "4 large, cored"}, {"name": "Walnuts", "amount": "1/4 cup, chopped"}, {"name": "Cinnamon", "amount": "2 tsp"}, {"name": "Honey", "amount": "2 tbsp"}]'::jsonb,
  '[{"step": 1, "instruction": "Preheat oven to 375°F (190°C).", "timer": null}, {"step": 2, "instruction": "Mix walnuts, cinnamon, and honey.", "timer": null}, {"step": 3, "instruction": "Stuff each apple with the mixture.", "timer": null}, {"step": 4, "instruction": "Bake for 25-30 minutes until tender.", "timer": 28}, {"step": 5, "instruction": "Serve warm.", "timer": null}]'::jsonb,
  '[{"tag": "Vegetarian", "type": "dietary"}, {"tag": "Gluten-Free", "type": "dietary"}, {"tag": "Kosher", "type": "dietary"}, {"tag": "Halal", "type": "dietary"}, {"tag": "High-Fiber", "type": "dietary"}]'::jsonb
);

-- Baked Turon (prep + baking ~35 min total)
SELECT insert_recipe_if_not_exists(
  'Baked Turon (Banana Spring Rolls)',
  'Healthier baked version of Filipino turon. Crispy banana rolls with brown sugar.',
  'Snack', 'Filipino', 'Beginner', 35, 180, 3, 32, 5, 7.5, 130,
  'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
  '[{"name": "Banana", "amount": "6 pieces, sliced lengthwise"}, {"name": "Brown Sugar", "amount": "1/4 cup"}, {"name": "Cinnamon", "amount": "1 tsp"}, {"name": "Egg", "amount": "1, beaten"}]'::jsonb,
  '[{"step": 1, "instruction": "Preheat oven to 400°F (200°C). Line baking sheet with parchment.", "timer": null}, {"step": 2, "instruction": "Mix brown sugar and cinnamon. Coat banana slices.", "timer": null}, {"step": 3, "instruction": "Wrap each banana in spring roll wrapper. Seal edges with egg.", "timer": null}, {"step": 4, "instruction": "Brush rolls with egg wash.", "timer": null}, {"step": 5, "instruction": "Bake for 20 minutes until golden and crispy.", "timer": 20}]'::jsonb,
  '[{"tag": "Vegetarian", "type": "dietary"}, {"tag": "Filipino", "type": "cuisine"}, {"tag": "Halal", "type": "dietary"}, {"tag": "Kosher", "type": "dietary"}]'::jsonb
);

-- Healthy Halo-Halo
SELECT insert_recipe_if_not_exists(
  'Healthy Halo-Halo',
  'Lighter version of Filipino halo-halo dessert with fresh fruits and coconut milk.',
  'Snack', 'Filipino', 'Beginner', 15, 280, 6, 48, 8, 8.0, 170,
  'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
  '[{"name": "Banana", "amount": "1, sliced"}, {"name": "Mango", "amount": "1/2 cup, diced"}, {"name": "Coconut Milk", "amount": "1/2 cup"}, {"name": "Honey", "amount": "2 tbsp"}, {"name": "Ice", "amount": "2 cups, crushed"}]'::jsonb,
  '[{"step": 1, "instruction": "Layer crushed ice in tall glasses.", "timer": null}, {"step": 2, "instruction": "Add banana and mango pieces.", "timer": null}, {"step": 3, "instruction": "Pour coconut milk and drizzle with honey.", "timer": null}, {"step": 4, "instruction": "Mix well before eating. Serve immediately.", "timer": null}]'::jsonb,
  '[{"tag": "Vegan", "type": "dietary"}, {"tag": "Vegetarian", "type": "dietary"}, {"tag": "Dairy-Free", "type": "dietary"}, {"tag": "Gluten-Free", "type": "dietary"}, {"tag": "Filipino", "type": "cuisine"}, {"tag": "Halal", "type": "dietary"}, {"tag": "Kosher", "type": "dietary"}]'::jsonb
);

-- Healthy Pandan Coconut Cake (prep + baking ~50 min total)
SELECT insert_recipe_if_not_exists(
  'Healthy Pandan Coconut Cake',
  'Light and fluffy pandan cake with reduced sugar. Fragrant and naturally green.',
  'Snack', 'Filipino', 'Intermediate', 50, 210, 5, 32, 8, 7.0, 140,
  'https://images.unsplash.com/photo-1562440499-64c9a74d5c92?w=400',
  '[{"name": "Flour", "amount": "2 cups"}, {"name": "Coconut Milk", "amount": "1 cup"}, {"name": "Egg", "amount": "4"}, {"name": "Honey", "amount": "1/2 cup"}, {"name": "Coconut Oil", "amount": "1/4 cup"}, {"name": "Baking Powder", "amount": "2 tsp"}, {"name": "Vanilla Extract", "amount": "1 tsp"}]'::jsonb,
  '[{"step": 1, "instruction": "Preheat oven to 350°F (175°C). Grease a cake pan.", "timer": null}, {"step": 2, "instruction": "Mix flour and baking powder in a bowl.", "timer": null}, {"step": 3, "instruction": "Beat eggs and honey until fluffy. Add coconut milk, oil, and vanilla.", "timer": null}, {"step": 4, "instruction": "Fold in flour mixture until just combined.", "timer": null}, {"step": 5, "instruction": "Pour into pan. Bake for 30 minutes until golden.", "timer": 30}, {"step": 6, "instruction": "Cool completely before slicing.", "timer": null}]'::jsonb,
  '[{"tag": "Vegetarian", "type": "dietary"}, {"tag": "Filipino", "type": "cuisine"}, {"tag": "Halal", "type": "dietary"}, {"tag": "Kosher", "type": "dietary"}]'::jsonb
);

-- Filipino Fruit Salad with Yogurt (needs 1 hour to chill)
SELECT insert_recipe_if_not_exists(
  'Filipino Fruit Salad with Yogurt',
  'Healthier Filipino fruit salad with Greek yogurt instead of condensed milk.',
  'Snack', 'Filipino', 'Beginner', 75, 190, 7, 34, 3, 8.5, 140,
  'https://images.unsplash.com/photo-1564093497595-593b96d80180?w=400',
  '[{"name": "Apple", "amount": "2, diced"}, {"name": "Banana", "amount": "2, sliced"}, {"name": "Mango", "amount": "1 cup, diced"}, {"name": "Greek Yogurt", "amount": "1 cup"}, {"name": "Honey", "amount": "2 tbsp"}, {"name": "Lemon", "amount": "1, juiced"}]'::jsonb,
  '[{"step": 1, "instruction": "Mix yogurt, honey, and lemon juice for dressing.", "timer": null}, {"step": 2, "instruction": "Combine all fruits in a large bowl.", "timer": null}, {"step": 3, "instruction": "Pour dressing over fruits and toss gently.", "timer": null}, {"step": 4, "instruction": "Refrigerate for 1 hour before serving.", "timer": 60}]'::jsonb,
  '[{"tag": "Vegetarian", "type": "dietary"}, {"tag": "Gluten-Free", "type": "dietary"}, {"tag": "Filipino", "type": "cuisine"}, {"tag": "Halal", "type": "dietary"}, {"tag": "Kosher", "type": "dietary"}, {"tag": "High-Fiber", "type": "dietary"}]'::jsonb
);

-- Healthy Matcha Brownies (prep + baking ~40 min total)
SELECT insert_recipe_if_not_exists(
  'Healthy Matcha Brownies',
  'Fudgy brownies with matcha green tea. Made with natural sweeteners and less fat.',
  'Snack', 'Japanese', 'Intermediate', 40, 150, 4, 22, 6, 7.5, 110,
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
  '[{"name": "Flour", "amount": "1 cup"}, {"name": "Cocoa Powder", "amount": "1/4 cup"}, {"name": "Honey", "amount": "1/2 cup"}, {"name": "Egg", "amount": "2"}, {"name": "Coconut Oil", "amount": "1/4 cup"}, {"name": "Vanilla Extract", "amount": "1 tsp"}, {"name": "Baking Powder", "amount": "1/2 tsp"}]'::jsonb,
  '[{"step": 1, "instruction": "Preheat oven to 350°F (175°C). Line baking pan with parchment.", "timer": null}, {"step": 2, "instruction": "Mix flour, cocoa powder, and baking powder.", "timer": null}, {"step": 3, "instruction": "Beat eggs, honey, oil, and vanilla until smooth.", "timer": null}, {"step": 4, "instruction": "Fold in dry ingredients until just combined.", "timer": null}, {"step": 5, "instruction": "Pour into pan and bake for 25 minutes.", "timer": 25}, {"step": 6, "instruction": "Cool before cutting into squares.", "timer": null}]'::jsonb,
  '[{"tag": "Vegetarian", "type": "dietary"}, {"tag": "Japanese", "type": "cuisine"}, {"tag": "Halal", "type": "dietary"}, {"tag": "Kosher", "type": "dietary"}]'::jsonb
);

-- Clean up
DROP FUNCTION insert_recipe_if_not_exists;
