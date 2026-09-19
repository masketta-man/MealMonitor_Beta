import { supabase } from "@/lib/supabase"
import { Database } from "@/types/database"

export interface UserSettings {
  id: string
  user_id: string
  daily_calorie_target: number
  weight_goal: "lose_weight" | "maintain_weight" | "gain_weight"
  activity_level:
    | "sedentary"
    | "lightly_active"
    | "moderately_active"
    | "very_active"
    | "extremely_active"
  dietary_restrictions: string[]
  favorite_cuisines: string[]
  meal_preferences: any
  tutorial_completed: boolean
  created_at: string
  updated_at: string
}

export type UserSettingsUpdate = Partial<
  Omit<UserSettings, "id" | "user_id" | "created_at" | "updated_at">
>

type UserSettingsRow = Database["public"]["Tables"]["user_settings"]["Row"]

/**
 * Every column on `user_settings` is nullable in the database, but callers treat
 * these values as concrete (arithmetic on daily_calorie_target, `.map` over
 * dietary_restrictions, and so on). Normalize once here, applying the same
 * defaults the columns declare in the migration, so a null can't leak into the UI.
 */
const normalizeSettings = (row: UserSettingsRow): UserSettings => ({
  id: row.id,
  user_id: row.user_id,
  daily_calorie_target: row.daily_calorie_target ?? 2000,
  weight_goal: (row.weight_goal ??
    "maintain_weight") as UserSettings["weight_goal"],
  activity_level: (row.activity_level ??
    "moderately_active") as UserSettings["activity_level"],
  dietary_restrictions: row.dietary_restrictions ?? [],
  favorite_cuisines: row.favorite_cuisines ?? [],
  meal_preferences: row.meal_preferences ?? {},
  tutorial_completed: row.tutorial_completed ?? false,
  created_at: row.created_at ?? "",
  updated_at: row.updated_at ?? "",
})

export const settingsService = {
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    if (error) {
      console.error("Error fetching user settings:", error)
      return null
    }

    return data ? normalizeSettings(data) : null
  },

  async createUserSettings(
    userId: string,
    settings?: Partial<UserSettings>,
  ): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from("user_settings")
      .insert({
        user_id: userId,
        ...settings,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating user settings:", error)
      return null
    }

    return normalizeSettings(data)
  },

  /**
   * Insert-or-update settings for a user.
   *
   * `user_settings.user_id` is NOT NULL UNIQUE, so a plain insert fails whenever a
   * row already exists. That happens more often than it looks: TutorialProvider
   * calls getOrCreateSettings as soon as a user is available, which can win the
   * race against onboarding and cause the onboarding write to be dropped.
   * Only the columns passed in are touched.
   */
  async upsertUserSettings(
    userId: string,
    settings: UserSettingsUpdate,
  ): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      .select()
      .single()

    if (error) {
      // 23503 is a foreign-key violation, which here means the user has no row in
      // `users` yet. That's the normal state between signing up and finishing
      // onboarding, so don't report it as an error.
      if (error.code === "23503") {
        console.log(
          "Skipping user settings write: profile row does not exist yet",
        )
        return null
      }

      console.error("Error upserting user settings:", error)
      return null
    }

    return normalizeSettings(data)
  },

  async updateUserSettings(
    userId: string,
    updates: UserSettingsUpdate,
  ): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from("user_settings")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating user settings:", error)
      return null
    }

    return normalizeSettings(data)
  },

  async getOrCreateSettings(userId: string): Promise<UserSettings | null> {
    const settings = await this.getUserSettings(userId)

    if (settings) return settings

    // Upsert rather than insert: another caller (e.g. onboarding completing at the
    // same time) may have created the row between the read above and this write.
    return this.upsertUserSettings(userId, {})
  },
}
