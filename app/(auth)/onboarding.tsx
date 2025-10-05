"use client"

import { useAuth } from "@/hooks/useAuth"
import { userService } from "@/services/userService"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

// Components
import Button from "@/components/Button"
import Card from "@/components/Card"

const HEALTH_GOALS = [
  "Lose weight",
  "Gain muscle",
  "Maintain weight",
  "Improve energy",
  "Better nutrition",
  "Manage health condition",
]

const DIETARY_PREFERENCES = [
  "Omnivore",
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Keto",
  "Paleo",
  "Mediterranean",
  "Low-carb",
]

const COOKING_FREQUENCY = [
  "Daily",
  "4-5 times a week",
  "2-3 times a week",
  "Once a week",
  "Rarely",
]

const FOOD_RESTRICTIONS = [
  "None",
  "Gluten",
  "Dairy",
  "Nuts",
  "Soy",
  "Eggs",
  "Shellfish",
  "Other allergies",
]

export default function OnboardingScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [preferences, setPreferences] = useState({
    healthGoals: [] as string[],
    dietaryPreferences: [] as string[],
    cookingFrequency: "",
    foodRestrictions: [] as string[],
  })

  const steps = [
    {
      title: "What are your health goals?",
      subtitle: "Select all that apply to personalize your experience",
      options: HEALTH_GOALS,
      key: "healthGoals" as keyof typeof preferences,
      multiple: true,
    },
    {
      title: "What's your dietary preference?",
      subtitle: "This helps us recommend suitable recipes",
      options: DIETARY_PREFERENCES,
      key: "dietaryPreferences" as keyof typeof preferences,
      multiple: true,
    },
    {
      title: "How often do you cook?",
      subtitle: "This helps us tailor challenges to your lifestyle",
      options: COOKING_FREQUENCY,
      key: "cookingFrequency" as keyof typeof preferences,
      multiple: false,
    },
    {
      title: "Any food restrictions?",
      subtitle: "We'll make sure to avoid these in recommendations",
      options: FOOD_RESTRICTIONS,
      key: "foodRestrictions" as keyof typeof preferences,
      multiple: true,
    },
  ]

  const currentStepData = steps[currentStep]

  const toggleOption = (option: string) => {
    const key = currentStepData.key
    
    if (currentStepData.multiple) {
      const currentArray = preferences[key] as string[]
      if (currentArray.includes(option)) {
        setPreferences(prev => ({
          ...prev,
          [key]: currentArray.filter(item => item !== option)
        }))
      } else {
        setPreferences(prev => ({
          ...prev,
          [key]: [...currentArray, option]
        }))
      }
    } else {
      setPreferences(prev => ({
        ...prev,
        [key]: option
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
    if (currentStep < steps.length - 1) {
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

  const handleComplete = async () => {
    if (!user) {
      Alert.alert("Error", "User not found. Please try logging in again.")
      return
    }

    console.log('🔑 Onboarding: Completing onboarding process...')
    setIsLoading(true)
    
    try {
      const profile = await userService.createProfile({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || "",
        username: user.user_metadata?.username || null,
        health_goals: preferences.healthGoals,
        dietary_preferences: preferences.dietaryPreferences,
        cooking_frequency: preferences.cookingFrequency,
        food_restrictions: preferences.foodRestrictions,
        onboarding_completed: true,
      })

      if (profile) {
        console.log('🔑 Onboarding: Profile created successfully')
        // The root layout will automatically redirect when onboarding is complete
      } else {
        console.log('🔑 Onboarding: Failed to create profile')
        Alert.alert("Error", "Failed to save your preferences. Please try again.")
      }
    } catch (error) {
      console.error("Error completing onboarding:", error)
      Alert.alert("Error", "Something went wrong. Please try again.")
    }
    
    setIsLoading(false)
  }

  return (
    <LinearGradient colors={["#dcfce7", "#f0fdf4"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#166534" />
            </TouchableOpacity>
          )}
          <View style={styles.progressContainer}>
            <Text style={styles.stepText}>
              Step {currentStep + 1} of {steps.length}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((currentStep + 1) / steps.length) * 100}%` }
                ]}
              />
            </View>
          </View>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={styles.questionCard}>
            <Text style={styles.title}>{currentStepData.title}</Text>
            <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>

            <View style={styles.optionsContainer}>
              {currentStepData.options.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    isOptionSelected(option) && styles.optionButtonSelected
                  ]}
                  onPress={() => toggleOption(option)}
                >
                  <View style={styles.optionContent}>
                    <Text
                      style={[
                        styles.optionText,
                        isOptionSelected(option) && styles.optionTextSelected
                      ]}
                    >
                      {option}
                    </Text>
                    {isOptionSelected(option) && (
                      <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            text={
              isLoading
                ? "Setting up..."
                : currentStep === steps.length - 1
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
          {currentStep < steps.length - 1 && (
            <TouchableOpacity 
              style={styles.skipButton} 
              onPress={handleNext}
              disabled={isLoading}
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
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
  optionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionText: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "600",
    flex: 1,
    marginRight: 12,
    lineHeight: 20,
  },
  optionTextSelected: {
    color: "#166534",
    fontWeight: "700",
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 32,
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