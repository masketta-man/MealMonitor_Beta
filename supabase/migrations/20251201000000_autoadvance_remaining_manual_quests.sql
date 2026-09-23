-- Make remaining "Group A" challenge tasks auto-advance-compatible.
--
-- These challenges are thematic (seafood, spices, traditional food, etc.) but
-- their core requirement is simply "cook a recipe" — the theme lives in the
-- description, not in something the app can verify. Their task TITLES were
-- written in a form that the challengeService.isAutoAdvanceTask classifier
-- cannot match (wrong verb, wrong noun, or no verb at all), so they were stuck
-- as manual checkboxes.
--
-- Fix: rewrite task titles to "Cook a meal" or "Cook on Day N" patterns while
-- keeping the original description text as context for the user.
--
-- Challenges deliberately left manual (require features the app lacks):
--   - Hydration Hero       — no water-tracking feature
--   - Filipino Food Explorer — requires matching a specific dish name
--   - Low-Calorie Champion  — requires per-recipe calorie threshold checking
--   - No Sugar Week (new)  — handled below (Sugar-Free Day N → Cook on Day N)
--
-- Challenges handled by code (meal_type check added in Task 2):
--   - Breakfast Champion, Lean & Green, Healthy Start — need meal_type matching

-- ===========================================================================
-- No Sugar Week (650e8400-e29b-41d4-a716-446655440009) — 7 tasks
-- "Sugar-Free Day N" → "Cook on Day N"  (same streak pattern as 7-Day Streak)
-- ===========================================================================
UPDATE challenge_tasks SET title = 'Cook on Day 1'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440009' AND order_number = 1;
UPDATE challenge_tasks SET title = 'Cook on Day 2'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440009' AND order_number = 2;
UPDATE challenge_tasks SET title = 'Cook on Day 3'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440009' AND order_number = 3;
UPDATE challenge_tasks SET title = 'Cook on Day 4'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440009' AND order_number = 4;
UPDATE challenge_tasks SET title = 'Cook on Day 5'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440009' AND order_number = 5;
UPDATE challenge_tasks SET title = 'Cook on Day 6'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440009' AND order_number = 6;
UPDATE challenge_tasks SET title = 'Cook on Day 7'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440009' AND order_number = 7;

-- ===========================================================================
-- Seafood Sunday (650e8400-e29b-41d4-a716-446655440008) — 4 tasks
-- Titles like "Grilled Fish Meal", "Seafood Pasta" don't start with a verb.
-- Descriptions keep the seafood context.
-- ===========================================================================
UPDATE challenge_tasks SET title = 'Cook a meal',
  description = 'Prepare a grilled fish dish rich in omega-3'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440008' AND order_number = 1;
UPDATE challenge_tasks SET title = 'Cook a second meal',
  description = 'Cook a delicious seafood pasta dish'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440008' AND order_number = 2;
UPDATE challenge_tasks SET title = 'Cook a third meal',
  description = 'Make a healthy steamed fish or shellfish meal'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440008' AND order_number = 3;
UPDATE challenge_tasks SET title = 'Cook a fourth meal',
  description = 'Prepare a hearty seafood stew or soup'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440008' AND order_number = 4;

-- ===========================================================================
-- Spice Explorer (650e8400-e29b-41d4-a716-446655440014) — 8 tasks
-- "New Spice N" has no verb. Descriptions keep the spice-exploration framing.
-- ===========================================================================
UPDATE challenge_tasks SET title = 'Cook a meal',
  description = 'Cook a recipe with a new spice you haven''t used before'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440014' AND order_number = 1;
UPDATE challenge_tasks SET title = 'Cook a second meal',
  description = 'Try cooking with another unfamiliar spice'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440014' AND order_number = 2;
UPDATE challenge_tasks SET title = 'Cook a third meal',
  description = 'Add a third new spice to your kitchen repertoire'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440014' AND order_number = 3;
