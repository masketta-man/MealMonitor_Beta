import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"

type Challenge = Database["public"]["Tables"]["challenges"]["Row"]

export interface RecommendedQuest extends Challenge {
  recommendation_score: number
  recommendation_reason: string
}

export interface QuestRecommendationFilters {
  category?: string
  difficulty?: "easy" | "medium" | "hard"
  maxDuration?: number
  minRewards?: number
}

export const questRecommendationService = {
  /**
   * Get personalized quest recommendations using the database function
   */
  async getRecommendedQuests(
    userId: string,
    limit: number = 5,
  ): Promise<RecommendedQuest[]> {
    try {
      const { data, error } = await supabase.rpc("get_recommended_quests", {
        p_user_id: userId,
        p_limit: limit,
      })

      if (error) {
        console.error("Error fetching recommended quests:", error)
        return []
      }

      // Transform the RPC result to match our interface
      const recommendedQuests: RecommendedQuest[] = (data || []).map(
        (item: any) => ({
          id: item.challenge_id,
          title: item.title,
          description: item.description,
          category: item.category,
          difficulty_level: item.difficulty_level,
          reward_points: item.reward_points,
          duration_days: item.duration_days,
          recommendation_score: item.recommendation_score,
          recommendation_reason: item.recommendation_reason,
          // Add required fields with defaults
          long_description: null,
          total_tasks: 0,
          start_date: new Date().toISOString(),
          end_date: new Date().toISOString(),
          icon: "star-outline",
          color: "#22c55e",
          bg_color: "#dcfce7",
          is_active: true,
          is_evergreen: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          prerequisite_challenge_id: null,
          chain_order: 0,
          chain_name: null,
        }),
      )

      return recommendedQuests
    } catch (error) {
      console.error("Error in getRecommendedQuests:", error)
      return []
    }
  },

  /**
   * Get recommendations with client-side filtering
   */
  async getFilteredRecommendations(
    userId: string,
    filters: QuestRecommendationFilters = {},
    limit: number = 10,
  ): Promise<RecommendedQuest[]> {
    // Get more quests than needed to allow for filtering
    const recommendations = await this.getRecommendedQuests(userId, limit * 2)

    // Apply client-side filters
    let filtered = recommendations

    if (filters.category) {
      filtered = filtered.filter((q) => q.category === filters.category)
    }

    if (filters.difficulty) {
      filtered = filtered.filter(
        (q) => q.difficulty_level === filters.difficulty,
      )
    }

    if (filters.maxDuration) {
      filtered = filtered.filter(
        (q) => q.duration_days && q.duration_days <= filters.maxDuration!,
      )
    }

    if (filters.minRewards) {
      filtered = filtered.filter((q) => q.reward_points >= filters.minRewards!)
    }

    return filtered.slice(0, limit)
  },

  /**
   * Get quest recommendations based on pantry ingredients
   */
  async getPantryBasedRecommendations(
    userId: string,
    limit: number = 3,
  ): Promise<RecommendedQuest[]> {
    try {
      // Get user's pantry ingredients count
      const { count: pantryCount } = await supabase
        .from("user_ingredients")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("in_stock", true)

      // Get base recommendations
      const recommendations = await this.getRecommendedQuests(userId, limit * 2)

      // Boost scores for quests that match pantry status
      const adjusted = recommendations.map((quest) => {
        let scoreAdjustment = 0

        // Boost meal prep and cooking quests if user has good pantry stock
        if (pantryCount && pantryCount > 10) {
          if (
            quest.category === "Skills" ||
            quest.title.toLowerCase().includes("meal prep")
          ) {
            scoreAdjustment += 15
          }
        }

        // Boost "Zero Waste" and pantry-related quests if user has ingredients
        if (pantryCount && pantryCount > 5) {
          if (
            quest.title.toLowerCase().includes("waste") ||
            quest.title.toLowerCase().includes("pantry")
          ) {
            scoreAdjustment += 20
          }
        }

        return {
          ...quest,
          recommendation_score: quest.recommendation_score + scoreAdjustment,
          recommendation_reason:
            scoreAdjustment > 0
              ? "Great match for your stocked pantry!"
              : quest.recommendation_reason,
        }
      })

      // Re-sort by adjusted score and return top results
      return adjusted
        .sort((a, b) => b.recommendation_score - a.recommendation_score)
        .slice(0, limit)
    } catch (error) {
      console.error("Error in getPantryBasedRecommendations:", error)
      return this.getRecommendedQuests(userId, limit)
    }
  },

  /**
   * Get quest recommendations for a specific time of day
   */
  async getTimeBasedRecommendations(
    userId: string,
    limit: number = 3,
  ): Promise<RecommendedQuest[]> {
    const hour = new Date().getHours()
    let preferredCategory: string | undefined

    // Morning (6 AM - 11 AM): Breakfast quests
    if (hour >= 6 && hour < 11) {
      preferredCategory = "Meal Type"
    }
    // Lunch time (11 AM - 2 PM): Quick and easy
    else if (hour >= 11 && hour < 14) {
      preferredCategory = "Beginner"
    }
    // Evening (5 PM - 9 PM): Dinner and skill-building
    else if (hour >= 17 && hour < 21) {
      preferredCategory = "Skills"
    }

    if (preferredCategory) {
      return this.getFilteredRecommendations(
        userId,
        { category: preferredCategory },
        limit,
      )
    }

    return this.getRecommendedQuests(userId, limit)
  },

  /**
   * Get "Quick Win" recommendations - easy quests for motivation
   */
  async getQuickWinRecommendations(
    userId: string,
    limit: number = 3,
  ): Promise<RecommendedQuest[]> {
    return this.getFilteredRecommendations(
      userId,
      {
        difficulty: "easy",
        maxDuration: 7,
      },
      limit,
    )
  },

  /**
   * Get "Challenge Yourself" recommendations - harder quests
   */
  async getChallengeRecommendations(
    userId: string,
    limit: number = 3,
  ): Promise<RecommendedQuest[]> {
    // Get user's completed quests count
    const { count: completedCount } = await supabase
      .from("user_challenge_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_completed", true)

    // Only recommend hard quests if user has completed at least 3 quests
    const difficulty = completedCount && completedCount >= 3 ? "hard" : "medium"

    return this.getFilteredRecommendations(
      userId,
      {
        difficulty,
        minRewards: 250,
      },
      limit,
    )
  },

  /**
   * Get category-specific recommendations
   */
  async getCategoryRecommendations(
    userId: string,
    category: string,
    limit: number = 5,
  ): Promise<RecommendedQuest[]> {
    return this.getFilteredRecommendations(userId, { category }, limit)
  },

  /**
   * Get recommendations based on completion patterns
   */
  async getPatternBasedRecommendations(
    userId: string,
    limit: number = 5,
  ): Promise<RecommendedQuest[]> {
    try {
      // Get user's most completed categories
      const { data: categoryStats } = await supabase
        .from("user_challenge_progress")
        .select(
          `
          challenge_id,
          challenges!inner(category)
        `,
        )
        .eq("user_id", userId)
        .eq("is_completed", true)

      if (!categoryStats || categoryStats.length === 0) {
        // New user - return easy quests
        return this.getQuickWinRecommendations(userId, limit)
      }

      // Count categories
      const categoryCounts: { [key: string]: number } = {}
      categoryStats.forEach((stat: any) => {
        const category = stat.challenges?.category
        if (category) {
          categoryCounts[category] = (categoryCounts[category] || 0) + 1
        }
      })

      // Find most common category
      const topCategory = Object.entries(categoryCounts).sort(
        ([, a], [, b]) => b - a,
      )[0]?.[0]

      if (topCategory) {
        return this.getCategoryRecommendations(userId, topCategory, limit)
      }

      return this.getRecommendedQuests(userId, limit)
    } catch (error) {
      console.error("Error in getPatternBasedRecommendations:", error)
      return this.getRecommendedQuests(userId, limit)
    }
  },

  /**
   * Get all recommendation sections for the home/explore screen
   */
  async getAllRecommendationSections(userId: string) {
    const [
      forYou,
      quickWins,
      challenges,
      pantryBased,
      timeBased,
      patternBased,
    ] = await Promise.all([
      this.getRecommendedQuests(userId, 5),
      this.getQuickWinRecommendations(userId, 3),
      this.getChallengeRecommendations(userId, 3),
      this.getPantryBasedRecommendations(userId, 3),
      this.getTimeBasedRecommendations(userId, 3),
      this.getPatternBasedRecommendations(userId, 3),
    ])

    return {
      forYou: {
        title: "Recommended For You",
        description: "Personalized quest suggestions based on your profile",
        quests: forYou,
      },
      quickWins: {
        title: "Quick Wins",
        description: "Easy quests to build momentum",
        quests: quickWins,
      },
      challenges: {
        title: "Challenge Yourself",
        description: "Push your cooking skills to the next level",
        quests: challenges,
      },
      pantryBased: {
        title: "Use Your Pantry",
        description: "Make the most of ingredients you have",
        quests: pantryBased,
      },
      timeBased: {
        title: "Perfect For Now",
        description: "Quests that match your current schedule",
        quests: timeBased,
      },
      patternBased: {
        title: "More Like Your Favorites",
        description: "Based on quests you've enjoyed",
        quests: patternBased,
      },
    }
  },
}
