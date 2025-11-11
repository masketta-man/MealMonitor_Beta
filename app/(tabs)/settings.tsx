import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, useWindowDimensions, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useAuth } from "@/hooks/useAuth"
import { settingsService, type UserSettings, type UserSettingsUpdate } from "@/services/settingsService"
import { userService } from "@/services/userService"
import Card from "@/components/Card"
import Button from "@/components/Button"
import { useTutorial } from "@/contexts/TutorialContext"
import { APP_TUTORIAL_STEPS } from "@/constants/tutorialSteps"

// Migration map for old restriction IDs to new consistent format
const RESTRICTION_ID_MAP: Record<string, string> = {
  'gluten': 'gluten-free',
  'dairy': 'dairy-free',
  'nuts': 'nut-free',
  'soy': 'soy-free',
  'eggs': 'egg-free',
  'shellfish': 'shellfish-free',
}

const DIETARY_RESTRICTIONS = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'pescatarian', label: 'Pescatarian' },
  { id: 'omnivore', label: 'Omnivore' },
  { id: 'keto', label: 'Keto' },
  { id: 'paleo', label: 'Paleo' },
  { id: 'mediterranean', label: 'Mediterranean' },
  { id: 'low-carb', label: 'Low-Carb' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'dairy-free', label: 'Dairy-Free' },
  { id: 'nut-free', label: 'Nut-Free' },
  { id: 'soy-free', label: 'Soy-Free' },
  { id: 'egg-free', label: 'Egg-Free' },
  { id: 'shellfish-free', label: 'Shellfish-Free' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Kosher' },
]

const WEIGHT_GOALS = [
  { id: 'lose_weight', label: 'Lose Weight', icon: 'trending-down' },
  { id: 'maintain_weight', label: 'Maintain Weight', icon: 'remove' },
  { id: 'gain_weight', label: 'Gain Weight', icon: 'trending-up' },
]

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
  { id: 'lightly_active', label: 'Lightly Active', description: 'Exercise 1-3 times/week' },
  { id: 'moderately_active', label: 'Moderately Active', description: 'Exercise 3-5 times/week' },
  { id: 'very_active', label: 'Very Active', description: 'Exercise 6-7 times/week' },
  { id: 'extremely_active', label: 'Extremely Active', description: 'Physical job or training twice/day' },
]

