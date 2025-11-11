/*
  # Add Missing Challenge Tasks

  ## Summary
  This migration adds the missing challenge tasks for challenges that had total_tasks 
  defined but no actual task records.

  ## Changes Made
  - Adds challenge_tasks for Hydration Hero (14 tasks)
  - Adds challenge_tasks for Filipino Food Explorer (8 tasks)
  - Adds challenge_tasks for Meal Prep Master (5 tasks)
  - Adds challenge_tasks for Low-Calorie Champion (10 tasks)
  - Adds challenge_tasks for Seafood Sunday (4 tasks)
  - Adds challenge_tasks for No Sugar Week (7 tasks)
  - Adds challenge_tasks for Rainbow Plate (5 tasks)
  - Adds challenge_tasks for Quick Cook Challenge (6 tasks)
  - Adds challenge_tasks for Traditional Tastes (5 tasks)
  - Adds challenge_tasks for Lean & Green (10 tasks)
  - Adds challenge_tasks for Spice Explorer (8 tasks)
*/

-- =============================================
-- Hydration Hero (14 tasks)
-- =============================================
INSERT INTO challenge_tasks (challenge_id, title, description, order_number) VALUES
  ('650e8400-e29b-41d4-a716-446655440004', 'Track Water Day 1', 'Track your water intake for the first day', 1),
  ('650e8400-e29b-41d4-a716-446655440004', 'Track Water Day 2', 'Track your water intake for the second day', 2),
  ('650e8400-e29b-41d4-a716-446655440004', 'Track Water Day 3', 'Track your water intake for the third day', 3),
  ('650e8400-e29b-41d4-a716-446655440004', 'Track Water Day 4', 'Track your water intake for the fourth day', 4),
  ('650e8400-e29b-41d4-a716-446655440004', 'Track Water Day 5', 'Track your water intake for the fifth day', 5),
  ('650e8400-e29b-41d4-a716-446655440004', 'Track Water Day 6', 'Track your water intake for the sixth day', 6),
  ('650e8400-e29b-41d4-a716-446655440004', 'Track Water Day 7', 'Track your water intake for the seventh day', 7),
  ('650e8400-e29b-41d4-a716-446655440004', 'Track Water Day 8', 'Track your water intake for the eighth day', 8),
  ('650e8400-e29b-41d4-a716-446655440004', 'Track Water Day 9', 'Track your water intake for the ninth day', 9),
  ('650e8400-e29b-41d4-a716-446655440004', 'Track Water Day 10', 'Track your water intake for the tenth day', 10),
  ('650e8400-e29b-41d4-a716-446655440004', 'Track Water Day 11', 'Track your water intake for the eleventh day', 11),
  ('650e8400-e29b-41d4-a716-446655440004', 'Track Water Day 12', 'Track your water intake for the twelfth day', 12),
  ('650e8400-e29b-41d4-a716-446655440004', 'Track Water Day 13', 'Track your water intake for the thirteenth day', 13),
  ('650e8400-e29b-41d4-a716-446655440004', 'Track Water Day 14', 'Track your water intake for the fourteenth day', 14)
ON CONFLICT (challenge_id, order_number) DO NOTHING;

-- =============================================
-- Filipino Food Explorer (8 tasks)
-- =============================================
INSERT INTO challenge_tasks (challenge_id, title, description, order_number) VALUES
  ('650e8400-e29b-41d4-a716-446655440005', 'Cook Adobo', 'Prepare the classic Filipino chicken or pork adobo', 1),
  ('650e8400-e29b-41d4-a716-446655440005', 'Make Sinigang', 'Create a delicious sinigang soup with tamarind broth', 2),
  ('650e8400-e29b-41d4-a716-446655440005', 'Prepare Pancit', 'Cook traditional Filipino noodles (pancit)', 3),
  ('650e8400-e29b-41d4-a716-446655440005', 'Cook Kare-Kare', 'Make the rich peanut-based kare-kare stew', 4),
  ('650e8400-e29b-41d4-a716-446655440005', 'Prepare Lumpia', 'Create Filipino spring rolls (lumpia)', 5),
  ('650e8400-e29b-41d4-a716-446655440005', 'Make Bistek', 'Cook Filipino beef steak (bistek tagalog)', 6),
  ('650e8400-e29b-41d4-a716-446655440005', 'Prepare Lechon Kawali', 'Make crispy pan-fried pork belly', 7),
  ('650e8400-e29b-41d4-a716-446655440005', 'Create Halo-Halo', 'Prepare the famous Filipino dessert halo-halo', 8)
