/*
  # Fix meal_logs constraint and add last_level_up column

  This migration fixes two issues:
  1. Removes the overly restrictive CHECK constraint on meal_logs.meal_type
  2. Adds the missing last_level_up column to users table

  ## Changes
  - Drop existing meal_type constraint on meal_logs
  - Add last_level_up column to users table for tracking level progression
  
  ## Security
  - No RLS changes needed (inherits from existing policies)
*/

-- Drop the restrictive meal_type constraint
ALTER TABLE meal_logs DROP CONSTRAINT IF EXISTS meal_logs_meal_type_check;

-- Add last_level_up column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'last_level_up'
  ) THEN
    ALTER TABLE users ADD COLUMN last_level_up timestamptz;
  END IF;
END $$;
