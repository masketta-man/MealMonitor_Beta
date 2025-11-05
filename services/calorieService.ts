import { supabase } from '@/lib/supabase'
import { settingsService } from './settingsService'
import { userService } from './userService'
import { activityService } from './activityService'

export interface DailyCalorieLog {
  id: string
  user_id: string
  date: string
  total_calories: number
  calorie_goal: number
  goal_met: boolean
  xp_awarded: boolean
  created_at: string
  updated_at: string
}

export interface MealLog {
  id: string
  user_id: string
  recipe_id: string | null
  meal_name: string
  calories: number
  logged_at: string
  meal_type: string | null
  created_at: string
}

const CALORIE_GOAL_XP_REWARD = 50
const CALORIE_GOAL_MIN_PERCENTAGE = 0.8 // 80% of goal
const CALORIE_GOAL_MAX_PERCENTAGE = 1.05 // 105% of goal

export const calorieService = {
  async getTodaysLog(userId: string): Promise<DailyCalorieLog | null> {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('daily_calories')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle()

    if (error) {
      console.error('Error fetching daily calorie log:', error)
      return null
    }

    return data
  },

  async getTodaysMeals(userId: string): Promise<MealLog[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('logged_at', today.toISOString())
      .order('logged_at', { ascending: false })

    if (error) {
      console.error('Error fetching today\'s meals:', error)
      return []
    }

    return data || []
  },

  async getOrCreateTodaysLog(userId: string): Promise<DailyCalorieLog | null> {
    let todaysLog = await this.getTodaysLog(userId)

    if (!todaysLog) {
      const settings = await settingsService.getOrCreateSettings(userId)
      const calorieGoal = settings?.daily_calorie_target || 2000

      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('daily_calories')
        .insert({
          user_id: userId,
          date: today,
          total_calories: 0,
          calorie_goal: calorieGoal,
          goal_met: false,
          xp_awarded: false,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating daily calorie log:', error)
        return null
      }

      todaysLog = data
    }

    return todaysLog
  },

  async logMeal(
    userId: string,
    mealName: string,
    calories: number,
    mealType?: string,
    recipeId?: string
  ): Promise<boolean> {
    // Ensure meal_type is one of: breakfast, lunch, dinner, snack
    const validMealType = mealType?.toLowerCase() || 'snack'

    const { data: mealData, error: mealError } = await supabase
      .from('meal_logs')
      .insert({
        user_id: userId,
        recipe_id: recipeId || null,
        meal_name: mealName,
        calories,
        meal_type: validMealType,
      })
      .select()
      .single()

    if (mealError) {
      console.error('Error logging meal:', mealError)
      return false
    }

    await this.updateDailyTotal(userId)

    return true
  },

  async updateDailyTotal(userId: string): Promise<void> {
    const todaysLog = await this.getOrCreateTodaysLog(userId)
    if (!todaysLog) return

    const todaysMeals = await this.getTodaysMeals(userId)
    const totalCalories = todaysMeals.reduce((sum, meal) => sum + meal.calories, 0)

    // Calculate min and max acceptable calorie range
    const minCalories = todaysLog.calorie_goal * CALORIE_GOAL_MIN_PERCENTAGE
    const maxCalories = todaysLog.calorie_goal * CALORIE_GOAL_MAX_PERCENTAGE

    // Goal is met if calories are within the acceptable range (80%-105% of goal)
    const goalMet = totalCalories > 0 && 
                    totalCalories >= minCalories && 
                    totalCalories <= maxCalories

    const { error } = await supabase
      .from('daily_calories')
      .update({
        total_calories: totalCalories,
        goal_met: goalMet,
      })
      .eq('id', todaysLog.id)

    if (error) {
      console.error('Error updating daily calorie total:', error)
      return
    }

    if (goalMet && !todaysLog.xp_awarded && totalCalories > 0) {
      await this.awardCalorieGoalXP(userId, todaysLog.id)
    }
  },

  async awardCalorieGoalXP(userId: string, logId: string): Promise<void> {
    const updatedProfile = await userService.updateExperience(userId, CALORIE_GOAL_XP_REWARD)

    if (updatedProfile) {
      const { error } = await supabase
        .from('daily_calories')
        .update({ xp_awarded: true })
        .eq('id', logId)

      if (error) {
        console.error('Error marking XP as awarded:', error)
      }

      await activityService.logActivity(
        userId,
        'recipe_completed',
        'Calorie Goal Met!',
        `Met your daily calorie goal and earned ${CALORIE_GOAL_XP_REWARD} XP`,
        CALORIE_GOAL_XP_REWARD
      )

      console.log(`User ${userId} earned ${CALORIE_GOAL_XP_REWARD} XP for meeting calorie goal`)
    }
  },

  async deleteMeal(userId: string, mealId: string): Promise<boolean> {
    const { error } = await supabase
      .from('meal_logs')
      .delete()
      .eq('id', mealId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting meal:', error)
      return false
    }

    await this.updateDailyTotal(userId)

    return true
  },

  async getCalorieHistory(userId: string, days: number = 7): Promise<DailyCalorieLog[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('daily_calories')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching calorie history:', error)
      return []
    }

    return data || []
  },
}
