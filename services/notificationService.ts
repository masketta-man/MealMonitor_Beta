import * as Device from "expo-device"
import * as Notifications from "expo-notifications"
import { Platform } from "react-native"
import { supabase } from "@/lib/supabase"

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export interface NotificationPreferences {
  quest_expiring: boolean
  quest_completed: boolean
  new_quests: boolean
  daily_reminder: boolean
  reminder_time: string // HH:MM format
}

export const notificationService = {
  /**
   * Request notification permissions and register device
   */
  async registerForPushNotifications(userId: string): Promise<string | null> {
    if (!Device.isDevice) {
      console.log("Must use physical device for Push Notifications")
      return null
    }

    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync()
      let finalStatus = existingStatus

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!")
        return null
      }

      // Get the push token
      const token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: "05f119bc-ab90-4c6a-8cd8-c353bed99ef3",
        })
      ).data

      // Save token to database
      await this.saveDeviceToken(userId, token)

      // Configure for Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#22c55e",
        })
      }

      return token
    } catch (error) {
      console.error("Error registering for push notifications:", error)
      return null
    }
  },

  /**
   * Save device push token to database
   */
  async saveDeviceToken(userId: string, token: string): Promise<boolean> {
    try {
      // Check if token already exists
      const { data: existing } = await supabase
        .from("user_push_tokens")
        .select("id")
        .eq("user_id", userId)
        .eq("token", token)
        .maybeSingle()

      if (existing) {
        // Update last_used timestamp
        await supabase
          .from("user_push_tokens")
          .update({ last_used: new Date().toISOString() })
          .eq("id", existing.id)
        return true
      }

      // Insert new token
      const { error } = await supabase.from("user_push_tokens").insert({
        user_id: userId,
        token,
        platform: Platform.OS,
        last_used: new Date().toISOString(),
      })

      if (error) {
        console.error("Error saving device token:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in saveDeviceToken:", error)
      return false
    }
  },

  /**
   * Get user's notification preferences
   */
  async getNotificationPreferences(
    userId: string
  ): Promise<NotificationPreferences> {
    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle()

      if (error) {
        console.error("Error fetching notification preferences:", error)
      }

      // Return defaults if no preferences found
      return {
        quest_expiring: data?.quest_expiring ?? true,
        quest_completed: data?.quest_completed ?? true,
        new_quests: data?.new_quests ?? true,
        daily_reminder: data?.daily_reminder ?? false,
        reminder_time: data?.reminder_time ?? "09:00",
      }
    } catch (error) {
      console.error("Error in getNotificationPreferences:", error)
      return {
        quest_expiring: true,
        quest_completed: true,
        new_quests: true,
        daily_reminder: false,
        reminder_time: "09:00",
      }
    }
  },

  /**
   * Update user's notification preferences
   */
  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<boolean> {
    try {
      // Check if preferences exist
      const { data: existing } = await supabase
        .from("notification_preferences")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle()

      if (existing) {
        // Update existing preferences
        const { error } = await supabase
          .from("notification_preferences")
          .update(preferences)
          .eq("user_id", userId)

        if (error) {
          console.error("Error updating notification preferences:", error)
          return false
        }
      } else {
        // Insert new preferences
        const { error } = await supabase
          .from("notification_preferences")
          .insert({
            user_id: userId,
            ...preferences,
          })

        if (error) {
          console.error("Error creating notification preferences:", error)
          return false
        }
      }

      // If daily reminder was updated, reschedule notification
      if (preferences.daily_reminder !== undefined) {
        if (preferences.daily_reminder) {
          await this.scheduleDailyReminder(
            userId,
            preferences.reminder_time || "09:00"
          )
        } else {
          await this.cancelDailyReminder(userId)
        }
      }

      return true
    } catch (error) {
      console.error("Error in updateNotificationPreferences:", error)
      return false
    }
  },

  /**
   * Schedule a local notification for quest expiring soon
   */
  async scheduleQuestExpiringNotification(
    userId: string,
    questTitle: string,
    hoursLeft: number
  ): Promise<void> {
    try {
      const preferences = await this.getNotificationPreferences(userId)
      if (!preferences.quest_expiring) return

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⏰ Quest Expiring Soon!",
          body: `"${questTitle}" expires in ${hoursLeft} hours. Complete it before time runs out!`,
          data: { type: "quest_expiring", userId },
          sound: true,
        },
        trigger: null, // Send immediately
      })

      // Log notification
      await this.logNotification(userId, "quest_expiring", {
        questTitle,
        hoursLeft,
      })
    } catch (error) {
      console.error("Error scheduling quest expiring notification:", error)
    }
  },

  /**
   * Send notification when quest is completed
   */
  async sendQuestCompletedNotification(
    userId: string,
    questTitle: string,
    rewardPoints: number
  ): Promise<void> {
    try {
      const preferences = await this.getNotificationPreferences(userId)
      if (!preferences.quest_completed) return

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🎉 Quest Completed!",
          body: `Congratulations! You completed "${questTitle}" and earned ${rewardPoints} XP!`,
          data: { type: "quest_completed", userId },
          sound: true,
        },
        trigger: null,
      })

      // Log notification
      await this.logNotification(userId, "quest_completed", {
        questTitle,
        rewardPoints,
      })
    } catch (error) {
      console.error("Error sending quest completed notification:", error)
    }
  },

  /**
   * Send notification for new quests available
   */
  async sendNewQuestsNotification(
    userId: string,
    questCount: number
  ): Promise<void> {
    try {
      const preferences = await this.getNotificationPreferences(userId)
      if (!preferences.new_quests) return

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "✨ New Quests Available!",
          body: `${questCount} new ${questCount === 1 ? "quest" : "quests"} ${questCount === 1 ? "is" : "are"} ready for you to conquer!`,
          data: { type: "new_quests", userId },
          sound: true,
        },
        trigger: null,
      })

      // Log notification
      await this.logNotification(userId, "new_quests", { questCount })
    } catch (error) {
      console.error("Error sending new quests notification:", error)
    }
  },

  /**
   * Schedule daily reminder notification
   */
  async scheduleDailyReminder(
    userId: string,
    time: string // HH:MM format
  ): Promise<void> {
    try {
      // Cancel existing daily reminder first
      await this.cancelDailyReminder(userId)

      const [hours, minutes] = time.split(":").map(Number)

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🍽️ Daily Check-in",
          body: "Don't forget to complete your quest tasks today!",
          data: { type: "daily_reminder", userId },
          sound: true,
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
        identifier: `daily-reminder-${userId}`,
      })

      console.log(`Daily reminder scheduled for ${time}`)
    } catch (error) {
      console.error("Error scheduling daily reminder:", error)
    }
  },

  /**
   * Cancel daily reminder notification
   */
  async cancelDailyReminder(userId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(
        `daily-reminder-${userId}`
      )
      console.log("Daily reminder cancelled")
    } catch (error) {
      console.error("Error cancelling daily reminder:", error)
    }
  },

  /**
   * Log notification to database
   */
  async logNotification(
    userId: string,
    type: string,
    metadata: any
  ): Promise<void> {
    try {
      await supabase.from("push_notification_log").insert({
        user_id: userId,
        notification_type: type,
        sent_at: new Date().toISOString(),
        metadata,
      })
    } catch (error) {
      console.error("Error logging notification:", error)
    }
  },

  /**
   * Check for expiring quests and send notifications
   */
  async checkExpiringQuests(userId: string): Promise<void> {
    try {
      const { data: activeQuests } = await supabase
        .from("user_challenge_progress")
        .select(
          `
          *,
          challenges (title, reward_points)
        `
        )
        .eq("user_id", userId)
        .eq("is_active", true)
        .eq("is_completed", false)
        .not("quest_end_date", "is", null)

      if (!activeQuests || activeQuests.length === 0) return

      const now = new Date()

      for (const quest of activeQuests) {
        if (!quest.quest_end_date) continue

        const endDate = new Date(quest.quest_end_date)
        const hoursLeft = Math.floor(
          (endDate.getTime() - now.getTime()) / (1000 * 60 * 60)
        )

        // Send notification if quest expires in 24 hours or less
        if (hoursLeft > 0 && hoursLeft <= 24) {
          const questTitle = (quest as any).challenges?.title || "Your quest"
          await this.scheduleQuestExpiringNotification(
            userId,
            questTitle,
            hoursLeft
          )
        }
      }
    } catch (error) {
      console.error("Error checking expiring quests:", error)
    }
  },

  /**
   * Get notification history for user
   */
  async getNotificationHistory(userId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from("push_notification_log")
        .select("*")
        .eq("user_id", userId)
        .order("sent_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Error fetching notification history:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error in getNotificationHistory:", error)
      return []
    }
  },

  /**
   * Remove device token (on logout)
   */
  async removeDeviceToken(userId: string, token: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("user_push_tokens")
        .delete()
        .eq("user_id", userId)
        .eq("token", token)

      if (error) {
        console.error("Error removing device token:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in removeDeviceToken:", error)
      return false
    }
  },
}
