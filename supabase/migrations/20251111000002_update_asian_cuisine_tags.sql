/*
  # Update Asian Cuisine Tags

  Add "Asian" tag to all Asia-related cuisines and make cuisine types more specific.
  
  Asian cuisines include: Thai, Korean, Japanese, Vietnamese, Chinese, Indian
*/

-- Add "Asian" tag to Teriyaki Tofu Stir-Fry and update cuisine to Japanese
UPDATE recipes 
SET cuisine_type = 'Japanese' 
WHERE id = 'a10e8400-e29b-41d4-a716-446655440011' AND cuisine_type = 'Asian';

INSERT INTO recipe_tags (recipe_id, tag, tag_type)
VALUES ('a10e8400-e29b-41d4-a716-446655440011', 'Japanese', 'cuisine')
ON CONFLICT DO NOTHING;

-- Add "Asian" tag to Lentil Curry (Indian cuisine)
INSERT INTO recipe_tags (recipe_id, tag, tag_type)
VALUES ('a10e8400-e29b-41d4-a716-446655440012', 'Asian', 'cuisine')
ON CONFLICT DO NOTHING;

-- Add "Asian" tag to Chicken Pho (Vietnamese cuisine)
INSERT INTO recipe_tags (recipe_id, tag, tag_type)
VALUES ('a10e8400-e29b-41d4-a716-446655440014', 'Asian', 'cuisine')
ON CONFLICT DO NOTHING;

-- Now add "Asian" tag to all existing Asian cuisine recipes from previous migrations
-- Thai recipes
INSERT INTO recipe_tags (recipe_id, tag, tag_type)
SELECT r.id, 'Asian', 'cuisine'
FROM recipes r
WHERE r.cuisine_type = 'Thai'
  AND NOT EXISTS (
    SELECT 1 FROM recipe_tags rt 
    WHERE rt.recipe_id = r.id AND rt.tag = 'Asian'
  );

-- Korean recipes
INSERT INTO recipe_tags (recipe_id, tag, tag_type)
SELECT r.id, 'Asian', 'cuisine'
FROM recipes r
WHERE r.cuisine_type = 'Korean'
  AND NOT EXISTS (
    SELECT 1 FROM recipe_tags rt 
    WHERE rt.recipe_id = r.id AND rt.tag = 'Asian'
  );

-- Japanese recipes
INSERT INTO recipe_tags (recipe_id, tag, tag_type)
SELECT r.id, 'Asian', 'cuisine'
FROM recipes r
WHERE r.cuisine_type = 'Japanese'
  AND NOT EXISTS (
    SELECT 1 FROM recipe_tags rt 
    WHERE rt.recipe_id = r.id AND rt.tag = 'Asian'
  );

-- Vietnamese recipes
INSERT INTO recipe_tags (recipe_id, tag, tag_type)
SELECT r.id, 'Asian', 'cuisine'
FROM recipes r
WHERE r.cuisine_type = 'Vietnamese'
  AND NOT EXISTS (
    SELECT 1 FROM recipe_tags rt 
    WHERE rt.recipe_id = r.id AND rt.tag = 'Asian'
  );

-- Chinese recipes
INSERT INTO recipe_tags (recipe_id, tag, tag_type)
SELECT r.id, 'Asian', 'cuisine'
FROM recipes r
WHERE r.cuisine_type = 'Chinese'
  AND NOT EXISTS (
    SELECT 1 FROM recipe_tags rt 
    WHERE rt.recipe_id = r.id AND rt.tag = 'Asian'
  );

-- Indian recipes
INSERT INTO recipe_tags (recipe_id, tag, tag_type)
SELECT r.id, 'Asian', 'cuisine'
FROM recipes r
WHERE r.cuisine_type = 'Indian'
  AND NOT EXISTS (
    SELECT 1 FROM recipe_tags rt 
    WHERE rt.recipe_id = r.id AND rt.tag = 'Asian'
  );
