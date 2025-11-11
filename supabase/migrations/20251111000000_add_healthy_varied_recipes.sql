/*
  # Add Diverse Healthy Recipes

  ## Summary
  This migration adds a variety of healthy recipes from different cuisines with proper nutritional information, ingredients, instructions, and tags.

  ## Recipes Added (20 total):
  
  ### Breakfast (5):
  1. Greek Yogurt Parfait - High-protein, quick breakfast
  2. Avocado Toast with Poached Egg - Healthy fats, protein
  3. Overnight Oats with Berries - High-fiber, prepare ahead
  4. Veggie Scramble - Low-carb, high-protein
  5. Banana Protein Smoothie Bowl - Post-workout, vegan option

  ### Lunch/Dinner (10):
  6. Mediterranean Quinoa Bowl - Plant-based, complete protein
  7. Grilled Chicken Caesar Salad - High-protein, low-carb
  8. Baked Salmon with Asparagus - Omega-3, low-calorie
  9. Turkey & Sweet Potato Chili - High-fiber, lean protein
  10. Zucchini Noodles with Pesto - Low-carb, vegetarian
  11. Teriyaki Tofu Stir-Fry - Vegan, high-protein
  12. Lentil Curry - Plant-based protein, high-fiber
  13. Shrimp Taco Bowl - Low-calorie, high-protein
  14. Chicken Pho - Vietnamese, low-fat
  15. Buddha Bowl - Vegan, nutrient-dense

  ### Snacks (5):
  16. Hummus with Veggies - Plant-based, fiber-rich
  17. Energy Balls - No-bake, healthy fats
  18. Greek Yogurt Dip - High-protein snack
  19. Roasted Chickpeas - Crunchy, high-fiber
  20. Fruit & Nut Mix - Quick energy, healthy fats
*/

-- =============================================
-- BREAKFAST RECIPES
-- =============================================

-- Recipe 1: Greek Yogurt Parfait
DO $$
DECLARE
  recipe_uuid uuid := 'a10e8400-e29b-41d4-a716-446655440001';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Greek Yogurt Parfait',
      'Layers of creamy Greek yogurt, fresh berries, and crunchy granola. A perfect high-protein breakfast that''s ready in minutes.',
      'https://images.pexels.com/photos/1854652/pexels-photo-1854652.jpeg?auto=compress&cs=tinysrgb&w=500',
      5,
      'Beginner',
      'Breakfast',
      'American',
      280,
      18,
      35,
      8,
      50,
      8.5
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'In a glass or bowl, add a layer of Greek yogurt (about 1/2 cup).', 0),
      (recipe_uuid, 2, 'Add a layer of mixed berries (strawberries, blueberries, raspberries).', 0),
      (recipe_uuid, 3, 'Sprinkle 2 tablespoons of granola on top.', 0),
      (recipe_uuid, 4, 'Repeat layers once more.', 0),
      (recipe_uuid, 5, 'Drizzle with honey if desired and serve immediately.', 0);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'American', 'cuisine'),
      (recipe_uuid, 'High-Protein', 'dietary'),
      (recipe_uuid, 'Quick', 'other'),
      (recipe_uuid, 'Healthy', 'dietary'),
      (recipe_uuid, 'Vegetarian', 'dietary'),
      (recipe_uuid, 'Breakfast', 'other');
  END IF;
END $$;

-- Recipe 2: Avocado Toast with Poached Egg
DO $$
DECLARE
  recipe_uuid uuid := 'a10e8400-e29b-41d4-a716-446655440002';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Avocado Toast with Poached Egg',
      'Creamy mashed avocado on whole grain toast topped with a perfectly poached egg. Rich in healthy fats and protein to start your day right.',
      'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=500',
      10,
      'Intermediate',
      'Breakfast',
      'American',
      320,
      14,
      28,
      18,
      55,
      8.0
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'Toast 2 slices of whole grain bread until golden brown.', 3),
      (recipe_uuid, 2, 'Mash 1 ripe avocado with a fork. Add salt, pepper, and red pepper flakes.', 2),
      (recipe_uuid, 3, 'Bring a pot of water to a gentle simmer. Add a splash of vinegar.', 3),
      (recipe_uuid, 4, 'Crack egg into a small bowl, then gently slide into simmering water. Cook for 3-4 minutes.', 4),
      (recipe_uuid, 5, 'Spread mashed avocado on toast. Top with poached egg, salt, and pepper.', 0);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'American', 'cuisine'),
      (recipe_uuid, 'Healthy', 'dietary'),
      (recipe_uuid, 'Vegetarian', 'dietary'),
      (recipe_uuid, 'High-Protein', 'dietary'),
      (recipe_uuid, 'Breakfast', 'other');
  END IF;
END $$;

