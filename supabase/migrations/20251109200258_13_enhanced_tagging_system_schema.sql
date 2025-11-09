/*
  # Enhanced Tagging System for Improved Recommendations

  ## Overview
  This migration implements a comprehensive tagging system with:
  - Hierarchical tag structure (categories, subcategories, tags)
  - Tag weighting and popularity tracking
  - Tag relationships for semantic connections
  - User-generated tags with validation
  - Tag statistics for recommendation optimization

  ## New Tables
  
  ### 1. `tag_categories`
  Top-level tag organization (dietary, cuisine, cooking_method, flavor, etc.)
  
  ### 2. `tags`
  Master tag table with metadata, weights, and validation status
  - Replaces the simple string-based tags in recipe_tags
  - Includes usage tracking, relevance scores, and approval workflow
  
  ### 3. `tag_relationships`
  Defines semantic relationships between tags (similar, opposite, related)
  
  ### 4. `user_tag_preferences`
  Tracks user interactions with tags for personalization
  
  ### 5. `recipe_tag_mappings`
  Enhanced many-to-many relationship with context-specific weights
  
  ## Changes
  - Keeps existing recipe_tags for backward compatibility
  - Adds new normalized tag system alongside
  - Enables gradual migration from old to new system
  
  ## Security
  - Enable RLS on all new tables
  - Appropriate policies for read/write access
  - Admin-only access for tag approval
*/

-- =============================================
-- 1. TAG CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS tag_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon text, -- Icon name for UI
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tag_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tag categories are viewable by everyone"
  ON tag_categories FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- =============================================
-- 2. TAGS MASTER TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL, -- URL-friendly version
  category_id uuid REFERENCES tag_categories(id) ON DELETE SET NULL,
  parent_tag_id uuid REFERENCES tags(id) ON DELETE SET NULL, -- For hierarchical tags
  description text,
  
  -- Weighting and scoring
  base_weight numeric DEFAULT 1.0 CHECK (base_weight >= 0 AND base_weight <= 10),
  relevance_score numeric DEFAULT 1.0 CHECK (relevance_score >= 0 AND relevance_score <= 10),
  usage_count integer DEFAULT 0,
  popularity_score numeric DEFAULT 0, -- Calculated field
  
  -- Validation and moderation
  is_system_tag boolean DEFAULT false, -- Created by system vs user-generated
  is_approved boolean DEFAULT false,
  is_active boolean DEFAULT true,
  requires_verification boolean DEFAULT false,
  
  -- Metadata
  synonyms text[], -- Alternative names
  related_terms text[],
  color_hex text, -- For UI visualization
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid REFERENCES users(id)
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tags are viewable by everyone"
  ON tags FOR SELECT
  TO authenticated, anon
  USING (is_active = true AND (is_approved = true OR is_system_tag = true));

CREATE POLICY "Authenticated users can suggest tags"
  ON tags FOR INSERT
  TO authenticated
  WITH CHECK (is_system_tag = false AND is_approved = false);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tags_category ON tags(category_id);
CREATE INDEX IF NOT EXISTS idx_tags_parent ON tags(parent_tag_id);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_popularity ON tags(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_tags_active_approved ON tags(is_active, is_approved);

-- =============================================
-- 3. TAG RELATIONSHIPS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS tag_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  related_tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  relationship_type text NOT NULL CHECK (relationship_type IN ('similar', 'opposite', 'parent', 'child', 'implies', 'excludes')),
  strength numeric DEFAULT 1.0 CHECK (strength >= 0 AND strength <= 1),
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(tag_id, related_tag_id, relationship_type)
);

ALTER TABLE tag_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tag relationships are viewable by everyone"
  ON tag_relationships FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_tag_relationships_tag ON tag_relationships(tag_id);
CREATE INDEX IF NOT EXISTS idx_tag_relationships_related ON tag_relationships(related_tag_id);

-- =============================================
-- 4. RECIPE TAG MAPPINGS (Enhanced)
-- =============================================
CREATE TABLE IF NOT EXISTS recipe_tag_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  
  -- Context-specific weighting
  relevance_weight numeric DEFAULT 1.0 CHECK (relevance_weight >= 0 AND relevance_weight <= 5),
  confidence_score numeric DEFAULT 1.0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Source tracking
  source text DEFAULT 'manual' CHECK (source IN ('manual', 'auto_generated', 'user_suggested', 'ml_inferred')),
  added_by uuid REFERENCES users(id),
  
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(recipe_id, tag_id)
);

