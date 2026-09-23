"use client"

import { useAuth } from "@/hooks/useAuth"
import {
    ingredientService,
    type StarterIngredientGroup,
} from "@/services/ingredientService"
import { settingsService } from "@/services/settingsService"
import { userService } from "@/services/userService"
import {
    ACTIVITY_LEVELS,
    calculateCalorieGoal,
    type ActivityLevel,
} from "@/utils/calorieGoal"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useRef, useState } from "react"
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

// Components
import Button from "@/components/Button"
import Card from "@/components/Card"

// Each option carries a short description so the choice is self-explanatory
// without the user having to guess what a bare label means. The `label` is what
// gets stored, so these strings must stay in sync with any downstream logic that
// keys off them (e.g. calculateCalorieGoal).
interface Option {
  label: string
  description: string
}

// Selecting this clears the other health goals (and vice versa): it's the "none
// of these" answer, so it can't coexist with a specific goal.
const NO_SPECIFIC_GOAL = "Just exploring for now"

const HEALTH_GOALS: Option[] = [
  {
    label: "Lose weight",
    description: "Lighter meals with a lower calorie target",
  },
  {
    label: "Gain muscle",
    description: "Higher-protein meals and a bigger calorie target",
  },
  {
    label: "Maintain weight",
    description: "Balanced meals to stay where you are",
  },
  {
    label: "Improve energy",
    description: "Steady, nourishing meals through the day",
  },
  { label: "Eat healthier", description: "More whole foods, less processed" },
  {
    label: "Manage a health condition",
    description: "Cook around dietary needs like diabetes or blood pressure",
  },
  {
    label: NO_SPECIFIC_GOAL,
    description: "No particular goal, I just want to browse and cook",
  },
]

const DIETARY_PREFERENCES: Option[] = [
  { label: "No restrictions", description: "I eat a bit of everything" },
  { label: "Vegetarian", description: "No meat or fish" },
  { label: "Vegan", description: "No animal products at all" },
  { label: "Pescatarian", description: "Fish and seafood, but no other meat" },
  { label: "Keto", description: "Very low carb, high fat" },
  { label: "Paleo", description: "Whole foods, no grains or dairy" },
  {
    label: "Mediterranean",
    description: "Veggies, fish, olive oil, whole grains",
  },
  { label: "Low-carb", description: "Fewer carbs, without going full keto" },
]

const COOKING_FREQUENCY: Option[] = [
  {
    label: "Almost every day",
    description: "Cooking is part of my daily routine",
  },
  {
    label: "A few times a week",
    description: "3 to 5 home-cooked meals a week",
  },
  { label: "About once a week", description: "Usually a weekend cook" },
  { label: "Rarely", description: "I'm just getting started with cooking" },
  { label: "It varies", description: "No set routine, it depends on the week" },
]

const FOOD_RESTRICTIONS: Option[] = [
  { label: "None", description: "Nothing to avoid" },
  { label: "Gluten", description: "Wheat, barley, rye" },
  { label: "Dairy", description: "Milk, cheese, butter, cream" },
  { label: "Nuts", description: "Peanuts and tree nuts" },
  { label: "Soy", description: "Soybeans, tofu, soy sauce" },
  { label: "Eggs", description: "Whole eggs and egg-based ingredients" },
  { label: "Shellfish", description: "Shrimp, crab, clams, and similar" },
]

