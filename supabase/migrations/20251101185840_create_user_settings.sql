/*
  # Create User Settings Table

  1. New Tables
    - `user_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users, unique)
      - `daily_calorie_target` (integer) - Daily calorie goal
      - `weight_goal` (text) - User's weight goal: 'lose_weight', 'maintain_weight', 'gain_weight'
      - `activity_level` (text) - Activity level: 'sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'
      - `dietary_restrictions` (text array) - List of dietary restrictions
      - `favorite_cuisines` (text array) - Preferred cuisine types
      - `meal_preferences` (jsonb) - Additional meal preferences
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_settings` table
    - Add policy for users to read their own settings
    - Add policy for users to insert their own settings
    - Add policy for users to update their own settings

  3. Important Notes
    - Each user has one settings record (enforced by unique constraint)
    - Settings are optional and have sensible defaults
    - The dietary_restrictions field complements the user's health_goals
*/

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  daily_calorie_target integer DEFAULT 2000,
  weight_goal text DEFAULT 'maintain_weight' CHECK (weight_goal IN ('lose_weight', 'maintain_weight', 'gain_weight')),
  activity_level text DEFAULT 'moderately_active' CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
  dietary_restrictions text[] DEFAULT '{}',
  favorite_cuisines text[] DEFAULT '{}',
  meal_preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own settings
CREATE POLICY "Users can read own settings"
  ON user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own settings
CREATE POLICY "Users can insert own settings"
  ON user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own settings
CREATE POLICY "Users can update own settings"
  ON user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
