/*
  # Seed Initial Data for MealR App

  1. Insert sample ingredients
  2. Insert sample recipes with ingredients and instructions
  3. Insert sample challenges and tasks
  4. Insert sample badges
  5. Insert recipe tags
*/

-- Insert sample ingredients
INSERT INTO ingredients (name, category) VALUES
  ('Avocado', 'Fruits'),
  ('Eggs', 'Protein'),
  ('Whole grain bread', 'Grains'),
  ('Cherry tomatoes', 'Vegetables'),
  ('Salt', 'Pantry'),
  ('Black pepper', 'Pantry'),
  ('Olive oil', 'Pantry'),
  ('Lemon', 'Fruits'),
  ('Grilled chicken breast', 'Protein'),
  ('Romaine lettuce', 'Vegetables'),
  ('Cucumber', 'Vegetables'),
  ('Kalamata olives', 'Pantry'),
  ('Feta cheese', 'Dairy'),
  ('Red onion', 'Vegetables'),
  ('Tofu', 'Protein'),
  ('Broccoli', 'Vegetables'),
  ('Carrots', 'Vegetables'),
  ('Bell peppers', 'Vegetables'),
  ('Soy sauce', 'Pantry'),
  ('Ginger', 'Pantry'),
  ('Garlic', 'Pantry'),
  ('Vegetable oil', 'Pantry'),
  ('Sesame oil', 'Pantry'),
  ('Green onions', 'Vegetables'),
  ('Milk', 'Dairy'),
  ('Cheese', 'Dairy'),
  ('Butter', 'Dairy'),
  ('Quinoa', 'Grains'),
  ('Black beans', 'Protein'),
  ('Corn', 'Vegetables'),
  ('Cilantro', 'Vegetables'),
  ('Lime', 'Fruits'),
  ('Salmon', 'Protein'),
  ('Dill', 'Pantry'),
  ('Rice', 'Grains'),
  ('Bananas', 'Fruits'),
  ('Greek yogurt', 'Dairy'),
  ('Honey', 'Pantry'),
  ('Granola', 'Grains'),
  ('Berries', 'Fruits')
ON CONFLICT (name) DO NOTHING;

