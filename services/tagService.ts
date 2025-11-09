import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type Tag = {
  id: string
  name: string
  slug: string
  category_id: string | null
  parent_tag_id: string | null
  description: string | null
  base_weight: number
  relevance_score: number
  usage_count: number
  popularity_score: number
  is_system_tag: boolean
  is_approved: boolean
  is_active: boolean
  synonyms: string[] | null
  related_terms: string[] | null
  color_hex: string | null
  created_at: string
  updated_at: string
}

type TagCategory = {
  id: string
  name: string
  description: string | null
  icon: string | null
  display_order: number
  is_active: boolean
}

type TagWithCategory = Tag & {
  category?: TagCategory
  related_tags?: Array<{
    id: string
    name: string
    relationship_type: string
    strength: number
  }>
}

type TagRelationship = {
  id: string
  tag_id: string
  related_tag_id: string
  relationship_type: 'similar' | 'opposite' | 'parent' | 'child' | 'implies' | 'excludes'
  strength: number
}

type UserTagPreference = {
  id: string
  user_id: string
  tag_id: string
  preference_score: number
  interaction_count: number
  positive_interactions: number
  negative_interactions: number
  last_interacted_at: string
}

export const tagService = {
  /**
   * Get all tag categories
   */
  async getTagCategories(): Promise<TagCategory[]> {
    const { data, error } = await supabase
      .from('tag_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order')

    if (error) {
      console.error('Error fetching tag categories:', error)
      return []
    }

    return data || []
  },

  /**
   * Get all tags with optional filtering
   */
  async getTags(filters?: {
    categoryId?: string
    isApproved?: boolean
    search?: string
    limit?: number
  }): Promise<TagWithCategory[]> {
    let query = supabase
      .from('tags')
      .select(`
        *,
        tag_categories (
          id,
          name,
          description,
          icon,
          display_order,
          is_active
        )
      `)
      .eq('is_active', true)

    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId)
    }

    if (filters?.isApproved !== undefined) {
      query = query.eq('is_approved', filters.isApproved)
    } else {
      // By default, only show approved or system tags
      query = query.or('is_approved.eq.true,is_system_tag.eq.true')
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,synonyms.cs.{${filters.search}}`)
    }

    query = query.order('popularity_score', { ascending: false })

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching tags:', error)
      return []
    }

    return (data || []).map((tag: any) => ({
      ...tag,
      category: tag.tag_categories
    }))
  },

  /**
   * Get tag by ID with related tags
   */
  async getTagById(tagId: string): Promise<TagWithCategory | null> {
    const { data, error } = await supabase
      .from('tags')
      .select(`
        *,
        tag_categories (
          id,
          name,
          description,
          icon,
          display_order,
          is_active
        )
      `)
      .eq('id', tagId)
      .single()

    if (error) {
      console.error('Error fetching tag:', error)
      return null
    }

    // Get related tags
    const { data: relatedData } = await supabase
      .from('tag_relationships')
      .select(`
        relationship_type,
        strength,
        related:tags!tag_relationships_related_tag_id_fkey (
          id,
          name
        )
      `)
      .eq('tag_id', tagId)
      .order('strength', { ascending: false })

    const related_tags = relatedData?.map((rel: any) => ({
      id: rel.related.id,
      name: rel.related.name,
      relationship_type: rel.relationship_type,
      strength: rel.strength
    })) || []

    return {
      ...data,
      category: data.tag_categories,
      related_tags
    }
  },

  /**
   * Get tags for a recipe
   */
  async getRecipeTags(recipeId: string): Promise<TagWithCategory[]> {
    const { data, error } = await supabase
      .from('recipe_tag_mappings')
      .select(`
        relevance_weight,
        confidence_score,
        tags (
          *,
          tag_categories (
            id,
            name,
            description,
            icon
          )
        )
      `)
      .eq('recipe_id', recipeId)
      .order('relevance_weight', { ascending: false })

    if (error) {
      console.error('Error fetching recipe tags:', error)
      return []
    }

    return (data || []).map((mapping: any) => ({
      ...mapping.tags,
      category: mapping.tags.tag_categories,
      relevance_weight: mapping.relevance_weight,
      confidence_score: mapping.confidence_score
    }))
  },

  /**
   * Add tag to recipe
   */
  async addTagToRecipe(
    recipeId: string,
    tagId: string,
    relevanceWeight: number = 1.0,
    userId?: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('recipe_tag_mappings')
      .insert({
        recipe_id: recipeId,
        tag_id: tagId,
        relevance_weight: relevanceWeight,
        source: userId ? 'user_suggested' : 'manual',
        added_by: userId
      })

    if (error) {
      console.error('Error adding tag to recipe:', error)
      return false
    }

    return true
  },

  /**
   * Remove tag from recipe
   */
  async removeTagFromRecipe(recipeId: string, tagId: string): Promise<boolean> {
    const { error } = await supabase
      .from('recipe_tag_mappings')
      .delete()
      .eq('recipe_id', recipeId)
      .eq('tag_id', tagId)

    if (error) {
      console.error('Error removing tag from recipe:', error)
      return false
    }

    return true
  },

  /**
   * Suggest a new tag (user-generated)
   */
  async suggestTag(
    name: string,
    categoryId: string,
    description?: string,
    userId?: string
  ): Promise<{ success: boolean; tagId?: string; message?: string }> {
    // Validate tag name
    const trimmedName = name.trim()
    if (trimmedName.length < 2) {
      return { success: false, message: 'Tag name must be at least 2 characters' }
    }

    if (trimmedName.length > 50) {
      return { success: false, message: 'Tag name must be less than 50 characters' }
    }

    // Check if tag already exists
    const { data: existing } = await supabase
      .from('tags')
      .select('id, is_approved')
      .eq('name', trimmedName)
      .single()

    if (existing) {
      if (existing.is_approved) {
        return { success: false, message: 'This tag already exists' }
      } else {
        return { success: false, message: 'This tag is pending approval' }
      }
    }

    // Create slug from name
    const slug = trimmedName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Insert new tag
    const { data, error } = await supabase
      .from('tags')
      .insert({
        name: trimmedName,
        slug,
        category_id: categoryId,
        description,
        is_system_tag: false,
        is_approved: false, // Requires approval
        requires_verification: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error suggesting tag:', error)
      return { success: false, message: 'Failed to suggest tag' }
    }

    return { success: true, tagId: data.id, message: 'Tag suggested successfully' }
  },

  /**
   * Get user tag preferences
   */
  async getUserTagPreferences(userId: string): Promise<UserTagPreference[]> {
    const { data, error } = await supabase
      .from('user_tag_preferences')
      .select('*')
      .eq('user_id', userId)
      .order('preference_score', { ascending: false })

    if (error) {
      console.error('Error fetching user tag preferences:', error)
      return []
    }

    return data || []
  },

  /**
   * Update user tag preference (based on interactions)
   */
  async updateUserTagPreference(
    userId: string,
    tagId: string,
    isPositive: boolean
  ): Promise<boolean> {
    // Get existing preference
    const { data: existing } = await supabase
      .from('user_tag_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('tag_id', tagId)
      .single()

    if (existing) {
      // Update existing preference
      const newPositiveCount = isPositive
        ? existing.positive_interactions + 1
        : existing.positive_interactions
      const newNegativeCount = !isPositive
        ? existing.negative_interactions + 1
        : existing.negative_interactions

      // Calculate preference score: (positive - negative) with decay
      const preferenceScore = Math.max(
        -10,
        Math.min(10, newPositiveCount - newNegativeCount)
      )

      const { error } = await supabase
        .from('user_tag_preferences')
        .update({
          preference_score: preferenceScore,
          interaction_count: existing.interaction_count + 1,
          positive_interactions: newPositiveCount,
          negative_interactions: newNegativeCount,
          last_interacted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)

      if (error) {
        console.error('Error updating user tag preference:', error)
        return false
      }
    } else {
      // Create new preference
      const { error } = await supabase
        .from('user_tag_preferences')
        .insert({
          user_id: userId,
          tag_id: tagId,
          preference_score: isPositive ? 1 : -1,
          interaction_count: 1,
          positive_interactions: isPositive ? 1 : 0,
          negative_interactions: isPositive ? 0 : 1,
          last_interacted_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error creating user tag preference:', error)
        return false
      }
    }

    return true
  },

  /**
   * Get related tags (for recommendations and autocomplete)
   */
  async getRelatedTags(
    tagId: string,
    relationshipTypes: string[] = ['similar', 'implies']
  ): Promise<TagWithCategory[]> {
    const { data, error } = await supabase.rpc('get_related_tags', {
      tag_uuid: tagId,
      relationship_types: relationshipTypes
    })

    if (error) {
      console.error('Error fetching related tags:', error)
      return []
    }

    // Fetch full tag details for related tags
    if (!data || data.length === 0) return []

    const relatedTagIds = data.map((r: any) => r.related_tag_id)
    const { data: tags } = await supabase
      .from('tags')
      .select(`
        *,
        tag_categories (
          id,
          name,
          description,
          icon
        )
      `)
      .in('id', relatedTagIds)

    return (tags || []).map((tag: any) => ({
      ...tag,
      category: tag.tag_categories
    }))
  },

  /**
   * Get popular tags (for trending/discovery)
   */
  async getPopularTags(limit: number = 20): Promise<TagWithCategory[]> {
    const { data, error } = await supabase
      .from('tags')
      .select(`
        *,
        tag_categories (
          id,
          name,
          description,
          icon
        )
      `)
      .eq('is_active', true)
      .or('is_approved.eq.true,is_system_tag.eq.true')
      .order('popularity_score', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching popular tags:', error)
      return []
    }

    return (data || []).map((tag: any) => ({
      ...tag,
      category: tag.tag_categories
    }))
  },

  /**
   * Search tags with fuzzy matching
   */
  async searchTags(searchTerm: string, limit: number = 10): Promise<TagWithCategory[]> {
    if (!searchTerm || searchTerm.trim().length < 2) return []

    const { data, error} = await supabase
      .from('tags')
      .select(`
        *,
        tag_categories (
          id,
          name,
          description,
          icon
        )
      `)
      .eq('is_active', true)
      .or('is_approved.eq.true,is_system_tag.eq.true')
      .or(`name.ilike.%${searchTerm}%,synonyms.cs.{${searchTerm}}`)
      .order('popularity_score', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error searching tags:', error)
      return []
    }

    return (data || []).map((tag: any) => ({
      ...tag,
      category: tag.tag_categories
    }))
  }
}
