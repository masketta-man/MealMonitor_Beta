/*
  # Deduplicate Ingredients

  Removes duplicate ingredients with different capitalizations.
  Keeps the properly capitalized version (Title Case) when available.
  Updates all references in recipe_ingredients and user_ingredients.
*/

-- Create a temporary table to store ingredient mappings (duplicate -> canonical)
CREATE TEMP TABLE ingredient_mapping AS
WITH ranked_ingredients AS (
  SELECT 
    id,
    name,
    LOWER(name) as normalized_name,
    category,
    -- Rank ingredients: prefer Title Case, then first alphabetically
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(name) 
      ORDER BY 
        -- Prefer proper Title Case (first letter upper, rest lower)
        CASE WHEN name ~ '^[A-Z][a-z]' THEN 0 ELSE 1 END,
        name
    ) as rn
  FROM ingredients
),
duplicates AS (
  SELECT 
    id,
    name,
    normalized_name,
    category,
    FIRST_VALUE(id) OVER (PARTITION BY normalized_name ORDER BY 
      CASE WHEN name ~ '^[A-Z][a-z]' THEN 0 ELSE 1 END,
      name
    ) as canonical_id
  FROM ranked_ingredients
)
SELECT 
  id as duplicate_id,
  canonical_id,
  name as duplicate_name,
  normalized_name
FROM duplicates
WHERE id != canonical_id;

-- Update recipe_ingredients to use canonical ingredient IDs
UPDATE recipe_ingredients ri
SET ingredient_id = im.canonical_id
FROM ingredient_mapping im
WHERE ri.ingredient_id = im.duplicate_id;

-- Update user_ingredients to use canonical ingredient IDs
-- First, handle cases where user might have both versions
WITH user_dupe_check AS (
  SELECT 
    ui.user_id,
    im.canonical_id,
    COUNT(*) as count
  FROM user_ingredients ui
  JOIN ingredient_mapping im ON ui.ingredient_id = im.duplicate_id
  GROUP BY ui.user_id, im.canonical_id
  HAVING COUNT(*) > 1
)
-- Delete duplicate user_ingredients (keep the one with most recent update)
DELETE FROM user_ingredients
WHERE id IN (
  SELECT ui.id
  FROM user_ingredients ui
  JOIN ingredient_mapping im ON ui.ingredient_id = im.duplicate_id
  WHERE EXISTS (
    SELECT 1 FROM user_ingredients ui2
    WHERE ui2.user_id = ui.user_id
    AND ui2.ingredient_id = im.canonical_id
    AND ui2.updated_at > ui.updated_at
  )
);

-- Now update remaining duplicate references
UPDATE user_ingredients ui
SET ingredient_id = im.canonical_id
FROM ingredient_mapping im
WHERE ui.ingredient_id = im.duplicate_id;

-- Delete duplicate ingredients
DELETE FROM ingredients
WHERE id IN (SELECT duplicate_id FROM ingredient_mapping);

-- Log the cleanup
DO $$
DECLARE
  duplicate_count INT;
BEGIN
  SELECT COUNT(*) INTO duplicate_count FROM ingredient_mapping;
  RAISE NOTICE 'Cleaned up % duplicate ingredient entries', duplicate_count;
END $$;
