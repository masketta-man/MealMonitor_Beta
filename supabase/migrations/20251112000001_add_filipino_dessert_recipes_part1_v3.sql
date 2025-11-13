/*
  # Add Filipino, International, and Dessert Recipes - Part 1 (v3 - NO DUPLICATES)
  
  This migration adds NEW recipes only (removed duplicates that already exist):
  - Greek Yogurt Berry Parfait
  - Dark Chocolate Avocado Mousse
  
  REMOVED (already exist in older migrations):
  - Healthy Chicken Adobo (exists as "Filipino Chicken Adobo")
  - Pinakbet (already exists)
  - Mediterranean Quinoa Bowl (already exists)
*/

-- Helper function to safely insert recipe if it doesn't exist
CREATE OR REPLACE FUNCTION insert_recipe_if_not_exists(
  p_title text,
  p_description text,
  p_meal_type text,
  p_cuisine_type text,
  p_difficulty text,
  p_prep_time integer,
  p_calories integer,
  p_protein integer,
  p_carbs integer,
  p_fat integer,
  p_nutrition_score numeric,
  p_points integer,
  p_image_url text,
  p_ingredients jsonb,
  p_instructions jsonb,
  p_tags jsonb
) RETURNS uuid AS $$
DECLARE
  v_recipe_id uuid;
  v_ingredient record;
  v_instruction record;
  v_tag record;
BEGIN
  -- Check if recipe exists
  SELECT id INTO v_recipe_id FROM recipes WHERE title = p_title;
  
  IF v_recipe_id IS NOT NULL THEN
    RAISE NOTICE 'Recipe "%" already exists, skipping...', p_title;
    RETURN v_recipe_id;
  END IF;
  
  -- Insert recipe
  INSERT INTO recipes (
    title, description, meal_type, cuisine_type, difficulty,
    prep_time, calories, protein, carbs, fat,
    nutrition_score, points, image_url
  ) VALUES (
    p_title, p_description, p_meal_type, p_cuisine_type, p_difficulty,
    p_prep_time, p_calories, p_protein, p_carbs, p_fat,
    p_nutrition_score, p_points, p_image_url
  ) RETURNING id INTO v_recipe_id;
  
  -- Insert ingredients
  FOR v_ingredient IN SELECT * FROM jsonb_array_elements(p_ingredients)
  LOOP
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount)
    SELECT 
      v_recipe_id,
      i.id,
      (v_ingredient.value->>'amount')::text
    FROM ingredients i
    WHERE LOWER(i.name) = LOWER((v_ingredient.value->>'name')::text)
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  -- Insert instructions
  FOR v_instruction IN SELECT * FROM jsonb_array_elements(p_instructions)
  LOOP
    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES (
      v_recipe_id,
      (v_instruction.value->>'step')::integer,
      (v_instruction.value->>'instruction')::text,
      (v_instruction.value->>'timer')::integer
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  -- Insert tags
  FOR v_tag IN SELECT * FROM jsonb_array_elements(p_tags)
  LOOP
    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES (
      v_recipe_id,
      (v_tag.value->>'tag')::text,
      (v_tag.value->>'type')::text
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  RAISE NOTICE 'Recipe "%" created successfully', p_title;
  RETURN v_recipe_id;
END;
$$ LANGUAGE plpgsql;

-- Insert Greek Yogurt Berry Parfait
SELECT insert_recipe_if_not_exists(
  'Greek Yogurt Berry Parfait',
  'Layered Greek yogurt with mixed berries and honey. High protein, low sugar dessert.',
  'Snack', 'American', 'Beginner', 10, 220, 18, 28, 4, 8.8, 140,
  'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
  '[
    {"name": "Greek Yogurt", "amount": "2 cups, plain"},
    {"name": "Strawberries", "amount": "1/2 cup, sliced"},
    {"name": "Blueberries", "amount": "1/2 cup"},
    {"name": "Honey", "amount": "2 tbsp"}
  ]'::jsonb,
  '[
    {"step": 1, "instruction": "Layer yogurt at the bottom of glasses.", "timer": null},
    {"step": 2, "instruction": "Add mixed berries layer.", "timer": null},
    {"step": 3, "instruction": "Drizzle with honey.", "timer": null},
    {"step": 4, "instruction": "Repeat layers and serve immediately.", "timer": null}
  ]'::jsonb,
  '[
    {"tag": "Vegetarian", "type": "dietary"},
    {"tag": "Kosher", "type": "dietary"},
    {"tag": "Halal", "type": "dietary"},
    {"tag": "High-Protein", "type": "dietary"},
    {"tag": "Gluten-Free", "type": "dietary"}
  ]'::jsonb
);

-- Insert Dark Chocolate Avocado Mousse
SELECT insert_recipe_if_not_exists(
  'Dark Chocolate Avocado Mousse',
  'Creamy chocolate mousse made with avocado. Rich in healthy fats and antioxidants.',
  'Snack', 'French', 'Beginner', 10, 180, 3, 22, 12, 8.2, 120,
  'https://images.unsplash.com/photo-1541599468348-e96984315921?w=400',
  '[
    {"name": "Avocado", "amount": "2 ripe, pitted"},
    {"name": "Cocoa Powder", "amount": "1/3 cup"},
    {"name": "Maple Syrup", "amount": "1/4 cup"},
    {"name": "Vanilla Extract", "amount": "1 tsp"},
    {"name": "Almond Milk", "amount": "1/4 cup"}
  ]'::jsonb,
  '[
    {"step": 1, "instruction": "Blend all ingredients until smooth and creamy.", "timer": null},
    {"step": 2, "instruction": "Taste and adjust sweetness if needed.", "timer": null},
    {"step": 3, "instruction": "Refrigerate for 30 minutes before serving.", "timer": 30}
  ]'::jsonb,
  '[
    {"tag": "Vegan", "type": "dietary"},
    {"tag": "Vegetarian", "type": "dietary"},
    {"tag": "Dairy-Free", "type": "dietary"},
    {"tag": "Gluten-Free", "type": "dietary"},
    {"tag": "Halal", "type": "dietary"},
    {"tag": "Kosher", "type": "dietary"}
  ]'::jsonb
);

-- Clean up helper function
DROP FUNCTION insert_recipe_if_not_exists;
