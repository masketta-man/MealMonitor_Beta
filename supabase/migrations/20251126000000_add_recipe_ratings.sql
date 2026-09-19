-- Migration: Add Comprehensive Recipe Ratings
-- This migration adds detailed recipe ratings with dimensional feedback

-- Create recipe_ratings table for comprehensive rating data
CREATE TABLE IF NOT EXISTS recipe_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  completion_id UUID REFERENCES user_completed_meals(id) ON DELETE SET NULL,
  
  -- Overall rating
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  
  -- Dimensional ratings
  difficulty_rating INTEGER NOT NULL CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  time_accuracy_rating INTEGER NOT NULL CHECK (time_accuracy_rating >= 1 AND time_accuracy_rating <= 5),
  taste_rating INTEGER NOT NULL CHECK (taste_rating >= 1 AND taste_rating <= 5),
  instructions_rating INTEGER NOT NULL CHECK (instructions_rating >= 1 AND instructions_rating <= 5),
  
  -- Time tracking
  actual_time_minutes INTEGER,
  suggested_time_minutes INTEGER,
  
  -- Feedback
  modifications TEXT,
  would_cook_again BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one rating per completion (user can rate same recipe multiple times if they cook it multiple times)
  UNIQUE(completion_id)
);

-- Create indexes for performance
CREATE INDEX idx_recipe_ratings_user_id ON recipe_ratings(user_id);
CREATE INDEX idx_recipe_ratings_recipe_id ON recipe_ratings(recipe_id);
CREATE INDEX idx_recipe_ratings_created_at ON recipe_ratings(created_at DESC);
CREATE INDEX idx_recipe_ratings_overall ON recipe_ratings(overall_rating);

-- Enable RLS
ALTER TABLE recipe_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY recipe_ratings_user_select ON recipe_ratings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY recipe_ratings_user_insert ON recipe_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY recipe_ratings_user_update ON recipe_ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY recipe_ratings_user_delete ON recipe_ratings
  FOR DELETE USING (auth.uid() = user_id);

-- Create a view for aggregated recipe ratings
CREATE OR REPLACE VIEW recipe_rating_stats AS
SELECT 
  r.id as recipe_id,
  r.title as recipe_name,
  COUNT(rr.id) as total_ratings,
  ROUND(AVG(rr.overall_rating)::numeric, 2) as avg_overall_rating,
  ROUND(AVG(rr.difficulty_rating)::numeric, 2) as avg_difficulty,
  ROUND(AVG(rr.time_accuracy_rating)::numeric, 2) as avg_time_accuracy,
  ROUND(AVG(rr.taste_rating)::numeric, 2) as avg_taste,
  ROUND(AVG(rr.instructions_rating)::numeric, 2) as avg_instructions,
  ROUND(AVG(rr.actual_time_minutes)::numeric, 0) as avg_actual_time,
  COUNT(*) FILTER (WHERE rr.would_cook_again = true) as would_cook_again_count,
  ROUND((COUNT(*) FILTER (WHERE rr.would_cook_again = true)::float / 
         NULLIF(COUNT(*)::float, 0) * 100)::numeric, 1) as would_cook_again_percentage
FROM recipes r
LEFT JOIN recipe_ratings rr ON r.id = rr.recipe_id
GROUP BY r.id, r.title;

-- Function to update recipe's cached rating after new rating is added
CREATE OR REPLACE FUNCTION update_recipe_rating_cache()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the recipes table with the new average (if you have a cached rating field)
  -- This is optional but improves query performance
  UPDATE recipes
  SET updated_at = NOW()
  WHERE id = NEW.recipe_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update cached rating
CREATE TRIGGER trigger_update_recipe_rating_cache
AFTER INSERT OR UPDATE OR DELETE ON recipe_ratings
FOR EACH ROW
EXECUTE FUNCTION update_recipe_rating_cache();

-- Update user_completed_meals to reference the rating
ALTER TABLE user_completed_meals
ADD COLUMN IF NOT EXISTS rating_id UUID REFERENCES recipe_ratings(id) ON DELETE SET NULL;

-- Add simple rating field for backward compatibility and quick queries
ALTER TABLE user_completed_meals
ADD COLUMN IF NOT EXISTS user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5);

-- Add comments
COMMENT ON TABLE recipe_ratings IS 'Comprehensive recipe ratings with dimensional feedback';
COMMENT ON VIEW recipe_rating_stats IS 'Aggregated rating statistics per recipe';
COMMENT ON COLUMN recipe_ratings.difficulty_rating IS '1=Very Easy, 5=Very Hard';
COMMENT ON COLUMN recipe_ratings.time_accuracy_rating IS '1=Much longer, 3=Accurate, 5=Much faster';
COMMENT ON COLUMN recipe_ratings.taste_rating IS '1=Poor, 5=Excellent';
COMMENT ON COLUMN recipe_ratings.instructions_rating IS '1=Confusing, 5=Very Clear';
COMMENT ON COLUMN recipe_ratings.would_cook_again IS 'Would the user make this recipe again?';
