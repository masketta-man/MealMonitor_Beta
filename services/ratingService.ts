import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"

type RecipeRatingInsert =
  Database["public"]["Tables"]["recipe_ratings"]["Insert"]
type RecipeRatingRow = Database["public"]["Tables"]["recipe_ratings"]["Row"]

export interface RatingData {
  overallRating: number
  difficulty: number
  timeAccuracy: number
  taste: number
  instructions: number
  actualTime: number
  modifications: string
  wouldCookAgain: boolean
}

/**
 * Aggregated stats from the `recipe_rating_stats` view.
 * All aggregate columns are null when a recipe has no ratings yet.
 */
export interface RecipeRatingStats {
  recipe_id: string | null
  recipe_name: string | null
  total_ratings: number | null
  avg_overall_rating: number | null
  avg_difficulty: number | null
  avg_time_accuracy: number | null
  avg_taste: number | null
  avg_instructions: number | null
  avg_actual_time: number | null
  would_cook_again_count: number | null
  would_cook_again_percentage: number | null
}

export const ratingService = {
  /**
   * Create a new recipe rating
   */
  async createRating(
    userId: string,
    recipeId: string,
    completionId: string | null,
    suggestedTimeMinutes: number,
    ratingData: RatingData,
  ): Promise<{ data: RecipeRatingRow | null; error: Error | null }> {
    try {
      const ratingRecord: RecipeRatingInsert = {
        user_id: userId,
        recipe_id: recipeId,
        completion_id: completionId,
        overall_rating: ratingData.overallRating,
        difficulty_rating: ratingData.difficulty,
        time_accuracy_rating: ratingData.timeAccuracy,
        taste_rating: ratingData.taste,
        instructions_rating: ratingData.instructions,
        actual_time_minutes: ratingData.actualTime,
        suggested_time_minutes: suggestedTimeMinutes,
        modifications: ratingData.modifications || null,
        would_cook_again: ratingData.wouldCookAgain,
      }

      const { data, error } = await supabase
        .from("recipe_ratings")
        .insert(ratingRecord)
        .select()
        .single()

      if (error) throw error

      // Update the completion record with the rating reference and simple rating
      if (completionId && data) {
        await supabase
          .from("user_completed_meals")
          .update({
            rating_id: data.id,
            user_rating: ratingData.overallRating,
          })
          .eq("id", completionId)
      }

      return { data, error: null }
    } catch (error) {
      console.error("Error creating rating:", error)
      return { data: null, error: error as Error }
    }
  },

  /**
   * Get user's rating for a specific recipe completion
   */
  async getRatingByCompletion(
    completionId: string,
  ): Promise<{ data: RecipeRatingRow | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("recipe_ratings")
        .select("*")
        .eq("completion_id", completionId)
        .single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error("Error fetching rating:", error)
      return { data: null, error: error as Error }
    }
  },

  /**
   * Get all ratings for a recipe
   */
  async getRecipeRatings(
    recipeId: string,
  ): Promise<{ data: RecipeRatingRow[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("recipe_ratings")
        .select("*")
        .eq("recipe_id", recipeId)
        .order("created_at", { ascending: false })

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error) {
      console.error("Error fetching recipe ratings:", error)
      return { data: [], error: error as Error }
    }
  },

  /**
   * Get aggregated rating statistics for a recipe
   */
  async getRecipeRatingStats(
    recipeId: string,
  ): Promise<{ data: RecipeRatingStats | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("recipe_rating_stats")
        .select("*")
        .eq("recipe_id", recipeId)
        .single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error("Error fetching recipe rating stats:", error)
      return { data: null, error: error as Error }
    }
  },

  /**
   * Get all ratings by a user
   */
  async getUserRatings(
    userId: string,
  ): Promise<{ data: RecipeRatingRow[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("recipe_ratings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error) {
      console.error("Error fetching user ratings:", error)
      return { data: [], error: error as Error }
    }
  },

  /**
   * Update an existing rating
   */
  async updateRating(
    ratingId: string,
    ratingData: Partial<RatingData>,
  ): Promise<{ data: RecipeRatingRow | null; error: Error | null }> {
    try {
      const updateData: Partial<RecipeRatingInsert> = {}

      if (ratingData.overallRating !== undefined)
        updateData.overall_rating = ratingData.overallRating
      if (ratingData.difficulty !== undefined)
        updateData.difficulty_rating = ratingData.difficulty
      if (ratingData.timeAccuracy !== undefined)
        updateData.time_accuracy_rating = ratingData.timeAccuracy
      if (ratingData.taste !== undefined)
        updateData.taste_rating = ratingData.taste
      if (ratingData.instructions !== undefined)
        updateData.instructions_rating = ratingData.instructions
      if (ratingData.actualTime !== undefined)
        updateData.actual_time_minutes = ratingData.actualTime
      if (ratingData.modifications !== undefined)
        updateData.modifications = ratingData.modifications || null
      if (ratingData.wouldCookAgain !== undefined)
        updateData.would_cook_again = ratingData.wouldCookAgain

      const { data, error } = await supabase
        .from("recipe_ratings")
        .update(updateData)
        .eq("id", ratingId)
        .select()
        .single()

      if (error) throw error

      // Update simple rating in completion if overall rating changed
      if (ratingData.overallRating !== undefined && data) {
        await supabase
          .from("user_completed_meals")
          .update({ user_rating: ratingData.overallRating })
          .eq("rating_id", ratingId)
      }

      return { data, error: null }
    } catch (error) {
      console.error("Error updating rating:", error)
      return { data: null, error: error as Error }
    }
  },

  /**
   * Delete a rating
   */
  async deleteRating(
    ratingId: string,
  ): Promise<{ success: boolean; error: Error | null }> {
    try {
      // First, clear the rating reference in user_completed_meals
      await supabase
        .from("user_completed_meals")
        .update({ rating_id: null, user_rating: null })
        .eq("rating_id", ratingId)

      const { error } = await supabase
        .from("recipe_ratings")
        .delete()
        .eq("id", ratingId)

      if (error) throw error

      return { success: true, error: null }
    } catch (error) {
      console.error("Error deleting rating:", error)
      return { success: false, error: error as Error }
    }
  },

  /**
   * Check if user has rated a specific completion
   */
  async hasRatedCompletion(
    completionId: string,
  ): Promise<{ hasRated: boolean; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("recipe_ratings")
        .select("id")
        .eq("completion_id", completionId)
        .single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      return { hasRated: !!data, error: null }
    } catch (error) {
      console.error("Error checking rating status:", error)
      return { hasRated: false, error: error as Error }
    }
  },
}

export default ratingService
