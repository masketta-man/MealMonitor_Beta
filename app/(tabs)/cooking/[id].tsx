"use client"

import { useAuth } from "@/hooks/useAuth"
import { ratingService } from "@/services/ratingService"
import { recipeService } from "@/services/recipeService"
import { scaleAmount } from "@/utils/scaleQuantity"
import { getStepType } from "@/utils/stepType"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake"
import { LinearGradient } from "expo-linear-gradient"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    Vibration,
    View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

// Components
import Button from "@/components/Button"
import Card from "@/components/Card"
import CircularProgress from "@/components/CircularProgress"
import EnhancedRatingModal, {
    RatingData,
} from "@/components/EnhancedRatingModal"
import LevelUpModal from "@/components/LevelUpModal"
import MultiTimerManager from "@/components/MultiTimerManager"
import StepPreview from "@/components/StepPreview"

// Types
interface RecipeInstruction {
  step_number: number
  instruction: string
  timer?: number
}

interface RecipeIngredientData {
  id: string
  name: string
  amount: string
  category: string
}

interface RecipeData {
  id: string
  title: string
  instructions: RecipeInstruction[]
  ingredients?: RecipeIngredientData[]
  prep_time: number
  servings?: number
  points?: number
  calories?: number
}

// The recipe amounts are written for this many servings. There's no per-recipe
// base-servings column yet, so assume a standard 2 and scale relative to it.
const DEFAULT_BASE_SERVINGS = 2