-- Recipe 3: Overnight Oats with Berries
DO $$
DECLARE
  recipe_uuid uuid := 'a10e8400-e29b-41d4-a716-446655440003';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Overnight Oats with Berries',
      'Prepare tonight, enjoy tomorrow! Creamy oats soaked overnight with chia seeds, topped with fresh berries and nuts. High in fiber and perfect for busy mornings.',
      'https://images.pexels.com/photos/704971/pexels-photo-704971.jpeg?auto=compress&cs=tinysrgb&w=500',
      5,
      'Beginner',
      'Breakfast',
      'American',
      310,
      12,
      48,
      9,
      50,
      8.5
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'In a jar, combine 1/2 cup rolled oats, 1 tbsp chia seeds, and 3/4 cup almond milk.', 0),
      (recipe_uuid, 2, 'Add 1 tsp honey or maple syrup and a pinch of cinnamon. Stir well.', 0),
      (recipe_uuid, 3, 'Cover and refrigerate overnight (at least 6 hours).', 0),
      (recipe_uuid, 4, 'In the morning, stir and add more milk if needed.', 0),
      (recipe_uuid, 5, 'Top with fresh berries, sliced banana, and chopped nuts. Enjoy cold!', 0);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'American', 'cuisine'),
      (recipe_uuid, 'Healthy', 'dietary'),
      (recipe_uuid, 'Vegetarian', 'dietary'),
      (recipe_uuid, 'High-Fiber', 'dietary'),
      (recipe_uuid, 'Vegan', 'dietary'),
      (recipe_uuid, 'Breakfast', 'other'),
      (recipe_uuid, 'Meal-Prep', 'other');
  END IF;
END $$;

-- Recipe 4: Veggie Scramble
DO $$
DECLARE
  recipe_uuid uuid := 'a10e8400-e29b-41d4-a716-446655440004';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Veggie Scramble',
      'Fluffy scrambled eggs loaded with colorful vegetables - bell peppers, spinach, tomatoes, and onions. A low-carb, high-protein breakfast powerhouse.',
      'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=500',
      15,
      'Beginner',
      'Breakfast',
      'American',
      220,
      16,
      12,
      12,
      55,
      8.0
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'Heat 1 tsp olive oil in a non-stick pan over medium heat.', 1),
      (recipe_uuid, 2, 'Sauté diced bell peppers, onions, and cherry tomatoes for 3-4 minutes.', 4),
      (recipe_uuid, 3, 'Add a handful of fresh spinach and cook until wilted.', 1),
      (recipe_uuid, 4, 'Whisk 3 eggs with salt and pepper. Pour into the pan.', 0),
      (recipe_uuid, 5, 'Gently scramble eggs with vegetables until cooked through. Serve hot.', 3);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'American', 'cuisine'),
      (recipe_uuid, 'Healthy', 'dietary'),
      (recipe_uuid, 'Vegetarian', 'dietary'),
      (recipe_uuid, 'High-Protein', 'dietary'),
      (recipe_uuid, 'Low-Carb', 'dietary'),
      (recipe_uuid, 'Breakfast', 'other');
  END IF;
END $$;

-- Recipe 5: Banana Protein Smoothie Bowl
DO $$
DECLARE
  recipe_uuid uuid := 'a10e8400-e29b-41d4-a716-446655440005';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Banana Protein Smoothie Bowl',
      'Thick and creamy smoothie bowl packed with banana, protein powder, and topped with granola, berries, and coconut. Perfect post-workout breakfast.',
      'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=500',
      10,
      'Beginner',
      'Breakfast',
      'American',
      290,
      20,
      42,
      6,
      55,
      8.5
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'In a blender, combine 2 frozen bananas, 1 scoop vanilla protein powder, 1/2 cup almond milk.', 0),
      (recipe_uuid, 2, 'Add 1 tbsp peanut butter and a handful of spinach (optional).', 0),
      (recipe_uuid, 3, 'Blend until thick and creamy. Add ice if needed for thickness.', 2),
      (recipe_uuid, 4, 'Pour into a bowl.', 0),
      (recipe_uuid, 5, 'Top with granola, fresh berries, chia seeds, and shredded coconut. Enjoy with a spoon!', 0);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'American', 'cuisine'),
      (recipe_uuid, 'Healthy', 'dietary'),
      (recipe_uuid, 'High-Protein', 'dietary'),
      (recipe_uuid, 'Vegan', 'dietary'),
      (recipe_uuid, 'Breakfast', 'other'),
      (recipe_uuid, 'Post-Workout', 'other');
  END IF;
END $$;

-- =============================================
-- LUNCH/DINNER RECIPES
-- =============================================

