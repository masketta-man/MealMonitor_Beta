/*
  # Add Halal and Kosher Dietary Restriction Tags
  
  ## Changes
  This migration adds support for halal and kosher dietary restrictions by:
  1. Creating tag categories if they don't exist
  2. Adding halal and kosher tags to both the enhanced tagging system (tags table)
  3. Adding halal and kosher tags to legacy system (recipe_tags table) for backward compatibility
  4. Auto-tagging recipes as halal/kosher based on ingredients analysis
  
  ## Background
  The filtering logic in recommendationService.ts and recipeService.ts now properly filters
  recipes based on halal and kosher restrictions, but recipes need to be tagged for this to work.
  
  ## Affected Tables
  - tag_categories (enhanced system)
  - tags (enhanced system)
  - recipe_tag_mappings (enhanced system)
  - recipe_tags (legacy system - for backward compatibility)
*/

-- =============================================
-- 1. ENSURE DIETARY TAG CATEGORY EXISTS
-- =============================================

-- Insert dietary category if it doesn't exist
INSERT INTO tag_categories (name, description, icon, display_order, is_active)
VALUES (
  'dietary',
  'Dietary preferences and restrictions (vegetarian, vegan, halal, kosher, etc.)',
  'nutrition',
  1,
  true
)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 2. ADD HALAL AND KOSHER TO ENHANCED TAG SYSTEM
-- =============================================

-- Insert Halal tag
INSERT INTO tags (
  name,
  slug,
  category_id,
  description,
  base_weight,
  relevance_score,
  is_system_tag,
  is_approved,
  is_active,
  synonyms,
  related_terms
)
VALUES (
  'Halal',
  'halal',
  (SELECT id FROM tag_categories WHERE name = 'dietary' LIMIT 1),
  'Food prepared according to Islamic dietary laws. No pork, alcohol, or non-halal meat.',
  2.0,  -- Higher weight as it's a strong restriction
  1.5,  -- High relevance for filtering
  true, -- System tag
  true, -- Auto-approved
  true, -- Active
  ARRAY['halal-certified', 'islamic-dietary', 'zabihah'],
  ARRAY['muslim', 'islamic', 'permissible', 'lawful']
)
ON CONFLICT (slug) 
DO UPDATE SET
  is_system_tag = true,
  is_approved = true,
  is_active = true,
  base_weight = 2.0,
  relevance_score = 1.5,
  updated_at = now();

-- Insert Kosher tag
INSERT INTO tags (
  name,
  slug,
  category_id,
  description,
  base_weight,
  relevance_score,
  is_system_tag,
  is_approved,
  is_active,
  synonyms,
  related_terms
)
VALUES (
  'Kosher',
  'kosher',
  (SELECT id FROM tag_categories WHERE name = 'dietary' LIMIT 1),
  'Food prepared according to Jewish dietary laws (kashrut). No pork, shellfish, or mixing meat with dairy.',
  2.0,  -- Higher weight as it's a strong restriction
  1.5,  -- High relevance for filtering
  true, -- System tag
  true, -- Auto-approved
  true, -- Active
  ARRAY['kosher-certified', 'kashrut', 'pareve', 'parve'],
  ARRAY['jewish', 'kashrut', 'kosher-style', 'kosher-certified']
)
ON CONFLICT (slug) 
DO UPDATE SET
  is_system_tag = true,
  is_approved = true,
  is_active = true,
  base_weight = 2.0,
  relevance_score = 1.5,
  updated_at = now();

-- =============================================
-- 3. AUTO-TAG RECIPES AS HALAL (Enhanced System)
-- =============================================

-- Tag recipes as Halal if they don't contain prohibited ingredients
-- Halal restrictions: No pork, no alcohol, no non-halal meat (beef/lamb must be zabihah)
-- For simplicity, we'll tag recipes without pork/alcohol as potentially halal
INSERT INTO recipe_tag_mappings (
  recipe_id,
  tag_id,
  relevance_weight,
  confidence_score,
  source
)
SELECT DISTINCT 
  r.id,
  (SELECT id FROM tags WHERE slug = 'halal' LIMIT 1),
  1.5,  -- High relevance
  0.7,  -- 70% confidence (may need manual verification)
  'auto_generated'
