import { supabase } from '@/lib/supabase'
import { tagService } from './tagService'
import { userService } from './userService'
import { calorieService } from './calorieService'
import { settingsService } from './settingsService'
import { RecipeWithDetails } from './recipeService'

interface RecommendationContext {
  userId: string
  availableIngredients?: string[]
  timeOfDay?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  maxPrepTime?: number
  calorieTarget?: number
  excludeTags?: string[]
  preferredTags?: string[]
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
  }
}

export const recommendationService = {
  /**
   * Get personalized recipe recommendations using enhanced tagging system
   */
  async getPersonalizedRecommendations(
    context: RecommendationContext,
    limit: number = 10
  ): Promise<ScoredRecipe[]> {
    const {
      userId,
      availableIngredients = [],
      timeOfDay,
      maxPrepTime,
      calorieTarget,
      excludeTags = [],
      preferredTags = []
    } = context

    console.log('🎯 Generating personalized recommendations with context:', context)

    // 1. Load user data in parallel
    const [userProfile, userSettings, todaysLog, userTagPreferences, completedRecipes] =
      await Promise.all([
        userService.getProfile(userId),
        settingsService.getUserSettings(userId),
        calorieService.getTodaysLog(userId),
        tagService.getUserTagPreferences(userId),
        this.getUserCompletedRecipes(userId)
      ])

    // 2. Get all recipes with enhanced tag data
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select(`
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
      console.error('Error fetching recipes for recommendations:', error)
      return []
    }

    // 3. Calculate time-based preferences
    const currentHour = new Date().getHours()
    const inferredTimeOfDay = timeOfDay || this.inferTimeOfDay(currentHour)

    // 4. Calculate calorie context
    const remainingCalories = calorieTarget ||
      (todaysLog?.calorie_goal || userSettings?.daily_calorie_target || 2000) -
      (todaysLog?.total_calories || 0)

    // 5. Build user tag preference map for quick lookups
    const tagPreferenceMap = new Map(
      userTagPreferences.map(pref => [pref.tag_id, pref.preference_score])
    )

    // 6. Build completed recipes set
    const completedRecipeIds = new Set(completedRecipes)

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
          tag_type: mapping.tags.tag_categories?.name || 'other',
          id: mapping.tags.id,
          base_weight: mapping.tags.base_weight,
          relevance_weight: mapping.relevance_weight,
          popularity_score: mapping.tags.popularity_score
        }))
      }

      // Calculate scoring components
      const scoringBreakdown = {
        tagMatch: this.calculateTagMatchScore(
          recipeWithDetails.tags,
          userTagPreferences,
          tagPreferenceMap,
          preferredTags,
          excludeTags
        ),
        ingredientMatch: this.calculateIngredientMatchScore(
          recipeWithDetails.ingredients,
          availableIngredients
        ),
        calorieAlignment: this.calculateCalorieAlignmentScore(
          recipe.calories || 0,
          remainingCalories
        ),
        timeRelevance: this.calculateTimeRelevanceScore(
          recipe.meal_type,
          inferredTimeOfDay,
          recipe.prep_time,
          maxPrepTime
        ),
        userPreference: this.calculateUserPreferenceScore(
          userProfile,
          userSettings,
          recipeWithDetails.tags
        ),
        novelty: this.calculateNoveltyScore(
          recipe.id,
          completedRecipeIds
        ),
        popularity: this.calculatePopularityScore(
          recipeWithDetails.tags,
          recipe.nutrition_score || 0
        )
      }

      // Weighted total score (out of 100)
      const recommendationScore =
        (scoringBreakdown.tagMatch * 0.25) +          // 25% - Tag matching is most important
        (scoringBreakdown.ingredientMatch * 0.20) +   // 20% - Ingredient availability
        (scoringBreakdown.userPreference * 0.15) +    // 15% - User dietary preferences
        (scoringBreakdown.calorieAlignment * 0.15) +  // 15% - Calorie goals
        (scoringBreakdown.timeRelevance * 0.10) +     // 10% - Time of day relevance
        (scoringBreakdown.popularity * 0.10) +        // 10% - Tag popularity
        (scoringBreakdown.novelty * 0.05)             // 5% - Novelty bonus

      return {
        ...recipeWithDetails,
        recommendationScore,
        scoringBreakdown
      }
    })

    // 8. Filter recipes based on dietary restrictions and excluded tags
    const userRestrictions = userSettings?.dietary_restrictions || []
    
    const filteredRecipes = scoredRecipes.filter(recipe => {
      const recipeTagNames = recipe.tags.map((t: any) => t.tag.toLowerCase())
      const recipeTagIds = recipe.tags.map((t: any) => t.id)
      
      // Check dietary restrictions
      for (const restriction of userRestrictions) {
        const restrictionLower = restriction.toLowerCase()
        
        // For dietary preferences (vegetarian, vegan, etc.), recipe MUST have the tag
        if (['vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo', 'low-carb', 'mediterranean'].includes(restrictionLower)) {
          if (!recipeTagNames.includes(restrictionLower)) {
            return false
          }
        }
        
        // For food restrictions (gluten-free, dairy-free, etc.), recipe MUST have the tag
        if (['gluten-free', 'dairy-free', 'nut-free', 'soy-free', 'egg-free', 'shellfish-free', 'halal', 'kosher'].includes(restrictionLower)) {
          if (!recipeTagNames.includes(restrictionLower)) {
            return false
          }
        }
      }
      
      // Check excluded tags
      return !excludeTags.some(excludeTagId => recipeTagIds.includes(excludeTagId))
    })

    // 9. Sort by score and return top results
    const topRecommendations = filteredRecipes
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit)

    console.log('📊 Recommendation scores (top 5):',
      topRecommendations.slice(0, 5).map(r => ({
        title: r.title,
        score: r.recommendationScore.toFixed(2),
        breakdown: Object.entries(r.scoringBreakdown)
          .map(([key, val]) => `${key}: ${val.toFixed(1)}`)
          .join(', ')
      }))
    )

    return topRecommendations
  },

  /**
   * Calculate tag match score using enhanced tagging system
   */
  calculateTagMatchScore(
    recipeTags: any[],
    userTagPreferences: any[],
    tagPreferenceMap: Map<string, number>,
    preferredTags: string[],
    excludeTags: string[]
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
      const popularityBoost = Math.min((recipeTag.popularity_score || 0) / 10, 10)
      tagScore += popularityBoost

      // Weight the tag score
      score += tagScore * combinedWeight
      weightSum += combinedWeight
    }

    // Calculate weighted average (0-100 scale)
    return weightSum > 0 ? Math.max(0, Math.min(100, score / weightSum)) : 50
  },

  /**
   * Calculate ingredient match score
   */
  calculateIngredientMatchScore(
    recipeIngredients: any[],
    availableIngredients: string[]
  ): number {
    if (recipeIngredients.length === 0) return 0
    if (availableIngredients.length === 0) return 30 // Lower score but not zero

    const recipeIngredientNames = recipeIngredients.map(i => i.name.toLowerCase())
    const availableIngredientNames = availableIngredients.map(i => i.toLowerCase())

    const matchingCount = recipeIngredientNames.filter(name =>
      availableIngredientNames.includes(name)
    ).length

    const matchPercentage = (matchingCount / recipeIngredients.length) * 100

    // Full match gets 100, partial matches scale down
    return matchPercentage
  },

  /**
   * Calculate calorie alignment score
   */
  calculateCalorieAlignmentScore(recipeCalories: number, remainingCalories: number): number {
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
    maxPrepTime?: number
  ): number {
    let score = 50

    // Meal type alignment (0-50 points)
    if (recipeMealType.toLowerCase() === currentTimeOfDay.toLowerCase()) {
      score += 40
    } else if (
      (currentTimeOfDay === 'breakfast' && recipeMealType === 'Brunch') ||
      (currentTimeOfDay === 'lunch' && recipeMealType === 'Brunch')
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
    recipeTags: any[]
  ): number {
    let score = 50 // Neutral base

    const dietaryPreferences = userProfile?.dietary_preferences || []
    const foodRestrictions = userSettings?.dietary_restrictions || []
    const recipeTagNames = recipeTags.map(t => t.tag.toLowerCase())

    // Check dietary preferences match
    const matchedPreferences = dietaryPreferences.filter((pref: string) =>
      recipeTagNames.includes(pref.toLowerCase())
    )

    score += matchedPreferences.length * 15

    // Check food restrictions (heavy penalty)
    const hasRestriction = foodRestrictions.some((restriction: string) =>
      recipeTagNames.includes(restriction.toLowerCase())
    )

    if (hasRestriction) {
      return 0 // Recipe violates restrictions
    }

    return Math.min(100, score)
  },

  /**
   * Calculate novelty score (encourage trying new recipes)
   */
  calculateNoveltyScore(recipeId: string, completedRecipeIds: Set<string>): number {
    // Not completed: full novelty bonus
    if (!completedRecipeIds.has(recipeId)) return 100

    // Already completed: reduced score
    return 30
  },

  /**
   * Calculate popularity score from tags
   */
  calculatePopularityScore(recipeTags: any[], nutritionScore: number): number {
    if (recipeTags.length === 0) return 50

    // Average popularity of all tags
    const avgPopularity = recipeTags.reduce((sum, tag) =>
      sum + (tag.popularity_score || 0), 0
    ) / recipeTags.length

    // Combine tag popularity with nutrition score
    const tagScore = Math.min(100, avgPopularity)
    const nutritionContribution = Math.min(100, (nutritionScore || 0) * 10)

    return (tagScore * 0.7) + (nutritionContribution * 0.3)
  },

  /**
   * Infer time of day from hour
   */
  inferTimeOfDay(hour: number): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
    if (hour >= 6 && hour < 11) return 'breakfast'
    if (hour >= 11 && hour < 16) return 'lunch'
    if (hour >= 16 && hour < 22) return 'dinner'
    return 'snack'
  },

  /**
   * Get user's completed recipes
   */
  async getUserCompletedRecipes(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('user_completed_meals')
      .select('recipe_id')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching completed recipes:', error)
      return []
    }

    return data?.map(r => r.recipe_id) || []
  },

  /**
   * Track user interaction with recommended recipe
   */
  async trackRecommendationInteraction(
    userId: string,
    recipeId: string,
    interactionType: 'view' | 'like' | 'complete' | 'skip'
  ): Promise<void> {
    // Get recipe tags
    const recipeTags = await tagService.getRecipeTags(recipeId)

    // Update user preferences for each tag
    const isPositive = interactionType === 'like' || interactionType === 'complete'

    for (const tag of recipeTags) {
      await tagService.updateUserTagPreference(userId, tag.id, isPositive)
    }

    console.log(`📝 Tracked ${interactionType} interaction for recipe ${recipeId}`)
  }
}
