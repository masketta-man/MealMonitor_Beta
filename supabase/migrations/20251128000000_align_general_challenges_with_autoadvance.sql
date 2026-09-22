-- Align a focused set of general-purpose cooking challenges with the auto-advance
-- quest system: their tasks should tick off when the user cooks any recipe,
-- rather than needing a manual checkbox.
--
-- Only challenges whose intent is genuinely "just cook a meal" are converted.
-- Themed challenges (cultural, calorie/protein/veggie-specific, spice, zero-waste,
-- hydration) are intentionally left manual, because their whole point is cooking a
-- particular thing the app cannot verify from a bare completion — and because
-- converting them all would erase the variety in the quest list.
--
-- Task titles are rewritten to match challengeService.isAutoAdvanceTask:
--   - "Cook on Day N"  (streak form), or
--   - "Cook a meal" / "Make a meal" (generic form: cook|prepare|make + meal/dish/recipe,
--     with no cuisine / meal-type / nutrition keyword that the classifier excludes).
-- Task descriptions still carry the flavour, so the challenge keeps its character.

-- Kitchen Newbie (Beginner, 3 tasks) — the starter challenge; must progress from cooking.
UPDATE challenge_tasks SET title = 'Cook a meal',
  description = 'Cook your very first recipe in the app'
  WHERE challenge_id = '9a795e08-3d21-4b67-af2f-f3e03c3d0e9b' AND order_number = 1;
UPDATE challenge_tasks SET title = 'Cook another meal',
  description = 'Try something new for your second dish'
  WHERE challenge_id = '9a795e08-3d21-4b67-af2f-f3e03c3d0e9b' AND order_number = 2;
UPDATE challenge_tasks SET title = 'Make a complete meal',
  description = 'Put it all together and cook a full meal'
  WHERE challenge_id = '9a795e08-3d21-4b67-af2f-f3e03c3d0e9b' AND order_number = 3;

-- Quick Cook Challenge (Productivity, 6 tasks)
UPDATE challenge_tasks SET title = 'Cook on Day 1', description = 'Whip up a quick meal'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440011' AND order_number = 1;
UPDATE challenge_tasks SET title = 'Cook on Day 2', description = 'Keep it fast and simple'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440011' AND order_number = 2;
UPDATE challenge_tasks SET title = 'Cook on Day 3', description = 'Another speedy dish'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440011' AND order_number = 3;
UPDATE challenge_tasks SET title = 'Cook on Day 4', description = 'Quick cooking, day four'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440011' AND order_number = 4;
UPDATE challenge_tasks SET title = 'Cook on Day 5', description = 'Fast meal number five'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440011' AND order_number = 5;
UPDATE challenge_tasks SET title = 'Cook on Day 6', description = 'Finish the week strong'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440011' AND order_number = 6;

-- Rainbow Plate (Nutrition, 5 tasks)
UPDATE challenge_tasks SET title = 'Cook a meal', description = 'Cook a colourful, veggie-rich plate'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440010' AND order_number = 1;
UPDATE challenge_tasks SET title = 'Cook a second meal', description = 'Add more colours to your plate'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440010' AND order_number = 2;
UPDATE challenge_tasks SET title = 'Cook a third meal', description = 'Keep the rainbow going'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440010' AND order_number = 3;
UPDATE challenge_tasks SET title = 'Cook a fourth meal', description = 'Another vibrant dish'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440010' AND order_number = 4;
UPDATE challenge_tasks SET title = 'Cook a fifth meal', description = 'Complete your rainbow week'
  WHERE challenge_id = '650e8400-e29b-41d4-a716-446655440010' AND order_number = 5;

-- Meal Prep Master (Skills, easy, 3 tasks)
UPDATE challenge_tasks SET title = 'Cook a meal', description = 'Batch cook a protein to prep ahead'
  WHERE challenge_id = '14d1f683-7653-4d20-90f1-b6fd459579c8' AND order_number = 1;
UPDATE challenge_tasks SET title = 'Cook another meal', description = 'Make a grain base for the week'
  WHERE challenge_id = '14d1f683-7653-4d20-90f1-b6fd459579c8' AND order_number = 2;
UPDATE challenge_tasks SET title = 'Make a meal', description = 'Prep a ready-to-go meal'
  WHERE challenge_id = '14d1f683-7653-4d20-90f1-b6fd459579c8' AND order_number = 3;
