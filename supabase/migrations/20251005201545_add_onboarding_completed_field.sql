/*
  # Add Onboarding Completed Field

  1. Changes
    - Add `onboarding_completed` boolean field to users table
    - Default value is false for new users
    - This tracks whether a user has completed the onboarding process

  2. Notes
    - Existing users will have onboarding_completed set to NULL initially
    - We'll update existing users to true assuming they've already gone through setup
*/

-- Add onboarding_completed field to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE users ADD COLUMN onboarding_completed boolean DEFAULT false;
  END IF;
END $$;

-- Update existing users to have onboarding_completed set to true
-- This assumes existing users have already completed onboarding
UPDATE users
SET onboarding_completed = true
WHERE onboarding_completed IS NULL;