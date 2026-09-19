-- Migration: Add Quest Chains, History, and Notification Support
-- This migration adds support for quest chains, completion tracking, and push notifications

-- Add quest chain support to challenges table
ALTER TABLE challenges
ADD COLUMN IF NOT EXISTS prerequisite_challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS chain_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS chain_name TEXT,
ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard'));

-- Add indexes for quest chains
CREATE INDEX IF NOT EXISTS idx_challenges_prerequisite 
ON challenges(prerequisite_challenge_id) 
WHERE prerequisite_challenge_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_challenges_chain 
ON challenges(chain_name, chain_order) 
WHERE chain_name IS NOT NULL;

-- Add quest recommendation and rating fields to user progress
ALTER TABLE user_challenge_progress
ADD COLUMN IF NOT EXISTS recommendation_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS completion_time_minutes INTEGER,
ADD COLUMN IF NOT EXISTS user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5);

-- Create quest history view for better querying
CREATE OR REPLACE VIEW quest_history AS
SELECT 
  ucp.id,
  ucp.user_id,
  ucp.challenge_id,
  c.title,
  c.description,
  c.category,
  c.difficulty_level,
  c.reward_points,
  c.total_tasks,
  c.duration_days,
  ucp.completed_tasks,
  ucp.activated_at,
  ucp.completed_at,
  ucp.quest_end_date,
  ucp.is_completed,
  ucp.user_rating,
  ucp.completion_time_minutes,
  CASE 
    WHEN ucp.completed_at IS NOT NULL AND ucp.activated_at IS NOT NULL THEN
      EXTRACT(EPOCH FROM (ucp.completed_at - ucp.activated_at))/60
    ELSE NULL
  END as actual_completion_minutes,
  CASE
    WHEN ucp.completed_at IS NOT NULL AND ucp.quest_end_date IS NOT NULL THEN
      ucp.completed_at < ucp.quest_end_date
    ELSE NULL
  END as completed_on_time
FROM user_challenge_progress ucp
JOIN challenges c ON ucp.challenge_id = c.id
WHERE ucp.activated_at IS NOT NULL;

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  quest_expiring_enabled BOOLEAN DEFAULT true,
  quest_completed_enabled BOOLEAN DEFAULT true,
  new_quest_enabled BOOLEAN DEFAULT true,
  daily_reminder_enabled BOOLEAN DEFAULT true,
  daily_reminder_time TIME DEFAULT '09:00:00',
  push_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create push notification log
CREATE TABLE IF NOT EXISTS push_notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered BOOLEAN DEFAULT false,
  opened BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster notification queries