-- Recipe 6: Mediterranean Quinoa Bowl
DO $$
DECLARE
  recipe_uuid uuid := 'a10e8400-e29b-41d4-a716-446655440006';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Mediterranean Quinoa Bowl',
      'Nutrient-packed bowl with fluffy quinoa, crisp cucumbers, juicy tomatoes, creamy feta, olives, and a lemon-herb dressing. Complete plant-based protein.',
      'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=500',
      25,
      'Beginner',
      'Lunch',
      'Mediterranean',
      380,
      14,
      52,
      14,
      65,
      9.0
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'Rinse 1 cup quinoa and cook in 2 cups water until fluffy.', 15),
      (recipe_uuid, 2, 'While quinoa cooks, dice cucumber, cherry tomatoes, and red onion.', 5),
      (recipe_uuid, 3, 'In a small bowl, whisk together olive oil, lemon juice, garlic, salt, and oregano.', 2),
      (recipe_uuid, 4, 'Fluff cooked quinoa and let cool slightly.', 2),
      (recipe_uuid, 5, 'Combine quinoa with vegetables, chickpeas, crumbled feta, and olives.', 0),
      (recipe_uuid, 6, 'Drizzle with dressing and toss. Garnish with fresh parsley. Serve warm or cold.', 0);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'Mediterranean', 'cuisine'),
      (recipe_uuid, 'Healthy', 'dietary'),
      (recipe_uuid, 'Vegetarian', 'dietary'),
      (recipe_uuid, 'High-Protein', 'dietary'),
      (recipe_uuid, 'High-Fiber', 'dietary'),
      (recipe_uuid, 'Lunch', 'other'),
      (recipe_uuid, 'Meal-Prep', 'other');
  END IF;
END $$;

-- Recipe 7: Grilled Chicken Caesar Salad
DO $$
DECLARE
  recipe_uuid uuid := 'a10e8400-e29b-41d4-a716-446655440007';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Grilled Chicken Caesar Salad',
      'Classic Caesar salad with grilled chicken breast, crisp romaine, parmesan, and a lighter homemade dressing. High-protein, low-carb perfection.',
      'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=500',
      20,
      'Intermediate',
      'Lunch',
      'American',
      350,
      38,
      15,
      16,
      70,
      8.5
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'Season chicken breast with salt, pepper, and garlic powder.', 0),
      (recipe_uuid, 2, 'Grill chicken over medium-high heat until cooked through (165°F internal temp).', 12),
      (recipe_uuid, 3, 'Let chicken rest for 5 minutes, then slice.', 5),
      (recipe_uuid, 4, 'Chop romaine lettuce and place in a large bowl.', 2),
      (recipe_uuid, 5, 'Make dressing: whisk Greek yogurt, lemon juice, garlic, anchovy paste, and parmesan.', 3),
      (recipe_uuid, 6, 'Toss lettuce with dressing. Top with sliced chicken and extra parmesan.', 0);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'American', 'cuisine'),
      (recipe_uuid, 'Healthy', 'dietary'),
      (recipe_uuid, 'High-Protein', 'dietary'),
      (recipe_uuid, 'Low-Carb', 'dietary'),
      (recipe_uuid, 'Lunch', 'other');
  END IF;
END $$;

-- Recipe 8: Baked Salmon with Asparagus
DO $$
DECLARE
  recipe_uuid uuid := 'a10e8400-e29b-41d4-a716-446655440008';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Baked Salmon with Asparagus',
      'Oven-baked salmon fillet with roasted asparagus, lemon, and herbs. Rich in omega-3 fatty acids and incredibly simple to make.',
      'https://images.pexels.com/photos/1516415/pexels-photo-1516415.jpeg?auto=compress&cs=tinysrgb&w=500',
      25,
      'Beginner',
      'Dinner',
      'American',
      320,
      34,
      8,
      16,
      75,
      9.5
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'Preheat oven to 400°F (200°C).', 0),
      (recipe_uuid, 2, 'Place salmon fillet on a baking sheet. Season with salt, pepper, and garlic.', 0),
      (recipe_uuid, 3, 'Arrange asparagus around salmon. Drizzle everything with olive oil and lemon juice.', 0),
      (recipe_uuid, 4, 'Bake for 15-18 minutes until salmon flakes easily with a fork.', 18),
      (recipe_uuid, 5, 'Garnish with fresh dill and lemon wedges. Serve immediately.', 0);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'American', 'cuisine'),
      (recipe_uuid, 'Healthy', 'dietary'),
      (recipe_uuid, 'High-Protein', 'dietary'),
      (recipe_uuid, 'Low-Carb', 'dietary'),
      (recipe_uuid, 'Omega-3', 'dietary'),
      (recipe_uuid, 'Dinner', 'other');
  END IF;
END $$;

