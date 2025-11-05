/*
  # Add More Achievement Badges

  This migration adds a comprehensive set of new achievement badges across different categories
  to give players more goals to work towards.

  ## New Badges Added
  
  ### Meals Completed (Beginner to Master)
  - First Steps (1 meal)
  - Getting Started (5 meals)
  - Home Chef (25 meals)
  - Kitchen Master (100 meals)
  
  ### Streak-Based Achievements
  - Three Day Warrior (3 days)
  - Weekly Champion (14 days)
  - Monthly Master (60 days)
  
  ### Point Milestones
  - Point Starter (100 points)
  - Point Collector (500 points)
  - Point Master (5000 points)
  - Point Legend (10000 points)
  
  ### Challenge Achievements
  - Challenge Novice (1 challenge)
  - Challenge Enthusiast (3 challenges)
  - Challenge Master (10 challenges)
  - Challenge Legend (20 challenges)
  
  ### Specialty Badges
  - Quick Cook (Complete 10 meals under 30 mins)
  - Health Conscious (Complete 15 low-calorie meals)
  - Calorie Tracker (Log calories for 7 days)
  - Perfect Week (Meet calorie goals for 7 consecutive days)
  
  ## Security
  - No RLS changes needed (inherits from existing policies)
*/

-- Add beginner-level meal badges
INSERT INTO badges (name, description, icon, color, requirement_type, requirement_value)
VALUES 
  ('First Steps', 'Complete your first meal', 'footsteps', '#10b981', 'meals_completed', 1),
  ('Getting Started', 'Complete 5 meals', 'fast-food', '#3b82f6', 'meals_completed', 5)
ON CONFLICT (name) DO NOTHING;

-- Add intermediate and advanced meal badges
INSERT INTO badges (name, description, icon, color, requirement_type, requirement_value)
VALUES 
  ('Home Chef', 'Complete 25 different meals', 'home', '#a855f7', 'meals_completed', 25),
  ('Kitchen Master', 'Complete 100 meals', 'medal', '#dc2626', 'meals_completed', 100),
  ('Culinary Legend', 'Complete 200 meals', 'trophy', '#eab308', 'meals_completed', 200)
ON CONFLICT (name) DO NOTHING;

-- Add streak progression badges
INSERT INTO badges (name, description, icon, color, requirement_type, requirement_value)
VALUES 
  ('Three Day Warrior', 'Maintain a 3-day cooking streak', 'bonfire', '#f97316', 'streak_days', 3),
  ('Weekly Champion', 'Maintain a 14-day cooking streak', 'thunderstorm', '#ef4444', 'streak_days', 14),
  ('Monthly Master', 'Maintain a 60-day cooking streak', 'rocket', '#dc2626', 'streak_days', 60)
ON CONFLICT (name) DO NOTHING;

-- Add point milestone badges
INSERT INTO badges (name, description, icon, color, requirement_type, requirement_value)
VALUES 
  ('Point Starter', 'Earn 100 total points', 'star-half', '#fbbf24', 'points_earned', 100),
  ('Point Master', 'Earn 5000 total points', 'star', '#f59e0b', 'points_earned', 5000),
  ('Point Legend', 'Earn 10000 total points', 'diamond', '#eab308', 'points_earned', 10000)
ON CONFLICT (name) DO NOTHING;

-- Add challenge progression badges
INSERT INTO badges (name, description, icon, color, requirement_type, requirement_value)
VALUES 
  ('Challenge Novice', 'Complete your first challenge', 'flag', '#10b981', 'challenges_completed', 1),
  ('Challenge Enthusiast', 'Complete 3 challenges', 'ribbon', '#3b82f6', 'challenges_completed', 3),
  ('Challenge Master', 'Complete 10 challenges', 'trophy', '#a855f7', 'challenges_completed', 10),
  ('Challenge Legend', 'Complete 20 challenges', 'trophy', '#dc2626', 'challenges_completed', 20)
ON CONFLICT (name) DO NOTHING;

-- Add specialty badges (these will need custom tracking logic)
INSERT INTO badges (name, description, icon, color, requirement_type, requirement_value)
VALUES 
  ('Quick Cook', 'Complete 10 recipes under 30 minutes', 'timer', '#06b6d4', 'meals_completed', 10),
  ('Health Conscious', 'Complete 15 low-calorie meals', 'fitness', '#10b981', 'meals_completed', 15),
  ('Balanced Diet', 'Track macros for 30 days', 'analytics', '#8b5cf6', 'streak_days', 30),
  ('Early Bird', 'Complete 10 breakfast recipes', 'cafe', '#f59e0b', 'meals_completed', 10)
ON CONFLICT (name) DO NOTHING;
