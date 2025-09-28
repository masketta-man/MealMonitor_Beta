import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type UserProfile = Database['public']['Tables']['users']['Row']
type UserProfileInsert = Database['public']['Tables']['users']['Insert']
type UserProfileUpdate = Database['public']['Tables']['users']['Update']

export const userService = {
  // Get user profile
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  },

  // Create user profile
  async createProfile(profile: UserProfileInsert): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .insert(profile)
      .select()
      .single()

    if (error) {
      console.error('Error creating user profile:', error)
      return null
    }

    return data
  },

  // Update user profile
  async updateProfile(userId: string, updates: UserProfileUpdate): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user profile:', error)
      return null
    }

    return data
  },

  // Update user experience and level
  async updateExperience(userId: string, pointsEarned: number): Promise<UserProfile | null> {
    // First get current user data
    const currentProfile = await this.getProfile(userId)
    if (!currentProfile) return null

    const newExperience = currentProfile.experience + pointsEarned
    const newTotalPoints = currentProfile.total_points + pointsEarned
    
    // Calculate new level (every 500 XP = 1 level)
    const newLevel = Math.floor(newExperience / 500) + 1

    const updates: UserProfileUpdate = {
      experience: newExperience,
      total_points: newTotalPoints,
      level: newLevel,
    }

    return this.updateProfile(userId, updates)
  },

  // Update streak days
  async updateStreak(userId: string, streakDays: number): Promise<UserProfile | null> {
    return this.updateProfile(userId, { streak_days: streakDays })
  },

  // Get user stats for dashboard
  async getUserStats(userId: string) {
    const [profile, completedMeals, challengeProgress, badges] = await Promise.all([
      this.getProfile(userId),
      this.getCompletedMealsCount(userId),
      this.getCompletedChallengesCount(userId),
      this.getUserBadgesCount(userId),
    ])

    return {
      profile,
      stats: {
        mealsCompleted: completedMeals,
        challengesCompleted: challengeProgress,
        badgesEarned: badges,
      },
    }
  },

  // Helper methods for stats
  async getCompletedMealsCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('user_completed_meals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching completed meals count:', error)
      return 0
    }

    return count || 0
  },

  async getCompletedChallengesCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('user_challenge_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_completed', true)

    if (error) {
      console.error('Error fetching completed challenges count:', error)
      return 0
    }

    return count || 0
  },

  async getUserBadgesCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('user_badges')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching user badges count:', error)
      return 0
    }

    return count || 0
  },
}