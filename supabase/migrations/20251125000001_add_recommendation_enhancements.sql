-- Migration: Add Recommendation Enhancement Features
-- This adds: recommendation metrics tracking, personalized weights, collaborative filtering, and A/B testing

-- ============================================================
-- 1. RECOMMENDATION METRICS TRACKING
-- ============================================================

-- Track every recommendation shown to users and their interactions
CREATE TABLE IF NOT EXISTS recommendation_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  recommended_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  recommendation_score FLOAT NOT NULL,
  scoring_weights JSONB NOT NULL, -- Store the weights used
  scoring_breakdown JSONB NOT NULL, -- Store individual component scores
  context JSONB, -- time_of_day, available_ingredients, etc.
  
  -- Interaction tracking
  was_viewed BOOLEAN DEFAULT FALSE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  was_clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  was_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  was_favorited BOOLEAN DEFAULT FALSE,
  favorited_at TIMESTAMP WITH TIME ZONE,
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  rated_at TIMESTAMP WITH TIME ZONE,
  
  -- Performance metrics
  position_in_list INTEGER, -- Where in the recommendation list
  experiment_variant VARCHAR(50), -- For A/B testing
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_recommendation_metrics_user_id ON recommendation_metrics(user_id);
CREATE INDEX idx_recommendation_metrics_recipe_id ON recommendation_metrics(recipe_id);
CREATE INDEX idx_recommendation_metrics_recommended_at ON recommendation_metrics(recommended_at DESC);
CREATE INDEX idx_recommendation_metrics_experiment ON recommendation_metrics(experiment_variant) WHERE experiment_variant IS NOT NULL;
CREATE INDEX idx_recommendation_metrics_interactions ON recommendation_metrics(user_id, was_clicked, was_completed);

-- RLS policies
ALTER TABLE recommendation_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY recommendation_metrics_user_access ON recommendation_metrics
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 2. PERSONALIZED SCORING WEIGHTS
-- ============================================================

-- Store learned/optimized scoring weights per user
CREATE TABLE IF NOT EXISTS user_recommendation_weights (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  -- Individual scoring component weights (sum to 1.0)
  tag_match_weight FLOAT DEFAULT 0.22,
  ingredient_match_weight FLOAT DEFAULT 0.20,
  user_preference_weight FLOAT DEFAULT 0.15,
  calorie_alignment_weight FLOAT DEFAULT 0.13,
  time_relevance_weight FLOAT DEFAULT 0.10,
  popularity_weight FLOAT DEFAULT 0.08,
  seasonal_weight FLOAT DEFAULT 0.07,
  novelty_weight FLOAT DEFAULT 0.05,
  
  -- Performance tracking
  performance_score FLOAT DEFAULT 0.0, -- How well these weights perform
  click_through_rate FLOAT DEFAULT 0.0,
  completion_rate FLOAT DEFAULT 0.0,
  average_rating FLOAT DEFAULT 0.0,
  
  -- Metadata
  total_recommendations INTEGER DEFAULT 0,
  total_interactions INTEGER DEFAULT 0,
  learning_confidence FLOAT DEFAULT 0.0, -- 0-1, how confident we are in these weights
  last_optimized_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: weights must sum to ~1.0
  CONSTRAINT weights_sum_check CHECK (
    ABS((tag_match_weight + ingredient_match_weight + user_preference_weight + 
         calorie_alignment_weight + time_relevance_weight + popularity_weight + 
         seasonal_weight + novelty_weight) - 1.0) < 0.01
  )
);

-- RLS policies
ALTER TABLE user_recommendation_weights ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_recommendation_weights_user_access ON user_recommendation_weights
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 3. COLLABORATIVE FILTERING (USER SIMILARITY)
-- ============================================================

-- Store user-to-user similarity scores for collaborative filtering
CREATE TABLE IF NOT EXISTS user_similarity (
  user_id_1 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id_2 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  similarity_score FLOAT NOT NULL CHECK (similarity_score BETWEEN 0 AND 1),
  calculation_method VARCHAR(50) DEFAULT 'cosine', -- cosine, jaccard, pearson
  
  -- Based on what features
  based_on JSONB, -- {"completed_recipes": true, "favorites": true, "ratings": true}
  
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  PRIMARY KEY (user_id_1, user_id_2),
  
  -- Ensure user_id_1 < user_id_2 to avoid duplicates
  CONSTRAINT user_order_check CHECK (user_id_1 < user_id_2)
);

-- Indexes for performance
CREATE INDEX idx_user_similarity_user1 ON user_similarity(user_id_1, similarity_score DESC);
CREATE INDEX idx_user_similarity_user2 ON user_similarity(user_id_2, similarity_score DESC);
CREATE INDEX idx_user_similarity_score ON user_similarity(similarity_score DESC);

