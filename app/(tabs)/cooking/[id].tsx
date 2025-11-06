"use client"

import { useAuth } from "@/hooks/useAuth"
import { recipeService } from "@/services/recipeService"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

// Components
import Button from "@/components/Button"
import Card from "@/components/Card"

// Types
interface RecipeInstruction {
  step_number: number;
  instruction: string;
  timer?: number;
}

interface RecipeData {
  id: string;
  title: string;
  instructions: RecipeInstruction[];
  prep_time: number;
}

export default function CookingModeScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useAuth()
  
  // All state hooks must be declared before any conditional returns
  const [recipe, setRecipe] = useState<RecipeData | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [isTimerPaused, setIsTimerPaused] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const loadRecipe = async () => {
      if (!id || !user) {
        setError('Missing recipe ID or user authentication')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const recipeData = await recipeService.getRecipe(id, user.id)
        
        if (recipeData && recipeData.instructions) {
          setRecipe(recipeData as RecipeData)
          setCompletedSteps(new Array(recipeData.instructions.length).fill(false))
        } else {
          setError('Recipe not found')
          Alert.alert('Error', 'Recipe not found', [
            { text: 'OK', onPress: () => router.back() }
          ])
        }
      } catch (err) {
        console.error('Error loading recipe:', err)
        setError('Failed to load recipe')
        Alert.alert('Error', 'Failed to load recipe. Please try again.', [
          { text: 'OK', onPress: () => router.back() }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadRecipe()
  }, [id, user])

  useEffect(() => {
    const checkIfCompleted = async () => {
      if (!user?.id || !id) return

      try {
        const { data } = await recipeService.checkCompletion(user.id, id)

        if (data) {
          setAlreadyCompleted(true)
        }
      } catch (error) {
        console.error('Error checking recipe completion:', error)
      } finally {
        setIsLoading(false)
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
      Alert.alert(
        "Timer Complete!",
        `Step ${currentStep + 1} is done. Check your food and move to the next step when ready.`,
        [{ text: "OK", onPress: () => {} }],
      )
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [timeRemaining, isTimerActive, isTimerPaused, currentStep])

  const startTimer = () => {
    if (!recipe) return
    const currentInstruction = recipe.instructions[currentStep]
    const timerMinutes = currentInstruction.timer || 0
    if (timerMinutes > 0) {
      setTimeRemaining(timerMinutes * 60) // Convert minutes to seconds
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
  }

  const markStepComplete = () => {
    const newCompletedSteps = [...completedSteps]
    newCompletedSteps[currentStep] = true
    setCompletedSteps(newCompletedSteps)
    stopTimer()
  }

  const nextStep = () => {
    if (!recipe) return
    if (currentStep < recipe.instructions.length - 1) {
      setCurrentStep(currentStep + 1)
      stopTimer()
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      stopTimer()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const finishCooking = async () => {
    console.log('🎉 FINISH COOKING: Function called')
    console.log('🎉 FINISH COOKING: User ID:', user?.id)
    console.log('🎉 FINISH COOKING: Recipe ID:', id)

    if (!user || !id) {
      console.warn('⚠️ FINISH COOKING: Missing user or recipe ID - aborting')
      console.log('⚠️ FINISH COOKING: User exists?', !!user)
      console.log('⚠️ FINISH COOKING: Recipe ID exists?', !!id)
      return
    }

    try {
      console.log('🎉 FINISH COOKING: Calling recipeService.completeRecipe...')
      const success = await recipeService.completeRecipe(user.id, id)
      console.log('🎉 FINISH COOKING: recipeService.completeRecipe returned:', success)

      if (success) {
        console.log('✅ FINISH COOKING: Recipe completed successfully!')

        if (Platform.OS === 'web') {
          // Web platform - navigate immediately with simple alert
          if (alreadyCompleted) {
            console.log('🎉 FINISH COOKING: Already completed - navigating immediately')
            router.replace("/(tabs)")
            alert("Great job! You've cooked this recipe again today. Points were already awarded for your first completion.")
          } else {
            console.log('🎉 FINISH COOKING: First completion today - navigating to dashboard')
            router.replace("/(tabs)")
            alert("Congratulations! You've earned points and XP. Check your profile to see your progress!")
          }
        } else {
          // Native platform - use Alert.alert with buttons
          if (alreadyCompleted) {
            console.log('🎉 FINISH COOKING: Already completed - navigating immediately')
            router.replace("/(tabs)")
            Alert.alert(
              "Cooking Complete!",
              "Great job! You've cooked this recipe again today. Points were already awarded for your first completion."
            )
          } else {
            console.log('🎉 FINISH COOKING: First completion today - showing alert then navigating')
            Alert.alert(
              "Recipe Completed!",
              "Congratulations! You've earned points and XP. Check your profile to see your progress!",
              [
                {
                  text: "View Profile",
                  onPress: () => {
                    console.log('🎉 FINISH COOKING: Navigating to profile')
                    router.replace("/(tabs)/profile")
                  },
                },
                {
                  text: "Back to Dashboard",
                  onPress: () => {
                    console.log('🎉 FINISH COOKING: Navigating to dashboard')
                    router.replace("/(tabs)")
                  },
                },
              ]
            )
          }
        }
      } else {
        console.error('❌ FINISH COOKING: Failed to complete recipe')
        if (Platform.OS === 'web') {
          router.replace("/(tabs)")
          alert("There was an issue completing the recipe. Please try again.")
        } else {
          Alert.alert(
            "Oops!",
            "There was an issue completing the recipe. Please try again.",
            [
              {
                text: "OK",
                onPress: () => {
                  console.log('❌ FINISH COOKING: Navigating back after failure')
                  router.replace("/(tabs)")
                },
              },
            ]
          )
        }
      }
    } catch (error) {
      console.error('❌ FINISH COOKING: Error completing recipe:', error)
      console.error('❌ FINISH COOKING: Error details:', JSON.stringify(error, null, 2))
      if (Platform.OS === 'web') {
        router.replace("/(tabs)")
        alert("An unexpected error occurred. Please try again.")
      } else {
        Alert.alert("Error", "An unexpected error occurred. Please try again.", [
          {
            text: "OK",
            onPress: () => {
              console.log('🎉 FINISH COOKING: Error case - going to dashboard')
              router.replace("/(tabs)")
            },
          },
        ])
      }
    }
  }

  // Handle loading and error states
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    )
  }

  if (error || !recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error || 'Recipe not found'}</Text>
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
  const isLastStep = currentStep === recipe.instructions.length - 1
  const allStepsCompleted = completedSteps.every((step) => step)

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f0fdf4', '#ecfdf5']}
        style={styles.background}
      >
        {alreadyCompleted && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={20} color="#fff" style={styles.warningIcon} />
            <Text style={styles.warningText}>
              You've already completed this recipe today. Come back tomorrow to earn more points!
            </Text>
          </View>
        )}
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#166534" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cooking Mode</Text>
          <TouchableOpacity style={styles.headerButton} onPress={finishCooking}>
            <Ionicons name="checkmark" size={24} color="#166534" />
          </TouchableOpacity>
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
              style={[styles.progressFill, { width: `${((currentStep + 1) / recipe.instructions.length) * 100}%` }]}
            />
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Current Step */}
          <Card style={styles.currentStepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{currentStep + 1}</Text>
              </View>
              <View style={styles.stepStatus}>
                {completedSteps[currentStep] && <Ionicons name="checkmark-circle" size={24} color="#22c55e" />}
              </View>
            </View>
            <Text style={styles.stepText}>{currentInstruction.instruction}</Text>

            {/* Timer Section */}
            {currentInstruction.timer && currentInstruction.timer > 0 && (
              <View style={styles.timerSection}>
                <Text style={styles.timerLabel}>Suggested Time: {currentInstruction.timer} minutes</Text>
                <View style={styles.timerDisplay}>
                  <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
                </View>
                <View style={styles.timerControls}>
                  {!isTimerActive ? (
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

            {/* Step Actions */}
            <View style={styles.stepActions}>
              <Button
                text="Mark Complete"
                color="white"
                backgroundColor={completedSteps[currentStep] ? "#16a34a" : "#22c55e"}
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
                style={styles.navButton}
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
                  setCurrentStep(index);
                  stopTimer();
                }}
              >
                <View style={styles.overviewStepNumber}>
                  {completedSteps[index] ? (
                    <Ionicons name="checkmark" size={16} color="white" />
                  ) : (
                    <Text style={styles.overviewStepNumberText}>{index + 1}</Text>
                  )}
                </View>
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
                    <Text style={styles.overviewTimerText}>{instruction.timer}m</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </Card>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  background: {
    flex: 1,
  },
  warningBanner: {
    backgroundColor: '#FFA000',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    margin: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  warningIcon: {
    marginRight: 8,
  },
  warningText: {
    color: '#fff',
    flex: 1,
    fontWeight: '500',
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
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
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
  // loadingContainer is defined above in the styles object
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
    fontSize: 48,
    fontWeight: "800",
    color: "#166534",
    fontFamily: "monospace",
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
