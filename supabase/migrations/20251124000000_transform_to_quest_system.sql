-- Migration: Transform Challenge System to Quest-Based System
-- This migration adds quest activation tracking and updates the challenge system

-- Add new columns to track quest activation
ALTER TABLE user_challenge_progress
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS quest_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;

-- Update challenges table to remove fixed time limits
-- Challenges are now "evergreen" - they can be started at any time
ALTER TABLE challenges
ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS is_evergreen BOOLEAN DEFAULT true;

-- Update existing challenges to be evergreen
UPDATE challenges
SET is_evergreen = true,
    duration_days = EXTRACT(DAY FROM (end_date::timestamp - start_date::timestamp))::integer
WHERE is_evergreen IS NULL;

-- Create an index for better query performance on active quests
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_active 
ON user_challenge_progress(user_id, is_active) 
WHERE is_active = true;

-- Create a function to activate a quest
CREATE OR REPLACE FUNCTION activate_quest(
  p_user_id UUID,
  p_challenge_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  quest_end_date TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_duration_days INTEGER;
  v_quest_end_date TIMESTAMP WITH TIME ZONE;
  v_existing_progress_id UUID;
BEGIN
  -- Get the challenge duration
  SELECT duration_days INTO v_duration_days
  FROM challenges
  WHERE id = p_challenge_id;

  IF v_duration_days IS NULL THEN
    RETURN QUERY SELECT false, 'Challenge not found', NULL::TIMESTAMP WITH TIME ZONE;
    RETURN;
  END IF;

  -- Calculate quest end date
  v_quest_end_date := NOW() + (v_duration_days || ' days')::INTERVAL;

  -- Check if user already has progress for this challenge
  SELECT id INTO v_existing_progress_id
  FROM user_challenge_progress
  WHERE user_id = p_user_id AND challenge_id = p_challenge_id;

  IF v_existing_progress_id IS NOT NULL THEN
    -- Update existing progress record
    UPDATE user_challenge_progress
    SET activated_at = NOW(),
        quest_end_date = v_quest_end_date,
        is_active = true,
        updated_at = NOW()
    WHERE id = v_existing_progress_id;
  ELSE
    -- Insert new progress record
    INSERT INTO user_challenge_progress (
      user_id,
      challenge_id,
      activated_at,
      quest_end_date,
      is_active,
      completed_tasks,
      is_completed
    ) VALUES (
      p_user_id,
      p_challenge_id,
      NOW(),
      v_quest_end_date,
      true,
      0,
      false
    );
  END IF;

  RETURN QUERY SELECT true, 'Quest activated successfully', v_quest_end_date;
END;
$$ LANGUAGE plpgsql;

-- Add comment to the function
COMMENT ON FUNCTION activate_quest IS 'Activates a quest for a user and sets the timer based on challenge duration';

-- Insert new diverse challenges/quests
INSERT INTO challenges (
  title,
  description,
  long_description,
  category,
  total_tasks,
  reward_points,
  start_date,
  end_date,
  icon,
  color,
  bg_color,
  is_active,
  duration_days,
  is_evergreen
) VALUES
-- Beginner-friendly quests
(
  'Kitchen Newbie',
  'Start your cooking journey with 3 simple recipes',
  'Perfect for beginners! Learn the basics by cooking three easy recipes. This quest will help you build confidence in the kitchen with straightforward, delicious meals.',
  'Beginner',
  3,
  150,
  NOW(),
  NOW() + INTERVAL '365 days',
  'restaurant-outline',
  '#3b82f6',
  '#dbeafe',
  true,
  7,
  true
),
(
  'Healthy Start',
  'Prepare 5 healthy meals under 400 calories',
  'Focus on nutrition with this quest! Cook five balanced, low-calorie meals that prove healthy eating can be delicious. Perfect for starting a wellness journey.',
  'Nutrition',
  5,
  200,
  NOW(),
  NOW() + INTERVAL '365 days',
  'nutrition-outline',
  '#10b981',
  '#d1fae5',
  true,
  10,
  true
),

-- Skill-building quests
(
  'Spice Explorer',
  'Cook 4 recipes using at least 5 different spices each',
  'Expand your spice knowledge! This quest challenges you to cook with diverse spices and seasonings, helping you understand flavor profiles and create more complex dishes.',
  'Skills',
  4,
  250,
  NOW(),
  NOW() + INTERVAL '365 days',
  'flask-outline',
  '#f59e0b',
  '#fef3c7',
  true,
  14,
  true
),
(
  'Meal Prep Master',
  'Prepare 3 batch-cooking recipes for the week',
  'Master the art of meal prep! Cook three recipes designed for batch preparation, saving time and ensuring you have healthy meals ready throughout the week.',
  'Skills',
  3,
  200,
  NOW(),
  NOW() + INTERVAL '365 days',
  'calendar-outline',
  '#8b5cf6',
  '#ede9fe',
  true,
  7,
  true
),

-- Cultural exploration quests
(
  'Asian Cuisine Journey',
  'Explore Asian flavors by cooking 5 traditional recipes',
  'Take a culinary trip through Asia! Cook five authentic recipes from different Asian cuisines, learning traditional techniques and flavor combinations.',
  'Cultural',
  5,
  300,
  NOW(),
  NOW() + INTERVAL '365 days',
  'earth-outline',
  '#ec4899',
  '#fce7f3',
  true,
  14,
  true
),
(
  'Filipino Food Fest',
  'Master 4 classic Filipino dishes',
  'Dive into Filipino cuisine! This quest introduces you to beloved Filipino recipes, from savory adobo to sweet desserts, celebrating rich culinary traditions.',
  'Cultural',
  4,
  250,
  NOW(),
  NOW() + INTERVAL '365 days',
  'heart-outline',
  '#ef4444',
  '#fee2e2',
  true,
  10,
  true
),

-- Advanced quests
(
  'Protein Power',
  'Cook 6 high-protein meals (25g+ protein each)',
  'Build muscle and stay satisfied! Create six protein-rich meals perfect for fitness goals, featuring lean meats, fish, legumes, and creative protein sources.',
  'Nutrition',
  6,
  350,
  NOW(),
  NOW() + INTERVAL '365 days',
  'barbell-outline',
  '#06b6d4',
  '#cffafe',
  true,
  14,
  true
),
(
  'Zero Waste Chef',
  'Prepare 5 recipes using leftover ingredients',
  'Reduce food waste while being creative! Learn to transform leftovers and scraps into delicious new meals, saving money and helping the environment.',
  'Sustainability',
  5,
  300,
  NOW(),
  NOW() + INTERVAL '365 days',
  'leaf-outline',
  '#22c55e',
  '#dcfce7',
  true,
  10,
  true
),

-- Challenge quests
(
  '7-Day Streak',
  'Cook at least one meal every day for a week',
  'Build a consistent cooking habit! This quest encourages daily cooking practice, helping you develop routine and confidence in the kitchen.',
  'Challenge',
  7,
  400,
  NOW(),
  NOW() + INTERVAL '365 days',
  'flame-outline',
  '#f97316',
  '#ffedd5',
  true,
  7,
  true
),
(
  'Breakfast Champion',
  'Prepare 5 different breakfast recipes',
  'Start your day right! Master breakfast cooking with five diverse morning meal recipes, from quick weekday options to leisurely weekend brunches.',
  'Meal Type',
  5,
  200,
  NOW(),
  NOW() + INTERVAL '365 days',
  'sunny-outline',
  '#eab308',
  '#fef9c3',
  true,
  10,
  true
),
(
  'Dinner Party Host',
  'Cook 3 impressive dinner recipes',
  'Become a confident host! Learn to prepare three show-stopping dinner recipes perfect for entertaining guests and special occasions.',
  'Skills',
  3,
  250,
  NOW(),
  NOW() + INTERVAL '365 days',
  'people-outline',
  '#a855f7',
  '#f3e8ff',
  true,
  14,
  true
),
(
  'Vegetarian Voyage',
  'Create 6 delicious plant-based meals',
  'Explore meat-free cooking! This quest showcases how satisfying and flavorful vegetarian meals can be, with six diverse plant-based recipes.',
  'Dietary',
  6,
  300,
  NOW(),
  NOW() + INTERVAL '365 days',
  'leaf-outline',
  '#84cc16',
  '#ecfccb',
  true,
  14,
  true
);

-- Now insert corresponding tasks for each new challenge
-- Kitchen Newbie tasks
INSERT INTO challenge_tasks (challenge_id, title, description, order_number)
SELECT id, 'Cook your first recipe', 'Choose any recipe and complete it', 1
FROM challenges WHERE title = 'Kitchen Newbie'
UNION ALL
SELECT id, 'Try a different cuisine', 'Cook a recipe from a cuisine you haven''t tried', 2
FROM challenges WHERE title = 'Kitchen Newbie'
UNION ALL
SELECT id, 'Make a complete meal', 'Cook a recipe that includes protein and vegetables', 3
FROM challenges WHERE title = 'Kitchen Newbie';

-- Healthy Start tasks
INSERT INTO challenge_tasks (challenge_id, title, description, order_number)
SELECT id, 'Cook a light breakfast', 'Prepare a breakfast recipe under 300 calories', 1
FROM challenges WHERE title = 'Healthy Start'
UNION ALL
SELECT id, 'Make a balanced lunch', 'Cook a lunch with protein and vegetables (under 400 cal)', 2
FROM challenges WHERE title = 'Healthy Start'
UNION ALL
SELECT id, 'Prepare a lean dinner', 'Create a satisfying dinner under 400 calories', 3
FROM challenges WHERE title = 'Healthy Start'
UNION ALL
SELECT id, 'Try a salad recipe', 'Make a creative, filling salad', 4
FROM challenges WHERE title = 'Healthy Start'
UNION ALL
SELECT id, 'Cook a veggie-forward dish', 'Prepare a meal where vegetables are the star', 5
FROM challenges WHERE title = 'Healthy Start';

-- Spice Explorer tasks
INSERT INTO challenge_tasks (challenge_id, title, description, order_number)
SELECT id, 'Cook with cumin and coriander', 'Use both spices in one recipe', 1
FROM challenges WHERE title = 'Spice Explorer'
UNION ALL
SELECT id, 'Try an Asian spice blend', 'Cook with ginger, garlic, and soy sauce', 2
FROM challenges WHERE title = 'Spice Explorer'
UNION ALL
SELECT id, 'Use warming spices', 'Cook with cinnamon, nutmeg, or cardamom', 3
FROM challenges WHERE title = 'Spice Explorer'
UNION ALL
SELECT id, 'Experiment with heat', 'Cook with chili peppers or hot spices', 4
FROM challenges WHERE title = 'Spice Explorer';

-- Meal Prep Master tasks
INSERT INTO challenge_tasks (challenge_id, title, description, order_number)
SELECT id, 'Batch cook a protein', 'Prepare chicken, tofu, or legumes for multiple meals', 1
FROM challenges WHERE title = 'Meal Prep Master'
UNION ALL
SELECT id, 'Make a grain base', 'Cook rice, quinoa, or pasta in bulk', 2
FROM challenges WHERE title = 'Meal Prep Master'
UNION ALL
SELECT id, 'Prep vegetables', 'Chop and store vegetables for the week', 3
FROM challenges WHERE title = 'Meal Prep Master';

-- Asian Cuisine Journey tasks
INSERT INTO challenge_tasks (challenge_id, title, description, order_number)
SELECT id, 'Cook a Chinese dish', 'Try stir-fry or fried rice', 1
FROM challenges WHERE title = 'Asian Cuisine Journey'
UNION ALL
SELECT id, 'Make a Japanese recipe', 'Cook teriyaki, ramen, or sushi', 2
FROM challenges WHERE title = 'Asian Cuisine Journey'
UNION ALL
SELECT id, 'Prepare Thai food', 'Try pad thai or curry', 3
FROM challenges WHERE title = 'Asian Cuisine Journey'
UNION ALL
SELECT id, 'Cook a Filipino dish', 'Make adobo, sinigang, or pancit', 4
FROM challenges WHERE title = 'Asian Cuisine Journey'
UNION ALL
SELECT id, 'Try Korean cuisine', 'Cook bibimbap or bulgogi', 5
FROM challenges WHERE title = 'Asian Cuisine Journey';

-- Filipino Food Fest tasks
INSERT INTO challenge_tasks (challenge_id, title, description, order_number)
SELECT id, 'Master adobo', 'Cook the iconic Filipino adobo', 1
FROM challenges WHERE title = 'Filipino Food Fest'
UNION ALL
SELECT id, 'Make sinigang', 'Prepare this classic sour soup', 2
FROM challenges WHERE title = 'Filipino Food Fest'
UNION ALL
SELECT id, 'Cook pancit', 'Try Filipino noodles', 3
FROM challenges WHERE title = 'Filipino Food Fest'
UNION ALL
SELECT id, 'Prepare a Filipino dessert', 'Make halo-halo, leche flan, or bibingka', 4
FROM challenges WHERE title = 'Filipino Food Fest';

-- Protein Power tasks
INSERT INTO challenge_tasks (challenge_id, title, description, order_number)
SELECT id, 'Cook lean chicken breast', 'Prepare a 25g+ protein chicken meal', 1
FROM challenges WHERE title = 'Protein Power'
UNION ALL
SELECT id, 'Make a fish dish', 'Cook salmon, tuna, or white fish', 2
FROM challenges WHERE title = 'Protein Power'
UNION ALL
SELECT id, 'Try plant protein', 'Cook with tofu, tempeh, or legumes', 3
FROM challenges WHERE title = 'Protein Power'
UNION ALL
SELECT id, 'Prepare a beef meal', 'Cook lean beef or ground meat', 4
FROM challenges WHERE title = 'Protein Power'
UNION ALL
SELECT id, 'Make a protein bowl', 'Create a balanced high-protein bowl', 5
FROM challenges WHERE title = 'Protein Power'
UNION ALL
SELECT id, 'Cook eggs for protein', 'Make an egg-based high-protein meal', 6
FROM challenges WHERE title = 'Protein Power';

-- Zero Waste Chef tasks
INSERT INTO challenge_tasks (challenge_id, title, description, order_number)
SELECT id, 'Use vegetable scraps', 'Make broth from scraps or cook with stems', 1
FROM challenges WHERE title = 'Zero Waste Chef'
UNION ALL
SELECT id, 'Transform leftovers', 'Turn yesterday''s meal into something new', 2
FROM challenges WHERE title = 'Zero Waste Chef'
UNION ALL
SELECT id, 'Cook with older produce', 'Use wilting vegetables in soup or stir-fry', 3
FROM challenges WHERE title = 'Zero Waste Chef'
UNION ALL
SELECT id, 'Make a "clean out the fridge" meal', 'Combine various leftover ingredients', 4
FROM challenges WHERE title = 'Zero Waste Chef'
UNION ALL
SELECT id, 'Repurpose bread', 'Make croutons, breadcrumbs, or bread pudding', 5
FROM challenges WHERE title = 'Zero Waste Chef';

-- 7-Day Streak tasks
INSERT INTO challenge_tasks (challenge_id, title, description, order_number)
SELECT id, 'Cook on Day 1', 'Prepare at least one meal', 1
FROM challenges WHERE title = '7-Day Streak'
UNION ALL
SELECT id, 'Cook on Day 2', 'Keep the streak going', 2
FROM challenges WHERE title = '7-Day Streak'
UNION ALL
SELECT id, 'Cook on Day 3', 'You''re building a habit!', 3
FROM challenges WHERE title = '7-Day Streak'
UNION ALL
SELECT id, 'Cook on Day 4', 'Halfway there!', 4
FROM challenges WHERE title = '7-Day Streak'
UNION ALL
SELECT id, 'Cook on Day 5', 'Keep up the momentum', 5
FROM challenges WHERE title = '7-Day Streak'
UNION ALL
SELECT id, 'Cook on Day 6', 'Almost done!', 6
FROM challenges WHERE title = '7-Day Streak'
UNION ALL
SELECT id, 'Cook on Day 7', 'Complete the week!', 7
FROM challenges WHERE title = '7-Day Streak';

-- Breakfast Champion tasks
INSERT INTO challenge_tasks (challenge_id, title, description, order_number)
SELECT id, 'Make a quick breakfast', 'Prepare a breakfast in under 15 minutes', 1
FROM challenges WHERE title = 'Breakfast Champion'
UNION ALL
SELECT id, 'Cook a protein breakfast', 'Make eggs, Greek yogurt, or tofu scramble', 2
FROM challenges WHERE title = 'Breakfast Champion'
UNION ALL
SELECT id, 'Try a sweet breakfast', 'Make pancakes, French toast, or oatmeal', 3
FROM challenges WHERE title = 'Breakfast Champion'
UNION ALL
SELECT id, 'Prepare a savory breakfast', 'Cook a breakfast sandwich or breakfast bowl', 4
FROM challenges WHERE title = 'Breakfast Champion'
UNION ALL
SELECT id, 'Make a weekend brunch', 'Create a special breakfast for leisure time', 5
FROM challenges WHERE title = 'Breakfast Champion';

-- Dinner Party Host tasks
INSERT INTO challenge_tasks (challenge_id, title, description, order_number)
SELECT id, 'Cook an impressive appetizer', 'Prepare a starter that will wow guests', 1
FROM challenges WHERE title = 'Dinner Party Host'
UNION ALL
SELECT id, 'Make a show-stopping main', 'Cook a visually appealing main course', 2
FROM challenges WHERE title = 'Dinner Party Host'
UNION ALL
SELECT id, 'Prepare an elegant dessert', 'Create a delicious finish to the meal', 3
FROM challenges WHERE title = 'Dinner Party Host';

-- Vegetarian Voyage tasks
INSERT INTO challenge_tasks (challenge_id, title, description, order_number)
SELECT id, 'Cook with beans or lentils', 'Make a legume-based meal', 1
FROM challenges WHERE title = 'Vegetarian Voyage'
UNION ALL
SELECT id, 'Try a tofu recipe', 'Prepare crispy or marinated tofu', 2
FROM challenges WHERE title = 'Vegetarian Voyage'
UNION ALL
SELECT id, 'Make a veggie stir-fry', 'Cook a colorful vegetable stir-fry', 3
FROM challenges WHERE title = 'Vegetarian Voyage'
UNION ALL
SELECT id, 'Prepare a plant-based pasta', 'Make pasta with vegetable sauce', 4
FROM challenges WHERE title = 'Vegetarian Voyage'
UNION ALL
SELECT id, 'Cook a grain bowl', 'Create a Buddha bowl or grain bowl', 5
FROM challenges WHERE title = 'Vegetarian Voyage'
UNION ALL
SELECT id, 'Try mushroom as meat substitute', 'Cook portobello or other hearty mushrooms', 6
FROM challenges WHERE title = 'Vegetarian Voyage';

-- Add comment explaining the migration
COMMENT ON TABLE user_challenge_progress IS 'Tracks user progress on challenges/quests. Now includes activation tracking for quest-based system where timers start on activation.';