-- RLS policies
ALTER TABLE user_similarity ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_similarity_read_access ON user_similarity
  FOR SELECT USING (
    auth.uid() = user_id_1 OR auth.uid() = user_id_2
  );

-- ============================================================
-- 4. A/B TESTING EXPERIMENTS
-- ============================================================

-- Define A/B testing experiments for recommendation algorithms
CREATE TABLE IF NOT EXISTS recommendation_experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  
  -- Experiment configuration
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  
  -- Variants configuration (JSON array)
  variants JSONB NOT NULL, -- [{"name": "control", "weight_profile": {...}}, {"name": "variant_a", ...}]
  traffic_allocation JSONB, -- {"control": 0.5, "variant_a": 0.5}
  
  -- Success metrics
  primary_metric VARCHAR(100), -- "click_through_rate", "completion_rate", "average_rating"
  
  -- Results
  results JSONB, -- Computed results per variant
  winner_variant VARCHAR(50),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_recommendation_experiments_active ON recommendation_experiments(is_active) WHERE is_active = TRUE;

-- RLS: Only admins can manage experiments (no policies = admin only)
ALTER TABLE recommendation_experiments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. RECIPE INTERACTION SUMMARY (Materialized View for Performance)
-- ============================================================

-- Aggregated recipe interaction statistics for collaborative filtering
CREATE MATERIALIZED VIEW IF NOT EXISTS recipe_interaction_summary AS
SELECT 
  recipe_id,
  COUNT(DISTINCT user_id) as total_users,
  COUNT(*) FILTER (WHERE was_viewed) as view_count,
  COUNT(*) FILTER (WHERE was_clicked) as click_count,
  COUNT(*) FILTER (WHERE was_completed) as completion_count,
  COUNT(*) FILTER (WHERE was_favorited) as favorite_count,
  AVG(user_rating) FILTER (WHERE user_rating IS NOT NULL) as average_rating,
  COUNT(user_rating) FILTER (WHERE user_rating IS NOT NULL) as rating_count,
  
  -- Click-through rate
  CASE 
    WHEN COUNT(*) FILTER (WHERE was_viewed) > 0 
    THEN COUNT(*) FILTER (WHERE was_clicked)::FLOAT / COUNT(*) FILTER (WHERE was_viewed)
    ELSE 0 
  END as click_through_rate,
  
  -- Completion rate
  CASE 
    WHEN COUNT(*) FILTER (WHERE was_clicked) > 0 
    THEN COUNT(*) FILTER (WHERE was_completed)::FLOAT / COUNT(*) FILTER (WHERE was_clicked)
    ELSE 0 
  END as completion_rate,
  
  MAX(recommended_at) as last_recommended_at
FROM recommendation_metrics
GROUP BY recipe_id;

-- Index on materialized view
CREATE UNIQUE INDEX idx_recipe_interaction_summary_recipe_id ON recipe_interaction_summary(recipe_id);
CREATE INDEX idx_recipe_interaction_summary_ctr ON recipe_interaction_summary(click_through_rate DESC);
CREATE INDEX idx_recipe_interaction_summary_completion ON recipe_interaction_summary(completion_rate DESC);

-- ============================================================
-- 6. HELPER FUNCTIONS
-- ============================================================