export default function OnboardingScreen() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [preferences, setPreferences] = useState({
    healthGoals: [] as string[],
    dietaryPreferences: [] as string[],
    cookingFrequency: "",
    foodRestrictions: [] as string[],
  })
  // Activity level is stored by id (e.g. "moderately_active") and lives outside
  // the generic `preferences` map because its options are rendered with a label
  // that differs from the stored value.
  const [activityLevel, setActivityLevel] =
    useState<ActivityLevel>("moderately_active")

  const steps = [
    {
      title: "What do you want to get out of cooking?",
      subtitle:
        "Pick any that apply. We'll aim your recipe suggestions and calorie goal at these.",
      options: HEALTH_GOALS,
      key: "healthGoals" as keyof typeof preferences,
      multiple: true,
    },
    {
      title: "How do you eat?",
      subtitle:
        "Choose the styles that fit you. Recipes that clash with these get filtered out. Pick more than one if they overlap.",
      options: DIETARY_PREFERENCES,
      key: "dietaryPreferences" as keyof typeof preferences,
      multiple: true,
    },
    {
      title: "How often do you cook?",
      subtitle:
        "Be honest, there's no wrong answer. We'll set challenge lengths and reminders to match.",
      options: COOKING_FREQUENCY,
      key: "cookingFrequency" as keyof typeof preferences,
      multiple: false,
    },
    {
      title: "Anything you need to avoid?",
      subtitle:
        "Pick any allergies or intolerances and we'll keep those ingredients out of your recommendations.",
      options: FOOD_RESTRICTIONS,
      key: "foodRestrictions" as keyof typeof preferences,
      multiple: true,
    },
  ]

  // The activity and pantry steps sit after the preference questions. They can't
  // live in `steps`: activity stores an id that differs from its label, and the
  // pantry options come from the database and are identified by id.
  const ACTIVITY_STEP_INDEX = steps.length
  const PANTRY_STEP_INDEX = steps.length + 1
  const totalSteps = steps.length + 2
  const isActivityStep = currentStep === ACTIVITY_STEP_INDEX
  const isPantryStep = currentStep === PANTRY_STEP_INDEX
  const isLastStep = currentStep === totalSteps - 1

  const [pantryGroups, setPantryGroups] = useState<StarterIngredientGroup[]>([])
  const [isLoadingPantry, setIsLoadingPantry] = useState(false)
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>(
    [],
  )
  // Guards against duplicate fetches without putting the loading flag in the
  // effect's dependencies, which would make the effect re-run on its own state
  // change, cancel its own in-flight request, and hang on the spinner forever.
  const pantryRequestedRef = useRef(false)

  const loadPantryOptions = useCallback(async () => {
    pantryRequestedRef.current = true
    setIsLoadingPantry(true)

    try {
      const groups = await ingredientService.getStarterIngredients()
      setPantryGroups(groups)

      // Allow another attempt if we came back with nothing.
      if (groups.length === 0) pantryRequestedRef.current = false
    } finally {
      setIsLoadingPantry(false)
    }
  }, [])

  // Fetch the starter list once, when the user first reaches the pantry step.
  useEffect(() => {
    if (!isPantryStep || pantryRequestedRef.current) return

    loadPantryOptions()
  }, [isPantryStep, loadPantryOptions])

  const toggleIngredient = (ingredientId: string) => {
    setSelectedIngredientIds((previous) =>
      previous.includes(ingredientId)
        ? previous.filter((id) => id !== ingredientId)
        : [...previous, ingredientId],
    )
  }

  const currentStepData = steps[currentStep]

  const toggleOption = (option: string) => {
    const key = currentStepData.key

    if (currentStepData.multiple) {
      const currentArray = preferences[key] as string[]
      if (currentArray.includes(option)) {
        setPreferences((prev) => ({
          ...prev,
          [key]: currentArray.filter((item) => item !== option),
        }))
      } else if (key === "healthGoals" && option === NO_SPECIFIC_GOAL) {
        // The catch-all is exclusive: picking it discards any specific goals.
        setPreferences((prev) => ({ ...prev, [key]: [option] }))
      } else if (key === "healthGoals") {
        // Picking a specific goal drops the catch-all if it was selected.
        setPreferences((prev) => ({
          ...prev,
          [key]: [
            ...currentArray.filter((item) => item !== NO_SPECIFIC_GOAL),
            option,
          ],
        }))
      } else {
        setPreferences((prev) => ({
          ...prev,
          [key]: [...currentArray, option],
        }))
      }
    } else {
      setPreferences((prev) => ({
        ...prev,
        [key]: option,
      }))
    }
  }

  const isOptionSelected = (option: string) => {
    const key = currentStepData.key
    if (currentStepData.multiple) {
      return (preferences[key] as string[]).includes(option)
    } else {
      return preferences[key] === option
    }
  }

  const canProceed = () => {
    const key = currentStepData.key
    if (currentStepData.multiple) {
      // Always allow proceeding for multiple selection steps
      return true
    } else {
      // Always allow proceeding - users can skip any step
      return true
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out? Your progress will be saved.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await signOut()
            router.replace("/")
          },
        },
      ],
    )
  }

  // The preference columns written to `users`, shared by the create/update paths.
  const profilePreferenceFields = () => ({
    health_goals: preferences.healthGoals,
    dietary_preferences: preferences.dietaryPreferences,
    cooking_frequency: preferences.cookingFrequency,
    food_restrictions: preferences.foodRestrictions,
    onboarding_completed: true,
  })

  /**
   * Mirror the collected preferences into `user_settings`.
   *
   * This matters more than it looks: the recommendation engine filters on
   * `user_settings.dietary_restrictions` (recommendationService.calculateUserPreferenceScore
   * and recipeService.getRecommendations), NOT on `users.food_restrictions`. Without
   * this write, the restrictions a user picks here have no effect on what we
   * recommend until they separately open Settings and save.
   */
  const persistSettings = async (userId: string) => {
    // Activity level now feeds the target alongside the user's goals, so a very
    // active user and a sedentary one with the same goal get different numbers.
    const initialCalorieGoal = calculateCalorieGoal(
      preferences.healthGoals,
      activityLevel,
    )

    // "None" is a UI affordance meaning "no restrictions". Persisting it verbatim
    // would have the engine try to match a literal "none" tag against recipes.
    const dietaryRestrictions = preferences.foodRestrictions.filter(
      (restriction) => restriction !== "None",
    )

    console.log("🔑 Onboarding: Saving settings", {
      initialCalorieGoal,
      activityLevel,
      dietaryRestrictions,
    })

    const settings = await settingsService.upsertUserSettings(userId, {
      daily_calorie_target: initialCalorieGoal,
      activity_level: activityLevel,
      dietary_restrictions: dietaryRestrictions,
    })

    if (!settings) {
      // Non-fatal: the profile is already saved and onboarding_completed is set, so
      // don't trap the user here. They can correct these in Settings.
      console.warn(
        "🔑 Onboarding: Settings could not be saved; continuing anyway",
      )
    }

    return settings
  }

  /**
   * Seed the pantry with whatever staples the user ticked.
   *
   * Recommendations are scored partly on how much of a recipe the user already
   * has, so an empty pantry means every recipe shows a 0% ingredient match and
   * nothing is ever flagged "Ready to Cook". Seeding even a handful of staples
   * makes the first home screen meaningful. Non-fatal: the pantry is editable
   * from the Ingredients tab afterwards.
   */
  const persistPantry = async (userId: string) => {
    if (selectedIngredientIds.length === 0) return

    const added = await ingredientService.addUserIngredients(
      userId,
      selectedIngredientIds,
    )

    if (added === 0) {
      console.warn(
        "🔑 Onboarding: Pantry could not be seeded; continuing anyway",
      )
      return
    }

    console.log("🔑 Onboarding: Seeded pantry with", added, "ingredients")
  }

  const handleComplete = async () => {
    if (!user) {
      Alert.alert("Error", "User not found. Please try logging in again.")
      return
    }

    console.log("🔑 Onboarding: Completing onboarding process...")
    setIsLoading(true)

    try {
      // Check if profile already exists
      const existingProfile = await userService.getProfile(user.id)

      let profile
      if (existingProfile) {
        console.log("🔑 Onboarding: Updating existing profile")
        profile = await userService.updateProfile(
          user.id,
          profilePreferenceFields(),
        )
      } else {
        console.log("🔑 Onboarding: Creating new profile")
        profile = await userService.createProfile({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || "",
          username: user.user_metadata?.username || null,
          ...profilePreferenceFields(),
        })
      }

      // A failed insert may simply mean the row already existed (the profile could
      // have been created by another path between the read and the write), so fall
      // back to an update before giving up.
      if (!profile) {
        console.log(
          "🔑 Onboarding: Save returned no profile, retrying as update",
        )
        profile = await userService.updateProfile(
          user.id,
          profilePreferenceFields(),
        )
      }

      if (profile) {
        console.log("🔑 Onboarding: Profile saved successfully")
        await Promise.all([persistSettings(user.id), persistPantry(user.id)])
        router.replace("/(tabs)?startTutorial=true")
      } else {
        console.log("🔑 Onboarding: Failed to save profile")
        Alert.alert(
          "Error",
          "Failed to save your preferences. Please try again.",
        )
        setIsLoading(false)
      }
    } catch (error: any) {
      console.error("Error completing onboarding:", error)

      // 23505 is Postgres unique_violation: the profile row already exists.
      if (error?.message?.includes("duplicate") || error?.code === "23505") {
        console.log("🔑 Onboarding: Profile already exists, updating instead")
        try {
          const profile = await userService.updateProfile(
            user.id,
            profilePreferenceFields(),
          )

          if (profile) {
            await Promise.all([
              persistSettings(user.id),
              persistPantry(user.id),
            ])
            router.replace("/(tabs)?startTutorial=true")
            return
          }
        } catch (updateError) {
          console.error("Failed to update profile:", updateError)
        }
      }

      Alert.alert("Error", "Something went wrong. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <LinearGradient colors={["#dcfce7", "#f0fdf4"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          {currentStep > 0 ? (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#166534" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.backButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            </TouchableOpacity>
          )}
          <View style={styles.progressContainer}>
            <Text style={styles.stepText}>
              Step {currentStep + 1} of {totalSteps}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((currentStep + 1) / totalSteps) * 100}%` },
                ]}
              />
            </View>
          </View>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {isPantryStep ? (
            <Card style={styles.questionCard}>
              <Text style={styles.title}>What&rsquo;s in your kitchen?</Text>
              <Text style={styles.subtitle}>
                Tick the staples you usually have. We use these to show you
                recipes you can cook right now, and you can edit the list
                anytime.
              </Text>

              {isLoadingPantry ? (
                <View style={styles.pantryLoading}>
                  <ActivityIndicator size="small" color="#22c55e" />
                  <Text style={styles.pantryLoadingText}>
                    Loading common ingredients...
                  </Text>
                </View>
              ) : pantryGroups.length === 0 ? (
                <View style={styles.pantryEmpty}>
                  <Text style={styles.pantryLoadingText}>
                    We couldn&rsquo;t load ingredients right now. You can skip
                    this and add them from the Ingredients tab later.
                  </Text>
                  <Button
                    text="Try Again"
                    color="#22c55e"
                    backgroundColor="transparent"
                    outline="#22c55e"
                    onPress={loadPantryOptions}
                    style={styles.pantryRetryButton}
                  />
                </View>
              ) : (
                <>
                  {pantryGroups.map((group) => (
                    <View key={group.category} style={styles.pantryGroup}>
                      <Text style={styles.pantryGroupTitle}>
                        {group.category}
                      </Text>
                      <View style={styles.pantryGrid}>
                        {group.ingredients.map((ingredient) => {
                          const selected = selectedIngredientIds.includes(
                            ingredient.id,
                          )

                          return (
                            <TouchableOpacity
                              key={ingredient.id}
                              style={[
                                styles.pantryChip,
                                selected && styles.pantryChipSelected,
                              ]}
                              onPress={() => toggleIngredient(ingredient.id)}
                            >
                              <Ionicons
                                name={
                                  selected
                                    ? "checkmark-circle"
                                    : "add-circle-outline"
                                }
                                size={16}
                                color={selected ? "#166534" : "#94a3b8"}
                              />
                              <Text
                                style={[
                                  styles.pantryChipText,
                                  selected && styles.pantryChipTextSelected,
                                ]}
                              >
                                {ingredient.name}
                              </Text>
                            </TouchableOpacity>
                          )
                        })}
                      </View>
                    </View>
                  ))}
                  <Text style={styles.pantryCount}>
                    {selectedIngredientIds.length === 0
                      ? "Nothing selected yet"
                      : `${selectedIngredientIds.length} selected`}
                  </Text>
                </>
              )}
            </Card>
          ) : isActivityStep ? (
            <Card style={styles.questionCard}>
              <Text style={styles.title}>How active are you?</Text>
              <Text style={styles.subtitle}>
                We use this with your goals to set a daily calorie target and to
                tune whether we suggest lighter or heartier meals.
              </Text>

              <View style={styles.optionsContainer}>
                {ACTIVITY_LEVELS.map((level) => {
                  const selected = activityLevel === level.id

                  return (
                    <TouchableOpacity
                      key={level.id}
                      style={[
                        styles.optionButton,
                        selected && styles.optionButtonSelected,
                      ]}
                      onPress={() => setActivityLevel(level.id)}
                    >
                      <View style={styles.optionContent}>
                        <View style={styles.optionTextGroup}>
                          <Text
                            style={[
                              styles.optionText,
                              selected && styles.optionTextSelected,
                            ]}
                          >
                            {level.label}
                          </Text>
                          <Text style={styles.optionDescription}>
                            {level.description}
                          </Text>
                        </View>
                        {selected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#22c55e"
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </Card>
          ) : (
            <Card style={styles.questionCard}>
              <Text style={styles.title}>{currentStepData.title}</Text>
              <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>

              <View style={styles.optionsContainer}>
                {currentStepData.options.map((option) => {
                  const selected = isOptionSelected(option.label)

                  return (
                    <TouchableOpacity
                      key={option.label}
                      style={[
                        styles.optionButton,
                        selected && styles.optionButtonSelected,
                      ]}
                      onPress={() => toggleOption(option.label)}
                    >
                      <View style={styles.optionContent}>
                        <View style={styles.optionTextGroup}>
                          <Text
                            style={[
                              styles.optionText,
                              selected && styles.optionTextSelected,
                            ]}
                          >
                            {option.label}
                          </Text>
                          <Text style={styles.optionDescription}>
                            {option.description}
                          </Text>
                        </View>
                        {selected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#22c55e"
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </Card>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            text={
              isLoading
                ? "Setting up..."
                : isLastStep
                  ? "Complete Setup"
                  : "Next"
            }
            color="white"
            backgroundColor="#22c55e"
            onPress={handleNext}
            disabled={isLoading}
            style={styles.nextButton}
          />

          {/* Skip button for all steps except the last one */}
          {!isLastStep && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleNext}
              disabled={isLoading}
            >
              {/* On multi-select question steps this is a real answer ("none
                  apply"), not dodging. The pantry and activity steps (which
                  have a default) keep a plain "Skip for now". */}
              <Text style={styles.skipButtonText}>
                {isPantryStep || isActivityStep
                  ? "Skip for now"
                  : "None of these apply"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  progressContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  stepText: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 12,
    fontWeight: "600",
  },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#22c55e",
    borderRadius: 3,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  questionCard: {
    padding: 20,
    marginTop: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#166534",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  optionsContainer: {
    gap: 14,
  },
  optionButton: {
    backgroundColor: "#f9fafb",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 18,
    minHeight: 60,
    justifyContent: "center",
  },
  optionButtonSelected: {
    backgroundColor: "#dcfce7",
    borderColor: "#22c55e",
  },
  // The pantry step offers many more options than the preference steps, so it uses
  // category-grouped wrapping chip grids rather than full-width rows.
  pantryGroup: {
    marginBottom: 20,
  },
  pantryGroupTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#166534",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  pantryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pantryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f9fafb",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: 44,
  },
  pantryChipSelected: {
    backgroundColor: "#dcfce7",
    borderColor: "#22c55e",
  },
  pantryChipText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  pantryChipTextSelected: {
    color: "#166534",
  },
  pantryCount: {
    marginTop: 16,
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
    textAlign: "center",
  },
  pantryLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 20,
  },
  pantryLoadingText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  pantryEmpty: {
    paddingVertical: 12,
    gap: 16,
  },
  pantryRetryButton: {
    alignSelf: "center",
    minWidth: 160,
  },
  optionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionTextGroup: {
    flex: 1,
    marginRight: 12,
  },
  optionText: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "600",
    lineHeight: 20,
  },
  optionTextSelected: {
    color: "#166534",
    fontWeight: "700",
  },
  optionDescription: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    // The 100px bottom padding that used to live here existed only to clear a tab
    // bar that should never have rendered over onboarding. The root layout now
    // hides the tab bar and FAB inside the (auth) group.
    paddingBottom: 24,
  },
  nextButton: {
    marginBottom: 12,
    minHeight: 52,
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: 16,
  },
  skipButtonText: {
    fontSize: 15,
    color: "#64748b",
    fontWeight: "600",
  },
})