ALTER TABLE recipe_tag_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipe tag mappings are viewable by everyone"
  ON recipe_tag_mappings FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_recipe_tag_mappings_recipe ON recipe_tag_mappings(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_tag_mappings_tag ON recipe_tag_mappings(tag_id);
CREATE INDEX IF NOT EXISTS idx_recipe_tag_mappings_weight ON recipe_tag_mappings(relevance_weight DESC);

-- =============================================
-- 5. USER TAG PREFERENCES
-- =============================================
CREATE TABLE IF NOT EXISTS user_tag_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  
  -- Preference tracking
  preference_score numeric DEFAULT 0 CHECK (preference_score >= -10 AND preference_score <= 10),
  interaction_count integer DEFAULT 0,
  positive_interactions integer DEFAULT 0,
  negative_interactions integer DEFAULT 0,
  
  -- Last interaction
  last_interacted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, tag_id)
);

ALTER TABLE user_tag_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tag preferences"
  ON user_tag_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own tag preferences"
  ON user_tag_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify own tag preferences"
  ON user_tag_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_tag_prefs_user ON user_tag_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tag_prefs_tag ON user_tag_preferences(tag_id);
CREATE INDEX IF NOT EXISTS idx_user_tag_prefs_score ON user_tag_preferences(preference_score DESC);

-- =============================================
-- 6. TAG USAGE STATISTICS
-- =============================================
CREATE TABLE IF NOT EXISTS tag_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id uuid UNIQUE NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  
  -- Usage metrics
  total_recipes integer DEFAULT 0,
  total_user_interactions integer DEFAULT 0,
  avg_recipe_rating numeric DEFAULT 0,
  avg_completion_rate numeric DEFAULT 0,
  
  -- Trend data
  weekly_usage integer DEFAULT 0,
  monthly_usage integer DEFAULT 0,
  trending_score numeric DEFAULT 0,
  
  -- Last updated
  last_calculated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tag_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tag statistics are viewable by everyone"
  ON tag_statistics FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_tag_stats_trending ON tag_statistics(trending_score DESC);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tags 
    SET usage_count = usage_count + 1,
        updated_at = now()
    WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tags 
    SET usage_count = GREATEST(0, usage_count - 1),
        updated_at = now()
    WHERE id = OLD.tag_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tag_usage
  AFTER INSERT OR DELETE ON recipe_tag_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_usage_count();

-- Function to calculate popularity score
CREATE OR REPLACE FUNCTION calculate_tag_popularity_score(tag_uuid uuid)
RETURNS numeric AS $$
DECLARE
  usage_count_val integer;
  base_weight_val numeric;
  relevance_val numeric;
  popularity numeric;
BEGIN
  SELECT usage_count, base_weight, relevance_score
  INTO usage_count_val, base_weight_val, relevance_val
  FROM tags
  WHERE id = tag_uuid;
  
  -- Formula: (usage_count * 0.3) + (base_weight * 2) + (relevance_score * 3)
  popularity := (COALESCE(usage_count_val, 0) * 0.3) + 
                (COALESCE(base_weight_val, 1) * 2) + 
                (COALESCE(relevance_val, 1) * 3);
  
  RETURN LEAST(popularity, 100); -- Cap at 100
END;
$$ LANGUAGE plpgsql;

-- Function to get related tags
CREATE OR REPLACE FUNCTION get_related_tags(tag_uuid uuid, relationship_types text[] DEFAULT ARRAY['similar', 'related'])
RETURNS TABLE(related_tag_id uuid, related_tag_name text, relationship_type text, strength numeric) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tr.related_tag_id,
    t.name,
    tr.relationship_type,
    tr.strength
  FROM tag_relationships tr
  JOIN tags t ON t.id = tr.related_tag_id
  WHERE tr.tag_id = tag_uuid
    AND tr.relationship_type = ANY(relationship_types)
    AND t.is_active = true
    AND t.is_approved = true
  ORDER BY tr.strength DESC, t.popularity_score DESC;
END;
$$ LANGUAGE plpgsql;