-- Recipe 9: Turkey & Sweet Potato Chili
DO $$
DECLARE
  recipe_uuid uuid := 'a10e8400-e29b-41d4-a716-446655440009';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Turkey & Sweet Potato Chili',
      'Hearty chili made with lean ground turkey, sweet potatoes, black beans, and warming spices. High in fiber and perfect for meal prep.',
      'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=500',
      45,
      'Intermediate',
      'Dinner',
      'American',
      340,
      28,
      38,
      8,
      70,
      8.5
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'In a large pot, brown 1 lb ground turkey over medium heat.', 8),
      (recipe_uuid, 2, 'Add diced onion, bell pepper, and garlic. Sauté until softened.', 5),
      (recipe_uuid, 3, 'Stir in cubed sweet potato, diced tomatoes, black beans, and spices.', 2),
      (recipe_uuid, 4, 'Add chicken broth and bring to a boil.', 5),
      (recipe_uuid, 5, 'Reduce heat and simmer until sweet potatoes are tender.', 20),
      (recipe_uuid, 6, 'Season to taste. Serve with Greek yogurt and cilantro.', 0);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'American', 'cuisine'),
      (recipe_uuid, 'Healthy', 'dietary'),
      (recipe_uuid, 'High-Protein', 'dietary'),
      (recipe_uuid, 'High-Fiber', 'dietary'),
      (recipe_uuid, 'Dinner', 'other'),
      (recipe_uuid, 'Meal-Prep', 'other');
  END IF;
END $$;

-- Recipe 10: Zucchini Noodles with Pesto
DO $$
DECLARE
  recipe_uuid uuid := 'a10e8400-e29b-41d4-a716-446655440010';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Zucchini Noodles with Pesto',
      'Fresh spiralized zucchini tossed in homemade basil pesto with cherry tomatoes and pine nuts. A delicious low-carb pasta alternative.',
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=500',
      20,
      'Beginner',
      'Dinner',
      'Italian',
      250,
      8,
      18,
      16,
      60,
      8.0
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'Spiralize 2-3 medium zucchinis into noodles. Pat dry with paper towels.', 5),
      (recipe_uuid, 2, 'Make pesto: blend basil, garlic, pine nuts, parmesan, and olive oil until smooth.', 5),
      (recipe_uuid, 3, 'Heat a large pan over medium heat. Add zucchini noodles and sauté for 2-3 minutes.', 3),
      (recipe_uuid, 4, 'Remove from heat and toss with pesto.', 0),
      (recipe_uuid, 5, 'Top with halved cherry tomatoes and extra parmesan. Serve immediately.', 0);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'Italian', 'cuisine'),
      (recipe_uuid, 'Healthy', 'dietary'),
      (recipe_uuid, 'Vegetarian', 'dietary'),
      (recipe_uuid, 'Low-Carb', 'dietary'),
      (recipe_uuid, 'Quick', 'other'),
      (recipe_uuid, 'Dinner', 'other');
  END IF;
END $$;

-- Recipe 11: Teriyaki Tofu Stir-Fry
DO $$
DECLARE
  recipe_uuid uuid := 'a10e8400-e29b-41d4-a716-446655440011';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Teriyaki Tofu Stir-Fry',
      'Crispy pan-fried tofu with colorful vegetables in a sweet-savory teriyaki sauce. Plant-based protein powerhouse ready in under 30 minutes.',
      'https://images.pexels.com/photos/2703468/pexels-photo-2703468.jpeg?auto=compress&cs=tinysrgb&w=500',
      30,
      'Intermediate',
      'Dinner',
      'Asian',
      310,
      18,
      35,
      12,
      65,
      8.5
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'Press tofu to remove excess water. Cut into cubes.', 5),
      (recipe_uuid, 2, 'Pan-fry tofu cubes until golden and crispy on all sides.', 10),
      (recipe_uuid, 3, 'Set tofu aside. In the same pan, stir-fry broccoli, bell peppers, and snap peas.', 6),
      (recipe_uuid, 4, 'Mix teriyaki sauce: soy sauce, honey, ginger, garlic, and cornstarch.', 2),
      (recipe_uuid, 5, 'Add tofu back to pan with vegetables. Pour sauce over and toss to coat.', 3),
      (recipe_uuid, 6, 'Serve over brown rice or quinoa. Garnish with sesame seeds.', 0);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'Asian', 'cuisine'),
      (recipe_uuid, 'Healthy', 'dietary'),
      (recipe_uuid, 'Vegan', 'dietary'),
      (recipe_uuid, 'High-Protein', 'dietary'),
      (recipe_uuid, 'Dinner', 'other');
  END IF;
END $$;

