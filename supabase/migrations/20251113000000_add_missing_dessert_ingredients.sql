/*
  # Add Missing Dessert Recipe Ingredients

  This migration adds ingredients that were missing from the database
  but are used in the Filipino dessert recipes (v3 migrations).

  ## New Ingredients Added
  
  ### Pantry/Baking
  - Spring Roll Wrapper - Used in Baked Turon
  - Pandan Extract - Used in Healthy Pandan Coconut Cake
  - Matcha Powder - Used in Healthy Matcha Brownies
  
  ## Security
  - No RLS changes needed (inherits from existing policies)
*/

-- Add missing ingredients for dessert recipes
INSERT INTO ingredients (name, category) VALUES
  ('Spring Roll Wrapper', 'Grains'),
  ('Pandan Extract', 'Pantry'),
  ('Matcha Powder', 'Pantry')
ON CONFLICT (name) DO NOTHING;