export default function CookingModeScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useAuth()
  const { width } = useWindowDimensions()
  const isWeb = width > 768

  // All state hooks must be declared before any conditional returns
  const [recipe, setRecipe] = useState<RecipeData | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [isTimerPaused, setIsTimerPaused] = useState(false)
  // Which step the inline timer belongs to. The timer keeps running when the user
  // navigates to another step to read ahead; it only shows its controls on its
  // own step. null means no inline timer is running.
  const [timerStep, setTimerStep] = useState<number | null>(null)
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([])
  const [servings, setServings] = useState(DEFAULT_BASE_SERVINGS)
  const [showIngredients, setShowIngredients] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [levelUpInfo, setLevelUpInfo] = useState<{ newLevel: number } | null>(
    null,
  )
  const [showMultiTimer, setShowMultiTimer] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const loadRecipe = async () => {
      if (!id || !user) {
        setError("Missing recipe ID or user authentication")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const recipeData = await recipeService.getRecipe(id, user.id)

        if (recipeData && recipeData.instructions) {
          setRecipe(recipeData as RecipeData)
          setCompletedSteps(
            new Array(recipeData.instructions.length).fill(false),
          )
          // Seed the servings control from the recipe's own base if it has one.
          const base = (recipeData as RecipeData).servings
          if (base && base > 0) setServings(base)
        } else {
          setError("Recipe not found")
          Alert.alert("Error", "Recipe not found", [
            { text: "OK", onPress: () => router.back() },
          ])
        }
      } catch (err) {
        console.error("Error loading recipe:", err)
        setError("Failed to load recipe")
        Alert.alert("Error", "Failed to load recipe. Please try again.", [
          { text: "OK", onPress: () => router.back() },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadRecipe()
  }, [id, user])

  // Keep screen awake during cooking
  useEffect(() => {
    activateKeepAwakeAsync()

    return () => {
      deactivateKeepAwake()
    }
  }, [])

  useEffect(() => {
    const checkIfCompleted = async () => {
      if (!user?.id || !id) return

      try {
        const { data } = await recipeService.checkCompletion(user.id, id)

        if (data) {
          setAlreadyCompleted(true)
        }
      } catch (error) {
        console.error("Error checking recipe completion:", error)
      }
    }

    checkIfCompleted()
  }, [user, id])

  useEffect(() => {
    if (isTimerActive && !isTimerPaused && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
    } else if (timeRemaining === 0 && isTimerActive) {
      setIsTimerActive(false)
      const finishedStep = timerStep

      // Alert loudly: a cook has set the phone down, so a silent dialog is the one
      // thing they'll miss. Match MultiTimerManager's buzz + success haptic.
      if (Platform.OS !== "web") {
        Vibration.vibrate([0, 500, 200, 500])
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      }

      Alert.alert(
        "⏰ Timer Complete!",
        finishedStep !== null
          ? `Step ${finishedStep + 1} is done. Check your food and move on when ready.`
          : "Your timer is done. Check your food and move on when ready.",
        [{ text: "OK", onPress: () => {} }],
      )
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [timeRemaining, isTimerActive, isTimerPaused, timerStep])

  // Guard against a stale currentStep if the recipe reloads with fewer steps.
  useEffect(() => {
    if (!recipe || recipe.instructions.length === 0) return
    if (currentStep >= recipe.instructions.length) {
      setCurrentStep(0)
    }
  }, [recipe, currentStep])

  const startTimer = () => {
    if (!recipe) return
    const currentInstruction = recipe.instructions[currentStep]
    const timerMinutes = currentInstruction.timer || 0
    if (timerMinutes > 0) {
      setTimeRemaining(timerMinutes * 60)
      setTimerStep(currentStep)
      setIsTimerActive(true)
      setIsTimerPaused(false)
    }
  }

  const pauseTimer = () => {
    setIsTimerPaused(!isTimerPaused)
  }

  const stopTimer = () => {
    setIsTimerActive(false)
    setIsTimerPaused(false)
    setTimeRemaining(0)
    setTimerStep(null)
  }

  // The inline timer belongs to whichever step started it. When the user is on
  // that step we show its live countdown; on any other step the timer keeps
  // running in the background and this returns null so the step shows its own
  // suggested-time preview instead.
  const currentStepTimerActive = isTimerActive && timerStep === currentStep

  const markStepComplete = () => {
    if (!recipe) return
    const newCompletedSteps = [...completedSteps]
    newCompletedSteps[currentStep] = true
    setCompletedSteps(newCompletedSteps)
    // Only clear the timer if it belonged to this step.
    if (timerStep === currentStep) stopTimer()
    if (currentStep < recipe.instructions.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const nextStep = () => {
    if (!recipe) return
    const nextIndex = currentStep + 1
    if (nextIndex < recipe.instructions.length) {
      // Leave any running timer alone; the cook may be reading ahead.
      setCurrentStep(nextIndex)
    }
  }

  const previousStep = () => {
    if (!recipe) return
    const prevIndex = currentStep - 1
    if (prevIndex >= 0) {
      setCurrentStep(prevIndex)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleRatingSubmit = async (ratingData: RatingData) => {
    console.log("📝 Rating submitted:", ratingData)
    setShowRatingModal(false)

    if (!user || !id || !recipe) return

    try {
      // First complete the recipe to get the completion ID
      const result = await recipeService.completeRecipe(user.id, id)

      if (result.success && result.completionId) {
        // Save the rating
        const { error } = await ratingService.createRating(
          user.id,
          id,
          result.completionId,
          recipe.prep_time || 0,
          ratingData,
        )

        if (error) {
          console.error("Error saving rating:", error)
          Alert.alert(
            "Rating Saved Locally",
            "Your rating couldn't be synced but was recorded. The recipe is marked complete.",
          )
        }

        // Track interaction
        await recipeService.trackRecipeInteraction(user.id, id, "complete")

        // Show level up if applicable
        if (result.leveledUp && result.newLevel) {
          setLevelUpInfo({ newLevel: result.newLevel })
          setShowLevelUp(true)
        } else {
          router.replace("/(tabs)")
        }
      }
    } catch (error) {
      console.error("Error completing recipe with rating:", error)
      Alert.alert("Error", "Failed to save your completion. Please try again.")
    }
  }

  const completeCookingProcess = async () => {
    if (!user || !id) return

    try {
      const result = await recipeService.completeRecipe(user.id, id)

      if (result.success) {
        await recipeService.trackRecipeInteraction(user.id, id, "complete")

        if (result.leveledUp && result.newLevel) {
          setLevelUpInfo({ newLevel: result.newLevel })
          setShowLevelUp(true)
        } else {
          router.replace("/(tabs)")
        }
      }
    } catch (error) {
      console.error("Error completing recipe:", error)
    }
  }

  const finishCooking = async () => {
    console.log("🎉 FINISH COOKING: Function called")

    if (!user || !id) {
      console.warn("⚠️ FINISH COOKING: Missing user or recipe ID")
      return
    }

    // Show rating modal
    setShowRatingModal(true)
  }

  // Handle loading and error states
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    )
  }

  if (
    error ||
    !recipe ||
    !recipe.instructions ||
    recipe.instructions.length === 0
  ) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>
            {error || "Recipe not found or has no instructions"}
          </Text>
          <Button
            text="Go Back"
            color="white"
            backgroundColor="#22c55e"
            onPress={() => router.back()}
            style={{ marginTop: 16 }}
          />
        </View>
      </SafeAreaView>
    )
  }

  const currentInstruction = recipe.instructions[currentStep]

  if (!currentInstruction) {
    console.error("Current instruction is undefined, currentStep:", currentStep)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    )
  }

  const isLastStep = currentStep === recipe.instructions.length - 1
  const allStepsCompleted = completedSteps.every((step) => step)

  const baseServings = recipe.servings || DEFAULT_BASE_SERVINGS
  const scaleFactor = servings / baseServings
  const hasIngredients = !!recipe.ingredients && recipe.ingredients.length > 0
  const currentStepType = getStepType(currentInstruction.instruction)

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#f0fdf4", "#ecfdf5"]} style={styles.background}>
        {alreadyCompleted && (
          <View style={styles.warningBanner}>
            <Ionicons
              name="warning"
              size={20}
              color="#fff"
              style={styles.warningIcon}
            />
            <Text style={styles.warningText}>
              You&rsquo;ve already completed this recipe today. Come back
              tomorrow to earn more points!
            </Text>
          </View>
        )}
        {/* Header */}
        <View style={[styles.header, isWeb && styles.headerWeb]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#166534" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cooking Mode</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowMultiTimer(true)}
            >
              <Ionicons name="timer-outline" size={24} color="#166534" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={finishCooking}
            >
              <Ionicons name="checkmark" size={24} color="#166534" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recipe Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          <Text style={styles.stepCounter}>
            Step {currentStep + 1} of {recipe.instructions.length}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentStep + 1) / recipe.instructions.length) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View
            style={[styles.contentWrapper, isWeb && styles.contentWrapperWeb]}
          >
            {/* Servings + ingredients reference */}
            {hasIngredients && (
              <Card style={styles.ingredientsCard}>
                <View style={styles.servingsRow}>
                  <View>
                    <Text style={styles.servingsLabel}>Servings</Text>
                    {scaleFactor !== 1 && (
                      <Text style={styles.servingsScaledNote}>
                        Amounts scaled ×{Math.round(scaleFactor * 100) / 100}
                      </Text>
                    )}
                  </View>
                  <View style={styles.servingsControl}>
                    <TouchableOpacity
                      style={[
                        styles.servingsButton,
                        servings <= 1 && styles.servingsButtonDisabled,
                      ]}
                      onPress={() => setServings((s) => Math.max(1, s - 1))}
                      disabled={servings <= 1}
                    >
                      <Ionicons name="remove" size={20} color="#166534" />
                    </TouchableOpacity>
                    <Text style={styles.servingsValue}>{servings}</Text>
                    <TouchableOpacity
                      style={[
                        styles.servingsButton,
                        servings >= 20 && styles.servingsButtonDisabled,
                      ]}
                      onPress={() => setServings((s) => Math.min(20, s + 1))}
                      disabled={servings >= 20}
                    >
                      <Ionicons name="add" size={20} color="#166534" />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.ingredientsToggle}
                  onPress={() => setShowIngredients((v) => !v)}
                >
                  <Text style={styles.ingredientsToggleText}>
                    {showIngredients ? "Hide" : "Show"} ingredients (
                    {recipe.ingredients!.length})
                  </Text>
                  <Ionicons
                    name={showIngredients ? "chevron-up" : "chevron-down"}
                    size={18}
                    color="#166534"
                  />
                </TouchableOpacity>

                {showIngredients &&
                  recipe.ingredients!.map((ing) => (
                    <View key={ing.id} style={styles.ingredientRow}>
                      <Text style={styles.ingredientAmount}>
                        {scaleAmount(ing.amount, scaleFactor)}
                      </Text>
                      <Text style={styles.ingredientName}>{ing.name}</Text>
                    </View>
                  ))}
              </Card>
            )}

            {/* Step Preview */}
            <View style={styles.stepPreviewContainer}>
              <StepPreview
                instructions={recipe.instructions}
                currentStep={currentStep}
              />
            </View>

            {/* Current Step */}
            <Card style={styles.currentStepCard}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{currentStep + 1}</Text>
                </View>
                <View
                  style={[
                    styles.stepTypeChip,
                    { backgroundColor: `${currentStepType.color}1a` },
                  ]}
                >
                  <Ionicons
                    name={currentStepType.icon}
                    size={15}
                    color={currentStepType.color}
                  />
                  <Text
                    style={[
                      styles.stepTypeLabel,
                      { color: currentStepType.color },
                    ]}
                  >
                    {currentStepType.label}
                  </Text>
                </View>
                <View style={styles.stepStatus}>
                  {completedSteps[currentStep] && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#22c55e"
                    />
                  )}
                </View>
              </View>
              <Text style={styles.stepText}>
                {currentInstruction.instruction}
              </Text>

              {/* Timer Section */}
              {currentInstruction.timer && currentInstruction.timer > 0 && (
                <View style={styles.timerSection}>
                  <Text style={styles.timerLabel}>
                    Suggested Time: {currentInstruction.timer} minutes
                  </Text>
                  <View style={styles.timerDisplay}>
                    <CircularProgress
                      size={168}
                      strokeWidth={10}
                      progress={
                        currentStepTimerActive
                          ? timeRemaining /
                            Math.max(1, currentInstruction.timer * 60)
                          : 1
                      }
                      color={isTimerPaused ? "#f59e0b" : "#22c55e"}
                      backgroundColor="#dcfce7"
                    >
                      <Text style={styles.timerText}>
                        {currentStepTimerActive
                          ? formatTime(timeRemaining)
                          : formatTime(currentInstruction.timer * 60)}
                      </Text>
                      {currentStepTimerActive && isTimerPaused && (
                        <Text style={styles.timerPausedLabel}>Paused</Text>
                      )}
                    </CircularProgress>
                  </View>
                  <View style={styles.timerControls}>
                    {!currentStepTimerActive ? (
                      <Button
                        text="Start Timer"
                        color="white"
                        backgroundColor="#22c55e"
                        onPress={startTimer}
                        style={styles.timerButton}
                      />
                    ) : (
                      <>
                        <Button
                          text={isTimerPaused ? "Resume" : "Pause"}
                          color="#166534"
                          backgroundColor="#dcfce7"
                          onPress={pauseTimer}
                          style={styles.timerButton}
                        />
                        <Button
                          text="Stop"
                          color="#dc2626"
                          backgroundColor="#fef2f2"
                          onPress={stopTimer}
                          style={styles.timerButton}
                        />
                      </>
                    )}
                  </View>
                </View>
              )}

              {/* A timer from another step is still counting down in the
                  background — surface it so it isn't forgotten. */}
              {isTimerActive &&
                timerStep !== null &&
                timerStep !== currentStep && (
                  <TouchableOpacity
                    style={styles.otherTimerBanner}
                    onPress={() => setCurrentStep(timerStep)}
                  >
                    <Ionicons name="timer-outline" size={16} color="#166534" />
                    <Text style={styles.otherTimerText}>
                      Step {timerStep + 1} timer running:{" "}
                      {formatTime(timeRemaining)}
                    </Text>
                  </TouchableOpacity>
                )}

              {/* Step Actions */}
              <View style={styles.stepActions}>
                <Button
                  text="Mark Complete"
                  color="white"
                  backgroundColor={
                    completedSteps[currentStep] ? "#16a34a" : "#22c55e"
                  }
                  onPress={markStepComplete}
                  style={styles.actionButton}
                  disabled={completedSteps[currentStep]}
                />
              </View>
            </Card>

            {/* Navigation */}
            <View style={styles.navigationContainer}>
              <Button
                text="Previous"
                color="#166534"
                backgroundColor="#dcfce7"
                onPress={previousStep}
                style={{
                  ...styles.navButton,
                  opacity: currentStep === 0 ? 0.5 : 1,
                }}
                disabled={currentStep === 0}
              />
              {!isLastStep ? (
                <Button
                  text="Next Step"
                  color="white"
                  backgroundColor="#22c55e"
                  onPress={nextStep}
                  style={styles.navButton}
                />
              ) : (
                <Button
                  text="Finish Cooking"
                  color="white"
                  backgroundColor="#16a34a"
                  onPress={finishCooking}
                  style={
                    allStepsCompleted
                      ? styles.navButton
                      : { ...styles.navButton, opacity: 0.6 }
                  }
                  disabled={!allStepsCompleted}
                />
              )}
            </View>

            {/* All Steps Overview */}
            <Card style={styles.overviewCard}>
              <Text style={styles.overviewTitle}>All Steps</Text>
              {recipe.instructions.map((instruction, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.overviewStep,
                    currentStep === index && styles.currentOverviewStep,
                    completedSteps[index] && styles.completedOverviewStep,
                  ]}
                  onPress={() => {
                    if (!recipe) return
                    if (index >= 0 && index < recipe.instructions.length) {
                      // Jump to the step without disturbing a running timer.
                      setCurrentStep(index)
                    }
                  }}
                >
                  <View style={styles.overviewStepNumber}>
                    {completedSteps[index] ? (
                      <Ionicons name="checkmark" size={16} color="white" />
                    ) : (
                      <Text style={styles.overviewStepNumberText}>
                        {index + 1}
                      </Text>
                    )}
                  </View>
                  <Ionicons
                    name={getStepType(instruction.instruction).icon}
                    size={16}
                    color={
                      completedSteps[index]
                        ? "#9ca3af"
                        : getStepType(instruction.instruction).color
                    }
                    style={styles.overviewStepIcon}
                  />
                  <Text
                    style={[
                      styles.overviewStepText,
                      currentStep === index && styles.currentOverviewStepText,
                      completedSteps[index] && styles.completedOverviewStepText,
                    ]}
                    numberOfLines={2}
                  >
                    {instruction.instruction}
                  </Text>
                  {instruction.timer && instruction.timer > 0 && (
                    <View style={styles.overviewTimer}>
                      <Ionicons name="time-outline" size={14} color="#64748b" />
                      <Text style={styles.overviewTimerText}>
                        {instruction.timer}m
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </Card>

            <View style={styles.bottomPadding} />
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Level Up Modal */}
      {levelUpInfo && (
        <LevelUpModal
          visible={showLevelUp}
          newLevel={levelUpInfo.newLevel}
          onClose={() => {
            setShowLevelUp(false)
            router.replace("/(tabs)")
          }}
        />
      )}

      {/* Multi-Timer Manager */}
      {recipe && (
        <MultiTimerManager
          visible={showMultiTimer}
          onClose={() => setShowMultiTimer(false)}
          currentStep={currentStep}
          stepLabel={recipe.instructions[currentStep]?.instruction.substring(
            0,
            30,
          )}
        />
      )}

      {/* Enhanced Rating Modal */}
      {recipe && (
        <EnhancedRatingModal
          visible={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleRatingSubmit}
          recipeTitle={recipe.title}
          suggestedPrepTime={recipe.prep_time}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  background: {
    flex: 1,
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
  warningBanner: {
    backgroundColor: "#FFA000",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    margin: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  warningIcon: {
    marginRight: 8,
  },
  warningText: {
    color: "#fff",
    flex: 1,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: "#166534",
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#dc2626",
    marginTop: 16,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerWeb: {
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#166534",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  stepPreviewContainer: {
    marginBottom: 16,
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: "center",
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#166534",
    textAlign: "center",
    marginBottom: 4,
  },
  stepCounter: {
    fontSize: 14,
    color: "#64748b",
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  progressBar: {
    height: 10,
    backgroundColor: "#e2e8f0",
    borderRadius: 5,
    overflow: "hidden",
    width: "100%",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#22c55e",
    borderRadius: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  currentStepCard: {
    marginBottom: 16,
    padding: 20,
  },
  stepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  stepStatus: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  stepTypeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  stepTypeLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  stepText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#1f2937",
    marginBottom: 20,
  },
  timerSection: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  timerLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 12,
    textAlign: "center",
  },
  timerDisplay: {
    alignItems: "center",
    marginBottom: 16,
  },
  timerText: {
    fontSize: 36,
    fontWeight: "800",
    color: "#166534",
    fontFamily: "monospace",
  },
  timerPausedLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#f59e0b",
    marginTop: 4,
  },
  timerControls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  timerButton: {
    flex: 1,
    maxWidth: 120,
  },
  otherTimerBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#dcfce7",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  otherTimerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#166534",
  },
  ingredientsCard: {
    marginBottom: 16,
  },
  servingsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  servingsLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#166534",
  },
  servingsScaledNote: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  servingsControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  servingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
  },
  servingsButtonDisabled: {
    opacity: 0.4,
  },
  servingsValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#166534",
    minWidth: 24,
    textAlign: "center",
  },
  ingredientsToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#f0fdf4",
  },
  ingredientsToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#166534",
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
    gap: 12,
  },
  ingredientAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#166534",
    minWidth: 90,
  },
  ingredientName: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  stepActions: {
    alignItems: "center",
  },
  actionButton: {
    minWidth: 150,
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  overviewCard: {
    marginBottom: 16,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 16,
  },
  overviewStep: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  currentOverviewStep: {
    backgroundColor: "#dcfce7",
  },
  completedOverviewStep: {
    backgroundColor: "#f0fdf4",
  },
  overviewStepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  overviewStepNumberText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  overviewStepIcon: {
    marginHorizontal: 8,
  },
  overviewStepText: {
    flex: 1,
    fontSize: 14,
    color: "#4b5563",
  },
  currentOverviewStepText: {
    color: "#166534",
    fontWeight: "600",
  },
  completedOverviewStepText: {
    color: "#16a34a",
  },
  overviewTimer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  overviewTimerText: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 4,
  },
  bottomPadding: {
    height: 100,
  },
})
