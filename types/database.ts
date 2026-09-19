export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          color: string
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          color: string
          created_at?: string | null
          description: string
          icon: string
          id?: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Update: {
          color?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      challenge_tasks: {
        Row: {
          challenge_id: string
          created_at: string | null
          description: string | null
          id: string
          order_number: number
          title: string
        }
        Insert: {
          challenge_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          order_number: number
          title: string
        }
        Update: {
          challenge_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          order_number?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_tasks_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          bg_color: string
          category: string
          chain_name: string | null
          chain_order: number | null
          color: string
          created_at: string | null
          description: string
          difficulty_level: string | null
          duration_days: number | null
          end_date: string
          icon: string
          id: string
          is_active: boolean | null
          is_evergreen: boolean | null
          long_description: string | null
          prerequisite_challenge_id: string | null
          reward_points: number
          start_date: string
          title: string
          total_tasks: number
          updated_at: string | null
        }
        Insert: {
          bg_color: string
          category: string
          chain_name?: string | null
          chain_order?: number | null
          color: string
          created_at?: string | null
          description: string
          difficulty_level?: string | null
          duration_days?: number | null
          end_date: string
          icon: string
          id?: string
          is_active?: boolean | null
          is_evergreen?: boolean | null
          long_description?: string | null
          prerequisite_challenge_id?: string | null
          reward_points?: number
          start_date: string
          title: string
          total_tasks?: number
          updated_at?: string | null
        }
        Update: {
          bg_color?: string
          category?: string
          chain_name?: string | null
          chain_order?: number | null
          color?: string
          created_at?: string | null
          description?: string
          difficulty_level?: string | null
          duration_days?: number | null
          end_date?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          is_evergreen?: boolean | null
          long_description?: string | null
          prerequisite_challenge_id?: string | null
          reward_points?: number
          start_date?: string
          title?: string
          total_tasks?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenges_prerequisite_challenge_id_fkey"
            columns: ["prerequisite_challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_calories: {
        Row: {
          calorie_goal: number
          created_at: string | null
          date: string
          goal_met: boolean
          id: string
          total_calories: number
          updated_at: string | null
          user_id: string
          xp_awarded: boolean
        }
        Insert: {
          calorie_goal?: number
          created_at?: string | null
          date?: string
          goal_met?: boolean
          id?: string
          total_calories?: number
          updated_at?: string | null
          user_id: string
          xp_awarded?: boolean
        }
        Update: {
          calorie_goal?: number
          created_at?: string | null
          date?: string
          goal_met?: boolean
          id?: string
          total_calories?: number
          updated_at?: string | null
          user_id?: string
          xp_awarded?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "daily_calories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_streaks: {
        Row: {
          activity_logged: boolean
          challenge_completed: boolean
          created_at: string | null
          date: string
          goal_met: boolean
          id: string
          user_id: string
        }
        Insert: {
          activity_logged?: boolean
          challenge_completed?: boolean
          created_at?: string | null
          date?: string
          goal_met?: boolean
          id?: string
          user_id: string
        }
        Update: {
          activity_logged?: boolean
          challenge_completed?: boolean
          created_at?: string | null
          date?: string
          goal_met?: boolean
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          category: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      meal_logs: {
        Row: {
          calories: number
          carbs: number | null
          created_at: string | null
          fat: number | null
          id: string
          logged_at: string | null
          meal_name: string
          meal_type: string
          protein: number | null
          recipe_id: string | null
          user_id: string
        }
        Insert: {
          calories?: number
          carbs?: number | null
          created_at?: string | null
          fat?: number | null
          id?: string
          logged_at?: string | null
          meal_name: string
          meal_type: string
          protein?: number | null
          recipe_id?: string | null
          user_id: string
        }
        Update: {
          calories?: number
          carbs?: number | null
          created_at?: string | null
          fat?: number | null
          id?: string
          logged_at?: string | null
          meal_name?: string
          meal_type?: string
          protein?: number | null
          recipe_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_logs_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          amount: string
          created_at: string | null
          id: string
          ingredient_id: string
          recipe_id: string
        }
        Insert: {
          amount: string
          created_at?: string | null
          id?: string
          ingredient_id: string
          recipe_id: string
        }
        Update: {
          amount?: string
          created_at?: string | null
          id?: string
          ingredient_id?: string
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_instructions: {
        Row: {
          created_at: string | null
          id: string
          instruction: string
          recipe_id: string
          step_number: number
          timer_minutes: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          instruction: string
          recipe_id: string
          step_number: number
          timer_minutes?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          instruction?: string
          recipe_id?: string
          step_number?: number
          timer_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_instructions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ratings: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          completion_id: string | null
          overall_rating: number
          difficulty_rating: number
          time_accuracy_rating: number
          taste_rating: number
          instructions_rating: number
          actual_time_minutes: number | null
          suggested_time_minutes: number | null
          modifications: string | null
          would_cook_again: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          completion_id?: string | null
          overall_rating: number
          difficulty_rating: number
          time_accuracy_rating: number
          taste_rating: number
          instructions_rating: number
          actual_time_minutes?: number | null
          suggested_time_minutes?: number | null
          modifications?: string | null
          would_cook_again?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          completion_id?: string | null
          overall_rating?: number
          difficulty_rating?: number
          time_accuracy_rating?: number
          taste_rating?: number
          instructions_rating?: number
          actual_time_minutes?: number | null
          suggested_time_minutes?: number | null
          modifications?: string | null
          would_cook_again?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ratings_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ratings_completion_id_fkey"
            columns: ["completion_id"]
            isOneToOne: false
            referencedRelation: "user_completed_meals"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_tag_mappings: {
        Row: {
          added_by: string | null
          confidence_score: number | null
          created_at: string | null
          id: string
          recipe_id: string
          relevance_weight: number | null
          source: string | null
          tag_id: string
        }
        Insert: {
          added_by?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          recipe_id: string
          relevance_weight?: number | null
          source?: string | null
          tag_id: string
        }
        Update: {
          added_by?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          recipe_id?: string
          relevance_weight?: number | null
          source?: string | null
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_tag_mappings_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_tag_mappings_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_tag_mappings_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_tags: {
        Row: {
          created_at: string | null
          id: string
          recipe_id: string
          tag: string
          tag_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          recipe_id: string
          tag: string
          tag_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          recipe_id?: string
          tag?: string
          tag_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_tags_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string | null
          cuisine_type: string | null
          description: string | null
          difficulty: string
          fat: number | null
          id: string
          image_url: string | null
          meal_type: string
          nutrition_score: number | null
          points: number
          prep_time: number
          protein: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          cuisine_type?: string | null
          description?: string | null
          difficulty: string
          fat?: number | null
          id?: string
          image_url?: string | null
          meal_type: string
          nutrition_score?: number | null
          points?: number
          prep_time: number
          protein?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          cuisine_type?: string | null
          description?: string | null
          difficulty?: string
          fat?: number | null
          id?: string
          image_url?: string | null
          meal_type?: string
          nutrition_score?: number | null
          points?: number
          prep_time?: number
          protein?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tag_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tag_relationships: {
        Row: {
          created_at: string | null
          id: string
          related_tag_id: string
          relationship_type: string
          strength: number | null
          tag_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          related_tag_id: string
          relationship_type: string
          strength?: number | null
          tag_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          related_tag_id?: string
          relationship_type?: string
          strength?: number | null
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tag_relationships_related_tag_id_fkey"
            columns: ["related_tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tag_relationships_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      tag_statistics: {
        Row: {
          avg_completion_rate: number | null
          avg_recipe_rating: number | null
          created_at: string | null
          id: string
          last_calculated_at: string | null
          monthly_usage: number | null
          tag_id: string
          total_recipes: number | null
          total_user_interactions: number | null
          trending_score: number | null
          weekly_usage: number | null
        }
        Insert: {
          avg_completion_rate?: number | null
          avg_recipe_rating?: number | null
          created_at?: string | null
          id?: string
          last_calculated_at?: string | null
          monthly_usage?: number | null
          tag_id: string
          total_recipes?: number | null
          total_user_interactions?: number | null
          trending_score?: number | null
          weekly_usage?: number | null
        }
        Update: {
          avg_completion_rate?: number | null
          avg_recipe_rating?: number | null
          created_at?: string | null
          id?: string
          last_calculated_at?: string | null
          monthly_usage?: number | null
          tag_id?: string
          total_recipes?: number | null
          total_user_interactions?: number | null
          trending_score?: number | null
          weekly_usage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tag_statistics_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: true
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          base_weight: number | null
          category_id: string | null
          color_hex: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_approved: boolean | null
          is_system_tag: boolean | null
          name: string
          parent_tag_id: string | null
          popularity_score: number | null
          related_terms: string[] | null
          relevance_score: number | null
          requires_verification: boolean | null
          slug: string
          synonyms: string[] | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          base_weight?: number | null
          category_id?: string | null
          color_hex?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          is_system_tag?: boolean | null
          name: string
          parent_tag_id?: string | null
          popularity_score?: number | null
          related_terms?: string[] | null
          relevance_score?: number | null
          requires_verification?: boolean | null
          slug: string
          synonyms?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          base_weight?: number | null
          category_id?: string | null
          color_hex?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          is_system_tag?: boolean | null
          name?: string
          parent_tag_id?: string | null
          popularity_score?: number | null
          related_terms?: string[] | null
          relevance_score?: number | null
          requires_verification?: boolean | null
          slug?: string
          synonyms?: string[] | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tags_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tags_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "tag_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tags_parent_tag_id_fkey"
            columns: ["parent_tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_log: {
        Row: {
          activity_description: string | null
          activity_title: string
          activity_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          points_earned: number
          user_id: string
        }
        Insert: {
          activity_description?: string | null
          activity_title: string
          activity_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          points_earned?: number
          user_id: string
        }
        Update: {
          activity_description?: string | null
          activity_title?: string
          activity_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          points_earned?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          created_at: string | null
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          created_at?: string | null
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          created_at?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenge_progress: {
        Row: {
          activated_at: string | null
          challenge_id: string
          completed_at: string | null
          completed_tasks: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_completed: boolean | null
          quest_end_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          challenge_id: string
          completed_at?: string | null
          completed_tasks?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_completed?: boolean | null
          quest_end_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activated_at?: string | null
          challenge_id?: string
          completed_at?: string | null
          completed_tasks?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_completed?: boolean | null
          quest_end_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_challenge_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenge_task_progress: {
        Row: {
          challenge_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          task_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          task_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          task_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_task_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_challenge_task_progress_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "challenge_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_challenge_task_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_completed_meals: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          points_earned: number
          recipe_id: string
          user_id: string
          rating_id: string | null
          user_rating: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          points_earned?: number
          recipe_id: string
          user_id: string
          rating_id?: string | null
          user_rating?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          points_earned?: number
          recipe_id?: string
          user_id?: string
          rating_id?: string | null
          user_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_completed_meals_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_completed_meals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_completed_meals_rating_id_fkey"
            columns: ["rating_id"]
            isOneToOne: false
            referencedRelation: "recipe_ratings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          recipe_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_ingredients: {
        Row: {
          created_at: string | null
          expiry_date: string | null
          id: string
          in_stock: boolean | null
          ingredient_id: string
          quantity: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          in_stock?: boolean | null
          ingredient_id: string
          quantity?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          in_stock?: boolean | null
          ingredient_id?: string
          quantity?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ingredients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          activity_level: string | null
          created_at: string | null
          daily_calorie_target: number | null
          dietary_restrictions: string[] | null
          favorite_cuisines: string[] | null
          id: string
          meal_preferences: Json | null
          tutorial_completed: boolean | null
          updated_at: string | null
          user_id: string
          weight_goal: string | null
        }
        Insert: {
          activity_level?: string | null
          created_at?: string | null
          daily_calorie_target?: number | null
          dietary_restrictions?: string[] | null
          favorite_cuisines?: string[] | null
          id?: string
          meal_preferences?: Json | null
          tutorial_completed?: boolean | null
          updated_at?: string | null
          user_id: string
          weight_goal?: string | null
        }
        Update: {
          activity_level?: string | null
          created_at?: string | null
          daily_calorie_target?: number | null
          dietary_restrictions?: string[] | null
          favorite_cuisines?: string[] | null
          id?: string
          meal_preferences?: Json | null
          tutorial_completed?: boolean | null
          updated_at?: string | null
          user_id?: string
          weight_goal?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tag_preferences: {
        Row: {
          created_at: string | null
          id: string
          interaction_count: number | null
          last_interacted_at: string | null
          negative_interactions: number | null
          positive_interactions: number | null
          preference_score: number | null
          tag_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          interaction_count?: number | null
          last_interacted_at?: string | null
          negative_interactions?: number | null
          positive_interactions?: number | null
          preference_score?: number | null
          tag_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          interaction_count?: number | null
          last_interacted_at?: string | null
          negative_interactions?: number | null
          positive_interactions?: number | null
          preference_score?: number | null
          tag_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tag_preferences_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tag_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          cooking_frequency: string | null
          created_at: string | null
          dietary_preferences: string[] | null
          email: string
          experience: number | null
          food_restrictions: string[] | null
          full_name: string | null
          health_goals: string[] | null
          id: string
          last_activity_date: string | null
          last_level_up: string | null
          level: number | null
          onboarding_completed: boolean | null
          streak_days: number | null
          total_points: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          cooking_frequency?: string | null
          created_at?: string | null
          dietary_preferences?: string[] | null
          email: string
          experience?: number | null
          food_restrictions?: string[] | null
          full_name?: string | null
          health_goals?: string[] | null
          id: string
          last_activity_date?: string | null
          last_level_up?: string | null
          level?: number | null
          onboarding_completed?: boolean | null
          streak_days?: number | null
          total_points?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          cooking_frequency?: string | null
          created_at?: string | null
          dietary_preferences?: string[] | null
          email?: string
          experience?: number | null
          food_restrictions?: string[] | null
          full_name?: string | null
          health_goals?: string[] | null
          id?: string
          last_activity_date?: string | null
          last_level_up?: string | null
          level?: number | null
          onboarding_completed?: boolean | null
          streak_days?: number | null
          total_points?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      quest_history: {
        Row: {
          activated_at: string | null
          actual_completion_minutes: number | null
          category: string | null
          challenge_id: string | null
          completed_at: string | null
          completed_on_time: boolean | null
          completed_tasks: number | null
          completion_time_minutes: number | null
          description: string | null
          difficulty_level: string | null
          duration_days: number | null
          id: string | null
          is_completed: boolean | null
          quest_end_date: string | null
          reward_points: number | null
          title: string | null
          total_tasks: number | null
          user_id: string | null
          user_rating: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_challenge_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_interaction_summary: {
        Row: {
          average_rating: number | null
          click_count: number | null
          click_through_rate: number | null
          completion_count: number | null
          completion_rate: number | null
          favorite_count: number | null
          last_recommended_at: string | null
          rating_count: number | null
          recipe_id: string | null
          total_users: number | null
          view_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_metrics_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      popular_ingredients: {
        Row: {
          id: string | null
          name: string | null
          category: string | null
          recipe_count: number | null
          category_rank: number | null
        }
        Relationships: []
      }
      recipe_rating_stats: {
        Row: {
          avg_actual_time: number | null
          avg_difficulty: number | null
          avg_instructions: number | null
          avg_overall_rating: number | null
          avg_taste: number | null
          avg_time_accuracy: number | null
          recipe_id: string | null
          recipe_name: string | null
          total_ratings: number | null
          would_cook_again_count: number | null
          would_cook_again_percentage: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      activate_quest: {
        Args: { p_challenge_id: string; p_user_id: string }
        Returns: {
          message: string
          quest_end_date: string
          success: boolean
        }[]
      }
      calculate_tag_popularity_score: {
        Args: { tag_uuid: string }
        Returns: number
      }
      calculate_user_similarity_jaccard: {
        Args: { user_id_1: string; user_id_2: string }
        Returns: number
      }
      check_quest_prerequisites: {
        Args: { p_challenge_id: string; p_user_id: string }
        Returns: boolean
      }
      get_collaborative_recommendations: {
        Args: {
          max_results?: number
          min_similarity?: number
          target_user_id: string
        }
        Returns: {
          recipe_id: string
          recommendation_strength: number
          similar_user_count: number
        }[]
      }
      get_recommended_quests: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          category: string
          challenge_id: string
          description: string
          difficulty_level: string
          duration_days: number
          recommendation_reason: string
          recommendation_score: number
          reward_points: number
          title: string
        }[]
      }
      get_related_tags: {
        Args: { relationship_types?: string[]; tag_uuid: string }
        Returns: {
          related_tag_id: string
          related_tag_name: string
          relationship_type: string
          strength: number
        }[]
      }
      get_similar_users: {
        Args: {
          max_results?: number
          min_similarity?: number
          target_user_id: string
        }
        Returns: {
          similar_user_id: string
          similarity_score: number
        }[]
      }
      refresh_recommendation_metrics: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
