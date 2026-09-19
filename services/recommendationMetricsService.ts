import { supabase } from "@/lib/supabase"

interface RecommendationMetric {
  id?: string
  user_id: string
  recipe_id: string
  recommendation_score: number
  scoring_weights: Record<string, number>
  scoring_breakdown: Record<string, number>
  context?: Record<string, any>
  position_in_list?: number
  experiment_variant?: string
}

interface InteractionUpdate {
  was_viewed?: boolean
  was_clicked?: boolean
  was_completed?: boolean
  was_favorited?: boolean
  user_rating?: number
}

interface MetricsAnalytics {
  total_recommendations: number
  click_through_rate: number
  completion_rate: number
  average_rating: number
  favorite_rate: number
  metrics_by_variant?: Record<string, any>
}

export const recommendationMetricsService = {
  /**
   * Log a recommendation shown to a user
   */
  async logRecommendation(
    metric: RecommendationMetric,
  ): Promise<string | null> {
    const { data, error } = await supabase
      .from("recommendation_metrics")
      .insert({
        user_id: metric.user_id,
        recipe_id: metric.recipe_id,
        recommendation_score: metric.recommendation_score,
        scoring_weights: metric.scoring_weights,
        scoring_breakdown: metric.scoring_breakdown,
        context: metric.context,
        position_in_list: metric.position_in_list,
        experiment_variant: metric.experiment_variant,
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error logging recommendation:", error)
      return null
    }

    return data.id
  },

  /**
   * Log multiple recommendations at once (batch insert)
   */
  async logRecommendationBatch(
    userId: string,
    recipes: Array<{
      recipe_id: string
      recommendation_score: number
      scoring_weights: Record<string, number>
      scoring_breakdown: Record<string, number>
      position: number
    }>,
    context?: Record<string, any>,
    experimentVariant?: string,
  ): Promise<void> {
    const metrics = recipes.map((recipe) => ({
      user_id: userId,
      recipe_id: recipe.recipe_id,
      recommendation_score: recipe.recommendation_score,
      scoring_weights: recipe.scoring_weights,
      scoring_breakdown: recipe.scoring_breakdown,
      context: context,
      position_in_list: recipe.position,
      experiment_variant: experimentVariant,
    }))

    const { error } = await supabase
      .from("recommendation_metrics")
      .insert(metrics)

    if (error) {
      console.error("Error logging recommendation batch:", error)
    } else {
      console.log(`📊 Logged ${metrics.length} recommendations for user ${userId}`)
    }
  },

  /**
   * Update interaction tracking for a recommendation
   */
  async trackInteraction(
    userId: string,
    recipeId: string,
    interaction: InteractionUpdate,
  ): Promise<void> {
    // Find the most recent recommendation for this user/recipe
    const { data: existing, error: findError } = await supabase
      .from("recommendation_metrics")
      .select("id")
      .eq("user_id", userId)
      .eq("recipe_id", recipeId)
      .order("recommended_at", { ascending: false })
      .limit(1)
      .single()

    if (findError || !existing) {
      console.error("No recommendation found to update:", findError)
      return
    }

    // Build update object with timestamps
    const updates: any = {}

    if (interaction.was_viewed !== undefined) {
      updates.was_viewed = interaction.was_viewed
      if (interaction.was_viewed) {
        updates.viewed_at = new Date().toISOString()
      }
    }

    if (interaction.was_clicked !== undefined) {
      updates.was_clicked = interaction.was_clicked
      if (interaction.was_clicked) {
        updates.clicked_at = new Date().toISOString()
      }
    }

    if (interaction.was_completed !== undefined) {
      updates.was_completed = interaction.was_completed
      if (interaction.was_completed) {
        updates.completed_at = new Date().toISOString()
      }
    }

    if (interaction.was_favorited !== undefined) {
      updates.was_favorited = interaction.was_favorited
      if (interaction.was_favorited) {
        updates.favorited_at = new Date().toISOString()
      }
    }

    if (interaction.user_rating !== undefined) {
      updates.user_rating = interaction.user_rating
      updates.rated_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from("recommendation_metrics")
      .update(updates)
      .eq("id", existing.id)

    if (error) {
      console.error("Error tracking interaction:", error)
    } else {
      console.log(`✅ Tracked interaction for recipe ${recipeId}`)
    }
  },

  /**
   * Get analytics for user's recommendation performance
   */
  async getUserAnalytics(
    userId: string,
    days: number = 30,
  ): Promise<MetricsAnalytics> {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const { data, error } = await supabase
      .from("recommendation_metrics")
      .select("*")
      .eq("user_id", userId)
      .gte("recommended_at", since.toISOString())

    if (error || !data) {
      console.error("Error fetching user analytics:", error)
      return {
        total_recommendations: 0,
        click_through_rate: 0,
        completion_rate: 0,
        average_rating: 0,
        favorite_rate: 0,
      }
    }

    const total = data.length
    const viewed = data.filter((m) => m.was_viewed).length
    const clicked = data.filter((m) => m.was_clicked).length
    const completed = data.filter((m) => m.was_completed).length
    const favorited = data.filter((m) => m.was_favorited).length
    const ratings = data.filter((m) => m.user_rating).map((m) => m.user_rating)

    return {
      total_recommendations: total,
      click_through_rate: viewed > 0 ? clicked / viewed : 0,
      completion_rate: clicked > 0 ? completed / clicked : 0,
      average_rating:
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0,
      favorite_rate: total > 0 ? favorited / total : 0,
    }
  },

  /**
   * Get analytics by experiment variant
   */
  async getExperimentAnalytics(
    experimentName: string,
    days: number = 30,
  ): Promise<Record<string, MetricsAnalytics>> {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const { data, error } = await supabase
      .from("recommendation_metrics")
      .select("*")
      .eq("experiment_variant", experimentName)
      .gte("recommended_at", since.toISOString())

    if (error || !data) {
      console.error("Error fetching experiment analytics:", error)
      return {}
    }

    // Group by variant (stored in context or separate field)
    const byVariant: Record<string, any[]> = {}

    data.forEach((metric) => {
      const variant = metric.experiment_variant || "control"
      if (!byVariant[variant]) {
        byVariant[variant] = []
      }
      byVariant[variant].push(metric)
    })

    // Calculate metrics for each variant
    const results: Record<string, MetricsAnalytics> = {}

    Object.entries(byVariant).forEach(([variant, metrics]) => {
      const total = metrics.length
      const viewed = metrics.filter((m) => m.was_viewed).length
      const clicked = metrics.filter((m) => m.was_clicked).length
      const completed = metrics.filter((m) => m.was_completed).length
      const favorited = metrics.filter((m) => m.was_favorited).length
      const ratings = metrics
        .filter((m) => m.user_rating)
        .map((m) => m.user_rating)

      results[variant] = {
        total_recommendations: total,
        click_through_rate: viewed > 0 ? clicked / viewed : 0,
        completion_rate: clicked > 0 ? completed / clicked : 0,
        average_rating:
          ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0,
        favorite_rate: total > 0 ? favorited / total : 0,
      }
    })

    return results
  },

  /**
   * Get top performing recipes (by CTR and completion rate)
   */
  async getTopPerformingRecipes(
    limit: number = 20,
    minRecommendations: number = 10,
  ): Promise<any[]> {
    const { data, error } = await supabase
      .from("recipe_interaction_summary")
      .select(
        `
        recipe_id,
        total_users,
        click_count,
        completion_count,
        click_through_rate,
        completion_rate,
        average_rating
      `,
      )
      .gte("total_users", minRecommendations)
      .order("completion_rate", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching top performing recipes:", error)
      return []
    }

    return data || []
  },

  /**
   * Get worst performing recipes (to potentially remove or improve)
   */
  async getWorstPerformingRecipes(
    limit: number = 20,
    minRecommendations: number = 10,
  ): Promise<any[]> {
    const { data, error } = await supabase
      .from("recipe_interaction_summary")
      .select(
        `
        recipe_id,
        total_users,
        click_count,
        completion_count,
        click_through_rate,
        completion_rate,
        average_rating
      `,
      )
      .gte("total_users", minRecommendations)
      .order("completion_rate", { ascending: true })
      .limit(limit)

    if (error) {
      console.error("Error fetching worst performing recipes:", error)
      return []
    }

    return data || []
  },

  /**
   * Refresh materialized view (should be run periodically, e.g., daily)
   */
  async refreshMetricsSummary(): Promise<void> {
    const { error } = await supabase.rpc("refresh_recommendation_metrics")

    if (error) {
      console.error("Error refreshing metrics summary:", error)
    } else {
      console.log("✅ Refreshed recommendation metrics summary")
    }
  },

  /**
   * Get scoring component effectiveness (which components predict success best)
   */
  async getScoringComponentEffectiveness(
    userId: string,
    days: number = 30,
  ): Promise<Record<string, number>> {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const { data, error } = await supabase
      .from("recommendation_metrics")
      .select("scoring_breakdown, was_completed")
      .eq("user_id", userId)
      .eq("was_clicked", true) // Only look at clicked recommendations
      .gte("recommended_at", since.toISOString())

    if (error || !data || data.length === 0) {
      return {}
    }

    // Calculate correlation between each scoring component and completion
    const components = [
      "tagMatch",
      "ingredientMatch",
      "calorieAlignment",
      "timeRelevance",
      "userPreference",
      "novelty",
      "popularity",
      "seasonal",
      "diversity",
    ]

    const effectiveness: Record<string, number> = {}

    components.forEach((component) => {
      const scores = data.map(
        (m) => (m.scoring_breakdown as any)[component] || 0,
      )
      const completions = data.map((m) => (m.was_completed ? 1 : 0))

      // Simple correlation calculation
      const correlation = this.calculateCorrelation(scores, completions)
      effectiveness[component] = correlation
    })

    return effectiveness
  },

  /**
   * Calculate Pearson correlation coefficient
   */
  calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length
    if (n === 0) return 0

    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0)

    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt(
      (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY),
    )

    if (denominator === 0) return 0

    return numerator / denominator
  },
}
