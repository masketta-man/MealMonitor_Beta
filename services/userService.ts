import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { getLevelProgress } from '@/utils/leveling'

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
      .insert(profile as any)
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
    // Create a type-safe update object
    const updateData: UserProfileUpdate = { ...updates };
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData as any) // Type assertion needed due to Supabase type limitations
      .eq('id', userId)
      .select()
      .single()
      
    if (error) {
      console.error('Error updating user profile:', error)
      return null
    }
    return data as UserProfile
  },

  // Update user experience and level
  async updateExperience(userId: string, pointsEarned: number): Promise<UserProfile | null> {
    const currentProfile = await this.getProfile(userId)
    if (!currentProfile) return null

    const currentExperience = currentProfile.experience ?? 0
    const currentLevel = currentProfile.level ?? 1

    const newExperience = currentExperience + pointsEarned
    const newTotalPoints = (currentProfile.total_points ?? 0) + pointsEarned

    const progress = getLevelProgress(newExperience)
    const leveledUp = progress.level > currentLevel

    const updates: UserProfileUpdate = {
      experience: newExperience,
      total_points: newTotalPoints,
      level: progress.level,
      ...(leveledUp ? { last_level_up: new Date().toISOString() } : {}),
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
      levelProgress: profile ? getLevelProgress(profile.experience ?? 0) : null,
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