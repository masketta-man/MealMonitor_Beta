import { supabase } from '@/lib/supabase'
import { userService } from './userService'
import { activityService } from './activityService'

const STREAK_BONUS_XP = 25

export const streakService = {
  async checkAndUpdateStreak(userId: string): Promise<{ streak: number; isNewStreak: boolean }> {
    const profile = await userService.getProfile(userId)
    if (!profile) {
      return { streak: 0, isNewStreak: false }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayString = today.toISOString().split('T')[0]

    const lastActivityDate = profile.last_activity_date
      ? new Date(profile.last_activity_date)
      : null

    if (lastActivityDate) {
      lastActivityDate.setHours(0, 0, 0, 0)
    }

    const lastActivityString = lastActivityDate
      ? lastActivityDate.toISOString().split('T')[0]
      : null

    if (lastActivityString === todayString) {
      return { streak: profile.streak_days || 0, isNewStreak: false }
    }

    let newStreakDays = profile.streak_days || 0
    let isNewStreak = false

    if (!lastActivityDate) {
      newStreakDays = 1
      isNewStreak = true
    } else {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayString = yesterday.toISOString().split('T')[0]

      if (lastActivityString === yesterdayString) {
        newStreakDays = (profile.streak_days || 0) + 1
        isNewStreak = true
      } else {
        newStreakDays = 1
        isNewStreak = true
      }
    }

    const { error } = await supabase
      .from('users')
      .update({
        streak_days: newStreakDays,
        last_activity_date: todayString,
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating streak:', error)
      return { streak: profile.streak_days || 0, isNewStreak: false }
    }

    if (isNewStreak && newStreakDays > 1 && newStreakDays % 7 === 0) {
      await this.awardStreakBonus(userId, newStreakDays)
    }

    return { streak: newStreakDays, isNewStreak }
  },

  async awardStreakBonus(userId: string, streakDays: number): Promise<void> {
    const bonusXP = STREAK_BONUS_XP * Math.floor(streakDays / 7)

    await userService.updateExperience(userId, bonusXP)

    await activityService.logActivity(
      userId,
      'level_up',
      `${streakDays}-Day Streak Milestone!`,
      `Reached a ${streakDays}-day streak and earned ${bonusXP} bonus XP`,
      bonusXP
    )

    console.log(`User ${userId} earned ${bonusXP} XP for ${streakDays}-day streak`)
  },

  async getStreakInfo(userId: string): Promise<{
    currentStreak: number
    lastActivityDate: string | null
    isActiveToday: boolean
  }> {
    const profile = await userService.getProfile(userId)
    if (!profile) {
      return { currentStreak: 0, lastActivityDate: null, isActiveToday: false }
    }

    const today = new Date().toISOString().split('T')[0]
    const isActiveToday = profile.last_activity_date === today

    return {
      currentStreak: profile.streak_days || 0,
      lastActivityDate: profile.last_activity_date,
      isActiveToday,
    }
  },

  async resetStreak(userId: string): Promise<void> {
    await supabase
      .from('users')
      .update({ streak_days: 0, last_activity_date: null })
      .eq('id', userId)
  },
}
