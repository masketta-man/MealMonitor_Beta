import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { activityService } from './activityService'
import { badgeService } from './badgeService'
import { calorieService } from './calorieService'
import { recommendationService } from './recommendationService'
import { settingsService } from './settingsService'
import { streakService } from './streakService'
import { tagService } from './tagService'
import { userService } from './userService'

type Recipe = Database['public']['Tables']['recipes']['Row']
type RecipeIngredient = Database['public']['Tables']['recipe_ingredients']['Row']
type RecipeInstruction = Database['public']['Tables']['recipe_instructions']['Row']
type RecipeTag = Database['public']['Tables']['recipe_tags']['Row']
type Ingredient = Database['public']['Tables']['ingredients']['Row']

export interface RecipeWithDetails extends Recipe {
  ingredients: Array<{
    id: string
    name: string
    amount: string
    category: string
  }>
  instructions: Array<{
    step_number: number
    instruction: string
    timer_minutes: number | null
  }>
  tags: Array<{
    tag: string
    tag_type: string
    id?: string
    base_weight?: number
    relevance_weight?: number
    popularity_score?: number
    category?: string
  }>
  isFavorite?: boolean
  hasAllIngredients?: boolean
  matchPercentage?: number
  recommendationScore?: number
  scoringBreakdown?: {
    tagMatch: number
    ingredientMatch: number
    calorieAlignment: number
    timeRelevance: number
    userPreference: number
    novelty: number
    popularity: number
  }
}