export default function SettingsScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { width } = useWindowDimensions()
  const isWeb = width > 768
  const { startTutorial } = useTutorial()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [calorieTarget, setCalorieTarget] = useState("2000")
  const [weightGoal, setWeightGoal] = useState<string>("maintain_weight")
  const [activityLevel, setActivityLevel] = useState<string>("moderately_active")
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      loadSettings()
    }
  }, [user])

  const loadSettings = async () => {
    if (!user) return

    try {
      setLoading(true)

      const [userSettings, userProfile] = await Promise.all([
        settingsService.getOrCreateSettings(user.id),
        userService.getProfile(user.id)
      ])

      if (userSettings) {
        setSettings(userSettings)
        setCalorieTarget(userSettings.daily_calorie_target.toString())
        setWeightGoal(userSettings.weight_goal)
        setActivityLevel(userSettings.activity_level)

        // Migrate old restriction IDs to new consistent format
        let restrictions = (userSettings.dietary_restrictions || []).map(r => RESTRICTION_ID_MAP[r] || r)

        if (userProfile?.dietary_preferences && Array.isArray(userProfile.dietary_preferences)) {
          const normalizedPreferences = userProfile.dietary_preferences.map((pref: string) =>
            pref.toLowerCase().replace(/\s+/g, '-')
          )
          restrictions = [...new Set([...restrictions, ...normalizedPreferences])]
        }

        if (userProfile?.food_restrictions && Array.isArray(userProfile.food_restrictions)) {
          const normalizedRestrictions = userProfile.food_restrictions
            .filter((r: string) => r.toLowerCase() !== 'none')
            .map((r: string) => {
              const normalized = r.toLowerCase().replace(/\s+/g, '-')
              // Migrate old IDs to new consistent format
              return RESTRICTION_ID_MAP[normalized] || normalized
            })
          restrictions = [...new Set([...restrictions, ...normalizedRestrictions])]
        }

        // Final deduplication to ensure no duplicates
        setSelectedRestrictions([...new Set(restrictions)])
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleRestriction = (restrictionId: string) => {
    setSelectedRestrictions(prev =>
      prev.includes(restrictionId)
        ? prev.filter(id => id !== restrictionId)
        : [...prev, restrictionId]
    )
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setSaving(true)

      const updates: UserSettingsUpdate = {
        daily_calorie_target: parseInt(calorieTarget) || 2000,
        weight_goal: weightGoal as UserSettings['weight_goal'],
        activity_level: activityLevel as UserSettings['activity_level'],
        dietary_restrictions: selectedRestrictions,
      }

      const dietaryPrefs = selectedRestrictions.filter(r =>
        ['vegetarian', 'vegan', 'pescatarian', 'omnivore', 'keto', 'paleo', 'mediterranean', 'low-carb'].includes(r)
      )

      const foodRestrictions = selectedRestrictions.filter(r =>
        ['gluten-free', 'dairy-free', 'nut-free', 'soy-free', 'egg-free', 'shellfish-free', 'halal', 'kosher'].includes(r)
      )

      const [updatedSettings] = await Promise.all([
        settingsService.updateUserSettings(user.id, updates),
        userService.updateProfile(user.id, {
          dietary_preferences: dietaryPrefs.length > 0 ? dietaryPrefs : selectedRestrictions,
          food_restrictions: foodRestrictions.length > 0 ? foodRestrictions : [],
        })
      ])

      if (updatedSettings) {
        setSettings(updatedSettings)

        if (Platform.OS === 'web') {
          alert('Settings saved successfully!')
        }
        router.back()
      } else {
        if (Platform.OS === 'web') {
          alert('Failed to save settings. Please try again.')
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      if (Platform.OS === 'web') {
        alert('An error occurred while saving settings.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <LinearGradient colors={["#dcfce7", "#f0fdf4"]} style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading settings...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={["#dcfce7", "#f0fdf4"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={[styles.header, isWeb && styles.headerWeb]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#166534" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.contentWrapper, isWeb && styles.contentWrapperWeb]}>
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>Personal Goals</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Daily Calorie Target</Text>
                <TextInput
                  style={styles.input}
                  value={calorieTarget}
                  onChangeText={setCalorieTarget}
                  keyboardType="numeric"
                  placeholder="2000"
                  placeholderTextColor="#94a3b8"
                />
                <Text style={styles.inputHint}>Recommended: 1500-2500 calories/day</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight Goal</Text>
                <View style={styles.optionsContainer}>
                  {WEIGHT_GOALS.map((goal) => (
                    <TouchableOpacity
                      key={goal.id}
                      style={[
                        styles.optionButton,
                        weightGoal === goal.id && styles.optionButtonActive,
                      ]}
                      onPress={() => setWeightGoal(goal.id)}
                    >
                      <Ionicons
                        name={goal.icon as keyof typeof Ionicons.glyphMap}
                        size={20}
                        color={weightGoal === goal.id ? "#22c55e" : "#64748b"}
                      />
                      <Text
                        style={[
                          styles.optionText,
                          weightGoal === goal.id && styles.optionTextActive,
                        ]}
                      >
                        {goal.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Card>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Activity Level</Text>
            {ACTIVITY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.activityOption,
                  activityLevel === level.id && styles.activityOptionActive,
                ]}
                onPress={() => setActivityLevel(level.id)}
              >
                <View style={styles.activityOptionContent}>
                  <View
                    style={[
                      styles.radioButton,
                      activityLevel === level.id && styles.radioButtonActive,
                    ]}
                  >
                    {activityLevel === level.id && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <View style={styles.activityOptionText}>
                    <Text
                      style={[
                        styles.activityOptionLabel,
                        activityLevel === level.id && styles.activityOptionLabelActive,
                      ]}
                    >
                      {level.label}
                    </Text>
                    <Text style={styles.activityOptionDescription}>
                      {level.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </Card>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Dietary Restrictions</Text>
            <Text style={styles.sectionSubtitle}>
              Select any dietary restrictions or preferences
            </Text>
            <View style={styles.restrictionsContainer}>
              {DIETARY_RESTRICTIONS.map((restriction) => (
                <TouchableOpacity
                  key={restriction.id}
                  style={[
                    styles.restrictionChip,
                    selectedRestrictions.includes(restriction.id) &&
                      styles.restrictionChipActive,
                  ]}
                  onPress={() => toggleRestriction(restriction.id)}
                >
                  <Text
                    style={[
                      styles.restrictionChipText,
                      selectedRestrictions.includes(restriction.id) &&
                        styles.restrictionChipTextActive,
                    ]}
                  >
                    {restriction.label}
                  </Text>
                  {selectedRestrictions.includes(restriction.id) && (
                    <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>App Tutorial</Text>
            <Text style={styles.sectionSubtitle}>
              Replay the guided tour to learn about the app features
            </Text>
            <TouchableOpacity
              style={styles.tutorialButton}
              onPress={() => {
                router.back()
                setTimeout(() => {
                  startTutorial(APP_TUTORIAL_STEPS)
                }, 500)
              }}
            >
              <View style={styles.tutorialButtonContent}>
                <Ionicons name="play-circle" size={24} color="#22c55e" />
                <Text style={styles.tutorialButtonText}>Restart Tutorial</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#64748b" />
            </TouchableOpacity>
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              text={saving ? 'Saving...' : 'Save Settings'}
              color="white"
              backgroundColor="#22c55e"
              onPress={handleSave}
              disabled={saving}
              style={styles.saveButton}
            />
          </View>

            <View style={styles.bottomPadding} />
          </View>
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
  headerWeb: {
    paddingHorizontal: 24,
  },
  contentWrapper: {
    width: "100%",
  },
  contentWrapperWeb: {
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#166534",
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#166534",
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
  },
  inputGroup: {
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1e293b",
  },
  inputHint: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
  },
  optionsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  optionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 6,
  },
  optionButtonActive: {
    backgroundColor: "#dcfce7",
    borderColor: "#22c55e",
  },
  optionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  optionTextActive: {
    color: "#166534",
  },
  activityOption: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  activityOptionActive: {
    backgroundColor: "#dcfce7",
    borderColor: "#22c55e",
  },
  activityOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonActive: {
    borderColor: "#22c55e",
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22c55e",
  },
  activityOptionText: {
    flex: 1,
  },
  activityOptionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 2,
  },
  activityOptionLabelActive: {
    color: "#166534",
  },
  activityOptionDescription: {
    fontSize: 12,
    color: "#64748b",
  },
  restrictionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  restrictionChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  restrictionChipActive: {
    backgroundColor: "#dcfce7",
    borderColor: "#22c55e",
  },
  restrictionChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748b",
  },
  restrictionChipTextActive: {
    color: "#166534",
  },
  buttonContainer: {
    marginTop: 8,
  },
  saveButton: {
    width: "100%",
  },
  tutorialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  tutorialButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tutorialButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#166534",
  },
  bottomPadding: {
    height: 100,
  },
})
