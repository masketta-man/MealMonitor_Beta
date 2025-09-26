"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"

// Components
import Card from "@/components/Card"
import Button from "@/components/Button"

// Types
type Instruction = {
  text: string;
  timer: number;
};

type Recipe = {
  id: string;
  title: string;
  instructions: Instruction[];
  prepTime: string;
};

// No need for RecipeId type since we're using Record<string, Recipe>

// Mock recipe data (same as recipe detail)
const MOCK_RECIPES: Record<string, Recipe> = {
  "1": {
    id: "1",
    title: "Avocado & Egg Toast",
    instructions: [
      { text: "Toast the bread slices until golden and crispy.", timer: 3 },
      { text: "In a small pan, fry the eggs to your liking (sunny side up recommended).", timer: 4 },
      { text: "Mash the avocado in a bowl and add lemon juice, salt, and pepper.", timer: 2 },
      { text: "Spread the mashed avocado on the toast.", timer: 1 },
      { text: "Place the fried egg on top of the avocado.", timer: 1 },
      { text: "Slice cherry tomatoes in half and arrange them around the egg.", timer: 2 },
      { text: "Sprinkle with red pepper flakes if desired.", timer: 0 },
      { text: "Serve immediately and enjoy!", timer: 0 },
    ],
    prepTime: "15 min",
  },
  "2": {
    id: "2",
    title: "Mediterranean Salad",
    instructions: [
      { text: "Chop the romaine lettuce and place in a large bowl.", timer: 3 },
      { text: "Dice the cucumber, tomatoes, and red onion.", timer: 5 },
      { text: "Slice the olives in half.", timer: 2 },
      { text: "Crumble the feta cheese.", timer: 1 },
      { text: "Add all vegetables and cheese to the bowl with lettuce.", timer: 1 },
      { text: "Slice the grilled chicken breast and add to the salad.", timer: 3 },
      { text: "In a small bowl, whisk together olive oil, lemon juice, oregano, salt, and pepper.", timer: 2 },
      { text: "Pour the dressing over the salad and toss gently to combine.", timer: 1 },
      { text: "Serve immediately or chill for 30 minutes to let flavors meld.", timer: 0 },
    ],
    prepTime: "20 min",
  },
  "3": {
    id: "3",
    title: "Vegetable Stir Fry",
    instructions: [
      { text: "Press tofu to remove excess water, then cut into cubes.", timer: 5 },
      { text: "Chop all vegetables into bite-sized pieces.", timer: 8 },
      { text: "Heat oil in a wok or large pan over high heat.", timer: 2 },
      { text: "Add tofu and cook until golden brown on all sides.", timer: 6 },
      { text: "Remove tofu and set aside.", timer: 1 },
      { text: "Add garlic and ginger to the pan and stir for 30 seconds.", timer: 1 },
      { text: "Add vegetables and stir-fry for 5-7 minutes until tender-crisp.", timer: 7 },
      { text: "Return tofu to the pan and add soy sauce.", timer: 1 },
      { text: "Stir everything together and cook for another 2 minutes.", timer: 2 },
      { text: "Drizzle with sesame oil and sprinkle with green onions.", timer: 1 },
      { text: "Serve hot over rice or noodles.", timer: 0 },
    ],
    prepTime: "25 min",
  },
}

export default function CookingModeScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  
  if (!recipe) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading recipe...</Text>
      </View>
    )
  }
  const [currentStep, setCurrentStep] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [isTimerPaused, setIsTimerPaused] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (id && id in MOCK_RECIPES) {
      const recipeData = MOCK_RECIPES[id];
      setRecipe(recipeData);
      setCompletedSteps(new Array(recipeData.instructions.length).fill(false));
    }
  }, [id])

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
    const currentInstruction = recipe.instructions[currentStep]
    if (currentInstruction.timer > 0) {
      setTimeRemaining(currentInstruction.timer * 60) // Convert minutes to seconds
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

  const finishCooking = () => {
    Alert.alert("Cooking Complete!", "Congratulations! You've finished cooking this recipe. Enjoy your meal!", [
      {
        text: "Back to Recipe",
        onPress: () => router.back(),
      },
      {
        text: "Rate Recipe",
        onPress: () => {
          // Navigate to rating screen or show rating modal
          router.back()
        },
      },
    ])
  }

  if (!recipe) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading recipe...</Text>
      </View>
    )
  }

  const currentInstruction = recipe.instructions[currentStep]
  const isLastStep = currentStep === recipe.instructions.length - 1
  const allStepsCompleted = completedSteps.every((step) => step)

  return (
    <LinearGradient colors={["#dcfce7", "#f0fdf4"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
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
            <Text style={styles.stepText}>{currentInstruction.text}</Text>

            {/* Timer Section */}
            {currentInstruction.timer > 0 && (
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
                  {instruction.text}
                </Text>
                {instruction.timer > 0 && (
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
      </SafeAreaView>
    </LinearGradient>
  );
};

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