export const recipeService = {
  // Get all recipes with details
  async getRecipes(filters?: {
    mealType?: string
    difficulty?: string
    cuisineType?: string
    tags?: string[]
    userId?: string
  }): Promise<RecipeWithDetails[]> {
    let query = supabase
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
        recipe_tags (
          tag,
          tag_type
        )
      `)

    // Apply filters
    if (filters?.mealType && filters.mealType !== 'All') {
      query = query.eq('meal_type', filters.mealType)
    }
    if (filters?.difficulty && filters.difficulty !== 'All') {
      query = query.eq('difficulty', filters.difficulty)
    }
    if (filters?.cuisineType) {
      query = query.eq('cuisine_type', filters.cuisineType)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching recipes:', error)
      return []
    }

    // Transform the data
    const recipes: RecipeWithDetails[] = data.map((recipe: any) => ({
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
      tags: recipe.recipe_tags.map((tag: any) => ({
        tag: tag.tag,
        tag_type: tag.tag_type,
      })),
    }))

    // If userId provided, check favorites and ingredient availability
    if (filters?.userId) {
      return this.enrichRecipesWithUserData(recipes, filters.userId)
    }

    return recipes
  },

  // Get single recipe with details
  async getRecipe(recipeId: string, userId?: string): Promise<RecipeWithDetails | null> {
    const { data, error } = await supabase
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
        recipe_tags (
          tag,
          tag_type
        )
      `)
      .eq('id', recipeId)
      .single()

    if (error) {
      console.error('Error fetching recipe:', error)
      return null
    }

    const recipe: RecipeWithDetails = {
      ...(data as any),
      ingredients: (data as any).recipe_ingredients.map((ri: any) => ({
        id: ri.ingredients.id,
        name: ri.ingredients.name,
        amount: ri.amount,
        category: ri.ingredients.category,
      })),
      instructions: (data as any).recipe_instructions
        .sort((a: any, b: any) => a.step_number - b.step_number)
        .map((inst: any) => ({
          step_number: inst.step_number,
          instruction: inst.instruction,
          timer_minutes: inst.timer_minutes,
        })),
      tags: (data as any).recipe_tags.map((tag: any) => ({
        tag: tag.tag,
        tag_type: tag.tag_type,
      })),
    }

    // If userId provided, check if it's a favorite and ingredient availability
    if (userId) {
      const [enrichedRecipes] = await this.enrichRecipesWithUserData([recipe], userId)
      return enrichedRecipes
    }

    return recipe
  },

  // Get recipe recommendations based on user's available ingredients, preferences, and goals
  async getRecommendations(userId: string, limit: number = 10): Promise<RecipeWithDetails[]> {
    // Get user data in parallel for performance
    const [userIngredients, userProfile, userSettings, todaysLog] = await Promise.all([
      supabase
        .from('user_ingredients')
        .select('ingredient_id, ingredients(name)')
        .eq('user_id', userId)
        .eq('in_stock', true),
      userService.getProfile(userId),
      settingsService.getOrCreateSettings(userId),
      calorieService.getTodaysLog(userId)
    ])

    if (userIngredients.error) {
      console.error('Error fetching user ingredients:', userIngredients.error)
      return []
    }

    const availableIngredientNames = (userIngredients.data || []).map((ui: any) => ui.ingredients.name)

    // Get all recipes
    const allRecipes = await this.getRecipes({ userId })

    // Determine time-based meal type preference
    const currentHour = new Date().getHours()
    let preferredMealType = 'Snack'
    if (currentHour >= 6 && currentHour < 11) preferredMealType = 'Breakfast'
    else if (currentHour >= 11 && currentHour < 16) preferredMealType = 'Lunch'
    else if (currentHour >= 16 && currentHour < 22) preferredMealType = 'Dinner'

    // Calculate remaining calories for the day
    const calorieGoal = todaysLog?.calorie_goal || userSettings?.daily_calorie_target || 2000
    const currentCalories = todaysLog?.total_calories || 0
    const remainingCalories = calorieGoal - currentCalories

    // Get dietary preferences and restrictions
    const dietaryPreferences = userProfile?.dietary_preferences || []
    const foodRestrictions = userSettings?.dietary_restrictions || []

    // Calculate smart scores for each recipe
    const recipesWithScores = allRecipes.map(recipe => {
      let score = 0
      
      // 1. Ingredient match scoring (0-50 points)
      const recipeIngredientNames = recipe.ingredients.map(ing => ing.name)
      const matchingIngredients = recipeIngredientNames.filter(name => 
        availableIngredientNames.includes(name)
      )
      const matchPercentage = (matchingIngredients.length / recipeIngredientNames.length) * 100
      score += matchPercentage * 0.5 // Max 50 points

      // 2. Time-based meal type bonus (0-20 points)
      if (recipe.meal_type === preferredMealType) {
        score += 20
      }

      // 3. Calorie alignment scoring (0-20 points)
      const recipeCalories = recipe.calories || 0
      if (recipeCalories > 0 && remainingCalories > 0) {
        // Ideal if recipe is 25-40% of remaining calories
        const calorieRatio = recipeCalories / remainingCalories
        if (calorieRatio >= 0.25 && calorieRatio <= 0.4) {
          score += 20
        } else if (calorieRatio > 0.4 && calorieRatio <= 0.6) {
          score += 10
        } else if (recipeCalories <= remainingCalories) {
          score += 5
        }
      }

      // 4. Dietary preference matching (0-10 points)
      const recipeTags = recipe.tags.map(t => t.tag.toLowerCase())
      const matchesDietaryPrefs = dietaryPreferences.some((pref: string) =>
        recipeTags.includes(pref.toLowerCase())
      )
      if (matchesDietaryPrefs) {
        score += 10
      }

      // Filter out recipes with food restrictions
      const hasRestriction = foodRestrictions.some((restriction: string) => {
        const restrictionLower = restriction.toLowerCase()
        return recipeTags.some(tag => 
          tag.includes(restrictionLower) || 
          recipe.title.toLowerCase().includes(restrictionLower)
        )
      })

      return {
        ...recipe,
        matchPercentage,
        hasAllIngredients: matchPercentage === 100,
        score,
        hasRestriction
      }
    })

    // Filter and sort recipes
    const filteredRecipes = recipesWithScores
      .filter(recipe => !recipe.hasRestriction) // Exclude recipes with restrictions
      .filter(recipe => recipe.matchPercentage >= 30) // Lower threshold for more variety
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    console.log('🍽️ Meal Recommendations:', {
      totalRecipes: allRecipes.length,
      filteredCount: filteredRecipes.length,
      preferredMealType,
      remainingCalories,
      dietaryPreferences,
      topScores: filteredRecipes.slice(0, 3).map(r => ({ title: r.title, score: r.score, match: r.matchPercentage }))
    })

    return filteredRecipes
  },

  // Toggle favorite recipe
  async toggleFavorite(userId: string, recipeId: string): Promise<boolean> {
    // Check if already favorited
    const { data: existing } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('recipe_id', recipeId)
      .single()

    if (existing) {
      // Remove from favorites
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)

      if (error) {
        console.error('Error removing favorite:', error)
        return false
      }
      return false // Not favorited anymore
    } else {
      // Add to favorites
      const { error } = await supabase
        .from('user_favorites')
        .insert({ user_id: userId, recipe_id: recipeId } as any)

      if (error) {
        console.error('Error adding favorite:', error)
        return false
      }
      return true // Now favorited
    }
  },

  // Complete a recipe and award points/XP
  async completeRecipe(userId: string, recipeId: string, awardPoints: boolean = true): Promise<{ success: boolean; leveledUp: boolean; newLevel?: number; oldLevel?: number }> {
    console.log(' recipeService.completeRecipe: Starting...', { userId, recipeId, awardPoints })

    // Get start and end of today in user's local timezone
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    console.log(' recipeService.completeRecipe: Date range check:', {
      now: now.toISOString(),
      todayStart: todayStart.toISOString(),
      todayEnd: todayEnd.toISOString()
    })

    // Check if completed today
    const { data: todayCompletions, error: checkError } = await supabase
      .from('user_completed_meals')
      .select('id, completed_at, points_earned')
      .eq('user_id', userId)
      .eq('recipe_id', recipeId)
      .gte('completed_at', todayStart.toISOString())
      .lte('completed_at', todayEnd.toISOString())
      .order('completed_at', { ascending: false })

    if (checkError) {
      console.error(' recipeService.completeRecipe: Error checking completions:', checkError)
    }

    const completedToday = todayCompletions && todayCompletions.length > 0
    console.log(' recipeService.completeRecipe: Today completions:', {
      count: todayCompletions?.length || 0,
      completedToday
    })

    // Get recipe details
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('points, title, calories, meal_type')
      .eq('id', recipeId)
      .single()

    if (recipeError || !recipe) {
      console.error(' recipeService.completeRecipe: Error fetching recipe:', recipeError)
      return { success: false, leveledUp: false }
    }

    const recipePoints = (recipe as any).points
    const recipeTitle = (recipe as any).title
    const recipeCalories = (recipe as any).calories || 0
    const recipeMealType = (recipe as any).meal_type || 'Snack'
    console.log('📊 recipeService.completeRecipe: Recipe details:', { title: recipeTitle, points: recipePoints, calories: recipeCalories, mealType: recipeMealType })

    // Determine if this completion should award points
    const shouldAwardPoints = awardPoints && !completedToday
    const pointsToAward = shouldAwardPoints ? recipePoints : 0

    // Add to completed meals
    const { error: insertError } = await supabase
      .from('user_completed_meals')
      .insert({
        user_id: userId,
        recipe_id: recipeId,
        points_earned: pointsToAward,
      } as any)

    if (insertError) {
      console.error(' recipeService.completeRecipe: Error inserting completion:', insertError)
      return { success: false, leveledUp: false }
    }

    console.log(' recipeService.completeRecipe: Completion recorded', {
      pointsAwarded: pointsToAward,
      isFirstCompletionToday: !completedToday
    })

    // Log meal calories if recipe has calorie data
    if (recipeCalories > 0) {
      const mealTypeForLog = recipeMealType.toLowerCase()
      await calorieService.logMeal(userId, recipeTitle, recipeCalories, mealTypeForLog, recipeId)
      console.log('📊 Logged calories for meal:', recipeTitle, recipeCalories, mealTypeForLog)
    }

    // Update streak for completing a meal
    if (!completedToday) {
      const streakInfo = await streakService.checkAndUpdateStreak(userId)
      console.log('🔥 Streak updated:', streakInfo)
    }

    // Get current level before update
    const profileBefore = await userService.getProfile(userId)
    const oldLevel = profileBefore?.level || 1

    // Update user experience and level only if points awarded
    if (shouldAwardPoints && pointsToAward > 0) {
      const updatedProfile = await userService.updateExperience(userId, pointsToAward)

      if (!updatedProfile) {
        console.error(' recipeService.completeRecipe: Error updating user XP')
        return { success: false, leveledUp: false }
      }

      const newLevel = updatedProfile.level || 1
      const leveledUp = newLevel > oldLevel

      console.log(' recipeService.completeRecipe: XP updated successfully!', {
        newXP: updatedProfile.experience,
        newLevel: updatedProfile.level,
        totalPoints: updatedProfile.total_points,
        leveledUp,
        oldLevel,
      })

      // Log activity to user's feed (only on first completion today)
      await activityService.logActivity(
        userId,
        'recipe_completed',
        `Completed ${recipeTitle}`,
        `Cooked a delicious meal and earned ${pointsToAward} points!`,
        pointsToAward,
        { recipe_id: recipeId }
      )

      // Check and award badges
      const newBadges = await badgeService.checkAndAwardBadges(userId)
      if (newBadges.length > 0) {
        console.log(`🏆 User ${userId} earned ${newBadges.length} new badge(s) after completing recipe!`)
      }

      return { success: true, leveledUp, newLevel, oldLevel }
    } else {
      console.log(' recipeService.completeRecipe: No points awarded (already completed today or points disabled)')
    }

    return { success: true, leveledUp: false }
  },

  // Get user's favorite recipes
  async getFavoriteRecipes(userId: string): Promise<RecipeWithDetails[]> {
    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        recipes (
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
          recipe_tags (
            tag,
            tag_type
          )
        )
      `)
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching favorite recipes:', error)
      return []
    }

    return data.map((fav: any) => ({
      ...fav.recipes,
      ingredients: fav.recipes.recipe_ingredients.map((ri: any) => ({
        id: ri.ingredients.id,
        name: ri.ingredients.name,
        amount: ri.amount,
        category: ri.ingredients.category,
      })),
      instructions: fav.recipes.recipe_instructions
        .sort((a: any, b: any) => a.step_number - b.step_number)
        .map((inst: any) => ({
          step_number: inst.step_number,
          instruction: inst.instruction,
          timer_minutes: inst.timer_minutes,
        })),
      tags: fav.recipes.recipe_tags.map((tag: any) => ({
        tag: tag.tag,
        tag_type: tag.tag_type,
      })),
      isFavorite: true,
    }))
  },

  // Check if a recipe was completed today (in user's local timezone)
  async checkCompletion(userId: string, recipeId: string): Promise<{ data: any; error: any }> {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    const { data, error } = await supabase
      .from('user_completed_meals')
      .select('completed_at, points_earned')
      .eq('user_id', userId)
      .eq('recipe_id', recipeId)
      .gte('completed_at', todayStart.toISOString())
      .lte('completed_at', todayEnd.toISOString())
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    return { data, error }
  },

  // Check if a recipe was completed within a custom date range (for legacy support)
  async checkCompletionInRange(userId: string, recipeId: string, startDate: Date, endDate: Date) {
    return await supabase
      .from('user_completed_meals')
      .select('completed_at, points_earned')
      .eq('user_id', userId)
      .eq('recipe_id', recipeId)
      .gte('completed_at', startDate.toISOString())
      .lt('completed_at', endDate.toISOString())
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle()
  },

  // Helper method to enrich recipes with user-specific data
  async enrichRecipesWithUserData(recipes: RecipeWithDetails[], userId: string): Promise<RecipeWithDetails[]> {
    // Get user data in parallel
    const [favoritesData, userIngredientsData, userSettings] = await Promise.all([
      supabase.from('user_favorites').select('recipe_id').eq('user_id', userId),
      supabase.from('user_ingredients').select('ingredient_id, ingredients(name)').eq('user_id', userId).eq('in_stock', true),
      settingsService.getUserSettings(userId)
    ])

    const favoriteIds = new Set(favoritesData.data?.map((f: any) => f.recipe_id) || [])

    // Normalize ingredient names for case-insensitive matching
    const normalizeIngredientName = (name: string) => 
      name.toLowerCase().trim().replace(/\s+/g, ' ')

    const availableIngredientNames = new Set(
      userIngredientsData.data?.map((ui: any) => normalizeIngredientName(ui.ingredients.name)) || []
    )

    // Only check ingredient availability if user has ingredients tracked
    const hasIngredientsTracked = availableIngredientNames.size > 0

    // Get user's dietary restrictions
    const userRestrictions = userSettings?.dietary_restrictions || []

    // Filter recipes based on dietary restrictions
    const filteredRecipes = recipes.filter(recipe => {
      if (userRestrictions.length === 0) return true

      const recipeTagNames = recipe.tags.map((t: any) => t.tag.toLowerCase())

      // Check each restriction
      for (const restriction of userRestrictions) {
        const restrictionLower = restriction.toLowerCase()

        // For dietary preferences, recipe MUST have the tag
        if (['vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo', 'low-carb', 'mediterranean'].includes(restrictionLower)) {
          if (!recipeTagNames.includes(restrictionLower)) {
            return false
          }
        }

        // For food restrictions, recipe MUST have the tag (or not have the allergen)
        if (['gluten-free', 'dairy-free', 'nut-free', 'soy-free', 'egg-free', 'shellfish-free', 'halal', 'kosher'].includes(restrictionLower)) {
          if (!recipeTagNames.includes(restrictionLower)) {
            return false
          }
        }
      }

      return true
    })

    return filteredRecipes.map(recipe => ({
      ...recipe,
      isFavorite: favoriteIds.has(recipe.id),
      // Only show "missing ingredients" if user is tracking ingredients
      hasAllIngredients: !hasIngredientsTracked ? true : recipe.ingredients.every(ing =>
        availableIngredientNames.has(normalizeIngredientName(ing.name))
      ),
    }))
  },

  // Get enhanced personalized recommendations using the new tagging system
  async getEnhancedRecommendations(
    userId: string,
    options?: {
      limit?: number
      maxPrepTime?: number
      preferredTags?: string[]
      excludeTags?: string[]
    }
  ): Promise<RecipeWithDetails[]> {
    const { limit = 10, maxPrepTime, preferredTags = [], excludeTags = [] } = options || {}

    // Get user's available ingredients
    const { data: userIngredients } = await supabase
      .from('user_ingredients')
      .select('ingredient_id, ingredients(name)')
      .eq('user_id', userId)
      .eq('in_stock', true)

    const availableIngredients = userIngredients?.map((ui: any) => ui.ingredients.name) || []

    // Get today's log to calculate calorie target
    const todaysLog = await calorieService.getTodaysLog(userId)
    const settings = await settingsService.getOrCreateSettings(userId)
    const calorieGoal = todaysLog?.calorie_goal || settings?.daily_calorie_target || 2000
    const currentCalories = todaysLog?.total_calories || 0
    const remainingCalories = calorieGoal - currentCalories

    // Call enhanced recommendation service
    const recommendations = await recommendationService.getPersonalizedRecommendations(
      {
        userId,
        availableIngredients,
        maxPrepTime,
        calorieTarget: remainingCalories,
        preferredTags,
        excludeTags,
      },
      limit
    )

    return recommendations
  },

  // Track user interaction with recipe for learning preferences
  async trackRecipeInteraction(
    userId: string,
    recipeId: string,
    interactionType: 'view' | 'like' | 'complete' | 'skip'
  ): Promise<void> {
    await recommendationService.trackRecommendationInteraction(userId, recipeId, interactionType)
  },

  // Get recipe tags using enhanced tagging system
  async getRecipeEnhancedTags(recipeId: string) {
    return tagService.getRecipeTags(recipeId)
  },

  // Get user's ingredients from pantry
  async getUserIngredients(userId: string): Promise<Set<string>> {
    const { data: userIngredients } = await supabase
      .from('user_ingredients')
      .select('ingredient_id, ingredients(name)')
      .eq('user_id', userId)
      .eq('in_stock', true)

    // Normalize ingredient names for matching
    const normalizeIngredientName = (name: string) => 
      name.toLowerCase().trim().replace(/\s+/g, ' ')

    return new Set(
      userIngredients?.map((ui: any) => normalizeIngredientName(ui.ingredients.name)) || []
    )
  },
}