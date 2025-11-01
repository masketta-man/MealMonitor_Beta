import { supabase } from '@/lib/supabase'

export interface ActivityLog {
  id: string
  user_id: string
  activity_type: 'recipe_completed' | 'challenge_completed' | 'level_up' | 'badge_earned' | 'ingredient_added' | 'recipe_created'
  activity_title: string
  activity_description: string | null
  points_earned: number
  metadata: any
  created_at: string
}

export interface ActivityWithMetadata extends ActivityLog {
  icon: string
  color: string
  displayDate: string
}

const ACTIVITY_CONFIG = {
  recipe_completed: { icon: 'restaurant', color: '#22c55e' },
  challenge_completed: { icon: 'trophy', color: '#f59e0b' },
  level_up: { icon: 'star', color: '#3b82f6' },
  badge_earned: { icon: 'ribbon', color: '#8b5cf6' },
  ingredient_added: { icon: 'leaf', color: '#10b981' },
  recipe_created: { icon: 'create', color: '#ec4899' },
}

const formatActivityDate = (dateString: string): string => {
  const activityDate = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - activityDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  return activityDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export const activityService = {
  async getUserActivities(userId: string, limit: number = 10, offset: number = 0): Promise<ActivityWithMetadata[]> {
    const { data, error } = await supabase
      .from('user_activity_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching user activities:', error)
      return []
    }

    return (data || []).map((activity: ActivityLog) => {
      const config = ACTIVITY_CONFIG[activity.activity_type]
      return {
        ...activity,
        icon: config.icon,
        color: config.color,
        displayDate: formatActivityDate(activity.created_at),
      }
    })
  },

  async getActivityCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('user_activity_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching activity count:', error)
      return 0
    }

    return count || 0
  },

  async logActivity(
    userId: string,
    activityType: ActivityLog['activity_type'],
    title: string,
    description?: string,
    pointsEarned: number = 0,
    metadata?: any
  ): Promise<ActivityLog | null> {
    const { data, error } = await supabase
      .from('user_activity_log')
      .insert({
        user_id: userId,
        activity_type: activityType,
        activity_title: title,
        activity_description: description,
        points_earned: pointsEarned,
        metadata: metadata,
      })
      .select()
      .single()

    if (error) {
      console.error('Error logging activity:', error)
      return null
    }

    return data
  },
}
