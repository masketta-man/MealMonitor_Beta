import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
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

  // Mark recipe as completed (once per day per recipe)
  async completeRecipe(userId: string, recipeId: string): Promise<boolean> {
    console.log(' recipeService.completeRecipe: Starting...', { userId, recipeId })
    
    // Check if completed today
    const today = new Date().toISOString().split('T')[0] // Get YYYY-MM-DD format
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    
    const { data: recentCompletion } = await supabase
      .from('user_completed_meals')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('recipe_id', recipeId)
      .gte('completed_at', `${today}T00:00:00.000Z`)
      .lt('completed_at', `${tomorrowStr}T00:00:00.000Z`)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (recentCompletion && 'completed_at' in recentCompletion && recentCompletion.completed_at) {
      console.log(' recipeService.completeRecipe: Recipe already completed today')
      return false
    }

    // Get recipe points
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('points')
      .eq('id', recipeId)
      .single()

    if (recipeError || !recipe) {
      console.error(' recipeService.completeRecipe: Error fetching recipe:', recipeError)
      return false
    }

    console.log('📊 recipeService.completeRecipe: Recipe points:', (recipe as any).points)

    // Add to completed meals
    const { error: insertError } = await supabase
      .from('user_completed_meals')
      .insert({
        user_id: userId,
        recipe_id: recipeId,
        points_earned: (recipe as any).points,
      } as any)

    if (insertError) {
      console.error(' recipeService.completeRecipe: Error inserting completion:', insertError)
      return false
    }

    console.log(' recipeService.completeRecipe: Completion recorded, updating XP...')

    // Update user experience and level
    const updatedProfile = await userService.updateExperience(userId, (recipe as any).points)
    
    if (!updatedProfile) {
      console.error(' recipeService.completeRecipe: Error updating user XP')
      return false
    }

    console.log(' recipeService.completeRecipe: XP updated successfully!', {
      newXP: updatedProfile.experience,
      newLevel: updatedProfile.level,
      totalPoints: updatedProfile.total_points
    })

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

  // Check if a recipe was completed within a date range
  async checkCompletion(userId: string, recipeId: string, startDate: string, endDate: string) {
    return await supabase
      .from('user_completed_meals')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('recipe_id', recipeId)
      .gte('completed_at', `${startDate}T00:00:00.000Z`)
      .lt('completed_at', `${endDate}T00:00:00.000Z`)
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