-- Recipe 12: Lentil Curry
DO $$
DECLARE
  recipe_uuid uuid := 'a10e8400-e29b-41d4-a716-446655440012';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Lentil Curry',
      'Aromatic Indian curry with red lentils, tomatoes, and warming spices in creamy coconut milk. Rich in plant-based protein and fiber.',
      'https://images.pexels.com/photos/2474658/pexels-photo-2474658.jpeg?auto=compress&cs=tinysrgb&w=500',
      40,
      'Intermediate',
      'Dinner',
      'Indian',
      330,
      16,
      48,
      10,
      70,
      9.0
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'Rinse 1 cup red lentils. Set aside.', 0),
      (recipe_uuid, 2, 'Sauté onions, garlic, and ginger in oil until fragrant.', 5),
      (recipe_uuid, 3, 'Add curry powder, turmeric, cumin, and cook for 1 minute.', 1),
      (recipe_uuid, 4, 'Stir in lentils, diced tomatoes, and vegetable broth. Bring to boil.', 5),
      (recipe_uuid, 5, 'Reduce heat and simmer until lentils are soft.', 20),
      (recipe_uuid, 6, 'Stir in coconut milk. Season with salt and serve with rice.', 2);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'Indian', 'cuisine'),
      (recipe_uuid, 'Healthy', 'dietary'),
      (recipe_uuid, 'Vegan', 'dietary'),
      (recipe_uuid, 'High-Fiber', 'dietary'),
      (recipe_uuid, 'High-Protein', 'dietary'),
      (recipe_uuid, 'Dinner', 'other'),
      (recipe_uuid, 'Meal-Prep', 'other');
  END IF;
END $$;

-- Recipe 13: Shrimp Taco Bowl
DO $$
DECLARE
  recipe_uuid uuid := 'a10e8400-e29b-41d4-a716-446655440013';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Shrimp Taco Bowl',
      'Spiced shrimp over cilantro-lime rice with black beans, corn, avocado, and fresh pico de gallo. A light and flavorful Mexican-inspired bowl.',
      'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=500',
      25,
      'Beginner',
      'Dinner',
      'Mexican',
      290,
      26,
      32,
      8,
      65,
      8.5
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'Cook rice and mix with lime juice and cilantro. Set aside.', 15),
      (recipe_uuid, 2, 'Season shrimp with chili powder, cumin, garlic powder, and paprika.', 0),
      (recipe_uuid, 3, 'Sauté shrimp in a hot pan for 2-3 minutes per side until pink.', 6),
      (recipe_uuid, 4, 'Assemble bowl: rice, black beans, corn, and cooked shrimp.', 0),
      (recipe_uuid, 5, 'Top with diced avocado, pico de gallo, and a squeeze of lime.', 0);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'Mexican', 'cuisine'),
      (recipe_uuid, 'Healthy', 'dietary'),
      (recipe_uuid, 'High-Protein', 'dietary'),
      (recipe_uuid, 'Quick', 'other'),
      (recipe_uuid, 'Dinner', 'other');
  END IF;
END $$;

-- Recipe 14: Chicken Pho
DO $$
DECLARE
  recipe_uuid uuid := 'a10e8400-e29b-41d4-a716-446655440014';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Chicken Pho',
      'Vietnamese aromatic noodle soup with tender chicken, rice noodles, and fresh herbs in a fragrant star anise broth. Comforting and low in fat.',
      'https://images.pexels.com/photos/1907228/pexels-photo-1907228.jpeg?auto=compress&cs=tinysrgb&w=500',
      45,
      'Advanced',
      'Dinner',
      'Vietnamese',
      280,
      30,
      35,
      4,
      70,
      9.0
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'Simmer chicken breast in broth with star anise, cinnamon, ginger, and onion.', 25),
      (recipe_uuid, 2, 'Remove chicken, shred it, and strain broth.', 5),
      (recipe_uuid, 3, 'Cook rice noodles according to package directions. Drain.', 8),
      (recipe_uuid, 4, 'Divide noodles into bowls. Top with shredded chicken.', 0),
      (recipe_uuid, 5, 'Ladle hot broth over noodles.', 0),
      (recipe_uuid, 6, 'Garnish with bean sprouts, basil, lime, jalapeño, and sriracha.', 0);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'Vietnamese', 'cuisine'),
      (recipe_uuid, 'Healthy', 'dietary'),
      (recipe_uuid, 'High-Protein', 'dietary'),
      (recipe_uuid, 'Low-Fat', 'dietary'),
      (recipe_uuid, 'Dinner', 'other');
  END IF;
END $$;