-- Function to get similar users for collaborative filtering
CREATE OR REPLACE FUNCTION get_similar_users(
  target_user_id UUID,
  min_similarity FLOAT DEFAULT 0.5,
  max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
  similar_user_id UUID,
  similarity_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN user_id_1 = target_user_id THEN user_id_2
      ELSE user_id_1
    END as similar_user_id,
    us.similarity_score
  FROM user_similarity us
  WHERE (us.user_id_1 = target_user_id OR us.user_id_2 = target_user_id)
    AND us.similarity_score >= min_similarity
  ORDER BY us.similarity_score DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get collaborative recommendations (what similar users liked)
CREATE OR REPLACE FUNCTION get_collaborative_recommendations(
  target_user_id UUID,
  min_similarity FLOAT DEFAULT 0.5,
  max_results INTEGER DEFAULT 20
)
RETURNS TABLE (
  recipe_id UUID,
  recommendation_strength FLOAT,
  similar_user_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH similar_users AS (
    SELECT * FROM get_similar_users(target_user_id, min_similarity, 50)
  ),
  user_completed AS (
    SELECT recipe_id FROM user_completed_meals WHERE user_id = target_user_id
  ),
  similar_user_favorites AS (
    SELECT 
      ucm.recipe_id,
      AVG(su.similarity_score) as avg_similarity,
      COUNT(DISTINCT su.similar_user_id) as user_count
    FROM similar_users su
    JOIN user_completed_meals ucm ON ucm.user_id = su.similar_user_id
    WHERE ucm.recipe_id NOT IN (SELECT recipe_id FROM user_completed)
    GROUP BY ucm.recipe_id
  )
  SELECT 
    suf.recipe_id,
    suf.avg_similarity * LN(suf.user_count + 1) as recommendation_strength,
    suf.user_count::INTEGER
  FROM similar_user_favorites suf
  ORDER BY recommendation_strength DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate user similarity based on completed recipes (Jaccard similarity)
CREATE OR REPLACE FUNCTION calculate_user_similarity_jaccard(
  user_id_1 UUID,
  user_id_2 UUID
)
RETURNS FLOAT AS $$
DECLARE
  intersection_count INTEGER;
  union_count INTEGER;
  similarity FLOAT;
BEGIN
  -- Count recipes both users completed
  SELECT COUNT(*) INTO intersection_count
  FROM (
    SELECT recipe_id FROM user_completed_meals WHERE user_id = user_id_1
    INTERSECT
    SELECT recipe_id FROM user_completed_meals WHERE user_id = user_id_2
  ) as intersection;
  
  -- Count total unique recipes completed by either user
  SELECT COUNT(*) INTO union_count
  FROM (
    SELECT recipe_id FROM user_completed_meals WHERE user_id = user_id_1
    UNION
    SELECT recipe_id FROM user_completed_meals WHERE user_id = user_id_2
  ) as union_set;
  
  -- Calculate Jaccard similarity
  IF union_count = 0 THEN
    similarity := 0.0;
  ELSE
    similarity := intersection_count::FLOAT / union_count::FLOAT;
  END IF;
  
  RETURN similarity;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh recommendation metrics summary
CREATE OR REPLACE FUNCTION refresh_recommendation_metrics()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY recipe_interaction_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 7. TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recommendation_metrics_updated_at
  BEFORE UPDATE ON recommendation_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_recommendation_weights_updated_at
  BEFORE UPDATE ON user_recommendation_weights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recommendation_experiments_updated_at
  BEFORE UPDATE ON recommendation_experiments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 8. INITIAL DATA
-- ============================================================

-- Create default experiment (control group uses current weights)
INSERT INTO recommendation_experiments (name, description, variants, traffic_allocation, primary_metric)
VALUES (
  'weight_optimization_v1',
  'Test different scoring weight distributions to optimize CTR and completion rate',
  '[
    {
      "name": "control",
      "weights": {
        "tag_match": 0.22,
        "ingredient_match": 0.20,
        "user_preference": 0.15,
        "calorie_alignment": 0.13,
        "time_relevance": 0.10,
        "popularity": 0.08,
        "seasonal": 0.07,
        "novelty": 0.05
      }
    },
    {
      "name": "ingredient_focused",
      "weights": {
        "tag_match": 0.18,
        "ingredient_match": 0.30,
        "user_preference": 0.15,
        "calorie_alignment": 0.12,
        "time_relevance": 0.10,
        "popularity": 0.05,
        "seasonal": 0.05,
        "novelty": 0.05
      }
    },
    {
      "name": "user_preference_focused",
      "weights": {
        "tag_match": 0.25,
        "ingredient_match": 0.15,
        "user_preference": 0.25,
        "calorie_alignment": 0.10,
        "time_relevance": 0.10,
        "popularity": 0.05,
        "seasonal": 0.05,
        "novelty": 0.05
      }
    }
  ]'::JSONB,
  '{"control": 0.4, "ingredient_focused": 0.3, "user_preference_focused": 0.3}'::JSONB,
  'completion_rate'
)
ON CONFLICT (name) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE recommendation_metrics IS 'Tracks all recommendations shown to users and their interactions for analytics and optimization';
COMMENT ON TABLE user_recommendation_weights IS 'Stores personalized scoring weights learned from user behavior';
COMMENT ON TABLE user_similarity IS 'User-to-user similarity scores for collaborative filtering';
COMMENT ON TABLE recommendation_experiments IS 'A/B testing configuration for recommendation algorithm variants';
COMMENT ON MATERIALIZED VIEW recipe_interaction_summary IS 'Aggregated recipe interaction statistics for performance';
COMMENT ON FUNCTION get_similar_users IS 'Returns users similar to the target user based on similarity scores';
COMMENT ON FUNCTION get_collaborative_recommendations IS 'Returns recipe recommendations based on what similar users liked';
COMMENT ON FUNCTION calculate_user_similarity_jaccard IS 'Calculates Jaccard similarity between two users based on completed recipes';
