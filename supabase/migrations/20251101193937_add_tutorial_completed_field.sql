/*
  # Add Tutorial Completed Field to User Settings

  1. Changes
    - Add `tutorial_completed` boolean field to `user_settings` table
    - Defaults to false for new users
    - Allows tracking whether user has completed the initial app tutorial

  2. Important Notes
    - This field is separate from onboarding_completed
    - Tutorial runs after onboarding for first-time users
    - Can be reset to false to allow users to replay tutorial
*/

-- Add tutorial_completed column to user_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'tutorial_completed'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN tutorial_completed boolean DEFAULT false;
  END IF;
END $$;
