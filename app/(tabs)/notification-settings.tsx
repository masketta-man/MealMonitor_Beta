import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import DateTimePicker from "@react-native-community/datetimepicker"

// Components
import Card from "@/components/Card"

// Hooks and Services
import { useAuth } from "@/hooks/useAuth"
import {
  notificationService,
  NotificationPreferences,
} from "@/services/notificationService"
import { useFocusEffect } from "expo-router"

export default function NotificationSettingsScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    quest_expiring: true,
    quest_completed: true,
    new_quests: true,
    daily_reminder: false,
    reminder_time: "09:00",
  })
  const [showTimePicker, setShowTimePicker] = useState(false)

  const fetchPreferences = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const prefs = await notificationService.getNotificationPreferences(user.id)
      setPreferences(prefs)
    } catch (error) {
      console.error("Error fetching notification preferences:", error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useFocusEffect(
    useCallback(() => {
      fetchPreferences()
    }, [fetchPreferences])
  )

  const updatePreference = async (
    key: keyof NotificationPreferences,
    value: boolean | string
  ) => {
    if (!user) return

    setSaving(true)
    try {
      const updated = { ...preferences, [key]: value }
      setPreferences(updated)

      const success = await notificationService.updateNotificationPreferences(
        user.id,
        { [key]: value }
      )

      if (!success) {
        // Revert on failure
        setPreferences(preferences)
        if (Platform.OS === "web") {
          alert("Failed to update preferences. Please try again.")
        } else {
          Alert.alert("Error", "Failed to update preferences. Please try again.")
        }
      }
    } catch (error) {
      console.error("Error updating preference:", error)
      setPreferences(preferences)
    } finally {
      setSaving(false)
    }
  }

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === "ios")

    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, "0")
      const minutes = selectedTime.getMinutes().toString().padStart(2, "0")
      const timeString = `${hours}:${minutes}`
      updatePreference("reminder_time", timeString)
    }
  }

  const getReminderTimeDate = () => {
    const [hours, minutes] = preferences.reminder_time.split(":").map(Number)
    const date = new Date()
    date.setHours(hours)
    date.setMinutes(minutes)
    return date
  }

  if (loading) {
    return (
      <LinearGradient colors={["#dcfce7", "#f0fdf4"]} style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#166534" />
            <Text style={styles.loadingText}>Loading preferences...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={["#dcfce7", "#f0fdf4"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#166534" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notification Settings</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Description */}
          <Card style={styles.descriptionCard}>
            <View style={styles.descriptionHeader}>
              <Ionicons name="notifications" size={32} color="#22c55e" />
            </View>
            <Text style={styles.descriptionTitle}>Stay Updated</Text>
            <Text style={styles.descriptionText}>
              Manage your notification preferences to stay informed about your
              quest progress and new challenges.
            </Text>
          </Card>

          {/* Quest Notifications */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Quest Notifications</Text>
            <Text style={styles.sectionDescription}>
              Get notified about your active quests
            </Text>

            {/* Quest Expiring */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="time-outline" size={20} color="#f59e0b" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Quest Expiring Soon</Text>
                  <Text style={styles.settingSubtitle}>
                    Remind me when quests are about to expire
                  </Text>
                </View>
              </View>
              <Switch
                value={preferences.quest_expiring}
                onValueChange={(value) =>
                  updatePreference("quest_expiring", value)
                }
                trackColor={{ false: "#e5e7eb", true: "#86efac" }}
                thumbColor={preferences.quest_expiring ? "#22c55e" : "#f3f4f6"}
                disabled={saving}
              />
            </View>

            {/* Quest Completed */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#22c55e"
                  />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Quest Completed</Text>
                  <Text style={styles.settingSubtitle}>
                    Celebrate when I complete a quest
                  </Text>
                </View>
              </View>
              <Switch
                value={preferences.quest_completed}
                onValueChange={(value) =>
                  updatePreference("quest_completed", value)
                }
                trackColor={{ false: "#e5e7eb", true: "#86efac" }}
                thumbColor={preferences.quest_completed ? "#22c55e" : "#f3f4f6"}
                disabled={saving}
              />
            </View>

            {/* New Quests */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="sparkles-outline" size={20} color="#8b5cf6" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>New Quests Available</Text>
                  <Text style={styles.settingSubtitle}>
                    Notify me about new quests I can start
                  </Text>
                </View>
              </View>
              <Switch
                value={preferences.new_quests}
                onValueChange={(value) => updatePreference("new_quests", value)}
                trackColor={{ false: "#e5e7eb", true: "#86efac" }}
                thumbColor={preferences.new_quests ? "#22c55e" : "#f3f4f6"}
                disabled={saving}
              />
            </View>
          </Card>

          {/* Daily Reminder */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Reminder</Text>
            <Text style={styles.sectionDescription}>
              Set a daily reminder to check your quests
            </Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="alarm-outline" size={20} color="#3b82f6" />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Enable Daily Reminder</Text>
                  <Text style={styles.settingSubtitle}>
                    Get a daily notification to stay on track
                  </Text>
                </View>
              </View>
              <Switch
                value={preferences.daily_reminder}
                onValueChange={(value) =>
                  updatePreference("daily_reminder", value)
                }
                trackColor={{ false: "#e5e7eb", true: "#86efac" }}
                thumbColor={preferences.daily_reminder ? "#22c55e" : "#f3f4f6"}
                disabled={saving}
              />
            </View>

            {/* Reminder Time */}
            {preferences.daily_reminder && (
              <View style={styles.reminderTimeContainer}>
                <View style={styles.reminderTimeInfo}>
                  <Ionicons name="time" size={20} color="#64748b" />
                  <Text style={styles.reminderTimeLabel}>Reminder Time</Text>
                </View>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowTimePicker(true)}
                  disabled={saving}
                >
                  <Text style={styles.timeButtonText}>
                    {preferences.reminder_time}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#64748b" />
                </TouchableOpacity>
              </View>
            )}

            {showTimePicker && (
              <DateTimePicker
                value={getReminderTimeDate()}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={handleTimeChange}
              />
            )}
          </Card>

          {/* Info Card */}
          <Card style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Ionicons
                name="information-circle"
                size={20}
                color="#3b82f6"
              />
            </View>
            <Text style={styles.infoText}>
              Notifications help you stay on track with your quests. You can
              change these settings anytime.
            </Text>
          </Card>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0fdf4",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#166534",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  descriptionCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    alignItems: "center",
  },
  descriptionHeader: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#166534",
    marginBottom: 8,
    textAlign: "center",
  },
  descriptionText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
  },
  reminderTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
  },
  reminderTimeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reminderTimeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#166534",
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  infoIconContainer: {
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#1e40af",
    lineHeight: 18,
  },
  bottomPadding: {
    height: 20,
  },
})
