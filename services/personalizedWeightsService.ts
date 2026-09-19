import { supabase } from "@/lib/supabase"

interface ScoringWeights {
  tag_match: number
  ingredient_match: number
  user_preference: number
  calorie_alignment: number
  time_relevance: number
  popularity: number
  seasonal: number
  novelty: number
}

interface UserWeightProfile {
  user_id: string
  weights: ScoringWeights
  performance_score: number
  click_through_rate: number
  completion_rate: number
  average_rating: number
  total_recommendations: number
  total_interactions: number
  learning_confidence: number
  last_optimized_at?: string
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  tag_match: 0.22,
  ingredient_match: 0.2,
  user_preference: 0.15,
  calorie_alignment: 0.13,
  time_relevance: 0.1,
  popularity: 0.08,
  seasonal: 0.07,
  novelty: 0.05,
}

export const personalizedWeightsService = {
  /**
   * Get user's personalized weights (or default if not yet learned)
   */
  async getUserWeights(userId: string): Promise<ScoringWeights> {
    const { data, error } = await supabase
      .from("user_recommendation_weights")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (error || !data) {
      // Return default weights if not found
      return DEFAULT_WEIGHTS
    }

    return {
      tag_match: data.tag_match_weight,
      ingredient_match: data.ingredient_match_weight,
      user_preference: data.user_preference_weight,
      calorie_alignment: data.calorie_alignment_weight,
      time_relevance: data.time_relevance_weight,
      popularity: data.popularity_weight,
      seasonal: data.seasonal_weight,
      novelty: data.novelty_weight,
    }
  },

  /**
   * Initialize default weights for a new user
   */
  async initializeUserWeights(userId: string): Promise<void> {
    const { error } = await supabase.from("user_recommendation_weights").insert({
      user_id: userId,
      tag_match_weight: DEFAULT_WEIGHTS.tag_match,
      ingredient_match_weight: DEFAULT_WEIGHTS.ingredient_match,
      user_preference_weight: DEFAULT_WEIGHTS.user_preference,
      calorie_alignment_weight: DEFAULT_WEIGHTS.calorie_alignment,
      time_relevance_weight: DEFAULT_WEIGHTS.time_relevance,
      popularity_weight: DEFAULT_WEIGHTS.popularity,
      seasonal_weight: DEFAULT_WEIGHTS.seasonal,
      novelty_weight: DEFAULT_WEIGHTS.novelty,
      performance_score: 0,
      click_through_rate: 0,
      completion_rate: 0,
      average_rating: 0,
      total_recommendations: 0,
      total_interactions: 0,
      learning_confidence: 0,
    })

    if (error && error.code !== "23505") {
      // Ignore duplicate key error
      console.error("Error initializing user weights:", error)
    }
  },

  /**
   * Learn optimal weights from user's interaction history
   * Uses simple gradient descent on completion rate as the optimization target
   */
  async optimizeWeights(
    userId: string,
    minInteractions: number = 20,
  ): Promise<boolean> {
    console.log(`🧠 Optimizing weights for user ${userId}...`)

    // Get user's recommendation history with interactions
    const { data: history, error: historyError } = await supabase
      .from("recommendation_metrics")
      .select("scoring_breakdown, was_clicked, was_completed, user_rating")
      .eq("user_id", userId)
      .eq("was_clicked", true) // Only learn from clicked recommendations
      .order("recommended_at", { ascending: false })
      .limit(100)

    if (historyError || !history || history.length < minInteractions) {
      console.log(
        `⚠️ Not enough interaction data (${history?.length || 0}/${minInteractions})`,
      )
      return false
    }

    // Analyze which scoring components correlate with positive outcomes
    const componentNames = [
      "tagMatch",
      "ingredientMatch",
      "userPreference",
      "calorieAlignment",
      "timeRelevance",
      "popularity",
      "seasonal",
      "novelty",
    ]

    const correlations: Record<string, number> = {}

    componentNames.forEach((component) => {
      const scores = history.map(
        (h) => (h.scoring_breakdown as any)[component] || 0,
      )
      const outcomes = history.map((h) => {
        // Weighted outcome: completion = 3, rating > 3 = 2, clicked = 1
        if (h.was_completed) return 3
        if (h.user_rating && h.user_rating > 3) return 2
        return 1
      })

      correlations[component] = this.calculateCorrelation(scores, outcomes)
    })

    console.log("📊 Component correlations:", correlations)

    // Convert correlations to weights
    // Positive correlations increase weight, negative decrease
    const currentWeights = await this.getUserWeights(userId)
    const learningRate = 0.3 // How much to adjust weights

    const newWeights: Record<string, number> = {}
    const weightMapping: Record<string, keyof ScoringWeights> = {
      tagMatch: "tag_match",
      ingredientMatch: "ingredient_match",
      userPreference: "user_preference",
      calorieAlignment: "calorie_alignment",
      timeRelevance: "time_relevance",
      popularity: "popularity",
      seasonal: "seasonal",
      novelty: "novelty",
    }

    // Adjust weights based on correlations
    componentNames.forEach((component) => {
      const weightKey = weightMapping[component]
      const currentWeight = currentWeights[weightKey]
      const correlation = correlations[component] || 0

      // Increase weight if positive correlation, decrease if negative
      const adjustment = correlation * learningRate * currentWeight
      newWeights[weightKey] = currentWeight + adjustment
    })

    // Normalize weights to sum to 1.0
    const totalWeight = Object.values(newWeights).reduce((a, b) => a + b, 0)
    Object.keys(newWeights).forEach((key) => {
      newWeights[key] = newWeights[key] / totalWeight
    })

    // Calculate performance metrics
    const clickedCount = history.length
    const completedCount = history.filter((h) => h.was_completed).length
    const ratings = history
      .filter((h) => h.user_rating)
      .map((h) => h.user_rating)

    const completionRate = completedCount / clickedCount
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0

    // Learning confidence increases with more data
    const learningConfidence = Math.min(1.0, history.length / 100)

    // Update database
    const { error: updateError } = await supabase
      .from("user_recommendation_weights")
      .upsert({
        user_id: userId,
        tag_match_weight: newWeights.tag_match,
        ingredient_match_weight: newWeights.ingredient_match,
        user_preference_weight: newWeights.user_preference,
        calorie_alignment_weight: newWeights.calorie_alignment,
        time_relevance_weight: newWeights.time_relevance,
        popularity_weight: newWeights.popularity,
        seasonal_weight: newWeights.seasonal,
        novelty_weight: newWeights.novelty,
        performance_score: completionRate,
        completion_rate: completionRate,
        average_rating: averageRating,
        total_recommendations: history.length,
        total_interactions: clickedCount,
        learning_confidence: learningConfidence,
        last_optimized_at: new Date().toISOString(),
      })

    if (updateError) {
      console.error("Error updating user weights:", updateError)
      return false
    }

    console.log("✅ Weights optimized successfully")
    console.log("New weights:", newWeights)
    console.log(`Completion rate: ${(completionRate * 100).toFixed(1)}%`)
    console.log(`Learning confidence: ${(learningConfidence * 100).toFixed(1)}%`)

    return true
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

  /**
   * Get user's weight profile with performance data
   */
  async getUserWeightProfile(userId: string): Promise<UserWeightProfile | null> {
    const { data, error } = await supabase
      .from("user_recommendation_weights")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (error || !data) {
      return null
    }

    return {
      user_id: data.user_id,
      weights: {
        tag_match: data.tag_match_weight,
        ingredient_match: data.ingredient_match_weight,
        user_preference: data.user_preference_weight,
        calorie_alignment: data.calorie_alignment_weight,
        time_relevance: data.time_relevance_weight,
        popularity: data.popularity_weight,
        seasonal: data.seasonal_weight,
        novelty: data.novelty_weight,
      },
      performance_score: data.performance_score,
      click_through_rate: data.click_through_rate,
      completion_rate: data.completion_rate,
      average_rating: data.average_rating,
      total_recommendations: data.total_recommendations,
      total_interactions: data.total_interactions,
      learning_confidence: data.learning_confidence,
      last_optimized_at: data.last_optimized_at,
    }
  },

  /**
   * Reset user weights to default
   */
  async resetUserWeights(userId: string): Promise<void> {
    const { error } = await supabase
      .from("user_recommendation_weights")
      .update({
        tag_match_weight: DEFAULT_WEIGHTS.tag_match,
        ingredient_match_weight: DEFAULT_WEIGHTS.ingredient_match,
        user_preference_weight: DEFAULT_WEIGHTS.user_preference,
        calorie_alignment_weight: DEFAULT_WEIGHTS.calorie_alignment,
        time_relevance_weight: DEFAULT_WEIGHTS.time_relevance,
        popularity_weight: DEFAULT_WEIGHTS.popularity,
        seasonal_weight: DEFAULT_WEIGHTS.seasonal,
        novelty_weight: DEFAULT_WEIGHTS.novelty,
        learning_confidence: 0,
        last_optimized_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (error) {
      console.error("Error resetting user weights:", error)
    } else {
      console.log(`✅ Reset weights to default for user ${userId}`)
    }
  },

  /**
   * Run optimization for all users with sufficient data
   * (Should be run as a scheduled background job)
   */
  async optimizeAllUsers(
    minInteractions: number = 20,
    batchSize: number = 50,
  ): Promise<void> {
    console.log("🔄 Starting batch weight optimization...")

    // Get users with sufficient interaction data
    const { data: users, error } = await supabase
      .from("recommendation_metrics")
      .select("user_id")
      .eq("was_clicked", true)

    if (error || !users) {
      console.error("Error fetching users:", error)
      return
    }

    // Count interactions per user
    const interactionCounts: Record<string, number> = {}
    users.forEach((u) => {
      interactionCounts[u.user_id] = (interactionCounts[u.user_id] || 0) + 1
    })

    // Filter users with enough interactions
    const eligibleUsers = Object.entries(interactionCounts)
      .filter(([_, count]) => count >= minInteractions)
      .map(([userId, _]) => userId)
      .slice(0, batchSize)

    console.log(
      `📊 Optimizing weights for ${eligibleUsers.length} eligible users...`,
    )

    let optimized = 0
    for (const userId of eligibleUsers) {
      const success = await this.optimizeWeights(userId, minInteractions)
      if (success) {
        optimized++
      }

      // Small delay to avoid overwhelming the database
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    console.log(
      `✅ Batch optimization complete: ${optimized}/${eligibleUsers.length} users optimized`,
    )
  },

  /**
   * Compare personalized weights performance vs default weights
   */
  async compareWeightPerformance(userId: string): Promise<{
    personalized: { completion_rate: number; average_rating: number }
    default: { completion_rate: number; average_rating: number }
    improvement: { completion_rate: number; average_rating: number }
  } | null> {
    // Get user's weight profile
    const profile = await this.getUserWeightProfile(userId)

    if (!profile || profile.learning_confidence < 0.3) {
      console.log("Not enough data to compare performance")
      return null
    }

    // Get recommendations made with personalized weights
    const { data: personalizedRecs, error: pError } = await supabase
      .from("recommendation_metrics")
      .select("was_completed, user_rating")
      .eq("user_id", userId)
      .eq("was_clicked", true)
      .gte("recommended_at", profile.last_optimized_at || "2020-01-01")

    // Get recommendations made with default weights (before optimization)
    const { data: defaultRecs, error: dError } = await supabase
      .from("recommendation_metrics")
      .select("was_completed, user_rating")
      .eq("user_id", userId)
      .eq("was_clicked", true)
      .lt("recommended_at", profile.last_optimized_at || "2020-01-01")

    if (
      pError ||
      dError ||
      !personalizedRecs ||
      !defaultRecs ||
      personalizedRecs.length < 5 ||
      defaultRecs.length < 5
    ) {
      console.log("Not enough data to compare")
      return null
    }

    // Calculate metrics
    const calcMetrics = (recs: any[]) => {
      const completed = recs.filter((r) => r.was_completed).length
      const ratings = recs.filter((r) => r.user_rating).map((r) => r.user_rating)

      return {
        completion_rate: completed / recs.length,
        average_rating:
          ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0,
      }
    }

    const personalizedMetrics = calcMetrics(personalizedRecs)
    const defaultMetrics = calcMetrics(defaultRecs)

    return {
      personalized: personalizedMetrics,
      default: defaultMetrics,
      improvement: {
        completion_rate:
          ((personalizedMetrics.completion_rate -
            defaultMetrics.completion_rate) /
            defaultMetrics.completion_rate) *
          100,
        average_rating:
          ((personalizedMetrics.average_rating - defaultMetrics.average_rating) /
            defaultMetrics.average_rating) *
          100,
      },
    }
  },
}
