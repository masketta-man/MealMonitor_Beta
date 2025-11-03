/*
  # Create MealR Database Schema

  1. New Tables
    - `users` - User profiles with health goals and preferences
    - `recipes` - Recipe information with nutrition data
    - `ingredients` - Master list of ingredients
    - `recipe_ingredients` - Junction table for recipe ingredients
    - `recipe_instructions` - Recipe cooking steps
    - `user_ingredients` - User's available ingredients
    - `recipe_tags` - Recipe tags for filtering
    - `user_favorites` - User's favorite recipes
    - `user_completed_meals` - Track completed meals for points
    - `challenges` - Available challenges
    - `challenge_tasks` - Tasks within challenges
    - `user_challenge_progress` - User progress on challenges
    - `user_challenge_task_progress` - User progress on individual tasks
    - `badges` - Available badges
    - `user_badges` - User's earned badges

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  username text UNIQUE,
  avatar_url text,
  health_goals text[] DEFAULT '{}',
  dietary_preferences text[] DEFAULT '{}',
  cooking_frequency text,
  food_restrictions text[] DEFAULT '{}',
  level integer DEFAULT 1,
  experience integer DEFAULT 0,
  total_points integer DEFAULT 0,
  streak_days integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  prep_time integer NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  meal_type text NOT NULL CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
  cuisine_type text,
  calories integer,
  protein integer,
  carbs integer,
  fat integer,
  points integer NOT NULL DEFAULT 0,
  nutrition_score decimal(3,1),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN ('Fruits', 'Vegetables', 'Protein', 'Dairy', 'Grains', 'Pantry')),
  created_at timestamptz DEFAULT now()
);

-- Create recipe_ingredients junction table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  amount text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(recipe_id, ingredient_id)
);

-- Create recipe_instructions table
CREATE TABLE IF NOT EXISTS recipe_instructions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  instruction text NOT NULL,
  timer_minutes integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(recipe_id, step_number)
);

-- Create user_ingredients table
CREATE TABLE IF NOT EXISTS user_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity text,
  expiry_date date,
  in_stock boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, ingredient_id)
);

-- Create recipe_tags table
CREATE TABLE IF NOT EXISTS recipe_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  tag text NOT NULL,
  tag_type text NOT NULL CHECK (tag_type IN ('dietary', 'cuisine', 'other')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(recipe_id, tag, tag_type)
);

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

-- Create user_completed_meals table
CREATE TABLE IF NOT EXISTS user_completed_meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  points_earned integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  long_description text,
  category text NOT NULL,
  total_tasks integer NOT NULL DEFAULT 1,
  reward_points integer NOT NULL DEFAULT 0,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  bg_color text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create challenge_tasks table
CREATE TABLE IF NOT EXISTS challenge_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  order_number integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(challenge_id, order_number)
);

-- Create user_challenge_progress table
CREATE TABLE IF NOT EXISTS user_challenge_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  completed_tasks integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Create user_challenge_task_progress table
CREATE TABLE IF NOT EXISTS user_challenge_task_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES challenge_tasks(id) ON DELETE CASCADE,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, challenge_id, task_id)
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  requirement_type text NOT NULL CHECK (requirement_type IN ('meals_completed', 'challenges_completed', 'ingredients_used', 'streak_days', 'points_earned')),
  requirement_value integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_completed_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenge_task_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for recipes (public read)
CREATE POLICY "Anyone can read recipes"
  ON recipes
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for ingredients (public read)
CREATE POLICY "Anyone can read ingredients"
  ON ingredients
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for recipe_ingredients (public read)
CREATE POLICY "Anyone can read recipe ingredients"
  ON recipe_ingredients
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for recipe_instructions (public read)
CREATE POLICY "Anyone can read recipe instructions"
  ON recipe_instructions
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for user_ingredients
CREATE POLICY "Users can manage own ingredients"
  ON user_ingredients
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for recipe_tags (public read)
CREATE POLICY "Anyone can read recipe tags"
  ON recipe_tags
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for user_favorites
CREATE POLICY "Users can manage own favorites"
  ON user_favorites
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for user_completed_meals
CREATE POLICY "Users can manage own completed meals"
  ON user_completed_meals
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for challenges (public read)
CREATE POLICY "Anyone can read challenges"
  ON challenges
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for challenge_tasks (public read)
CREATE POLICY "Anyone can read challenge tasks"
  ON challenge_tasks
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for user_challenge_progress
CREATE POLICY "Users can manage own challenge progress"
  ON user_challenge_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for user_challenge_task_progress
CREATE POLICY "Users can manage own task progress"
  ON user_challenge_task_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for badges (public read)
CREATE POLICY "Anyone can read badges"
  ON badges
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for user_badges
CREATE POLICY "Users can read own badges"
  ON user_badges
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert user badges"
  ON user_badges
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_recipes_meal_type ON recipes(meal_type);
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine_type ON recipes(cuisine_type);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_ingredient_id ON recipe_ingredients(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_user_ingredients_user_id ON user_ingredients(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ingredients_in_stock ON user_ingredients(in_stock);
CREATE INDEX IF NOT EXISTS idx_recipe_tags_recipe_id ON recipe_tags(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_tags_tag_type ON recipe_tags(tag_type);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_completed_meals_user_id ON user_completed_meals(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_is_active ON challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_user_id ON user_challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_ingredients_updated_at BEFORE UPDATE ON user_ingredients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_challenge_progress_updated_at BEFORE UPDATE ON user_challenge_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_challenge_task_progress_updated_at BEFORE UPDATE ON user_challenge_task_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