-- Insert sample recipes
INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Avocado & Egg Toast', 'A delicious and nutritious breakfast option that combines creamy avocado with perfectly cooked eggs on top of crispy whole grain toast.', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80', 15, 'Beginner', 'Breakfast', 'American', 320, 15, 30, 18, 45, 8.5),
  ('550e8400-e29b-41d4-a716-446655440002', 'Mediterranean Salad', 'A refreshing and healthy Mediterranean-inspired salad featuring grilled chicken, fresh vegetables, olives, and feta cheese.', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80', 20, 'Intermediate', 'Lunch', 'Mediterranean', 380, 25, 15, 22, 60, 9.2),
  ('550e8400-e29b-41d4-a716-446655440003', 'Vegetable Stir Fry', 'A quick and flavorful vegetable stir fry with tofu that''s packed with nutrients and plant-based protein.', 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80', 25, 'Intermediate', 'Dinner', 'Asian', 340, 18, 35, 12, 75, 9.0),
  ('550e8400-e29b-41d4-a716-446655440004', 'Simple Omelette', 'A classic breakfast omelette with cheese and herbs, perfect for a quick and protein-rich meal.', 'https://images.unsplash.com/photo-1510693206972-df098062cb71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80', 10, 'Beginner', 'Breakfast', 'French', 280, 18, 2, 22, 40, 7.5),
  ('550e8400-e29b-41d4-a716-446655440005', 'Quinoa Bowl', 'A nutritious quinoa bowl with avocado, black beans, and fresh vegetables.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80', 25, 'Intermediate', 'Lunch', 'Mexican', 420, 15, 65, 14, 65, 9.5),
  ('550e8400-e29b-41d4-a716-446655440006', 'Grilled Salmon', 'Perfectly grilled salmon with herbs and lemon, a healthy and delicious dinner option.', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80', 30, 'Advanced', 'Dinner', 'Scandinavian', 450, 40, 5, 28, 85, 9.8)
ON CONFLICT (id) DO NOTHING;

-- Insert recipe ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) 
SELECT r.id, i.id, amounts.amount
FROM recipes r
CROSS JOIN LATERAL (
  VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Avocado', '1 medium'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Eggs', '2 large'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Whole grain bread', '2 slices'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Cherry tomatoes', '1/2 cup'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Salt', 'to taste'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Black pepper', 'to taste'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Grilled chicken breast', '6 oz'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Romaine lettuce', '2 cups'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Cucumber', '1/2 medium'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Kalamata olives', '1/4 cup'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Feta cheese', '1/4 cup'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Cherry tomatoes', '1/2 cup'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Tofu', '14 oz'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Broccoli', '1 cup'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Carrots', '2 medium'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Bell peppers', '1 large'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Soy sauce', '3 tbsp'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Ginger', '1 tbsp minced'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Eggs', '2 large'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Cheese', '1/4 cup'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Milk', '2 tbsp'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Salt', 'to taste'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Black pepper', 'to taste'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Butter', '1 tbsp'),
    ('550e8400-e29b-41d4-a716-446655440005', 'Quinoa', '1 cup'),
    ('550e8400-e29b-41d4-a716-446655440005', 'Avocado', '1 medium'),
    ('550e8400-e29b-41d4-a716-446655440005', 'Black beans', '1/2 cup'),
    ('550e8400-e29b-41d4-a716-446655440005', 'Corn', '1/2 cup'),
    ('550e8400-e29b-41d4-a716-446655440005', 'Lime', '1 whole'),
    ('550e8400-e29b-41d4-a716-446655440005', 'Cilantro', '1/4 cup'),
    ('550e8400-e29b-41d4-a716-446655440006', 'Salmon', '6 oz fillet'),
    ('550e8400-e29b-41d4-a716-446655440006', 'Lemon', '1 whole'),
    ('550e8400-e29b-41d4-a716-446655440006', 'Garlic', '2 cloves'),
    ('550e8400-e29b-41d4-a716-446655440006', 'Olive oil', '2 tbsp'),
    ('550e8400-e29b-41d4-a716-446655440006', 'Dill', '1 tbsp'),
    ('550e8400-e29b-41d4-a716-446655440006', 'Salt', 'to taste'),
    ('550e8400-e29b-41d4-a716-446655440006', 'Black pepper', 'to taste')
) AS amounts(recipe_id, ingredient_name, amount)
JOIN ingredients i ON i.name = amounts.ingredient_name
WHERE r.id = amounts.recipe_id::uuid
ON CONFLICT (recipe_id, ingredient_id) DO NOTHING;

-- Insert recipe instructions
INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 1, 'Toast the bread slices until golden and crispy.', 3),
  ('550e8400-e29b-41d4-a716-446655440001', 2, 'In a small pan, fry the eggs to your liking (sunny side up recommended).', 4),
  ('550e8400-e29b-41d4-a716-446655440001', 3, 'Mash the avocado in a bowl and add lemon juice, salt, and pepper.', 2),
  ('550e8400-e29b-41d4-a716-446655440001', 4, 'Spread the mashed avocado on the toast.', 1),
  ('550e8400-e29b-41d4-a716-446655440001', 5, 'Place the fried egg on top of the avocado.', 1),
  ('550e8400-e29b-41d4-a716-446655440001', 6, 'Slice cherry tomatoes in half and arrange them around the egg.', 2),
  ('550e8400-e29b-41d4-a716-446655440001', 7, 'Sprinkle with red pepper flakes if desired.', NULL),
  ('550e8400-e29b-41d4-a716-446655440001', 8, 'Serve immediately and enjoy!', NULL),
  
  ('550e8400-e29b-41d4-a716-446655440002', 1, 'Chop the romaine lettuce and place in a large bowl.', 3),
  ('550e8400-e29b-41d4-a716-446655440002', 2, 'Dice the cucumber, tomatoes, and red onion.', 5),
  ('550e8400-e29b-41d4-a716-446655440002', 3, 'Slice the olives in half.', 2),
  ('550e8400-e29b-41d4-a716-446655440002', 4, 'Crumble the feta cheese.', 1),
  ('550e8400-e29b-41d4-a716-446655440002', 5, 'Add all vegetables and cheese to the bowl with lettuce.', 1),
  ('550e8400-e29b-41d4-a716-446655440002', 6, 'Slice the grilled chicken breast and add to the salad.', 3),
  ('550e8400-e29b-41d4-a716-446655440002', 7, 'In a small bowl, whisk together olive oil, lemon juice, oregano, salt, and pepper.', 2),
  ('550e8400-e29b-41d4-a716-446655440002', 8, 'Pour the dressing over the salad and toss gently to combine.', 1),
  ('550e8400-e29b-41d4-a716-446655440002', 9, 'Serve immediately or chill for 30 minutes to let flavors meld.', NULL),
  
  ('550e8400-e29b-41d4-a716-446655440003', 1, 'Press tofu to remove excess water, then cut into cubes.', 5),
  ('550e8400-e29b-41d4-a716-446655440003', 2, 'Chop all vegetables into bite-sized pieces.', 8),
  ('550e8400-e29b-41d4-a716-446655440003', 3, 'Heat oil in a wok or large pan over high heat.', 2),
  ('550e8400-e29b-41d4-a716-446655440003', 4, 'Add tofu and cook until golden brown on all sides.', 6),
  ('550e8400-e29b-41d4-a716-446655440003', 5, 'Remove tofu and set aside.', 1),
  ('550e8400-e29b-41d4-a716-446655440003', 6, 'Add garlic and ginger to the pan and stir for 30 seconds.', 1),
  ('550e8400-e29b-41d4-a716-446655440003', 7, 'Add vegetables and stir-fry for 5-7 minutes until tender-crisp.', 7),
  ('550e8400-e29b-41d4-a716-446655440003', 8, 'Return tofu to the pan and add soy sauce.', 1),
  ('550e8400-e29b-41d4-a716-446655440003', 9, 'Stir everything together and cook for another 2 minutes.', 2),
  ('550e8400-e29b-41d4-a716-446655440003', 10, 'Drizzle with sesame oil and sprinkle with green onions.', 1),
  ('550e8400-e29b-41d4-a716-446655440003', 11, 'Serve hot over rice or noodles.', NULL)