-- Recipe 15: Buddha Bowl
DO $$
DECLARE
  recipe_uuid uuid := 'a10e8400-e29b-41d4-a716-446655440015';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Buddha Bowl',
      'Colorful plant-based bowl with roasted chickpeas, quinoa, kale, sweet potato, avocado, and tahini dressing. Nutrient-dense and satisfying.',
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=500',
      35,
      'Beginner',
      'Lunch',
      'American',
      360,
      14,
      52,
      12,
      70,
      9.5
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'Roast cubed sweet potato at 400°F for 25 minutes.', 25),
      (recipe_uuid, 2, 'Cook quinoa according to package directions.', 15),
      (recipe_uuid, 3, 'Massage kale with lemon juice and olive oil.', 2),
      (recipe_uuid, 4, 'Roast chickpeas with spices until crispy.', 15),
      (recipe_uuid, 5, 'Make tahini dressing: mix tahini, lemon, garlic, and water.', 3),
      (recipe_uuid, 6, 'Assemble bowl with all ingredients. Drizzle with dressing.', 0);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'American', 'cuisine'),
      (recipe_uuid, 'Healthy', 'dietary'),
      (recipe_uuid, 'Vegan', 'dietary'),
      (recipe_uuid, 'High-Fiber', 'dietary'),
      (recipe_uuid, 'Lunch', 'other'),
      (recipe_uuid, 'Meal-Prep', 'other');
  END IF;
END $$;

-- =============================================
-- SNACK RECIPES
-- =============================================

-- Recipe 16: Hummus with Veggies
DO $$
DECLARE
  recipe_uuid uuid := 'a10e8400-e29b-41d4-a716-446655440016';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Hummus with Veggies',
      'Creamy homemade chickpea hummus with fresh cut vegetables - carrots, celery, bell peppers, and cucumbers. Perfect protein-rich snack.',
      'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=500',
      15,
      'Beginner',
      'Snack',
      'Mediterranean',
      150,
      6,
      18,
      6,
      40,
      8.0
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'In a food processor, blend chickpeas, tahini, lemon juice, and garlic.', 0),
      (recipe_uuid, 2, 'Add olive oil gradually while blending until smooth and creamy.', 2),
      (recipe_uuid, 3, 'Season with salt, cumin, and paprika. Blend again.', 0),
      (recipe_uuid, 4, 'Cut carrots, celery, bell peppers, and cucumbers into sticks.', 5),
      (recipe_uuid, 5, 'Serve hummus in a bowl with veggie sticks arranged around it.', 0);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'Mediterranean', 'cuisine'),
      (recipe_uuid, 'Healthy', 'dietary'),
      (recipe_uuid, 'Vegan', 'dietary'),
      (recipe_uuid, 'High-Fiber', 'dietary'),
      (recipe_uuid, 'Snack', 'other'),
      (recipe_uuid, 'Quick', 'other');
  END IF;
END $$;

-- Recipe 17: Energy Balls
DO $$
DECLARE
  recipe_uuid uuid := 'a10e8400-e29b-41d4-a716-446655440017';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Energy Balls',
      'No-bake energy bites made with dates, nuts, oats, and dark chocolate chips. Perfect grab-and-go snack packed with healthy fats and natural sweetness.',
      'https://images.pexels.com/photos/1028714/pexels-photo-1028714.jpeg?auto=compress&cs=tinysrgb&w=500',
      20,
      'Beginner',
      'Snack',
      'American',
      180,
      5,
      22,
      9,
      45,
      7.5
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'In a food processor, pulse dates, almonds, and oats until finely chopped.', 2),
      (recipe_uuid, 2, 'Add peanut butter, honey, and vanilla. Process until mixture holds together.', 2),
      (recipe_uuid, 3, 'Fold in dark chocolate chips and chia seeds.', 0),
      (recipe_uuid, 4, 'Roll mixture into 1-inch balls using your hands.', 10),
      (recipe_uuid, 5, 'Refrigerate for 30 minutes to firm up. Store in an airtight container.', 0);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'American', 'cuisine'),
      (recipe_uuid, 'Healthy', 'dietary'),
      (recipe_uuid, 'Vegetarian', 'dietary'),
      (recipe_uuid, 'Snack', 'other'),
      (recipe_uuid, 'Meal-Prep', 'other'),
      (recipe_uuid, 'No-Bake', 'other');
  END IF;
END $$;

