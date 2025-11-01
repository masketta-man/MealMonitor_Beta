import { supabase } from '@/lib/supabase'

export interface UserSettings {
  id: string
  user_id: string
  daily_calorie_target: number
  weight_goal: 'lose_weight' | 'maintain_weight' | 'gain_weight'
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active'
  dietary_restrictions: string[]
  favorite_cuisines: string[]
  meal_preferences: any
  tutorial_completed: boolean
  created_at: string
  updated_at: string
}

export type UserSettingsUpdate = Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>

export const settingsService = {
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching user settings:', error)
      return null
    }

    return data
  },

  async createUserSettings(userId: string, settings?: Partial<UserSettings>): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .insert({
        user_id: userId,
        ...settings,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user settings:', error)
      return null
    }

    return data
  },

  async updateUserSettings(userId: string, updates: UserSettingsUpdate): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user settings:', error)
      return null
    }

    return data
  },

  async getOrCreateSettings(userId: string): Promise<UserSettings | null> {
    let settings = await this.getUserSettings(userId)

    if (!settings) {
      settings = await this.createUserSettings(userId)
    }

    return settings
  },
}
