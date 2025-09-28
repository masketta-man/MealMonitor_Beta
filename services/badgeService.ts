import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { userService } from './userService'

type Badge = Database['public']['Tables']['badges']['Row']
type UserBadge = Database['public']['Tables']['user_badges']['Row']

export interface BadgeWithProgress extends Badge {
  isEarned: boolean
  progress: number
  earnedAt?: string
}

export const badgeService = {
  // Get all badges with user progress
  async getBadgesWithProgress(userId: string): Promise<BadgeWithProgress[]> {
    // Get all badges
    const { data: badges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .order('requirement_value')

    if (badgesError) {
      console.error('Error fetching badges:', badgesError)
      return []
    }

    // Get user's earned badges
    const { data: userBadges, error: userBadgesError } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)

    if (userBadgesError) {
      console.error('Error fetching user badges:', userBadgesError)
      return []
    }

    const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id))
    const earnedBadgeMap = new Map(userBadges.map(ub => [ub.badge_id, ub]))

    // Get user stats for progress calculation
    const userStats = await userService.getUserStats(userId)
    if (!userStats.profile) return []

    return badges.map(badge => {
      const isEarned = earnedBadgeIds.has(badge.id)
      const earnedBadge = earnedBadgeMap.get(badge.id)
      
      let progress = 0
      switch (badge.requirement_type) {
        case 'meals_completed':
          progress = userStats.stats.mealsCompleted
          break
        case 'challenges_completed':
          progress = userStats.stats.challengesCompleted
          break
        case 'streak_days':
          progress = userStats.profile.streak_days
          break
        case 'points_earned':
          progress = userStats.profile.total_points
          break
        case 'ingredients_used':
          // This would need a separate query to count unique ingredients used
          progress = 0
          break
        default:
          progress = 0
      }

      return {
        ...badge,
        isEarned,
        progress: Math.min(progress, badge.requirement_value),
        earnedAt: earnedBadge?.earned_at,
      }
    })
  },

  // Get user's earned badges
  async getUserBadges(userId: string): Promise<(Badge & { earnedAt: string })[]> {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badges (*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })

    if (error) {
      console.error('Error fetching user badges:', error)
      return []
    }

    return data.map((userBadge: any) => ({
      ...userBadge.badges,
      earnedAt: userBadge.earned_at,
    }))
  },

  // Check and award badges for user
  async checkAndAwardBadges(userId: string): Promise<Badge[]> {
    const badgesWithProgress = await this.getBadgesWithProgress(userId)
    const newlyEarnedBadges: Badge[] = []

    for (const badge of badgesWithProgress) {
      if (!badge.isEarned && badge.progress >= badge.requirement_value) {
        // Award the badge
        const { error } = await supabase
          .from('user_badges')
          .insert({
            user_id: userId,
            badge_id: badge.id,
          })

        if (!error) {
          newlyEarnedBadges.push(badge)
        } else {
          console.error('Error awarding badge:', error)
        }
      }
    }

    return newlyEarnedBadges
  },

  // Award a specific badge to user
  async awardBadge(userId: string, badgeId: string): Promise<boolean> {
    // Check if user already has this badge
    const { data: existing } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_id', badgeId)
      .single()

    if (existing) {
      return true // Already has badge
    }

    const { error } = await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_id: badgeId,
      })

    if (error) {
      console.error('Error awarding badge:', error)
      return false
    }

    return true
  },

  // Get badge by ID
  async getBadge(badgeId: string): Promise<Badge | null> {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('id', badgeId)
      .single()

    if (error) {
      console.error('Error fetching badge:', error)
      return null
    }

    return data
  },

  // Get badges by requirement type
  async getBadgesByType(requirementType: string): Promise<Badge[]> {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('requirement_type', requirementType)
      .order('requirement_value')

    if (error) {
      console.error('Error fetching badges by type:', error)
      return []
    }

    return data
  },
}