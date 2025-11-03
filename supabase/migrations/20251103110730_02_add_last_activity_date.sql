/*
  # Add last_activity_date to users table

  This migration adds the `last_activity_date` field to track when users last performed an activity,
  which is essential for accurate streak calculation.

  ## Changes
  - Add `last_activity_date` column to users table
  
  ## Security
  - No RLS changes needed (inherits from existing policies)
*/

-- Add last_activity_date field if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'last_activity_date'
  ) THEN
    ALTER TABLE users ADD COLUMN last_activity_date date;
  END IF;
END $$;