-- Recipe 18: Greek Yogurt Dip
DO $$
DECLARE
  recipe_uuid uuid := 'a10e8400-e29b-41d4-a716-446655440018';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Greek Yogurt Dip',
      'Protein-packed tzatziki-style dip with Greek yogurt, cucumber, dill, and garlic. Serve with pita chips or use as a healthy sandwich spread.',
      'https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg?auto=compress&cs=tinysrgb&w=500',
      10,
      'Beginner',
      'Snack',
      'Greek',
      120,
      10,
      12,
      3,
      35,
      8.5
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'Grate cucumber and squeeze out excess water with a clean kitchen towel.', 3),
      (recipe_uuid, 2, 'In a bowl, mix Greek yogurt with grated cucumber.', 0),
      (recipe_uuid, 3, 'Add minced garlic, chopped fresh dill, lemon juice, salt, and pepper.', 2),
      (recipe_uuid, 4, 'Stir well and refrigerate for at least 30 minutes for flavors to meld.', 0),
      (recipe_uuid, 5, 'Serve chilled with whole wheat pita chips or raw vegetables.', 0);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'Greek', 'cuisine'),
      (recipe_uuid, 'Healthy', 'dietary'),
      (recipe_uuid, 'Vegetarian', 'dietary'),
      (recipe_uuid, 'High-Protein', 'dietary'),
      (recipe_uuid, 'Low-Carb', 'dietary'),
      (recipe_uuid, 'Snack', 'other'),
      (recipe_uuid, 'Quick', 'other');
  END IF;
END $$;

-- Recipe 19: Roasted Chickpeas
DO $$
DECLARE
  recipe_uuid uuid := 'a10e8400-e29b-41d4-a716-446655440019';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Roasted Chickpeas',
      'Crunchy oven-roasted chickpeas seasoned with your choice of spices. A high-fiber, protein-rich alternative to chips that''s actually good for you!',
      'https://images.pexels.com/photos/2377045/pexels-photo-2377045.jpeg?auto=compress&cs=tinysrgb&w=500',
      35,
      'Beginner',
      'Snack',
      'Mediterranean',
      140,
      7,
      22,
      3,
      40,
      8.0
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'Preheat oven to 400°F (200°C).', 0),
      (recipe_uuid, 2, 'Drain and rinse canned chickpeas. Pat completely dry with paper towels.', 5),
      (recipe_uuid, 3, 'Toss chickpeas with olive oil, salt, and your choice of spices (paprika, cumin, garlic powder).', 2),
      (recipe_uuid, 4, 'Spread in a single layer on a baking sheet.', 0),
      (recipe_uuid, 5, 'Roast for 25-30 minutes, shaking pan every 10 minutes, until crispy.', 30),
      (recipe_uuid, 6, 'Let cool completely before eating. Store in an airtight container.', 0);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'Mediterranean', 'cuisine'),
      (recipe_uuid, 'Healthy', 'dietary'),
      (recipe_uuid, 'Vegan', 'dietary'),
      (recipe_uuid, 'High-Fiber', 'dietary'),
      (recipe_uuid, 'High-Protein', 'dietary'),
      (recipe_uuid, 'Snack', 'other');
  END IF;
END $$;

-- Recipe 20: Fruit & Nut Mix
DO $$
DECLARE
  recipe_uuid uuid := 'a10e8400-e29b-41d4-a716-446655440020';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM recipes WHERE id = recipe_uuid) THEN
    INSERT INTO recipes (id, title, description, image_url, prep_time, difficulty, meal_type, cuisine_type, calories, protein, carbs, fat, points, nutrition_score)
    VALUES (
      recipe_uuid,
      'Fruit & Nut Mix',
      'Custom trail mix with almonds, walnuts, dried cranberries, dark chocolate chips, and coconut flakes. Perfect portable energy boost.',
      'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=500',
      5,
      'Beginner',
      'Snack',
      'American',
      200,
      6,
      20,
      12,
      45,
      7.5
    );

    INSERT INTO recipe_instructions (recipe_id, step_number, instruction, timer_minutes)
    VALUES 
      (recipe_uuid, 1, 'In a large bowl, combine raw almonds and walnuts.', 0),
      (recipe_uuid, 2, 'Add dried cranberries, raisins, or other dried fruit of choice.', 0),
      (recipe_uuid, 3, 'Mix in dark chocolate chips and unsweetened coconut flakes.', 0),
      (recipe_uuid, 4, 'Toss everything together until evenly distributed.', 1),
      (recipe_uuid, 5, 'Portion into small bags or containers for grab-and-go snacking.', 0);

    INSERT INTO recipe_tags (recipe_id, tag, tag_type)
    VALUES 
      (recipe_uuid, 'American', 'cuisine'),
      (recipe_uuid, 'Healthy', 'dietary'),
      (recipe_uuid, 'Vegetarian', 'dietary'),
      (recipe_uuid, 'Vegan', 'dietary'),
      (recipe_uuid, 'Snack', 'other'),
      (recipe_uuid, 'Quick', 'other'),
      (recipe_uuid, 'No-Cook', 'other');
  END IF;
END $$;

-- =============================================
-- ADD INGREDIENTS TO RECIPES
-- =============================================
-- Note: First we'll add any missing ingredients to the ingredients table