FROM recipes r
WHERE NOT EXISTS (
  -- Exclude recipes with pork
  SELECT 1 FROM recipe_ingredients ri
  JOIN ingredients i ON ri.ingredient_id = i.id
  WHERE ri.recipe_id = r.id
  AND LOWER(i.name) SIMILAR TO '%(pork|bacon|ham|prosciutto|pancetta|chorizo|sausage with pork)%'
)
AND NOT EXISTS (
  -- Exclude recipes with alcohol
  SELECT 1 FROM recipe_ingredients ri
  JOIN ingredients i ON ri.ingredient_id = i.id
  WHERE ri.recipe_id = r.id
  AND LOWER(i.name) SIMILAR TO '%(wine|beer|rum|vodka|whiskey|brandy|alcohol|liquor|sake|mirin)%'
)
AND NOT EXISTS (
  -- Don't duplicate if already tagged
  SELECT 1 FROM recipe_tag_mappings rtm
  WHERE rtm.recipe_id = r.id 
  AND rtm.tag_id = (SELECT id FROM tags WHERE slug = 'halal' LIMIT 1)
)
ON CONFLICT (recipe_id, tag_id) DO NOTHING;

-- =============================================
-- 4. AUTO-TAG RECIPES AS KOSHER (Enhanced System)
-- =============================================

-- Tag recipes as Kosher if they don't contain prohibited ingredients
-- Kosher restrictions: No pork, no shellfish, no mixing meat with dairy
INSERT INTO recipe_tag_mappings (
  recipe_id,
  tag_id,
  relevance_weight,
  confidence_score,
  source
)
SELECT DISTINCT 
  r.id,
  (SELECT id FROM tags WHERE slug = 'kosher' LIMIT 1),
  1.5,  -- High relevance
  0.7,  -- 70% confidence (may need manual verification)
  'auto_generated'
FROM recipes r
WHERE NOT EXISTS (
  -- Exclude recipes with pork
  SELECT 1 FROM recipe_ingredients ri
  JOIN ingredients i ON ri.ingredient_id = i.id
  WHERE ri.recipe_id = r.id
  AND LOWER(i.name) SIMILAR TO '%(pork|bacon|ham|prosciutto|pancetta)%'
)
AND NOT EXISTS (
  -- Exclude recipes with shellfish
  SELECT 1 FROM recipe_ingredients ri
  JOIN ingredients i ON ri.ingredient_id = i.id
  WHERE ri.recipe_id = r.id
  AND LOWER(i.name) SIMILAR TO '%(shrimp|lobster|crab|oyster|clam|mussel|shellfish|scallop|crawfish)%'
)
AND NOT EXISTS (
  -- Exclude recipes that mix meat and dairy (simplified check)
  SELECT 1 FROM recipe_ingredients ri1
  JOIN ingredients i1 ON ri1.ingredient_id = i1.id
  WHERE ri1.recipe_id = r.id
  AND LOWER(i1.name) SIMILAR TO '%(chicken|beef|lamb|turkey|meat)%'
  AND EXISTS (
    SELECT 1 FROM recipe_ingredients ri2
    JOIN ingredients i2 ON ri2.ingredient_id = i2.id
    WHERE ri2.recipe_id = r.id
    AND LOWER(i2.name) SIMILAR TO '%(milk|cheese|yogurt|cream|butter|dairy|parmesan|mozzarella)%'
  )
)
AND NOT EXISTS (
  -- Don't duplicate if already tagged
  SELECT 1 FROM recipe_tag_mappings rtm
  WHERE rtm.recipe_id = r.id 
  AND rtm.tag_id = (SELECT id FROM tags WHERE slug = 'kosher' LIMIT 1)
)
ON CONFLICT (recipe_id, tag_id) DO NOTHING;

-- =============================================
-- 5. ADD TO LEGACY RECIPE_TAGS (Backward Compatibility)
-- =============================================

-- Add Halal to legacy recipe_tags for recipes tagged in the enhanced system
INSERT INTO recipe_tags (recipe_id, tag, tag_type)
SELECT DISTINCT 
  rtm.recipe_id,
  'Halal',
  'dietary'
FROM recipe_tag_mappings rtm
WHERE rtm.tag_id = (SELECT id FROM tags WHERE slug = 'halal' LIMIT 1)
AND NOT EXISTS (
  SELECT 1 FROM recipe_tags rt
  WHERE rt.recipe_id = rtm.recipe_id 
  AND LOWER(rt.tag) = 'halal'
)
ON CONFLICT DO NOTHING;