UPDATE challenge_tasks SET title = 'Cook a fourth meal',
  description = 'Keep exploring — use your fourth new spice'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440014' AND order_number = 4;
UPDATE challenge_tasks SET title = 'Cook a fifth meal',
  description = 'Halfway through the spice journey'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440014' AND order_number = 5;
UPDATE challenge_tasks SET title = 'Cook a sixth meal',
  description = 'Experiment with a sixth bold spice'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440014' AND order_number = 6;
UPDATE challenge_tasks SET title = 'Cook a seventh meal',
  description = 'Almost there — cook with your seventh new spice'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440014' AND order_number = 7;
UPDATE challenge_tasks SET title = 'Cook an eighth meal',
  description = 'Complete your spice adventure with one final recipe'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440014' AND order_number = 8;

-- ===========================================================================
-- Traditional Tastes (650e8400-e29b-41d4-a716-446655440012) — 5 tasks
-- "Family Recipe N" / "Regional Dish N" / "Heritage Dish" have no verb.
-- ===========================================================================
UPDATE challenge_tasks SET title = 'Cook a meal',
  description = 'Cook your first traditional family recipe'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440012' AND order_number = 1;
UPDATE challenge_tasks SET title = 'Cook a second meal',
  description = 'Prepare a traditional regional dish'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440012' AND order_number = 2;
UPDATE challenge_tasks SET title = 'Cook a third meal',
  description = 'Cook your second traditional family recipe'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440012' AND order_number = 3;
UPDATE challenge_tasks SET title = 'Cook a fourth meal',
  description = 'Prepare another traditional regional dish'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440012' AND order_number = 4;
UPDATE challenge_tasks SET title = 'Cook a fifth meal',
  description = 'Cook a special heritage or celebratory dish'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440012' AND order_number = 5;

-- ===========================================================================
-- Protein Power (650e8400-e29b-41d4-a716-446655440002) — tasks from both old
-- inserts and the transform migration. Update all by challenge_id.
-- Old tasks: "Cook lean chicken breast", "Make a fish dish", etc. — verb is
-- right but noun is not (meal|dish|recipe|something). "Make a fish dish" would
-- actually pass! But "Cook lean chicken breast" fails (noun = "breast").
-- Simplest fix: rewrite all 6 to the generic form.
-- ===========================================================================
UPDATE challenge_tasks SET title = 'Cook a meal',
  description = 'Prepare a high-protein chicken meal (aim for 25g+ protein)'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440002' AND order_number = 1;
UPDATE challenge_tasks SET title = 'Cook a second meal',
  description = 'Cook salmon, tuna, or white fish for an omega-3 boost'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440002' AND order_number = 2;
UPDATE challenge_tasks SET title = 'Cook a third meal',
  description = 'Cook with tofu, tempeh, or legumes for plant-based protein'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440002' AND order_number = 3;
UPDATE challenge_tasks SET title = 'Cook a fourth meal',
  description = 'Cook lean beef or ground meat for a satisfying protein hit'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440002' AND order_number = 4;
UPDATE challenge_tasks SET title = 'Cook a fifth meal',
  description = 'Create a balanced high-protein bowl with multiple sources'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440002' AND order_number = 5;
UPDATE challenge_tasks SET title = 'Cook a sixth meal',
  description = 'Make an egg-based high-protein meal'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440002' AND order_number = 6;

-- ===========================================================================
-- Vegetarian Voyage (by title — no hardcoded UUID in earlier migrations)
-- "Cook with beans or lentils" passes the verb check but "beans" isn't in the
-- noun set. "Try a tofu recipe" fails ("try" is not a starter verb).
-- Rewrite to generic form; descriptions keep the plant-based framing.
-- ===========================================================================
UPDATE challenge_tasks SET title = 'Cook a meal',
  description = 'Make a legume-based meal — beans, lentils, or chickpeas'
  WHERE challenge_id IN (SELECT id FROM challenges WHERE title = 'Vegetarian Voyage')
  AND order_number = 1;
