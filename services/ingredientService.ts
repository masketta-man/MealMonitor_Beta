import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"

export type Ingredient = Database["public"]["Tables"]["ingredients"]["Row"]
type UserIngredient = Database["public"]["Tables"]["user_ingredients"]["Row"]
type UserIngredientInsert =
  Database["public"]["Tables"]["user_ingredients"]["Insert"]
type UserIngredientUpdate =
  Database["public"]["Tables"]["user_ingredients"]["Update"]

export interface UserIngredientWithDetails extends UserIngredient {
  ingredient: Ingredient
}

export interface StarterIngredientGroup {
  category: string
  ingredients: Ingredient[]
}

/**
 * How many ingredients to offer per category in the onboarding pantry step, and
 * the order the groups appear in. Weighted towards substantial ingredients:
 * proteins and vegetables are what a user pictures when asked what's in their
 * kitchen, whereas Pantry is mostly seasonings and oils, so it's capped and last.
 */
const STARTER_QUOTAS: Record<string, number> = {
  Protein: 8,
  Vegetables: 8,
  Grains: 6,
  Fruits: 5,
  Dairy: 4,
  Pantry: 6,
}

const STARTER_CATEGORY_ORDER = [
  "Protein",
  "Vegetables",
  "Grains",
  "Fruits",
  "Dairy",
  "Pantry",
]

const MAX_STARTER_QUOTA = Math.max(...Object.values(STARTER_QUOTAS))

