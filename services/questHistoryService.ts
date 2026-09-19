import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type UserChallengeProgress = Database['public']['Tables']['user_challenge_progress']['Row']

export interface QuestHistoryEntry {
  id: string
  user_id: string
  challenge_id: string
  title: string
  description: string
  category: string
  difficulty_level: string | null
  reward_points: number
  total_tasks: number
  duration_days: number | null
  completed_tasks: number | null
  activated_at: string | null
  completed_at: string | null
  quest_end_date: string | null
  is_completed: boolean | null
  user_rating: number | null
  completion_time_minutes: number | null
  actual_completion_minutes: number | null
  completed_on_time: boolean | null
}

export interface QuestStats {
  totalCompleted: number
  totalActivated: number
  totalAbandoned: number
  averageRating: number
  totalXpEarned: number
  averageCompletionTime: number
  fastestCompletion: number | null
  completionRate: number
  favoriteCategory: string | null
  currentStreak: number
  longestStreak: number
}

export const questHistoryService = {
  /**
   * Get all quest history for a user
   */
  async getQuestHistory(userId: string): Promise<QuestHistoryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('quest_history')
        .select('*')
        .eq('user_id', userId)
        .order('activated_at', { ascending: false })

      if (error) {
        console.error('Error fetching quest history:', error)
        return []
      }

      return (data || []) as QuestHistoryEntry[]
    } catch (error) {
      console.error('Error in getQuestHistory:', error)
      return []
    }
  },

  /**
   * Get completed quests only
   */
  async getCompletedQuests(userId: string): Promise<QuestHistoryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('quest_history')
        .select('*')
        .eq('user_id', userId)
        .eq('is_completed', true)
        .order('completed_at', { ascending: false })

      if (error) {
        console.error('Error fetching completed quests:', error)
        return []
      }

      return (data || []) as QuestHistoryEntry[]
    } catch (error) {
      console.error('Error in getCompletedQuests:', error)
      return []
    }
  },

  /**
   * Get abandoned/expired quests
   */
  async getAbandonedQuests(userId: string): Promise<QuestHistoryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('quest_history')
        .select('*')
        .eq('user_id', userId)
        .eq('is_completed', false)
        .not('quest_end_date', 'is', null)
        .lt('quest_end_date', new Date().toISOString())
        .order('quest_end_date', { ascending: false })

      if (error) {
        console.error('Error fetching abandoned quests:', error)
        return []
      }

      return (data || []) as QuestHistoryEntry[]
    } catch (error) {
      console.error('Error in getAbandonedQuests:', error)
      return []
    }
  },

  /**
   * Get quest statistics for a user
   */
  async getQuestStats(userId: string): Promise<QuestStats> {
    try {
      const history = await this.getQuestHistory(userId)

      const completed = history.filter((q) => q.is_completed)
      const abandoned = history.filter(
        (q) =>
          !q.is_completed &&
          q.quest_end_date &&
          new Date(q.quest_end_date) < new Date()
      )

      // Calculate total XP earned
      const totalXpEarned = completed.reduce(
        (sum, q) => sum + q.reward_points,
        0
      )

      // Calculate average rating
      const ratedQuests = completed.filter((q) => q.user_rating !== null)
      const averageRating =
        ratedQuests.length > 0
          ? ratedQuests.reduce((sum, q) => sum + (q.user_rating || 0), 0) /
            ratedQuests.length
          : 0

      // Calculate average completion time (in hours)
      const questsWithTime = completed.filter(
        (q) => q.actual_completion_minutes !== null
      )
      const averageCompletionTime =
        questsWithTime.length > 0
          ? questsWithTime.reduce(
              (sum, q) => sum + (q.actual_completion_minutes || 0),
              0
            ) /
            questsWithTime.length /
            60
          : 0

      // Find fastest completion
      const fastestCompletion =
        questsWithTime.length > 0
          ? Math.min(
              ...questsWithTime.map((q) => q.actual_completion_minutes || Infinity)
            ) / 60
          : null

      // Calculate completion rate
      const totalActivated = history.length
      const completionRate =
        totalActivated > 0 ? (completed.length / totalActivated) * 100 : 0

      // Find favorite category
      const categoryCounts: { [key: string]: number } = {}
      completed.forEach((q) => {
        categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1
      })
      const favoriteCategory =
        Object.keys(categoryCounts).length > 0
          ? Object.entries(categoryCounts).sort(([, a], [, b]) => b - a)[0][0]
          : null

      // Calculate streaks
      const { currentStreak, longestStreak } = this.calculateStreaks(completed)

      return {
        totalCompleted: completed.length,
        totalActivated,
        totalAbandoned: abandoned.length,
        averageRating: Math.round(averageRating * 10) / 10,
        totalXpEarned,
        averageCompletionTime: Math.round(averageCompletionTime * 10) / 10,
        fastestCompletion:
          fastestCompletion !== null
            ? Math.round(fastestCompletion * 10) / 10
            : null,
        completionRate: Math.round(completionRate),
        favoriteCategory,
        currentStreak,
        longestStreak,
      }
    } catch (error) {
      console.error('Error in getQuestStats:', error)
      return {
        totalCompleted: 0,
        totalActivated: 0,
        totalAbandoned: 0,
        averageRating: 0,
        totalXpEarned: 0,
        averageCompletionTime: 0,
        fastestCompletion: null,
        completionRate: 0,
        favoriteCategory: null,
        currentStreak: 0,
        longestStreak: 0,
      }
    }
  },

  /**
   * Calculate current and longest quest completion streaks
   */
  calculateStreaks(
    completedQuests: QuestHistoryEntry[]
  ): { currentStreak: number; longestStreak: number } {
    if (completedQuests.length === 0) {
      return { currentStreak: 0, longestStreak: 0 }
    }

    // Sort by completion date
    const sorted = [...completedQuests]
      .filter((q) => q.completed_at)
      .sort(
        (a, b) =>
          new Date(b.completed_at!).getTime() -
          new Date(a.completed_at!).getTime()
      )

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 1

    // Calculate current streak (consecutive days)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < sorted.length; i++) {
      const questDate = new Date(sorted[i].completed_at!)
      questDate.setHours(0, 0, 0, 0)

      const daysDiff = Math.floor(
        (today.getTime() - questDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (i === 0 && daysDiff <= 1) {
        currentStreak = 1
      } else if (currentStreak > 0 && i > 0) {
        const prevDate = new Date(sorted[i - 1].completed_at!)
        prevDate.setHours(0, 0, 0, 0)

        const prevDaysDiff = Math.floor(
          (prevDate.getTime() - questDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (prevDaysDiff <= 1) {
          currentStreak++
        } else {
          break
        }
      }
    }

    // Calculate longest streak
    for (let i = 1; i < sorted.length; i++) {
      const currentDate = new Date(sorted[i].completed_at!)
      const prevDate = new Date(sorted[i - 1].completed_at!)

      currentDate.setHours(0, 0, 0, 0)
      prevDate.setHours(0, 0, 0, 0)

      const daysDiff = Math.floor(
        (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysDiff <= 1) {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 1
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak)

    return { currentStreak, longestStreak }
  },

  /**
   * Rate a completed quest
   */
  async rateQuest(
    userId: string,
    challengeId: string,
    rating: number
  ): Promise<boolean> {
    if (rating < 1 || rating > 5) {
      console.error('Rating must be between 1 and 5')
      return false
    }

    try {
      const { error } = await supabase
        .from('user_challenge_progress')
        .update({ user_rating: rating })
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .eq('is_completed', true)

      if (error) {
        console.error('Error rating quest:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in rateQuest:', error)
      return false
    }
  },

  /**
   * Get quests grouped by category
   */
  async getQuestsByCategory(userId: string): Promise<{
    [category: string]: QuestHistoryEntry[]
  }> {
    const history = await this.getCompletedQuests(userId)

    const grouped: { [category: string]: QuestHistoryEntry[] } = {}

    history.forEach((quest) => {
      if (!grouped[quest.category]) {
        grouped[quest.category] = []
      }
      grouped[quest.category].push(quest)
    })

    return grouped
  },

  /**
   * Get recent achievements (completed quests in last 7 days)
   */
  async getRecentAchievements(userId: string): Promise<QuestHistoryEntry[]> {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    try {
      const { data, error } = await supabase
        .from('quest_history')
        .select('*')
        .eq('user_id', userId)
        .eq('is_completed', true)
        .gte('completed_at', sevenDaysAgo.toISOString())
        .order('completed_at', { ascending: false })

      if (error) {
        console.error('Error fetching recent achievements:', error)
        return []
      }

      return (data || []) as QuestHistoryEntry[]
    } catch (error) {
      console.error('Error in getRecentAchievements:', error)
      return []
    }
  },

  /**
   * Get personal best for a specific quest (fastest completion)
   */
  async getPersonalBest(
    userId: string,
    challengeId: string
  ): Promise<QuestHistoryEntry | null> {
    try {
      const { data, error } = await supabase
        .from('quest_history')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .eq('is_completed', true)
        .not('actual_completion_minutes', 'is', null)
        .order('actual_completion_minutes', { ascending: true })
        .limit(1)
        .single()

      if (error) {
        console.error('Error fetching personal best:', error)
        return null
      }

      return data as QuestHistoryEntry
    } catch (error) {
      console.error('Error in getPersonalBest:', error)
      return null
    }
  },

  /**
   * Export quest history as JSON
   */
  async exportQuestHistory(userId: string): Promise<string> {
    const history = await this.getQuestHistory(userId)
    const stats = await this.getQuestStats(userId)

    const exportData = {
      exportDate: new Date().toISOString(),
      userId,
      stats,
      history,
    }

    return JSON.stringify(exportData, null, 2)
  },
}