ON CONFLICT (recipe_id, step_number) DO NOTHING;

-- Insert recipe tags
INSERT INTO recipe_tags (recipe_id, tag, tag_type) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'vegetarian', 'dietary'),
  ('550e8400-e29b-41d4-a716-446655440001', 'high-protein', 'dietary'),
  ('550e8400-e29b-41d4-a716-446655440001', 'american', 'cuisine'),
  ('550e8400-e29b-41d4-a716-446655440002', 'high-protein', 'dietary'),
  ('550e8400-e29b-41d4-a716-446655440002', 'low-carb', 'dietary'),
  ('550e8400-e29b-41d4-a716-446655440002', 'mediterranean', 'cuisine'),
  ('550e8400-e29b-41d4-a716-446655440003', 'vegetarian', 'dietary'),
  ('550e8400-e29b-41d4-a716-446655440003', 'vegan', 'dietary'),
  ('550e8400-e29b-41d4-a716-446655440003', 'asian', 'cuisine'),
  ('550e8400-e29b-41d4-a716-446655440004', 'vegetarian', 'dietary'),
  ('550e8400-e29b-41d4-a716-446655440004', 'high-protein', 'dietary'),
  ('550e8400-e29b-41d4-a716-446655440004', 'french', 'cuisine'),
  ('550e8400-e29b-41d4-a716-446655440005', 'vegetarian', 'dietary'),
  ('550e8400-e29b-41d4-a716-446655440005', 'vegan', 'dietary'),
  ('550e8400-e29b-41d4-a716-446655440005', 'high-fiber', 'dietary'),
  ('550e8400-e29b-41d4-a716-446655440005', 'mexican', 'cuisine'),
  ('550e8400-e29b-41d4-a716-446655440006', 'high-protein', 'dietary'),
  ('550e8400-e29b-41d4-a716-446655440006', 'low-carb', 'dietary'),
  ('550e8400-e29b-41d4-a716-446655440006', 'omega-3', 'dietary'),
  ('550e8400-e29b-41d4-a716-446655440006', 'scandinavian', 'cuisine')
ON CONFLICT (recipe_id, tag, tag_type) DO NOTHING;

-- Insert sample challenges
INSERT INTO challenges (id, title, description, long_description, category, total_tasks, reward_points, start_date, end_date, icon, color, bg_color, is_active) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'Veggie Week', 'Eat 5 vegetable-based meals this week', 'Challenge yourself to incorporate more vegetables into your diet by preparing and consuming 5 vegetable-based meals this week. This challenge will help you discover new recipes, increase your nutrient intake, and develop healthier eating habits.', 'Nutrition', 5, 200, '2024-01-01', '2024-12-31', 'leaf', '#a855f7', '#f3e8ff', true),
  ('650e8400-e29b-41d4-a716-446655440002', 'Protein Power', 'Prepare 3 high-protein meals with at least 25g of protein', 'Boost your protein intake by preparing 3 meals that each contain at least 25g of protein. This challenge will help you build and maintain muscle mass, support recovery after workouts, and keep you feeling fuller for longer.', 'Fitness', 3, 150, '2024-01-01', '2024-12-31', 'fitness', '#3b82f6', '#dbeafe', true),
  ('650e8400-e29b-41d4-a716-446655440003', 'Breakfast Champion', 'Start your day right with 7 healthy breakfasts', 'Make breakfast a priority by preparing 7 nutritious breakfast meals. This challenge focuses on starting your day with balanced nutrition to boost energy and metabolism.', 'Wellness', 7, 250, '2024-01-01', '2024-12-31', 'sunny', '#f59e0b', '#fef3c7', true),
  ('650e8400-e29b-41d4-a716-446655440004', 'Hydration Hero', 'Track your water intake for 14 consecutive days', 'Stay hydrated by tracking your daily water intake for 14 consecutive days. Proper hydration is essential for overall health and can improve energy levels and cognitive function.', 'Wellness', 14, 300, '2024-01-01', '2024-12-31', 'water', '#0ea5e9', '#e0f2fe', true)