-- Add Kosher to legacy recipe_tags for recipes tagged in the enhanced system
INSERT INTO recipe_tags (recipe_id, tag, tag_type)
SELECT DISTINCT 
  rtm.recipe_id,
  'Kosher',
  'dietary'
FROM recipe_tag_mappings rtm
WHERE rtm.tag_id = (SELECT id FROM tags WHERE slug = 'kosher' LIMIT 1)
AND NOT EXISTS (
  SELECT 1 FROM recipe_tags rt
  WHERE rt.recipe_id = rtm.recipe_id 
  AND LOWER(rt.tag) = 'kosher'
)
ON CONFLICT DO NOTHING;

-- =============================================
-- 6. UPDATE TAG USAGE COUNTS
-- =============================================

-- Update usage counts for halal tag
UPDATE tags
SET usage_count = (
  SELECT COUNT(*) 
  FROM recipe_tag_mappings rtm 
  WHERE rtm.tag_id = tags.id
),
updated_at = now()
WHERE slug IN ('halal', 'kosher');

-- =============================================
-- 7. CREATE TAG RELATIONSHIPS
-- =============================================

-- Halal and Kosher have some similarities (both exclude pork)
INSERT INTO tag_relationships (tag_id, related_tag_id, relationship_type, strength)
SELECT 
  (SELECT id FROM tags WHERE slug = 'halal' LIMIT 1),
  (SELECT id FROM tags WHERE slug = 'kosher' LIMIT 1),
  'similar',
  0.6
WHERE EXISTS (SELECT 1 FROM tags WHERE slug = 'halal')
  AND EXISTS (SELECT 1 FROM tags WHERE slug = 'kosher')
ON CONFLICT DO NOTHING;

INSERT INTO tag_relationships (tag_id, related_tag_id, relationship_type, strength)
SELECT
  (SELECT id FROM tags WHERE slug = 'kosher' LIMIT 1),
  (SELECT id FROM tags WHERE slug = 'halal' LIMIT 1),
  'similar',
  0.6
WHERE EXISTS (SELECT 1 FROM tags WHERE slug = 'kosher')
  AND EXISTS (SELECT 1 FROM tags WHERE slug = 'halal')
ON CONFLICT DO NOTHING;

-- Both are related to religious dietary laws (only if vegetarian tag exists)
INSERT INTO tag_relationships (tag_id, related_tag_id, relationship_type, strength)
SELECT
  (SELECT id FROM tags WHERE slug = 'halal' LIMIT 1),
  (SELECT id FROM tags WHERE slug = 'vegetarian' LIMIT 1),
  'related',
  0.4
WHERE EXISTS (SELECT 1 FROM tags WHERE slug = 'halal')
  AND EXISTS (SELECT 1 FROM tags WHERE slug = 'vegetarian')
ON CONFLICT DO NOTHING;

INSERT INTO tag_relationships (tag_id, related_tag_id, relationship_type, strength)
SELECT
  (SELECT id FROM tags WHERE slug = 'kosher' LIMIT 1),
  (SELECT id FROM tags WHERE slug = 'vegetarian' LIMIT 1),
  'related',
  0.4
WHERE EXISTS (SELECT 1 FROM tags WHERE slug = 'kosher')
  AND EXISTS (SELECT 1 FROM tags WHERE slug = 'vegetarian')
ON CONFLICT DO NOTHING;

-- =============================================
-- VERIFICATION QUERY (Comment out after running)
-- =============================================

/*
-- To verify the migration worked, run these queries:

-- Check if tags were created
SELECT * FROM tags WHERE slug IN ('halal', 'kosher');

-- Count recipes tagged as halal
SELECT COUNT(*) as halal_recipe_count 
FROM recipe_tag_mappings rtm
JOIN tags t ON rtm.tag_id = t.id
WHERE t.slug = 'halal';

-- Count recipes tagged as kosher
SELECT COUNT(*) as kosher_recipe_count 
FROM recipe_tag_mappings rtm
JOIN tags t ON rtm.tag_id = t.id
WHERE t.slug = 'kosher';

-- View sample halal recipes
SELECT r.id, r.title, r.meal_type
FROM recipes r
JOIN recipe_tag_mappings rtm ON r.id = rtm.recipe_id
JOIN tags t ON rtm.tag_id = t.id
WHERE t.slug = 'halal'
LIMIT 10;

-- Check legacy recipe_tags
SELECT COUNT(*) FROM recipe_tags WHERE LOWER(tag) IN ('halal', 'kosher');
*/
