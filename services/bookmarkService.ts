import { supabase } from "@/lib/supabase"

export interface BookmarkCollection {
  id: string
  user_id: string
  name: string
  description: string | null
  icon: string
  color: string
  created_at: string
  updated_at: string
  bookmarkCount?: number
}

export interface Bookmark {
  id: string
  user_id: string
  recipe_id: string
  collection_id: string | null
  notes: string | null
  created_at: string
}

export const bookmarkService = {
  // Get all collections for a user
  async getCollections(userId: string): Promise<BookmarkCollection[]> {
    const { data, error } = await supabase
      .from("bookmark_collections")
      .select("*, user_bookmarks(count)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching bookmark collections:", error)
      return []
    }

    return (data || []).map((collection: any) => ({
      ...collection,
      bookmarkCount: collection.user_bookmarks?.[0]?.count || 0,
    }))
  },

  // Create a new collection
  async createCollection(
    userId: string,
    name: string,
    description?: string,
    icon: string = "bookmark",
    color: string = "#22c55e",
  ): Promise<BookmarkCollection | null> {
    const { data, error } = await supabase
      .from("bookmark_collections")
      .insert({
        user_id: userId,
        name,
        description,
        icon,
        color,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating bookmark collection:", error)
      return null
    }

    return data
  },

  // Get bookmarks in a collection (or all if no collection specified)
  async getBookmarks(userId: string, collectionId?: string) {
    let query = supabase
      .from("user_bookmarks")
      .select(
        `
        *,
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
      `,
      )
      .eq("user_id", userId)

    if (collectionId) {
      query = query.eq("collection_id", collectionId)
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    })

    if (error) {
      console.error("Error fetching bookmarks:", error)
      return []
    }

    return data || []
  },

  // Toggle bookmark (add or remove)
  async toggleBookmark(
    userId: string,
    recipeId: string,
    collectionId?: string,
  ): Promise<boolean> {
    // Check if bookmark exists
    const { data: existing } = await supabase
      .from("user_bookmarks")
      .select("id")
      .eq("user_id", userId)
      .eq("recipe_id", recipeId)
      .eq("collection_id", collectionId || null)
      .maybeSingle()

    if (existing) {
      // Remove bookmark
      const { error } = await supabase
        .from("user_bookmarks")
        .delete()
        .eq("id", existing.id)

      if (error) {
        console.error("Error removing bookmark:", error)
        return false
      }
      return false // Not bookmarked anymore
    } else {
      // Add bookmark - if no collection specified, add to default "Saved" collection
      let targetCollectionId = collectionId

      if (!targetCollectionId) {
        // Get or create default collection
        const collections = await this.getCollections(userId)
        let defaultCollection = collections.find(
          (c) => c.name === "Saved Recipes",
        )

        if (!defaultCollection) {
          defaultCollection = await this.createCollection(
            userId,
            "Saved Recipes",
            "My bookmarked recipes",
          )
        }

        targetCollectionId = defaultCollection?.id
      }

      const { error } = await supabase.from("user_bookmarks").insert({
        user_id: userId,
        recipe_id: recipeId,
        collection_id: targetCollectionId,
      })

      if (error) {
        console.error("Error adding bookmark:", error)
        return false
      }
      return true // Now bookmarked
    }
  },

  // Check if a recipe is bookmarked
  async isBookmarked(userId: string, recipeId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("user_bookmarks")
      .select("id")
      .eq("user_id", userId)
      .eq("recipe_id", recipeId)
      .maybeSingle()

    if (error) {
      console.error("Error checking bookmark status:", error)
      return false
    }

    return !!data
  },

  // Add note to bookmark
  async addNote(bookmarkId: string, notes: string): Promise<boolean> {
    const { error } = await supabase
      .from("user_bookmarks")
      .update({ notes })
      .eq("id", bookmarkId)

    if (error) {
      console.error("Error adding bookmark note:", error)
      return false
    }

    return true
  },

  // Update collection
  async updateCollection(
    collectionId: string,
    updates: Partial<
      Pick<BookmarkCollection, "name" | "description" | "icon" | "color">
    >,
  ): Promise<boolean> {
    const { error } = await supabase
      .from("bookmark_collections")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", collectionId)

    if (error) {
      console.error("Error updating collection:", error)
      return false
    }

    return true
  },

  // Delete collection
  async deleteCollection(collectionId: string): Promise<boolean> {
    const { error } = await supabase
      .from("bookmark_collections")
      .delete()
      .eq("id", collectionId)

    if (error) {
      console.error("Error deleting collection:", error)
      return false
    }

    return true
  },
}