ON CONFLICT (id) DO NOTHING;

-- Insert challenge tasks
INSERT INTO challenge_tasks (challenge_id, title, description, order_number) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'Prepare a vegetable salad', 'Create a colorful salad with at least 3 different vegetables', 1),
  ('650e8400-e29b-41d4-a716-446655440001', 'Cook a vegetable stir-fry', 'Make a delicious stir-fry using seasonal vegetables', 2),
  ('650e8400-e29b-41d4-a716-446655440001', 'Make a vegetable soup', 'Prepare a hearty soup with mixed vegetables', 3),
  ('650e8400-e29b-41d4-a716-446655440001', 'Prepare a vegetable curry', 'Cook a flavorful curry with your favorite vegetables', 4),
  ('650e8400-e29b-41d4-a716-446655440001', 'Create a vegetable pasta dish', 'Make pasta with plenty of fresh vegetables', 5),
  
  ('650e8400-e29b-41d4-a716-446655440002', 'Cook a high-protein breakfast', 'Prepare a breakfast with at least 25g of protein', 1),
  ('650e8400-e29b-41d4-a716-446655440002', 'Prepare a protein-rich lunch', 'Make a lunch containing 25g+ protein', 2),
  ('650e8400-e29b-41d4-a716-446655440002', 'Make a high-protein dinner', 'Cook a dinner with 25g+ protein', 3),
  
  ('650e8400-e29b-41d4-a716-446655440003', 'Healthy Monday Breakfast', 'Start the week with a nutritious breakfast', 1),
  ('650e8400-e29b-41d4-a716-446655440003', 'Protein Tuesday', 'Include protein in your breakfast', 2),
  ('650e8400-e29b-41d4-a716-446655440003', 'Whole Grain Wednesday', 'Add whole grains to your morning meal', 3),
  ('650e8400-e29b-41d4-a716-446655440003', 'Fruit Thursday', 'Include fresh fruit in your breakfast', 4),
  ('650e8400-e29b-41d4-a716-446655440003', 'Fiber Friday', 'Focus on high-fiber breakfast options', 5),
  ('650e8400-e29b-41d4-a716-446655440003', 'Satisfying Saturday', 'Make a filling weekend breakfast', 6),
  ('650e8400-e29b-41d4-a716-446655440003', 'Sunday Special', 'Create a special breakfast to end the week', 7)
ON CONFLICT (challenge_id, order_number) DO NOTHING;

-- Insert sample badges
INSERT INTO badges (name, description, icon, color, requirement_type, requirement_value) VALUES
  ('Veggie Master', 'Complete 10 vegetarian recipes', 'leaf', '#22c55e', 'meals_completed', 10),
  ('Protein Pro', 'Prepare 15 high-protein meals', 'fitness', '#f97316', 'meals_completed', 15),
  ('Hydration Hero', 'Track water intake for 30 consecutive days', 'water', '#3b82f6', 'streak_days', 30),
  ('Meal Planner', 'Create 20 meal plans', 'calendar', '#8b5cf6', 'meals_completed', 20),
  ('Breakfast Champion', 'Prepare 20 healthy breakfast recipes', 'sunny', '#f59e0b', 'meals_completed', 20),
  ('Nutrition Expert', 'Complete nutrition-focused challenges', 'school', '#ec4899', 'challenges_completed', 5),
  ('Cooking Streak', 'Cook meals for 7 consecutive days', 'flame', '#ef4444', 'streak_days', 7),
  ('Recipe Explorer', 'Try 50 different recipes', 'restaurant', '#06b6d4', 'meals_completed', 50),
  ('Ingredient Master', 'Use 100 different ingredients', 'nutrition', '#84cc16', 'ingredients_used', 100),
  ('Point Collector', 'Earn 1000 total points', 'star', '#fbbf24', 'points_earned', 1000)
ON CONFLICT (name) DO NOTHING;