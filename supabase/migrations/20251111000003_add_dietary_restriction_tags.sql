/*
  # Add Dietary Restriction Tags to Recipes

  Adds appropriate dietary restriction tags to existing recipes based on their ingredients and characteristics.
  This ensures recipe filtering by dietary restrictions works correctly.
*/

-- Add Vegan tag to recipes that are already tagged as vegan or have no animal products
INSERT INTO recipe_tags (recipe_id, tag, tag_type)
SELECT DISTINCT r.id, 'Vegan', 'dietary'
FROM recipes r
WHERE EXISTS (
  SELECT 1 FROM recipe_tags rt 
  WHERE rt.recipe_id = r.id 
  AND LOWER(rt.tag) IN ('vegan', 'plant-based')
)
AND NOT EXISTS (
  SELECT 1 FROM recipe_tags rt2
  WHERE rt2.recipe_id = r.id AND rt2.tag = 'Vegan' AND rt2.tag_type = 'dietary'
)
ON CONFLICT DO NOTHING;

-- Add Vegetarian tag to vegan recipes and recipes with no meat
INSERT INTO recipe_tags (recipe_id, tag, tag_type)
SELECT DISTINCT r.id, 'Vegetarian', 'dietary'
FROM recipes r
WHERE (
  EXISTS (
    SELECT 1 FROM recipe_tags rt 
    WHERE rt.recipe_id = r.id 
    AND LOWER(rt.tag) IN ('vegan', 'vegetarian', 'plant-based')
  )
  OR NOT EXISTS (
    SELECT 1 FROM recipe_ingredients ri
    JOIN ingredients i ON ri.ingredient_id = i.id
    WHERE ri.recipe_id = r.id
    AND LOWER(i.name) SIMILAR TO '%(chicken|beef|pork|lamb|turkey|salmon|shrimp|fish|meat)%'
  )
)
AND NOT EXISTS (
  SELECT 1 FROM recipe_tags rt2
  WHERE rt2.recipe_id = r.id AND rt2.tag = 'Vegetarian' AND rt2.tag_type = 'dietary'
)
ON CONFLICT DO NOTHING;

-- Add Gluten-Free tag to recipes without wheat/gluten ingredients
INSERT INTO recipe_tags (recipe_id, tag, tag_type)
SELECT DISTINCT r.id, 'Gluten-Free', 'dietary'
FROM recipes r
WHERE NOT EXISTS (
  SELECT 1 FROM recipe_ingredients ri
  JOIN ingredients i ON ri.ingredient_id = i.id
  WHERE ri.recipe_id = r.id
  AND LOWER(i.name) SIMILAR TO '%(bread|wheat|flour|pasta|noodle|soy sauce)%'
  AND LOWER(i.name) NOT SIMILAR TO '%(gluten-free|rice)%'
)
AND NOT EXISTS (
  SELECT 1 FROM recipe_tags rt2
  WHERE rt2.recipe_id = r.id AND rt2.tag = 'Gluten-Free' AND rt2.tag_type = 'dietary'
)
ON CONFLICT DO NOTHING;

-- Add Dairy-Free tag to recipes without dairy products
INSERT INTO recipe_tags (recipe_id, tag, tag_type)
SELECT DISTINCT r.id, 'Dairy-Free', 'dietary'
FROM recipes r
WHERE NOT EXISTS (
  SELECT 1 FROM recipe_ingredients ri
  JOIN ingredients i ON ri.ingredient_id = i.id
  WHERE ri.recipe_id = r.id
  AND LOWER(i.name) SIMILAR TO '%(milk|cheese|yogurt|cream|butter|dairy|parmesan|feta)%'
  AND LOWER(i.name) NOT SIMILAR TO '%(almond milk|coconut milk|dairy-free)%'
)
AND NOT EXISTS (
  SELECT 1 FROM recipe_tags rt2
  WHERE rt2.recipe_id = r.id AND rt2.tag = 'Dairy-Free' AND rt2.tag_type = 'dietary'
)
ON CONFLICT DO NOTHING;

-- Add Nut-Free tag to recipes without nuts
INSERT INTO recipe_tags (recipe_id, tag, tag_type)
SELECT DISTINCT r.id, 'Nut-Free', 'dietary'
FROM recipes r
WHERE NOT EXISTS (
  SELECT 1 FROM recipe_ingredients ri
  JOIN ingredients i ON ri.ingredient_id = i.id
  WHERE ri.recipe_id = r.id
  AND LOWER(i.name) SIMILAR TO '%(almond|peanut|cashew|walnut|pecan|pistachio|hazelnut|pine nut)%'
)
AND NOT EXISTS (
  SELECT 1 FROM recipe_tags rt2
  WHERE rt2.recipe_id = r.id AND rt2.tag = 'Nut-Free' AND rt2.tag_type = 'dietary'
)
ON CONFLICT DO NOTHING;

-- Add High-Protein tag to recipes with protein >= 20g
INSERT INTO recipe_tags (recipe_id, tag, tag_type)
SELECT DISTINCT r.id, 'High-Protein', 'dietary'
FROM recipes r
WHERE r.protein >= 20
AND NOT EXISTS (
  SELECT 1 FROM recipe_tags rt2
  WHERE rt2.recipe_id = r.id AND rt2.tag = 'High-Protein' AND rt2.tag_type = 'dietary'
)
ON CONFLICT DO NOTHING;

-- Add Low-Carb tag to recipes with carbs <= 20g
INSERT INTO recipe_tags (recipe_id, tag, tag_type)
SELECT DISTINCT r.id, 'Low-Carb', 'dietary'
FROM recipes r
WHERE r.carbs <= 20
AND NOT EXISTS (
  SELECT 1 FROM recipe_tags rt2
  WHERE rt2.recipe_id = r.id AND rt2.tag = 'Low-Carb' AND rt2.tag_type = 'dietary'
)
ON CONFLICT DO NOTHING;

-- Add Keto tag to recipes with low carbs and high fat
INSERT INTO recipe_tags (recipe_id, tag, tag_type)
SELECT DISTINCT r.id, 'Keto', 'dietary'
FROM recipes r
WHERE r.carbs <= 10 AND r.fat >= 15
AND NOT EXISTS (
  SELECT 1 FROM recipe_tags rt2
  WHERE rt2.recipe_id = r.id AND rt2.tag = 'Keto' AND rt2.tag_type = 'dietary'
)
ON CONFLICT DO NOTHING;
