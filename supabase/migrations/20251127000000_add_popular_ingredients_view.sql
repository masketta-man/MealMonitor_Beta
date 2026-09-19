-- Ranks ingredients by how many distinct recipes call for them.
--
-- Used to offer a new user a short list of high-leverage staples during
-- onboarding: ingredient match carries real weight in recommendation scoring, so
-- a user with an empty pantry sees 0% match on everything and none of the
-- "Ready to Cook" affordances on day one.
CREATE OR REPLACE VIEW popular_ingredients AS
SELECT
  i.id,
  i.name,
  i.category,
  COUNT(DISTINCT ri.recipe_id)::int AS recipe_count
FROM ingredients i
JOIN recipe_ingredients ri ON ri.ingredient_id = i.id
GROUP BY i.id, i.name, i.category;

COMMENT ON VIEW popular_ingredients IS 'Ingredients ranked by distinct recipe usage; drives the onboarding pantry starter list.';
