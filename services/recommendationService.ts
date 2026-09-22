import { supabase } from "@/lib/supabase"
import { activityRecommendationBias } from "@/utils/calorieGoal"
import { calorieService } from "./calorieService"
import { RecipeWithDetails } from "./recipeService"
import { settingsService } from "./settingsService"
import { tagService } from "./tagService"
import { userService } from "./userService"

interface RecommendationContext {
  userId: string
  availableIngredients?: string[]
  timeOfDay?: "breakfast" | "lunch" | "dinner" | "snack"
  maxPrepTime?: number
  calorieTarget?: number
  excludeTags?: string[]
  preferredTags?: string[]
  usePersonalizedWeights?: boolean // Use learned weights instead of defaults
  useCollaborativeFiltering?: boolean // Blend with collaborative filtering
  experimentVariant?: string // For A/B testing
}

interface ScoredRecipe extends RecipeWithDetails {
  recommendationScore: number
  scoringBreakdown: {
    tagMatch: number
    ingredientMatch: number
    calorieAlignment: number
    timeRelevance: number
    userPreference: number
    novelty: number
    popularity: number
    seasonal: number
    diversity: number
  }
}

interface CompletedRecipe {
  recipe_id: string
  completed_at: string
}

// Cache for recommendations
interface CacheEntry {
  data: ScoredRecipe[]
  timestamp: number
  contextHash: string
}

const recommendationCache = new Map<string, CacheEntry>()
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes

// Pantry staples that most users have (don't penalize heavily if missing)
const PANTRY_STAPLES = new Set([
  "salt",
  "pepper",
  "black pepper",
  "olive oil",
  "vegetable oil",
  "cooking oil",
  "butter",
  "flour",
  "sugar",
  "water",
  "eggs",
  "garlic",
  "onion",
  "onions",
  "garlic powder",
  "onion powder",
])

// Seasonal ingredients by season (Northern Hemisphere)
const SEASONAL_INGREDIENTS = {
  winter: [
    "root vegetables",
    "cabbage",
    "kale",
    "brussels sprouts",
    "citrus",
    "orange",
    "lemon",
    "grapefruit",
    "squash",
    "potato",
    "sweet potato",
  ],
  spring: [
    "asparagus",
    "peas",
    "spinach",
    "artichoke",
    "strawberries",
    "rhubarb",
    "radish",
    "lettuce",
    "green beans",
  ],
  summer: [
    "tomato",
    "tomatoes",
    "corn",
    "zucchini",
    "cucumber",
    "berries",
    "watermelon",
    "peach",
    "bell pepper",
    "eggplant",
    "basil",
  ],
  fall: [
    "pumpkin",
    "apple",
    "pear",
    "squash",
    "sweet potato",
    "mushroom",
    "cranberry",
    "brussels sprouts",
    "cauliflower",
    "broccoli",
  ],
}

