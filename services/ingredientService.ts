import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type Ingredient = Database['public']['Tables']['ingredients']['Row']
type UserIngredient = Database['public']['Tables']['user_ingredients']['Row']
type UserIngredientInsert = Database['public']['Tables']['user_ingredients']['Insert']
type UserIngredientUpdate = Database['public']['Tables']['user_ingredients']['Update']

export interface UserIngredientWithDetails extends UserIngredient {
  ingredient: Ingredient
}

export const ingredientService = {
  // Get all available ingredients
  async getAllIngredients(): Promise<Ingredient[]> {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching ingredients:', error)
      return []
    }

    return data
  },

  // Get user's ingredients
  async getUserIngredients(userId: string): Promise<UserIngredientWithDetails[]> {
    const { data, error } = await supabase
      .from('user_ingredients')
      .select(`
        *,
        ingredients (
          id,
          name,
          category
        )
      `)
      .eq('user_id', userId)
      .order('ingredients(name)')

    if (error) {
      console.error('Error fetching user ingredients:', error)
      return []
    }

    return data.map((ui: any) => ({
      ...ui,
      ingredient: ui.ingredients,
    }))
  },

  // Add ingredient to user's pantry
  async addUserIngredient(
    userId: string,
    ingredientId: string,
    quantity?: string,
    expiryDate?: string
  ): Promise<UserIngredient | null> {
    const insertData: UserIngredientInsert = {
      user_id: userId,
      ingredient_id: ingredientId,
      quantity: quantity || null,
      expiry_date: expiryDate || null,
      in_stock: true,
    }

    const { data, error } = await supabase
      .from('user_ingredients')
      .insert(insertData)
      .select()
      .single<UserIngredient>()

    if (error) {
      console.error('Error adding user ingredient:', error)
      return null
    }

    return data
  },

  // Update user ingredient
  async updateUserIngredient(
    userIngredientId: string,
    updates: {
      quantity?: string
      expiryDate?: string
      inStock?: boolean
    }
  ): Promise<UserIngredient | null> {
    const updateData: Partial<UserIngredientUpdate> = {}

    if (updates.quantity !== undefined) updateData.quantity = updates.quantity
    if (updates.expiryDate !== undefined) updateData.expiry_date = updates.expiryDate
    if (updates.inStock !== undefined) updateData.in_stock = updates.inStock

    const { data, error } = await supabase
      .from('user_ingredients')
      .update(updateData as UserIngredientUpdate)
      .eq('id', userIngredientId)
      .select()
      .single<UserIngredient>()

    if (error) {
      console.error('Error updating user ingredient:', error)
      return null
    }

    return data
  },

  // Toggle ingredient stock status
  async toggleIngredientStock(userId: string, ingredientId: string): Promise<boolean> {
    // First check if the user ingredient exists
    const { data: existing } = await supabase
      .from('user_ingredients')
      .select('*')
      .eq('user_id', userId)
      .eq('ingredient_id', ingredientId)
      .single<UserIngredient>()

    if (existing) {
      // Update existing ingredient
      const newStockState = !existing.in_stock
      const { data, error } = await supabase
        .from('user_ingredients')
        .update({ in_stock: newStockState } as UserIngredientUpdate)
        .eq('id', existing.id)
        .select()
        .single<UserIngredient>()

      if (error) {
        console.error('Error toggling ingredient stock:', error)
        return existing.in_stock // Return original state on error
      }
      return data?.in_stock ?? existing.in_stock
    } else {
      // Add new ingredient as in stock
      const insertData: UserIngredientInsert = {
        user_id: userId,
        ingredient_id: ingredientId,
        in_stock: true,
        quantity: null,
        expiry_date: null
      }
      const { error } = await supabase
        .from('user_ingredients')
        .insert(insertData)

      if (error) {
        console.error('Error adding ingredient:', error)
        return false
      }
      return true
    }
  },

  // Remove ingredient from user's pantry
  async removeUserIngredient(userIngredientId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_ingredients')
      .delete()
      .eq('id', userIngredientId)

    if (error) {
      console.error('Error removing user ingredient:', error)
      return false
    }

    return true
  },

  // Get ingredients by category
  async getIngredientsByCategory(category: string): Promise<Ingredient[]> {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .eq('category', category)
      .order('name')

    if (error) {
      console.error('Error fetching ingredients by category:', error)
      return []
    }

    return data
  },

  // Search ingredients
  async searchIngredients(query: string): Promise<Ingredient[]> {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(20)

    if (error) {
      console.error('Error searching ingredients:', error)
      return []
    }

    return data
  },

  // Get user's in-stock ingredients
  async getUserInStockIngredients(userId: string): Promise<UserIngredientWithDetails[]> {
    const { data, error } = await supabase
      .from('user_ingredients')
      .select(`
        *,
        ingredients (
          id,
          name,
          category
        )
      `)
      .eq('user_id', userId)
      .eq('in_stock', true)
      .order('ingredients(name)')

    if (error) {
      console.error('Error fetching user in-stock ingredients:', error)
      return []
    }

    return data.map((ui: any) => ({
      ...ui,
      ingredient: ui.ingredients,
    }))
  },
}