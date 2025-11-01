export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          username: string | null
          avatar_url: string | null
          health_goals: string[] | null
          dietary_preferences: string[] | null
          cooking_frequency: string | null
          food_restrictions: string[] | null
          level: number
          experience: number
          total_points: number
          streak_days: number
          onboarding_completed: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          health_goals?: string[] | null
          dietary_preferences?: string[] | null
          cooking_frequency?: string | null
          food_restrictions?: string[] | null
          level?: number
          experience?: number
          total_points?: number
          streak_days?: number
          onboarding_completed?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          health_goals?: string[] | null
          dietary_preferences?: string[] | null
          cooking_frequency?: string | null
          food_restrictions?: string[] | null
          level?: number
          experience?: number
          total_points?: number
          streak_days?: number
          onboarding_completed?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          title: string
          description: string | null
          image_url: string | null
          prep_time: number
          difficulty: string
          meal_type: string
          cuisine_type: string | null
          calories: number | null
          protein: number | null
          carbs: number | null
          fat: number | null
          points: number
          nutrition_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          image_url?: string | null
          prep_time: number
          difficulty: string
          meal_type: string
          cuisine_type?: string | null
          calories?: number | null
          protein?: number | null
          carbs?: number | null
          fat?: number | null
          points: number
          nutrition_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          image_url?: string | null
          prep_time?: number
          difficulty?: string
          meal_type?: string
          cuisine_type?: string | null
          calories?: number | null
          protein?: number | null
          carbs?: number | null
          fat?: number | null
          points?: number
          nutrition_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      ingredients: {
        Row: {
          id: string
          name: string
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          created_at?: string
        }
      }
      recipe_ingredients: {
        Row: {
          id: string
          recipe_id: string
          ingredient_id: string
          amount: string
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          ingredient_id: string
          amount: string
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          ingredient_id?: string
          amount?: string
          created_at?: string
        }
      }
      recipe_instructions: {
        Row: {
          id: string
          recipe_id: string
          step_number: number
          instruction: string
          timer_minutes: number | null
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          step_number: number
          instruction: string
          timer_minutes?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          step_number?: number
          instruction?: string
          timer_minutes?: number | null
          created_at?: string
        }
      }
      user_ingredients: {
        Row: {
          id: string
          user_id: string
          ingredient_id: string
          quantity: string | null
          expiry_date: string | null
          in_stock: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ingredient_id: string
          quantity?: string | null
          expiry_date?: string | null
          in_stock?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ingredient_id?: string
          quantity?: string | null
          expiry_date?: string | null
          in_stock?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      recipe_tags: {
        Row: {
          id: string
          recipe_id: string
          tag: string
          tag_type: string
          created_at: string
        }
        Insert: {
          id?: string
          recipe_id: string
          tag: string
          tag_type: string
          created_at?: string
        }
        Update: {
          id?: string
          recipe_id?: string
          tag?: string
          tag_type?: string
          created_at?: string
        }
      }
      user_favorites: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          created_at?: string
        }
      }
      user_completed_meals: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          completed_at: string
          points_earned: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          completed_at?: string
          points_earned: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          completed_at?: string
          points_earned?: number
          created_at?: string
        }
      }
      challenges: {
        Row: {
          id: string
          title: string
          description: string
          long_description: string | null
          category: string
          total_tasks: number
          reward_points: number
          start_date: string
          end_date: string
          icon: string
          color: string
          bg_color: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          long_description?: string | null
          category: string
          total_tasks: number
          reward_points: number
          start_date: string
          end_date: string
          icon: string
          color: string
          bg_color: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          long_description?: string | null
          category?: string
          total_tasks?: number
          reward_points?: number
          start_date?: string
          end_date?: string
          icon?: string
          color?: string
          bg_color?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      challenge_tasks: {
        Row: {
          id: string
          challenge_id: string
          title: string
          description: string | null
          order_number: number
          created_at: string
        }
        Insert: {
          id?: string
          challenge_id: string
          title: string
          description?: string | null
          order_number: number
          created_at?: string
        }
        Update: {
          id?: string
          challenge_id?: string
          title?: string
          description?: string | null
          order_number?: number
          created_at?: string
        }
      }
      user_challenge_progress: {
        Row: {
          id: string
          user_id: string
          challenge_id: string
          completed_tasks: number
          is_completed: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          challenge_id: string
          completed_tasks?: number
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          challenge_id?: string
          completed_tasks?: number
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_challenge_task_progress: {
        Row: {
          id: string
          user_id: string
          challenge_id: string
          task_id: string
          is_completed: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          challenge_id: string
          task_id: string
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          challenge_id?: string
          task_id?: string
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          color: string
          requirement_type: string
          requirement_value: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon: string
          color: string
          requirement_type: string
          requirement_value: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          color?: string
          requirement_type?: string
          requirement_value?: number
          created_at?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          earned_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          earned_at?: string
          created_at?: string
        }
      }
      user_activity_log: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          activity_title: string
          activity_description: string | null
          points_earned: number
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: string
          activity_title: string
          activity_description?: string | null
          points_earned?: number
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: string
          activity_title?: string
          activity_description?: string | null
          points_earned?: number
          metadata?: Json | null
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          daily_calorie_target: number
          weight_goal: string
          activity_level: string
          dietary_restrictions: string[]
          favorite_cuisines: string[]
          meal_preferences: Json
          tutorial_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          daily_calorie_target?: number
          weight_goal?: string
          activity_level?: string
          dietary_restrictions?: string[]
          favorite_cuisines?: string[]
          meal_preferences?: Json
          tutorial_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          daily_calorie_target?: number
          weight_goal?: string
          activity_level?: string
          dietary_restrictions?: string[]
          favorite_cuisines?: string[]
          meal_preferences?: Json
          tutorial_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}