export const recommendationService = {
  /**
   * Get personalized recipe recommendations using enhanced tagging system
   */
  async getPersonalizedRecommendations(
    context: RecommendationContext,
    limit: number = 10,
  ): Promise<ScoredRecipe[]> {
    const {
      userId,
      availableIngredients = [],
      timeOfDay,
      maxPrepTime,
      calorieTarget,
      excludeTags = [],
      preferredTags = [],
      usePersonalizedWeights = true,
      useCollaborativeFiltering = true,
      experimentVariant,
    } = context

    console.log(
      "🎯 Generating personalized recommendations with context:",
      context,
    )

    // Check cache first
    const cacheKey = `${userId}-${limit}`
    const contextHash = this.hashContext(context)
    const cached = recommendationCache.get(cacheKey)

    if (
      cached &&
      Date.now() - cached.timestamp < CACHE_DURATION &&
      cached.contextHash === contextHash
    ) {
      console.log("✅ Returning cached recommendations")
      return cached.data
    }

    // Get personalized weights if enabled
    const scoringWeights = usePersonalizedWeights
      ? await personalizedWeightsService.getUserWeights(userId)
      : {
          tag_match: 0.22,
          ingredient_match: 0.2,
          user_preference: 0.15,
          calorie_alignment: 0.13,
          time_relevance: 0.1,
          popularity: 0.08,
          seasonal: 0.07,
          novelty: 0.05,
        }

    console.log(
      usePersonalizedWeights
        ? "🎯 Using personalized weights"
        : "📊 Using default weights",
    )

    // 1. Load user data in parallel
    const [
      userProfile,
      userSettings,
      todaysLog,
      userTagPreferences,
      completedRecipesData,
    ] = await Promise.all([
      userService.getProfile(userId),
      settingsService.getUserSettings(userId),
      calorieService.getTodaysLog(userId),
      tagService.getUserTagPreferences(userId),
      this.getUserCompletedRecipesWithDates(userId),
    ])

    // 2. Get all recipes with enhanced tag data
    const { data: recipes, error } = await supabase.from("recipes").select(`
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
          relevance_weight,
          confidence_score,
          tags (
            id,
            name,
            slug,
            category_id,
            base_weight,
            relevance_score,
            popularity_score,
            tag_categories (
              name
            )
          )
        )
      `)

    if (error || !recipes) {
      console.error("Error fetching recipes for recommendations:", error)
      return []
    }

    // 3. Calculate time-based preferences
    const currentHour = new Date().getHours()
    const currentMonth = new Date().getMonth()
    const inferredTimeOfDay = timeOfDay || this.inferTimeOfDay(currentHour)
    const currentSeason = this.getSeason(currentMonth)

    // 4. Calculate calorie context
    const remainingCalories =
      calorieTarget ||
      (todaysLog?.calorie_goal || userSettings?.daily_calorie_target || 2000) -
        (todaysLog?.total_calories || 0)

    // 5. Build user tag preference map for quick lookups
    const tagPreferenceMap = new Map(
      userTagPreferences.map((pref) => [pref.tag_id, pref.preference_score]),
    )

    // 6. Build completed recipes map with dates
    const completedRecipesMap = new Map(
      completedRecipesData.map((r) => [r.recipe_id, new Date(r.completed_at)]),
    )

    // 7. Score each recipe
    const scoredRecipes: ScoredRecipe[] = recipes.map((recipe: any) => {
      // Transform recipe data
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
          tag_type: mapping.tags.tag_categories?.name || "other",
          id: mapping.tags.id,
          base_weight: mapping.tags.base_weight,
          relevance_weight: mapping.relevance_weight,
          popularity_score: mapping.tags.popularity_score,
        })),
      }

      // Calculate scoring components
      const scoringBreakdown = {
        tagMatch: this.calculateTagMatchScore(
          recipeWithDetails.tags,
          userTagPreferences,
          tagPreferenceMap,
          preferredTags,
          excludeTags,
        ),
        ingredientMatch: this.calculateSmartIngredientMatchScore(
          recipeWithDetails.ingredients,
          availableIngredients,
        ),
        calorieAlignment: this.calculateCalorieAlignmentScore(
          recipe.calories || 0,
          remainingCalories,
        ),
        timeRelevance: this.calculateTimeRelevanceScore(
          recipe.meal_type,
          inferredTimeOfDay,
          recipe.prep_time,
          maxPrepTime,
        ),
        userPreference: this.calculateUserPreferenceScore(
          userProfile,
          userSettings,
          recipeWithDetails.tags,
        ),
        novelty: this.calculateTimeDecayNoveltyScore(
          recipe.id,
          completedRecipesMap,
        ),
        popularity: this.calculatePopularityScore(
          recipeWithDetails.tags,
          recipe.nutrition_score || 0,
        ),
        seasonal: this.calculateSeasonalScore(
          recipeWithDetails.ingredients,
          currentSeason,
        ),
        diversity: 50, // Will be calculated after initial scoring
      }

      // Weighted total score (out of 100) using personalized or default weights
      const recommendationScore =
        scoringBreakdown.tagMatch * scoringWeights.tag_match +
        scoringBreakdown.ingredientMatch * scoringWeights.ingredient_match +
        scoringBreakdown.userPreference * scoringWeights.user_preference +
        scoringBreakdown.calorieAlignment * scoringWeights.calorie_alignment +
        scoringBreakdown.timeRelevance * scoringWeights.time_relevance +
        scoringBreakdown.popularity * scoringWeights.popularity +
        scoringBreakdown.seasonal * scoringWeights.seasonal +
        scoringBreakdown.novelty * scoringWeights.novelty

      return {
        ...recipeWithDetails,
        recommendationScore,
        scoringBreakdown,
      }
    })

    // 8. Filter recipes based on dietary restrictions and excluded tags
    const userRestrictions = userSettings?.dietary_restrictions || []

    const filteredRecipes = scoredRecipes.filter((recipe) => {
      const recipeTagNames = recipe.tags.map((t: any) => t.tag.toLowerCase())
      const recipeTagIds = recipe.tags.map((t: any) => t.id)

      // Check dietary restrictions
      for (const restriction of userRestrictions) {
        const restrictionLower = restriction.toLowerCase()

        // For dietary preferences (vegetarian, vegan, etc.), recipe MUST have the tag
        if (
          [
            "vegetarian",
            "vegan",
            "pescatarian",
            "keto",
            "paleo",
            "low-carb",
            "mediterranean",
          ].includes(restrictionLower)
        ) {
          if (!recipeTagNames.includes(restrictionLower)) {
            return false
          }
        }

        // For food restrictions (gluten-free, dairy-free, etc.), recipe MUST have the tag
        if (
          [
            "gluten-free",
            "dairy-free",
            "nut-free",
            "soy-free",
            "egg-free",
            "shellfish-free",
            "halal",
            "kosher",
          ].includes(restrictionLower)
        ) {
          if (!recipeTagNames.includes(restrictionLower)) {
            return false
          }
        }
      }

      // Check excluded tags
      return !excludeTags.some((excludeTagId) =>
        recipeTagIds.includes(excludeTagId),
      )
    })

    // 9. Sort by score
    const sortedRecipes = filteredRecipes.sort(
      (a, b) => b.recommendationScore - a.recommendationScore,
    )

    // 10. Apply diversity filtering
    let diverseRecommendations = this.ensureDiversity(sortedRecipes, limit * 2) // Get more for collaborative blending

    // 11. Blend with collaborative filtering if enabled
    if (useCollaborativeFiltering) {
      const contentBasedScores = new Map(
        diverseRecommendations.map((r) => [r.id, r.recommendationScore]),
      )

      const hybridScores =
        await collaborativeFilteringService.getHybridRecommendations(
          userId,
          contentBasedScores,
          0.25, // 25% collaborative, 75% content-based
          limit * 2,
        )

      // Re-score recipes with hybrid scores
      const hybridScoreMap = new Map(
        hybridScores.map((h) => [h.recipe_id, h.hybrid_score]),
      )

      diverseRecommendations.forEach((recipe) => {
        const hybridScore = hybridScoreMap.get(recipe.id)
        if (hybridScore !== undefined) {
          recipe.recommendationScore = hybridScore
        }
      })

      // Re-sort with hybrid scores
      diverseRecommendations.sort(
        (a, b) => b.recommendationScore - a.recommendationScore,
      )

      console.log("🤝 Applied collaborative filtering blend")
    }

    // Take final top N
    const finalRecommendations = diverseRecommendations.slice(0, limit)

    console.log(
      "📊 Recommendation scores (top 5):",
      finalRecommendations.slice(0, 5).map((r) => ({
        title: r.title,
        score: r.recommendationScore.toFixed(2),
        breakdown: Object.entries(r.scoringBreakdown)
          .map(([key, val]) => `${key}: ${val.toFixed(1)}`)
          .join(", "),
      })),
    )

    // 12. Log recommendations for analytics (async, don't wait)
    this.logRecommendationsAsync(
      userId,
      finalRecommendations,
      scoringWeights,
      context,
      experimentVariant,
    )

    // Cache the results
    recommendationCache.set(cacheKey, {
      data: finalRecommendations,
      timestamp: Date.now(),
      contextHash,
    })

    return finalRecommendations
  },

  /**
   * Log recommendations asynchronously for metrics tracking
   */
  async logRecommendationsAsync(
    userId: string,
    recommendations: ScoredRecipe[],
    weights: any,
    context: RecommendationContext,
    experimentVariant?: string,
  ): Promise<void> {
    try {
      const recipes = recommendations.map((rec, index) => ({
        recipe_id: rec.id,
        recommendation_score: rec.recommendationScore,
        scoring_weights: weights,
        scoring_breakdown: rec.scoringBreakdown,
        position: index + 1,
      }))

      await recommendationMetricsService.logRecommendationBatch(
        userId,
        recipes,
        {
          timeOfDay: context.timeOfDay,
          maxPrepTime: context.maxPrepTime,
          ingredientCount: context.availableIngredients?.length || 0,
        },
        experimentVariant,
      )
    } catch (error) {
      console.error("Error logging recommendations:", error)
    }
  },

  /**
   * Hash context for cache key comparison
   */
  hashContext(context: RecommendationContext): string {
    return JSON.stringify({
      ingredients: context.availableIngredients?.sort(),
      timeOfDay: context.timeOfDay,
      maxPrepTime: context.maxPrepTime,
      calorieTarget: context.calorieTarget,
      excludeTags: context.excludeTags?.sort(),
      preferredTags: context.preferredTags?.sort(),
    })
  },

  /**
   * Clear cache for a specific user
   */
  clearUserCache(userId: string): void {
    for (const key of recommendationCache.keys()) {
      if (key.startsWith(userId)) {
        recommendationCache.delete(key)
      }
    }
    console.log(`🗑️ Cleared recommendation cache for user ${userId}`)
  },

  /**
   * Calculate tag match score using enhanced tagging system
   */
  calculateTagMatchScore(
    recipeTags: any[],
    userTagPreferences: any[],
    tagPreferenceMap: Map<string, number>,
    preferredTags: string[],
    excludeTags: string[],
  ): number {
    if (recipeTags.length === 0) return 50 // Neutral score

    let score = 0
    let weightSum = 0

    for (const recipeTag of recipeTags) {
      const tagId = recipeTag.id
      const baseWeight = recipeTag.base_weight || 1
      const relevanceWeight = recipeTag.relevance_weight || 1
      const combinedWeight = baseWeight * relevanceWeight

      // Check if user has preference for this tag
      const userPreference = tagPreferenceMap.get(tagId) || 0

      // Check if tag is in preferred list
      const isPreferred = preferredTags.includes(tagId)

      // Calculate tag contribution
      let tagScore = 50 // Base neutral score

      // Apply user preference (-10 to +10 scale)
      tagScore += userPreference * 3 // Scale to -30 to +30

      // Apply preferred tag bonus
      if (isPreferred) {
        tagScore += 20
      }

      // Apply tag popularity boost
      const popularityBoost = Math.min(
        (recipeTag.popularity_score || 0) / 10,
        10,
      )
      tagScore += popularityBoost

      // Weight the tag score
      score += tagScore * combinedWeight
      weightSum += combinedWeight
    }

    // Calculate weighted average (0-100 scale)
    return weightSum > 0 ? Math.max(0, Math.min(100, score / weightSum)) : 50
  },

  /**
   * Calculate smart ingredient match score with pantry staples consideration
   */
  calculateSmartIngredientMatchScore(
    recipeIngredients: any[],
    availableIngredients: string[],
  ): number {
    if (recipeIngredients.length === 0) return 0
    if (availableIngredients.length === 0) return 30 // Lower score but not zero

    const recipeIngredientNames = recipeIngredients.map((i) =>
      i.name.toLowerCase(),
    )
    const availableIngredientNames = availableIngredients.map((i) =>
      i.toLowerCase(),
    )

    let matchScore = 0
    let totalWeight = 0

    for (const ingredientName of recipeIngredientNames) {
      // Determine ingredient weight
      const isStaple = PANTRY_STAPLES.has(ingredientName)
      const weight = isStaple ? 0.2 : 1.0

      // Check if ingredient is available
      const isAvailable =
        availableIngredientNames.includes(ingredientName) ||
        availableIngredientNames.some((available) =>
          this.fuzzyIngredientMatch(available, ingredientName),
        )

      if (isAvailable || isStaple) {
        matchScore += 100 * weight
      }

      totalWeight += weight
    }

    // Calculate weighted match percentage
    return totalWeight > 0 ? Math.min(100, matchScore / totalWeight) : 30
  },

  /**
   * Fuzzy match ingredients (e.g., "chicken" matches "chicken breast")
   */
  fuzzyIngredientMatch(available: string, required: string): boolean {
    // Simple fuzzy matching - can be enhanced
    return (
      available.includes(required) ||
      required.includes(available) ||
      (available.length > 3 &&
        required.length > 3 &&
        (available.startsWith(required.substring(0, 4)) ||
          required.startsWith(available.substring(0, 4))))
    )
  },

  /**
   * Calculate calorie alignment score
   */
  calculateCalorieAlignmentScore(
    recipeCalories: number,
    remainingCalories: number,
  ): number {
    if (recipeCalories === 0 || remainingCalories <= 0) return 50 // Neutral

    const ratio = recipeCalories / remainingCalories

    // Ideal: Recipe is 25-40% of remaining calories
    if (ratio >= 0.25 && ratio <= 0.4) return 100
    if (ratio > 0.4 && ratio <= 0.6) return 80
    if (ratio > 0.6 && ratio <= 0.8) return 60
    if (ratio > 0.8 && ratio <= 1.0) return 40
    if (ratio > 1.0 && ratio <= 1.2) return 20
    if (ratio > 1.2) return 0

    // Too few calories
    if (ratio < 0.25) return 70

    return 50
  },

  /**
   * Calculate time relevance score
   */
  calculateTimeRelevanceScore(
    recipeMealType: string,
    currentTimeOfDay: string,
    prepTime: number,
    maxPrepTime?: number,
  ): number {
    let score = 50

    // Meal type alignment (0-50 points)
    if (recipeMealType.toLowerCase() === currentTimeOfDay.toLowerCase()) {
      score += 40
    } else if (
      (currentTimeOfDay === "breakfast" && recipeMealType === "Brunch") ||
      (currentTimeOfDay === "lunch" && recipeMealType === "Brunch")
    ) {
      score += 20
    }

    // Prep time consideration (0-10 points)
    if (maxPrepTime) {
      if (prepTime <= maxPrepTime) {
        score += 10
      } else {
        score -= 20
      }
    }

    return Math.max(0, Math.min(100, score))
  },

  /**
   * Calculate user preference score based on dietary preferences
   */
  calculateUserPreferenceScore(
    userProfile: any,
    userSettings: any,
    recipeTags: any[],
  ): number {
    let score = 50 // Neutral base

    const dietaryPreferences = userProfile?.dietary_preferences || []
    const foodRestrictions = userSettings?.dietary_restrictions || []
    const recipeTagNames = recipeTags.map((t) => t.tag.toLowerCase())

    // Check dietary preferences match
    const matchedPreferences = dietaryPreferences.filter((pref: string) =>
      recipeTagNames.includes(pref.toLowerCase()),
    )

    score += matchedPreferences.length * 15

    // Check food restrictions (heavy penalty)
    const hasRestriction = foodRestrictions.some((restriction: string) =>
      recipeTagNames.includes(restriction.toLowerCase()),
    )

    if (hasRestriction) {
      return 0 // Recipe violates restrictions
    }

    // Activity-level nudge: more active users get pushed toward heartier,
    // protein-rich meals; less active users toward lighter, low-calorie ones.
    // `bias` is in [-1, 1] (positive = more active). We tilt the score by up to
    // ±15 depending on whether the recipe's tags read as "heavy" or "light".
    const bias = activityRecommendationBias(userSettings?.activity_level)
    if (bias !== 0) {
      const heavyTags = [
        "high-protein",
        "high-calorie",
        "protein",
        "bulking",
        "post-workout",
        "hearty",
        "energy",
      ]
      const lightTags = [
        "low-calorie",
        "light",
        "low-carb",
        "salad",
        "low-fat",
        "diet",
      ]
      const isHeavy = recipeTagNames.some((t: string) => heavyTags.includes(t))
      const isLight = recipeTagNames.some((t: string) => lightTags.includes(t))

      // A recipe that leans heavy benefits from a positive bias (active user)
      // and is penalised by a negative one; light recipes are the reverse.
      if (isHeavy) score += bias * 15
      if (isLight) score += -bias * 15
    }

    return Math.max(0, Math.min(100, score))
  },

  /**
   * Calculate novelty score with time decay (recipes become "new" again over time)
   */
  calculateTimeDecayNoveltyScore(
    recipeId: string,
    completedRecipesMap: Map<string, Date>,
  ): number {
    const lastCompleted = completedRecipesMap.get(recipeId)

    // Not completed: full novelty bonus
    if (!lastCompleted) return 100

    // Calculate days since last completion
    const daysSince =
      (Date.now() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24)

    // After 30 days, recipe regains full novelty
    // Linear recovery: 30 + (70 * progress)
    const noveltyRecovery = Math.min(100, 30 + (daysSince / 30) * 70)

    return noveltyRecovery
  },

  /**
   * Calculate popularity score from tags
   */
  calculatePopularityScore(recipeTags: any[], nutritionScore: number): number {
    if (recipeTags.length === 0) return 50

    // Average popularity of all tags
    const avgPopularity =
      recipeTags.reduce((sum, tag) => sum + (tag.popularity_score || 0), 0) /
      recipeTags.length

    // Combine tag popularity with nutrition score
    const tagScore = Math.min(100, avgPopularity)
    const nutritionContribution = Math.min(100, (nutritionScore || 0) * 10)

    return tagScore * 0.7 + nutritionContribution * 0.3
  },

  /**
   * Calculate seasonal score based on ingredient seasonality
   */
  calculateSeasonalScore(
    recipeIngredients: any[],
    currentSeason: string,
  ): number {
    if (recipeIngredients.length === 0) return 50

    const seasonalIngredients =
      SEASONAL_INGREDIENTS[
        currentSeason as keyof typeof SEASONAL_INGREDIENTS
      ] || []
    const ingredientNames = recipeIngredients.map((i) => i.name.toLowerCase())

    // Count how many ingredients are seasonal
    const seasonalCount = ingredientNames.filter((name) =>
      seasonalIngredients.some(
        (seasonal) => name.includes(seasonal) || seasonal.includes(name),
      ),
    ).length

    // Calculate percentage and scale to 0-100
    const seasonalPercentage = (seasonalCount / recipeIngredients.length) * 100

    // Boost for seasonal recipes
    return 50 + seasonalPercentage * 0.5
  },

  /**
   * Ensure diversity in recommendations (no 3 similar recipes in a row)
   */
  ensureDiversity(
    sortedRecipes: ScoredRecipe[],
    limit: number,
  ): ScoredRecipe[] {
    if (sortedRecipes.length <= limit) return sortedRecipes.slice(0, limit)

    const diverse: ScoredRecipe[] = []
    const recentCategories: string[] = []
    const DIVERSITY_WINDOW = 3 // Don't repeat category within last 3 recipes

    for (const recipe of sortedRecipes) {
      if (diverse.length >= limit) break

      // Get primary category (meal type or first tag)
      const primaryCategory =
        recipe.meal_type || recipe.tags[0]?.tag_type || "other"

      // Check if this category appeared recently
      const recentOccurrence = recentCategories
        .slice(-DIVERSITY_WINDOW)
        .filter((cat) => cat === primaryCategory).length

      if (recentOccurrence < 2) {
        // Allow if not too repetitive
        diverse.push(recipe)
        recentCategories.push(primaryCategory)

        // Update diversity score in breakdown
        recipe.scoringBreakdown.diversity = 100
      } else {
        // Penalize but don't completely exclude
        recipe.scoringBreakdown.diversity = 30
      }
    }

    // If we don't have enough diverse recipes, fill with remaining
    if (diverse.length < limit) {
      const remaining = sortedRecipes.filter((r) => !diverse.includes(r))
      diverse.push(...remaining.slice(0, limit - diverse.length))
    }

    return diverse
  },

  /**
   * Get current season based on month
   */
  getSeason(month: number): string {
    // Northern Hemisphere
    if (month >= 2 && month <= 4) return "spring" // Mar-May
    if (month >= 5 && month <= 7) return "summer" // Jun-Aug
    if (month >= 8 && month <= 10) return "fall" // Sep-Nov
    return "winter" // Dec-Feb
  },

  /**
   * Infer time of day from hour
   */
  inferTimeOfDay(hour: number): "breakfast" | "lunch" | "dinner" | "snack" {
    if (hour >= 6 && hour < 11) return "breakfast"
    if (hour >= 11 && hour < 16) return "lunch"
    if (hour >= 16 && hour < 22) return "dinner"
    return "snack"
  },

  /**
   * Get user's completed recipes with completion dates
   */
  async getUserCompletedRecipesWithDates(
    userId: string,
  ): Promise<CompletedRecipe[]> {
    const { data, error } = await supabase
      .from("user_completed_meals")
      .select("recipe_id, completed_at")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })

    if (error) {
      console.error("Error fetching completed recipes:", error)
      return []
    }

    return data || []
  },

  /**
   * Get user's completed recipes (legacy method for compatibility)
   */
  async getUserCompletedRecipes(userId: string): Promise<string[]> {
    const recipes = await this.getUserCompletedRecipesWithDates(userId)
    return recipes.map((r) => r.recipe_id)
  },

  /**
   * Track user interaction with recommended recipe
   */
  async trackRecommendationInteraction(
    userId: string,
    recipeId: string,
    interactionType: "view" | "like" | "complete" | "skip",
  ): Promise<void> {
    // Get recipe tags
    const recipeTags = await tagService.getRecipeTags(recipeId)

    // Update user preferences for each tag
    const isPositive =
      interactionType === "like" || interactionType === "complete"

    for (const tag of recipeTags) {
      await tagService.updateUserTagPreference(userId, tag.id, isPositive)
    }

    // Clear user's cache to reflect updated preferences
    this.clearUserCache(userId)

    console.log(
      `📝 Tracked ${interactionType} interaction for recipe ${recipeId}`,
    )
  },

  /**
   * Get "Quick & Easy" filtered recommendations
   */
  async getQuickAndEasyRecommendations(
    userId: string,
    limit: number = 10,
  ): Promise<ScoredRecipe[]> {
    const recommendations = await this.getPersonalizedRecommendations(
      {
        userId,
        maxPrepTime: 30,
      },
      limit * 2, // Get more to filter from
    )

    // Filter for recipes with <= 10 ingredients
    return recommendations
      .filter((recipe) => recipe.ingredients.length <= 10)
      .slice(0, limit)
  },
}