UPDATE challenge_tasks SET title = 'Cook a second meal',
  description = 'Prepare crispy or marinated tofu as the protein'
  WHERE challenge_id IN (SELECT id FROM challenges WHERE title = 'Vegetarian Voyage')
  AND order_number = 2;
UPDATE challenge_tasks SET title = 'Cook a third meal',
  description = 'Cook a colorful vegetable stir-fry'
  WHERE challenge_id IN (SELECT id FROM challenges WHERE title = 'Vegetarian Voyage')
  AND order_number = 3;
UPDATE challenge_tasks SET title = 'Cook a fourth meal',
  description = 'Make pasta with a vegetable-based sauce'
  WHERE challenge_id IN (SELECT id FROM challenges WHERE title = 'Vegetarian Voyage')
  AND order_number = 4;
UPDATE challenge_tasks SET title = 'Cook a fifth meal',
  description = 'Create a Buddha bowl or grain bowl loaded with veggies'
  WHERE challenge_id IN (SELECT id FROM challenges WHERE title = 'Vegetarian Voyage')
  AND order_number = 5;
UPDATE challenge_tasks SET title = 'Cook a sixth meal',
  description = 'Cook portobello or other hearty mushrooms as a meat substitute'
  WHERE challenge_id IN (SELECT id FROM challenges WHERE title = 'Vegetarian Voyage')
  AND order_number = 6;

-- ===========================================================================
-- Dinner Party Host (by title) — 3 tasks
-- "appetizer" and "dessert" are excluded keywords; "Make a show-stopping main"
-- actually passes but is inconsistent. Unify to generic form.
-- ===========================================================================
UPDATE challenge_tasks SET title = 'Cook a meal',
  description = 'Prepare a starter that will wow guests'
  WHERE challenge_id IN (SELECT id FROM challenges WHERE title = 'Dinner Party Host')
  AND order_number = 1;
UPDATE challenge_tasks SET title = 'Cook a second meal',
  description = 'Cook a visually appealing, impressive main course'
  WHERE challenge_id IN (SELECT id FROM challenges WHERE title = 'Dinner Party Host')
  AND order_number = 2;
UPDATE challenge_tasks SET title = 'Cook a third meal',
  description = 'Create a delicious finish to the meal'
  WHERE challenge_id IN (SELECT id FROM challenges WHERE title = 'Dinner Party Host')
  AND order_number = 3;

-- ===========================================================================
-- Zero Waste Chef (by title) — 5 tasks
-- "Use vegetable scraps", "Transform leftovers" etc. — no cook/prepare/make verb.
-- ===========================================================================
UPDATE challenge_tasks SET title = 'Cook a meal',
  description = 'Make broth or cook with vegetable scraps and stems'
  WHERE challenge_id IN (SELECT id FROM challenges WHERE title = 'Zero Waste Chef')
  AND order_number = 1;
UPDATE challenge_tasks SET title = 'Cook a second meal',
  description = 'Turn yesterday''s meal into something new'
  WHERE challenge_id IN (SELECT id FROM challenges WHERE title = 'Zero Waste Chef')
  AND order_number = 2;
UPDATE challenge_tasks SET title = 'Cook a third meal',
  description = 'Use wilting vegetables in soup or stir-fry'
  WHERE challenge_id IN (SELECT id FROM challenges WHERE title = 'Zero Waste Chef')
  AND order_number = 3;
UPDATE challenge_tasks SET title = 'Cook a fourth meal',
  description = 'Combine various leftover ingredients into a creative dish'
  WHERE challenge_id IN (SELECT id FROM challenges WHERE title = 'Zero Waste Chef')
  AND order_number = 4;
UPDATE challenge_tasks SET title = 'Cook a fifth meal',
  description = 'Repurpose stale bread into croutons, breadcrumbs, or bread pudding'
  WHERE challenge_id IN (SELECT id FROM challenges WHERE title = 'Zero Waste Chef')
  AND order_number = 5;