export const ingredientService = {
  // Get all available ingredients
  async getAllIngredients(): Promise<Ingredient[]> {
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .order("name")

    if (error) {
      console.error("Error fetching ingredients:", error)
      return []
    }

    // Deduplicate ingredients by name (case-insensitive)
    const uniqueIngredientsMap = new Map<string, Ingredient>()

    for (const ingredient of data) {
      const normalizedName = ingredient.name.toLowerCase()

      // Keep first occurrence, or prefer properly capitalized names
      if (!uniqueIngredientsMap.has(normalizedName)) {
        uniqueIngredientsMap.set(normalizedName, ingredient)
      } else {
        const existing = uniqueIngredientsMap.get(normalizedName)!
        // Prefer ingredient with proper capitalization (first letter uppercase)
        const isProperCase =
          /^[A-Z]/.test(ingredient.name) &&
          ingredient.name ===
            ingredient.name.charAt(0).toUpperCase() +
              ingredient.name.slice(1).toLowerCase()
        const existingIsProperCase =
          /^[A-Z]/.test(existing.name) &&
          existing.name ===
            existing.name.charAt(0).toUpperCase() +
              existing.name.slice(1).toLowerCase()

        if (isProperCase && !existingIsProperCase) {
          uniqueIngredientsMap.set(normalizedName, ingredient)
        }
      }
    }

    return Array.from(uniqueIngredientsMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    )
  },

  // Get user's ingredients
  async getUserIngredients(
    userId: string,
  ): Promise<UserIngredientWithDetails[]> {
    const { data, error } = await supabase
      .from("user_ingredients")
      .select(
        `
        *,
        ingredients (
          id,
          name,
          category
        )
      `,
      )
      .eq("user_id", userId)
      .order("ingredients(name)")

    if (error) {
      console.error("Error fetching user ingredients:", error)
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
    expiryDate?: string,
  ): Promise<UserIngredient | null> {
    const insertData: UserIngredientInsert = {
      user_id: userId,
      ingredient_id: ingredientId,
      quantity: quantity || null,
      expiry_date: expiryDate || null,
      in_stock: true,
    }

    const { data, error } = await supabase
      .from("user_ingredients")
      .insert(insertData)
      .select()
      .single<UserIngredient>()

    if (error) {
      console.error("Error adding user ingredient:", error)
      return null
    }

    return data
  },

  /**
   * Ingredients that appear in the most recipes, most useful first.
   *
   * Backed by the `popular_ingredients` view so the list tracks the recipe
   * catalogue instead of being a hardcoded set of names that silently drifts.
   */
  async getStarterIngredients(): Promise<StarterIngredientGroup[]> {
    const { data, error } = await supabase
      .from("popular_ingredients")
      .select("id, name, category, recipe_count, category_rank")
      // Over-fetch relative to the quotas so there's room to drop duplicate names.
      .lte("category_rank", MAX_STARTER_QUOTA * 3)
      .order("category")
      .order("category_rank")

    if (error) {
      console.error("Error fetching starter ingredients:", error)
      return []
    }

    // The catalogue contains near-duplicate rows differing only by casing, so
    // collapse by name and keep the highest-ranked of each.
    const seenNames = new Set<string>()
    const byCategory = new Map<string, Ingredient[]>()

    for (const row of data ?? []) {
      if (!row.id || !row.name || !row.category) continue

      const nameKey = row.name.toLowerCase()
      if (seenNames.has(nameKey)) continue

      const quota = STARTER_QUOTAS[row.category]
      if (!quota) continue

      const bucket = byCategory.get(row.category) ?? []
      if (bucket.length >= quota) continue

      seenNames.add(nameKey)
      bucket.push({
        id: row.id,
        name: row.name,
        category: row.category,
        created_at: null,
      })
      byCategory.set(row.category, bucket)
    }

    return STARTER_CATEGORY_ORDER.filter((category) =>
      byCategory.has(category),
    ).map((category) => ({
      category,
      ingredients: byCategory.get(category) ?? [],
    }))
  },

  /**
   * Add several ingredients to a pantry in one round trip.
   *
   * Upserts on the (user_id, ingredient_id) unique constraint so re-running this
   * (e.g. a user repeating onboarding) is harmless rather than a conflict error.
   * Returns the number of rows written.
   */
  async addUserIngredients(
    userId: string,
    ingredientIds: string[],
  ): Promise<number> {
    if (ingredientIds.length === 0) return 0

    const rows: UserIngredientInsert[] = ingredientIds.map((ingredientId) => ({
      user_id: userId,
      ingredient_id: ingredientId,
      quantity: null,
      expiry_date: null,
      in_stock: true,
    }))

    const { data, error } = await supabase
      .from("user_ingredients")
      .upsert(rows, { onConflict: "user_id,ingredient_id" })
      .select("id")

    if (error) {
      console.error("Error adding user ingredients:", error)
      return 0
    }

    return data?.length ?? 0
  },

  // Update user ingredient
  async updateUserIngredient(
    userIngredientId: string,
    updates: {
      quantity?: string
      expiryDate?: string
    },
  ): Promise<UserIngredient | null> {
    const updateData: Partial<UserIngredientUpdate> = {}

    if (updates.quantity !== undefined) updateData.quantity = updates.quantity
    if (updates.expiryDate !== undefined)
      updateData.expiry_date = updates.expiryDate

    const { data, error } = await supabase
      .from("user_ingredients")
      .update(updateData as UserIngredientUpdate)
      .eq("id", userIngredientId)
      .select()
      .single<UserIngredient>()

    if (error) {
      console.error("Error updating user ingredient:", error)
      return null
    }

    return data
  },

  // Remove ingredient from user's pantry
  async removeUserIngredient(userIngredientId: string): Promise<boolean> {
    const { error } = await supabase
      .from("user_ingredients")
      .delete()
      .eq("id", userIngredientId)

    if (error) {
      console.error("Error removing user ingredient:", error)
      return false
    }

    return true
  },

  // Get ingredients by category
  async getIngredientsByCategory(category: string): Promise<Ingredient[]> {
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .eq("category", category)
      .order("name")

    if (error) {
      console.error("Error fetching ingredients by category:", error)
      return []
    }

    return data
  },

  // Search ingredients
  async searchIngredients(query: string): Promise<Ingredient[]> {
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .ilike("name", `%${query}%`)
      .order("name")
      .limit(20)

    if (error) {
      console.error("Error searching ingredients:", error)
      return []
    }

    return data
  },

  // Get the user's pantry ingredients (everything in the pantry is treated as
  // available; the in-stock/out-of-stock concept was removed).
  async getUserInStockIngredients(
    userId: string,
  ): Promise<UserIngredientWithDetails[]> {
    const { data, error } = await supabase
      .from("user_ingredients")
      .select(
        `
        *,
        ingredients (
          id,
          name,
          category
        )
      `,
      )
      .eq("user_id", userId)
      .order("ingredients(name)")

    if (error) {
      console.error("Error fetching user pantry ingredients:", error)
      return []
    }

    return data.map((ui: any) => ({
      ...ui,
      ingredient: ui.ingredients,
    }))
  },
}
