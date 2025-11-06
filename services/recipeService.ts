import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { userService } from './userService'
import { activityService } from './activityService'
import { calorieService } from './calorieService'
import { streakService } from './streakService'
import { badgeService } from './badgeService'

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
  }>
  isFavorite?: boolean
  hasAllIngredients?: boolean
  matchPercentage?: number
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

  // Get recipe recommendations based on user's available ingredients
  async getRecommendations(userId: string, limit: number = 10): Promise<RecipeWithDetails[]> {
    // Get user's available ingredients
    const { data: userIngredients, error: ingredientsError } = await supabase
      .from('user_ingredients')
      .select('ingredient_id, ingredients(name)')
      .eq('user_id', userId)
      .eq('in_stock', true)

    if (ingredientsError) {
      console.error('Error fetching user ingredients:', ingredientsError)
      return []
    }

    const availableIngredientNames = userIngredients.map((ui: any) => ui.ingredients.name)

    // Get all recipes
    const allRecipes = await this.getRecipes({ userId })

    // Calculate match percentage for each recipe
    const recipesWithMatches = allRecipes.map(recipe => {
      const recipeIngredientNames = recipe.ingredients.map(ing => ing.name)
      const matchingIngredients = recipeIngredientNames.filter(name => 
        availableIngredientNames.includes(name)
      )
      const matchPercentage = (matchingIngredients.length / recipeIngredientNames.length) * 100

      return {
        ...recipe,
        matchPercentage,
        hasAllIngredients: matchPercentage === 100,
      }
    })

    // Sort by match percentage and return top recommendations
    return recipesWithMatches
      .filter(recipe => recipe.matchPercentage >= 50) // At least 50% match
      .sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0))
      .slice(0, limit)
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

  // Mark recipe as completed (allows multiple completions per day, but only first counts toward daily goals)
  async completeRecipe(userId: string, recipeId: string, awardPoints: boolean = true): Promise<boolean> {
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
      return false
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
      return false
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

    // Update user experience and level only if points awarded
    if (shouldAwardPoints && pointsToAward > 0) {
      const updatedProfile = await userService.updateExperience(userId, pointsToAward)

      if (!updatedProfile) {
        console.error(' recipeService.completeRecipe: Error updating user XP')
        return false
      }

      console.log(' recipeService.completeRecipe: XP updated successfully!', {
        newXP: updatedProfile.experience,
        newLevel: updatedProfile.level,
        totalPoints: updatedProfile.total_points
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
    } else {
      console.log(' recipeService.completeRecipe: No points awarded (already completed today or points disabled)')
    }

    return true
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
    // Get user favorites
    const { data: favorites } = await supabase
      .from('user_favorites')
      .select('recipe_id')
      .eq('user_id', userId)

    const favoriteIds = new Set(favorites?.map((f: any) => f.recipe_id) || [])

    // Get user's available ingredients
    const { data: userIngredients } = await supabase
      .from('user_ingredients')
      .select('ingredient_id, ingredients(name)')
      .eq('user_id', userId)
      .eq('in_stock', true)

    const availableIngredientNames = new Set(
      userIngredients?.map((ui: any) => ui.ingredients.name) || []
    )

    return recipes.map(recipe => ({
      ...recipe,
      isFavorite: favoriteIds.has(recipe.id),
      hasAllIngredients: recipe.ingredients.every(ing => 
        availableIngredientNames.has(ing.name)
      ),
    }))
  },
}