-- Add missing ingredients if they don't exist
-- Valid categories: 'Fruits', 'Vegetables', 'Protein', 'Dairy', 'Grains', 'Pantry'
INSERT INTO ingredients (name, category) VALUES ('Greek Yogurt', 'Dairy') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Granola', 'Grains') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Mixed Berries', 'Fruits') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Honey', 'Pantry') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Avocado', 'Vegetables') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Whole Grain Bread', 'Grains') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Eggs', 'Protein') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Rolled Oats', 'Grains') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Chia Seeds', 'Pantry') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Almond Milk', 'Dairy') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Banana', 'Fruits') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Bell Pepper', 'Vegetables') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Spinach', 'Vegetables') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Cherry Tomatoes', 'Vegetables') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Onion', 'Vegetables') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Protein Powder', 'Protein') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Peanut Butter', 'Protein') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Quinoa', 'Grains') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Cucumber', 'Vegetables') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Feta Cheese', 'Dairy') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Olives', 'Vegetables') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Chickpeas', 'Protein') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Lemon', 'Fruits') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Olive Oil', 'Pantry') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Garlic', 'Vegetables') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Chicken Breast', 'Protein') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Romaine Lettuce', 'Vegetables') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Parmesan Cheese', 'Dairy') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Salmon', 'Protein') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Asparagus', 'Vegetables') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Ground Turkey', 'Protein') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Sweet Potato', 'Vegetables') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Black Beans', 'Protein') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Tomato', 'Vegetables') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Zucchini', 'Vegetables') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Basil', 'Pantry') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Pine Nuts', 'Pantry') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Tofu', 'Protein') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Broccoli', 'Vegetables') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Soy Sauce', 'Pantry') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Ginger', 'Pantry') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Red Lentils', 'Protein') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Coconut Milk', 'Dairy') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Curry Powder', 'Pantry') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Shrimp', 'Protein') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Rice', 'Grains') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Corn', 'Vegetables') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Lime', 'Fruits') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Cilantro', 'Pantry') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Rice Noodles', 'Grains') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Star Anise', 'Pantry') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Kale', 'Vegetables') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Tahini', 'Pantry') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Carrots', 'Vegetables') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Celery', 'Vegetables') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Dates', 'Fruits') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Almonds', 'Pantry') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Dark Chocolate Chips', 'Pantry') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Dill', 'Pantry') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Walnuts', 'Pantry') ON CONFLICT (name) DO NOTHING;
INSERT INTO ingredients (name, category) VALUES ('Dried Cranberries', 'Fruits') ON CONFLICT (name) DO NOTHING;

-- Now link ingredients to recipes
-- Recipe 1: Greek Yogurt Parfait
DO $$
DECLARE
  recipe_id uuid := 'a10e8400-e29b-41d4-a716-446655440001';
  yogurt_id uuid;
  granola_id uuid;
  berries_id uuid;
  honey_id uuid;
BEGIN
  SELECT id INTO yogurt_id FROM ingredients WHERE name = 'Greek Yogurt' LIMIT 1;
  SELECT id INTO granola_id FROM ingredients WHERE name = 'Granola' LIMIT 1;
  SELECT id INTO berries_id FROM ingredients WHERE name = 'Mixed Berries' LIMIT 1;
  SELECT id INTO honey_id FROM ingredients WHERE name = 'Honey' LIMIT 1;

  IF yogurt_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) VALUES (recipe_id, yogurt_id, '1 cup') ON CONFLICT DO NOTHING;
  END IF;
  IF granola_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) VALUES (recipe_id, granola_id, '4 tbsp') ON CONFLICT DO NOTHING;
  END IF;
  IF berries_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) VALUES (recipe_id, berries_id, '1 cup') ON CONFLICT DO NOTHING;
  END IF;
  IF honey_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) VALUES (recipe_id, honey_id, '1 tbsp') ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Recipe 2: Avocado Toast with Poached Egg
DO $$
DECLARE
  recipe_id uuid := 'a10e8400-e29b-41d4-a716-446655440002';
  bread_id uuid;
  avocado_id uuid;
  eggs_id uuid;
BEGIN
  SELECT id INTO bread_id FROM ingredients WHERE name = 'Whole Grain Bread' LIMIT 1;
  SELECT id INTO avocado_id FROM ingredients WHERE name = 'Avocado' LIMIT 1;
  SELECT id INTO eggs_id FROM ingredients WHERE name = 'Eggs' LIMIT 1;

  IF bread_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) VALUES (recipe_id, bread_id, '2 slices') ON CONFLICT DO NOTHING;
  END IF;
  IF avocado_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) VALUES (recipe_id, avocado_id, '1 whole') ON CONFLICT DO NOTHING;
  END IF;
  IF eggs_id IS NOT NULL THEN
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount) VALUES (recipe_id, eggs_id, '2 eggs') ON CONFLICT DO NOTHING;
  END IF;
END $$;