-- Adds a per-category popularity rank.
--
-- Ranking ingredients globally by recipe_count is dominated by seasonings and
-- condiments: garlic appears in 28 recipes and salt in 15, while the most common
-- protein (eggs) appears in 9. A flat "top N" therefore offers a new user a list
-- of accessory ingredients rather than the substantial things they actually think
-- of as being in their kitchen. Ranking within category lets the caller take a
-- balanced quota from each.
CREATE OR REPLACE VIEW popular_ingredients AS
SELECT
  i.id,
  i.name,
  i.category,
  COUNT(DISTINCT ri.recipe_id)::int AS recipe_count,
  ROW_NUMBER() OVER (
    PARTITION BY i.category
    ORDER BY COUNT(DISTINCT ri.recipe_id) DESC, i.name
  )::int AS category_rank
FROM ingredients i
JOIN recipe_ingredients ri ON ri.ingredient_id = i.id
GROUP BY i.id, i.name, i.category;

COMMENT ON VIEW popular_ingredients IS 'Ingredients ranked by distinct recipe usage, both overall and within category; drives the onboarding pantry starter list.';