ON CONFLICT (challenge_id, order_number) DO NOTHING;

-- =============================================
-- Meal Prep Master (5 tasks)
-- =============================================
INSERT INTO challenge_tasks (challenge_id, title, description, order_number) VALUES
  ('650e8400-e29b-41d4-a716-446655440006', 'Day 1 Meal Prep', 'Prepare all meals for Day 1 in advance', 1),
  ('650e8400-e29b-41d4-a716-446655440006', 'Day 2 Meal Prep', 'Prepare all meals for Day 2 in advance', 2),
  ('650e8400-e29b-41d4-a716-446655440006', 'Day 3 Meal Prep', 'Prepare all meals for Day 3 in advance', 3),
  ('650e8400-e29b-41d4-a716-446655440006', 'Day 4 Meal Prep', 'Prepare all meals for Day 4 in advance', 4),
  ('650e8400-e29b-41d4-a716-446655440006', 'Day 5 Meal Prep', 'Prepare all meals for Day 5 in advance', 5)
ON CONFLICT (challenge_id, order_number) DO NOTHING;

-- =============================================
-- Low-Calorie Champion (10 tasks)
-- =============================================
INSERT INTO challenge_tasks (challenge_id, title, description, order_number) VALUES
  ('650e8400-e29b-41d4-a716-446655440007', 'Low-Cal Breakfast 1', 'Prepare a breakfast under 400 calories', 1),
  ('650e8400-e29b-41d4-a716-446655440007', 'Low-Cal Lunch 1', 'Make a lunch under 400 calories', 2),
  ('650e8400-e29b-41d4-a716-446655440007', 'Low-Cal Dinner 1', 'Cook a dinner under 400 calories', 3),
  ('650e8400-e29b-41d4-a716-446655440007', 'Low-Cal Breakfast 2', 'Prepare another breakfast under 400 calories', 4),
  ('650e8400-e29b-41d4-a716-446655440007', 'Low-Cal Lunch 2', 'Make another lunch under 400 calories', 5),
  ('650e8400-e29b-41d4-a716-446655440007', 'Low-Cal Dinner 2', 'Cook another dinner under 400 calories', 6),
  ('650e8400-e29b-41d4-a716-446655440007', 'Low-Cal Snack', 'Prepare a healthy snack under 400 calories', 7),
  ('650e8400-e29b-41d4-a716-446655440007', 'Low-Cal Breakfast 3', 'Prepare a third breakfast under 400 calories', 8),
  ('650e8400-e29b-41d4-a716-446655440007', 'Low-Cal Lunch 3', 'Make a third lunch under 400 calories', 9),
  ('650e8400-e29b-41d4-a716-446655440007', 'Low-Cal Dinner 3', 'Cook a third dinner under 400 calories', 10)
ON CONFLICT (challenge_id, order_number) DO NOTHING;

-- =============================================
-- Seafood Sunday (4 tasks)
-- =============================================
INSERT INTO challenge_tasks (challenge_id, title, description, order_number) VALUES
  ('650e8400-e29b-41d4-a716-446655440008', 'Grilled Fish Meal', 'Prepare a grilled fish dish rich in omega-3', 1),
  ('650e8400-e29b-41d4-a716-446655440008', 'Seafood Pasta', 'Cook a delicious seafood pasta dish', 2),
  ('650e8400-e29b-41d4-a716-446655440008', 'Steamed Seafood', 'Make a healthy steamed fish or shellfish meal', 3),
  ('650e8400-e29b-41d4-a716-446655440008', 'Seafood Stew', 'Prepare a hearty seafood stew or soup', 4)
