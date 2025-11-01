/*
  # Create User Activity Log Table

  1. New Tables
    - `user_activity_log`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `activity_type` (text) - Type of activity: 'recipe_completed', 'challenge_completed', 'level_up', 'badge_earned', 'ingredient_added', 'recipe_created'
      - `activity_title` (text) - Human-readable title of the activity
      - `activity_description` (text, nullable) - Optional detailed description
      - `points_earned` (integer) - Points earned from this activity (0 if not applicable)
      - `metadata` (jsonb, nullable) - Additional data like recipe_id, challenge_id, badge_id, etc.
      - `created_at` (timestamptz) - When the activity occurred

  2. Security
    - Enable RLS on `user_activity_log` table
    - Add policy for users to read their own activity log
    - Add policy for authenticated users to insert their own activities

  3. Important Notes
    - This table will track all user activities for the activity feed
    - The metadata field stores related IDs (recipe_id, challenge_id, etc.) as JSON
    - Activities are append-only (no updates/deletes for data integrity)
*/

-- Create user_activity_log table
CREATE TABLE IF NOT EXISTS user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('recipe_completed', 'challenge_completed', 'level_up', 'badge_earned', 'ingredient_added', 'recipe_created')),
  activity_title text NOT NULL,
  activity_description text,
  points_earned integer NOT NULL DEFAULT 0,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at DESC);

-- Enable Row Level Security
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own activity log
CREATE POLICY "Users can read own activity log"
  ON user_activity_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own activities
CREATE POLICY "Users can insert own activities"
  ON user_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