CREATE INDEX IF NOT EXISTS idx_push_notification_log_user_sent 
ON push_notification_log(user_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user 
ON user_notification_preferences(user_id);

-- Function to get recommended quests for a user
CREATE OR REPLACE FUNCTION get_recommended_quests(p_user_id UUID, p_limit INTEGER DEFAULT 5)
RETURNS TABLE (
  challenge_id UUID,
  title TEXT,
  description TEXT,
  category TEXT,
  difficulty_level TEXT,
  reward_points INTEGER,
  duration_days INTEGER,
  recommendation_score NUMERIC,
  recommendation_reason TEXT
) AS $$
DECLARE
  v_user_completed_categories TEXT[];
  v_user_dietary_prefs TEXT[];
BEGIN
  -- Get user's completed challenge categories
  SELECT ARRAY_AGG(DISTINCT c.category)
  INTO v_user_completed_categories
  FROM user_challenge_progress ucp
  JOIN challenges c ON ucp.challenge_id = c.id
  WHERE ucp.user_id = p_user_id AND ucp.is_completed = true;

  -- Get user's dietary preferences
  SELECT dietary_preferences
  INTO v_user_dietary_prefs
  FROM users
  WHERE id = p_user_id;

  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    c.description,
    c.category,
    c.difficulty_level,
    c.reward_points,
    c.duration_days,
    -- Calculate recommendation score
    (
      -- Base score
      50.0 +
      -- Bonus for matching difficulty progression (easy -> medium -> hard)
      (CASE 
        WHEN c.difficulty_level = 'easy' AND NOT EXISTS (
          SELECT 1 FROM user_challenge_progress ucp2
          JOIN challenges c2 ON ucp2.challenge_id = c2.id
          WHERE ucp2.user_id = p_user_id AND ucp2.is_completed = true
        ) THEN 30.0 -- Recommend easy quests to new users
        WHEN c.difficulty_level = 'medium' THEN 15.0
        WHEN c.difficulty_level = 'hard' THEN 5.0
        ELSE 0.0
      END) +
      -- Bonus for matching user's dietary preferences
      (CASE 
        WHEN v_user_dietary_prefs IS NOT NULL 
        AND c.category = ANY(v_user_dietary_prefs) THEN 25.0
        ELSE 0.0
      END) +
      -- Bonus for not completed
      (CASE 
        WHEN NOT EXISTS (
          SELECT 1 FROM user_challenge_progress ucp2
          WHERE ucp2.user_id = p_user_id 
          AND ucp2.challenge_id = c.id 
          AND ucp2.is_completed = true
        ) THEN 20.0
        ELSE 0.0
      END) +
      -- Bonus for popular category user has completed before
      (CASE 
        WHEN c.category = ANY(v_user_completed_categories) THEN 15.0
        ELSE 0.0
      END) +
      -- Bonus for high rewards
      (CASE 
        WHEN c.reward_points > 300 THEN 10.0
        WHEN c.reward_points > 200 THEN 5.0
        ELSE 0.0
      END) +
      -- Penalty for already active
      (CASE 
        WHEN EXISTS (
          SELECT 1 FROM user_challenge_progress ucp3
          WHERE ucp3.user_id = p_user_id 
          AND ucp3.challenge_id = c.id 
          AND ucp3.is_active = true
        ) THEN -100.0
        ELSE 0.0
      END)
    )::NUMERIC as score,
    -- Generate recommendation reason
    (CASE 
      WHEN c.difficulty_level = 'easy' AND NOT EXISTS (
        SELECT 1 FROM user_challenge_progress ucp4
        JOIN challenges c4 ON ucp4.challenge_id = c4.id
        WHERE ucp4.user_id = p_user_id AND ucp4.is_completed = true
      ) THEN 'Perfect for beginners'
      WHEN c.category = ANY(v_user_completed_categories) THEN 'Based on your completed quests'
      WHEN c.category = ANY(v_user_dietary_prefs) THEN 'Matches your dietary preferences'
      WHEN c.reward_points > 300 THEN 'High reward potential'
      WHEN c.difficulty_level = 'easy' THEN 'Great for getting started'
      ELSE 'Popular choice among users'
    END)::TEXT
  FROM challenges c
  WHERE c.is_active = true
  AND c.is_evergreen = true
  -- Must meet prerequisites if any
  AND (
    c.prerequisite_challenge_id IS NULL 
    OR EXISTS (
      SELECT 1 FROM user_challenge_progress ucp
      WHERE ucp.user_id = p_user_id 
      AND ucp.challenge_id = c.prerequisite_challenge_id
      AND ucp.is_completed = true
    )
  )
  -- Not already completed
  AND NOT EXISTS (
    SELECT 1 FROM user_challenge_progress ucp4
    WHERE ucp4.user_id = p_user_id 
    AND ucp4.challenge_id = c.id 
    AND ucp4.is_completed = true
  )
  ORDER BY score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to check if quest prerequisites are met
CREATE OR REPLACE FUNCTION check_quest_prerequisites(p_user_id UUID, p_challenge_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_prerequisite_id UUID;
  v_prerequisite_completed BOOLEAN;
BEGIN
  -- Get prerequisite challenge ID
  SELECT prerequisite_challenge_id
  INTO v_prerequisite_id
  FROM challenges
  WHERE id = p_challenge_id;

  -- If no prerequisite, return true
  IF v_prerequisite_id IS NULL THEN
    RETURN true;
  END IF;

  -- Check if prerequisite is completed
  SELECT EXISTS (
    SELECT 1 
    FROM user_challenge_progress
    WHERE user_id = p_user_id 
    AND challenge_id = v_prerequisite_id
    AND is_completed = true
  ) INTO v_prerequisite_completed;

  RETURN v_prerequisite_completed;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON FUNCTION get_recommended_quests IS 'Returns personalized quest recommendations based on user preferences, history, and behavior';
COMMENT ON FUNCTION check_quest_prerequisites IS 'Checks if a user has completed the prerequisite quest to unlock a new quest';
COMMENT ON VIEW quest_history IS 'Comprehensive view of user quest history with completion metrics';
COMMENT ON TABLE user_notification_preferences IS 'Stores user preferences for push notifications';
COMMENT ON TABLE push_notification_log IS 'Logs all push notifications sent to users for tracking and analytics';

-- Update existing challenges with difficulty levels based on their properties
UPDATE challenges
SET difficulty_level = 
  CASE 
    WHEN total_tasks <= 3 AND duration_days <= 7 THEN 'easy'
    WHEN total_tasks >= 6 OR duration_days >= 14 THEN 'hard'
    ELSE 'medium'
  END
WHERE difficulty_level IS NULL OR difficulty_level = 'medium';