ON CONFLICT (challenge_id, order_number) DO NOTHING;

-- =============================================
-- No Sugar Week (7 tasks)
-- =============================================
INSERT INTO challenge_tasks (challenge_id, title, description, order_number) VALUES
  ('650e8400-e29b-41d4-a716-446655440009', 'Sugar-Free Day 1', 'Complete Day 1 without added sugars', 1),
  ('650e8400-e29b-41d4-a716-446655440009', 'Sugar-Free Day 2', 'Complete Day 2 without added sugars', 2),
  ('650e8400-e29b-41d4-a716-446655440009', 'Sugar-Free Day 3', 'Complete Day 3 without added sugars', 3),
  ('650e8400-e29b-41d4-a716-446655440009', 'Sugar-Free Day 4', 'Complete Day 4 without added sugars', 4),
  ('650e8400-e29b-41d4-a716-446655440009', 'Sugar-Free Day 5', 'Complete Day 5 without added sugars', 5),
  ('650e8400-e29b-41d4-a716-446655440009', 'Sugar-Free Day 6', 'Complete Day 6 without added sugars', 6),
  ('650e8400-e29b-41d4-a716-446655440009', 'Sugar-Free Day 7', 'Complete Day 7 without added sugars', 7)
ON CONFLICT (challenge_id, order_number) DO NOTHING;

-- =============================================
-- Rainbow Plate (5 tasks)
-- =============================================
INSERT INTO challenge_tasks (challenge_id, title, description, order_number) VALUES
  ('650e8400-e29b-41d4-a716-446655440010', 'Rainbow Meal 1', 'Create a meal with 5+ different colored ingredients', 1),
  ('650e8400-e29b-41d4-a716-446655440010', 'Rainbow Meal 2', 'Create another meal with 5+ different colors', 2),
  ('650e8400-e29b-41d4-a716-446655440010', 'Rainbow Meal 3', 'Create a third meal with 5+ different colors', 3),
  ('650e8400-e29b-41d4-a716-446655440010', 'Rainbow Meal 4', 'Create a fourth meal with 5+ different colors', 4),
  ('650e8400-e29b-41d4-a716-446655440010', 'Rainbow Meal 5', 'Create a fifth meal with 5+ different colors', 5)
ON CONFLICT (challenge_id, order_number) DO NOTHING;

-- =============================================
-- Quick Cook Challenge (6 tasks)
-- =============================================
INSERT INTO challenge_tasks (challenge_id, title, description, order_number) VALUES
  ('650e8400-e29b-41d4-a716-446655440011', 'Quick Breakfast', 'Prepare a healthy breakfast in under 30 minutes', 1),
  ('650e8400-e29b-41d4-a716-446655440011', 'Quick Lunch 1', 'Make a nutritious lunch in under 30 minutes', 2),
  ('650e8400-e29b-41d4-a716-446655440011', 'Quick Dinner 1', 'Cook a healthy dinner in under 30 minutes', 3),
  ('650e8400-e29b-41d4-a716-446655440011', 'Quick Lunch 2', 'Make another quick lunch in under 30 minutes', 4),
  ('650e8400-e29b-41d4-a716-446655440011', 'Quick Dinner 2', 'Cook another dinner in under 30 minutes', 5),
  ('650e8400-e29b-41d4-a716-446655440011', 'Quick Snack', 'Prepare a quick healthy snack in under 30 minutes', 6)
ON CONFLICT (challenge_id, order_number) DO NOTHING;

