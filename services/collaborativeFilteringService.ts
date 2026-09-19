import { supabase } from "@/lib/supabase"
import { RecipeWithDetails } from "./recipeService"

interface SimilarUser {
  user_id: string
  similarity_score: number
}

interface CollaborativeRecommendation {
  recipe_id: string
  recommendation_strength: number
  similar_user_count: number
}

export const collaborativeFilteringService = {
  /**
   * Calculate similarity between two users based on completed recipes (Jaccard)
   */
  async calculateUserSimilarity(
    userId1: string,
    userId2: string,
  ): Promise<number> {
    const { data, error } = await supabase.rpc(
      "calculate_user_similarity_jaccard",
      {
        user_id_1: userId1,
        user_id_2: userId2,
      },
    )

    if (error) {
      console.error("Error calculating user similarity:", error)
      return 0
    }

    return data || 0
  },

  /**
   * Store user similarity in database
   */
  async storeSimilarity(
    userId1: string,
    userId2: string,
    similarityScore: number,
    method: string = "jaccard",
    basedOn: Record<string, boolean> = { completed_recipes: true },
  ): Promise<void> {
    // Ensure user_id_1 < user_id_2 (constraint requirement)
    const [smallerId, largerId] =
      userId1 < userId2 ? [userId1, userId2] : [userId2, userId1]

    const { error } = await supabase.from("user_similarity").upsert({
      user_id_1: smallerId,
      user_id_2: largerId,
      similarity_score: similarityScore,
      calculation_method: method,
      based_on: basedOn,
      calculated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error storing user similarity:", error)
    }
  },

  /**
   * Get similar users for a given user
   */
  async getSimilarUsers(
    userId: string,
    minSimilarity: number = 0.3,
    limit: number = 10,
  ): Promise<SimilarUser[]> {
    const { data, error } = await supabase.rpc("get_similar_users", {
      target_user_id: userId,
      min_similarity: minSimilarity,
      max_results: limit,
    })

    if (error) {
      console.error("Error fetching similar users:", error)
      return []
    }

    return (
      data?.map((row: any) => ({
        user_id: row.similar_user_id,
        similarity_score: row.similarity_score,
      })) || []
    )
  },

  /**
   * Get collaborative recipe recommendations based on similar users
   */
  async getCollaborativeRecommendations(
    userId: string,
    minSimilarity: number = 0.3,
    limit: number = 20,
  ): Promise<CollaborativeRecommendation[]> {
    const { data, error } = await supabase.rpc(
      "get_collaborative_recommendations",
      {
        target_user_id: userId,
        min_similarity: minSimilarity,
        max_results: limit,
      },
    )

    if (error) {
      console.error("Error fetching collaborative recommendations:", error)
      return []
    }

    return (
      data?.map((row: any) => ({
        recipe_id: row.recipe_id,
        recommendation_strength: row.recommendation_strength,
        similar_user_count: row.similar_user_count,
      })) || []
    )
  },

  /**
   * Build similarity matrix for a user against all other users
   * (Computationally expensive - should be run in background job)
   */
  async buildSimilarityMatrixForUser(
    userId: string,
    minCompletedRecipes: number = 3,
  ): Promise<void> {
    console.log(`🔄 Building similarity matrix for user ${userId}...`)

    // Get all users with at least minCompletedRecipes completed
    const { data: users, error: usersError } = await supabase
      .from("user_completed_meals")
      .select("user_id")
      .neq("user_id", userId)

    if (usersError || !users) {
      console.error("Error fetching users:", usersError)
      return
    }

    // Get unique user IDs with enough activity
    const uniqueUserIds = [...new Set(users.map((u) => u.user_id))]

    // Count completed recipes per user
    const userCounts: Record<string, number> = {}
    users.forEach((u) => {
      userCounts[u.user_id] = (userCounts[u.user_id] || 0) + 1
    })

    // Filter users with minimum activity
    const activeUsers = uniqueUserIds.filter(
      (uid) => userCounts[uid] >= minCompletedRecipes,
    )

    console.log(
      `📊 Calculating similarity with ${activeUsers.length} active users...`,
    )

    // Calculate similarity with each user
    let calculated = 0
    for (const otherUserId of activeUsers) {
      const similarity = await this.calculateUserSimilarity(
        userId,
        otherUserId,
      )

      // Only store if similarity is significant
      if (similarity > 0.1) {
        await this.storeSimilarity(userId, otherUserId, similarity)
        calculated++
      }
    }

    console.log(`✅ Calculated and stored ${calculated} similarity scores`)
  },

  /**
   * Hybrid recommendation: blend collaborative filtering with content-based
   */
  async getHybridRecommendations(
    userId: string,
    contentBasedScores: Map<string, number>, // recipe_id -> score
    collaborativeWeight: number = 0.3, // 30% collaborative, 70% content-based
    limit: number = 20,
  ): Promise<Array<{ recipe_id: string; hybrid_score: number }>> {
    // Get collaborative recommendations
    const collaborativeRecs = await this.getCollaborativeRecommendations(
      userId,
      0.3,
      limit * 2,
    )

    // Normalize collaborative scores to 0-100 range
    const maxCollaborativeStrength = Math.max(
      ...collaborativeRecs.map((r) => r.recommendation_strength),
      1,
    )

    const collaborativeScores = new Map<string, number>()
    collaborativeRecs.forEach((rec) => {
      const normalizedScore =
        (rec.recommendation_strength / maxCollaborativeStrength) * 100
      collaborativeScores.set(rec.recipe_id, normalizedScore)
    })

    // Combine scores
    const allRecipeIds = new Set([
      ...contentBasedScores.keys(),
      ...collaborativeScores.keys(),
    ])

    const hybridScores: Array<{ recipe_id: string; hybrid_score: number }> = []

    allRecipeIds.forEach((recipeId) => {
      const contentScore = contentBasedScores.get(recipeId) || 0
      const collabScore = collaborativeScores.get(recipeId) || 0

      // Weighted average
      const hybridScore =
        contentScore * (1 - collaborativeWeight) +
        collabScore * collaborativeWeight

      hybridScores.push({
        recipe_id: recipeId,
        hybrid_score: hybridScore,
      })
    })

    // Sort by hybrid score and return top N
    return hybridScores
      .sort((a, b) => b.hybrid_score - a.hybrid_score)
      .slice(0, limit)
  },

  /**
   * Get "Users like you also enjoyed" recommendations
   */
  async getUsersLikeYouRecommendations(
    userId: string,
    limit: number = 10,
  ): Promise<
    Array<{
      recipe: RecipeWithDetails
      similar_user_count: number
      recommendation_strength: number
    }>
  > {
    // Get collaborative recommendations
    const collaborativeRecs = await this.getCollaborativeRecommendations(
      userId,
      0.4,
      limit,
    )

    if (collaborativeRecs.length === 0) {
      return []
    }

    // Fetch full recipe details
    const recipeIds = collaborativeRecs.map((r) => r.recipe_id)

    const { data: recipes, error } = await supabase
      .from("recipes")
      .select(
        `
        *,
        recipe_ingredients (
          amount,
          ingredients (
            id,
            name,
            category
          )
        ),
        recipe_instructions (
          step_number,
          instruction,
          timer_minutes
        ),
        recipe_tag_mappings (
          tags (
            id,
            name
          )
        )
      `,
      )
      .in("id", recipeIds)

    if (error || !recipes) {
      console.error("Error fetching recipes:", error)
      return []
    }

    // Transform and combine with collaborative data
    return recipes.map((recipe: any) => {
      const collabData = collaborativeRecs.find(
        (r) => r.recipe_id === recipe.id,
      )!

      const recipeWithDetails: RecipeWithDetails = {
        ...recipe,
        ingredients: recipe.recipe_ingredients.map((ri: any) => ({
          id: ri.ingredients.id,
          name: ri.ingredients.name,
          amount: ri.amount,
          category: ri.ingredients.category,
        })),
        instructions: recipe.recipe_instructions
          .sort((a: any, b: any) => a.step_number - b.step_number)
          .map((inst: any) => ({
            step_number: inst.step_number,
            instruction: inst.instruction,
            timer_minutes: inst.timer_minutes,
          })),
        tags: recipe.recipe_tag_mappings.map((mapping: any) => ({
          tag: mapping.tags.name,
          id: mapping.tags.id,
        })),
      }

      return {
        recipe: recipeWithDetails,
        similar_user_count: collabData.similar_user_count,
        recommendation_strength: collabData.recommendation_strength,
      }
    })
  },

  /**
   * Calculate and store similarities for all user pairs
   * (Very expensive - should be run as a scheduled background job)
   */
  async buildGlobalSimilarityMatrix(
    minCompletedRecipes: number = 5,
    batchSize: number = 100,
  ): Promise<void> {
    console.log("🔄 Building global similarity matrix...")

    // Get all active users
    const { data: userActivity, error } = await supabase.rpc(
      "execute_sql",
      {
        query: `
        SELECT user_id, COUNT(*) as completed_count
        FROM user_completed_meals
        GROUP BY user_id
        HAVING COUNT(*) >= ${minCompletedRecipes}
        ORDER BY user_id
      `,
      },
    )

    if (error) {
      console.error("Error fetching active users:", error)
      return
    }

    const activeUsers = userActivity.map((u: any) => u.user_id)
    console.log(`📊 Processing ${activeUsers.length} active users...`)

    // Process in batches to avoid overwhelming the system
    let processed = 0

    for (let i = 0; i < activeUsers.length; i++) {
      if (processed >= batchSize) break

      const user1 = activeUsers[i]

      for (let j = i + 1; j < activeUsers.length; j++) {
        if (processed >= batchSize) break

        const user2 = activeUsers[j]

        // Calculate similarity
        const similarity = await this.calculateUserSimilarity(user1, user2)

        // Store if significant
        if (similarity > 0.1) {
          await this.storeSimilarity(user1, user2, similarity)
        }

        processed++

        if (processed % 10 === 0) {
          console.log(`⏳ Processed ${processed} user pairs...`)
        }
      }
    }

    console.log(`✅ Built similarity matrix: ${processed} pairs processed`)
  },
}