-- =============================================
-- Traditional Tastes (5 tasks)
-- =============================================
INSERT INTO challenge_tasks (challenge_id, title, description, order_number) VALUES
  ('650e8400-e29b-41d4-a716-446655440012', 'Family Recipe 1', 'Cook your first traditional family recipe', 1),
  ('650e8400-e29b-41d4-a716-446655440012', 'Regional Dish 1', 'Prepare a traditional regional dish', 2),
  ('650e8400-e29b-41d4-a716-446655440012', 'Family Recipe 2', 'Cook your second traditional family recipe', 3),
  ('650e8400-e29b-41d4-a716-446655440012', 'Regional Dish 2', 'Prepare another traditional regional dish', 4),
  ('650e8400-e29b-41d4-a716-446655440012', 'Heritage Dish', 'Cook a special heritage or celebratory dish', 5)
ON CONFLICT (challenge_id, order_number) DO NOTHING;

-- =============================================
-- Lean & Green (10 tasks)
-- =============================================
INSERT INTO challenge_tasks (challenge_id, title, description, order_number) VALUES
  ('650e8400-e29b-41d4-a716-446655440013', 'Veggie-Heavy Breakfast 1', 'Prepare a vegetable-heavy, low-fat breakfast', 1),
  ('650e8400-e29b-41d4-a716-446655440013', 'Lean Green Lunch 1', 'Make a vegetable-focused, low-fat lunch', 2),
  ('650e8400-e29b-41d4-a716-446655440013', 'Plant-Based Dinner 1', 'Cook a vegetable-heavy, low-fat dinner', 3),
  ('650e8400-e29b-41d4-a716-446655440013', 'Veggie-Heavy Breakfast 2', 'Prepare another veggie breakfast', 4),
  ('650e8400-e29b-41d4-a716-446655440013', 'Lean Green Lunch 2', 'Make another low-fat veggie lunch', 5),
  ('650e8400-e29b-41d4-a716-446655440013', 'Plant-Based Dinner 2', 'Cook another veggie-heavy dinner', 6),
  ('650e8400-e29b-41d4-a716-446655440013', 'Green Smoothie Bowl', 'Create a nutrient-dense green smoothie bowl', 7),
  ('650e8400-e29b-41d4-a716-446655440013', 'Veggie Salad', 'Make a large, satisfying vegetable salad', 8),
  ('650e8400-e29b-41d4-a716-446655440013', 'Lean Green Lunch 3', 'Prepare a third veggie-focused lunch', 9),
  ('650e8400-e29b-41d4-a716-446655440013', 'Plant-Based Dinner 3', 'Cook a third vegetable-heavy dinner', 10)
ON CONFLICT (challenge_id, order_number) DO NOTHING;

-- =============================================
-- Spice Explorer (8 tasks)
-- =============================================
INSERT INTO challenge_tasks (challenge_id, title, description, order_number) VALUES
  ('650e8400-e29b-41d4-a716-446655440014', 'New Spice 1', 'Cook a recipe with your first new spice', 1),
  ('650e8400-e29b-41d4-a716-446655440014', 'New Spice 2', 'Cook a recipe with your second new spice', 2),
  ('650e8400-e29b-41d4-a716-446655440014', 'New Spice 3', 'Cook a recipe with your third new spice', 3),
  ('650e8400-e29b-41d4-a716-446655440014', 'New Spice 4', 'Cook a recipe with your fourth new spice', 4),
  ('650e8400-e29b-41d4-a716-446655440014', 'New Spice 5', 'Cook a recipe with your fifth new spice', 5),
  ('650e8400-e29b-41d4-a716-446655440014', 'New Spice 6', 'Cook a recipe with your sixth new spice', 6),
  ('650e8400-e29b-41d4-a716-446655440014', 'New Spice 7', 'Cook a recipe with your seventh new spice', 7),
  ('650e8400-e29b-41d4-a716-446655440014', 'New Spice 8', 'Cook a recipe with your eighth new spice', 8)
ON CONFLICT (challenge_id, order_number) DO NOTHING;
