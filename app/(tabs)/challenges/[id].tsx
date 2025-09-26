"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"

// Components
import Card from "@/components/Card"
import Badge from "@/components/Badge"
import Button from "@/components/Button"
import ProgressBar from "@/components/ProgressBar"
import NutritionChart from "@/components/NutritionChart"

// Define Challenge type
interface Challenge {
  id: string
  title: string
  description: string
  longDescription?: string
  progress: number
  total: number
  reward: number
  daysLeft: number
  color: string
  bgColor: string
  icon: string
  startDate?: string
  endDate?: string
  category?: string
  participants?: number
  tasks?: {
    id: number
    title: string
    completed: boolean
    date?: string
  }[]
  relatedRecipes?: {
    id: string
    title: string
    image: string
    difficulty: string
    prepTime: string
  }[]
  nutritionGoals?: {
    protein: number
    carbs: number
    fat: number
  }
}

// Mock data for challenges
const MOCK_CHALLENGES: Record<string, Challenge> = {
  "1": {
    id: "1",
    title: "Veggie Week",
    description: "Eat 5 vegetable-based meals this week",
    longDescription:
      "Challenge yourself to incorporate more vegetables into your diet by preparing and consuming 5 vegetable-based meals this week. This challenge will help you discover new recipes, increase your nutrient intake, and develop healthier eating habits.",
    progress: 3,
    total: 5,
    reward: 200,
    daysLeft: 4,
    color: "#a855f7",
    bgColor: "#f3e8ff",
    icon: "leaf",
    startDate: "May 18, 2023",
    endDate: "May 25, 2023",
    category: "Nutrition",
    participants: 245,
    tasks: [
      { id: 1, title: "Prepare a vegetable salad", completed: true, date: "May 18, 2023" },
      { id: 2, title: "Cook a vegetable stir-fry", completed: true, date: "May 19, 2023" },
      { id: 3, title: "Make a vegetable soup", completed: true, date: "May 20, 2023" },
      { id: 4, title: "Prepare a vegetable curry", completed: false },
      { id: 5, title: "Create a vegetable pasta dish", completed: false },
    ],
    relatedRecipes: [
      {
        id: "3",
        title: "Vegetable Stir Fry",
        image:
          "https://images.unsplash.com/photo-1532550907401-a500c9a57435?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        difficulty: "Intermediate",
        prepTime: "25 min",
      },
      {
        id: "5",
        title: "Quinoa Bowl",
        image:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        difficulty: "Intermediate",
        prepTime: "25 min",
      },
    ],
    nutritionGoals: {
      protein: 15,
      carbs: 60,
      fat: 25,
    },
  },
  "2": {
    id: "2",
    title: "Protein Power",
    description: "Prepare 3 high-protein meals with at least 25g of protein",
    longDescription:
      "Boost your protein intake by preparing 3 meals that each contain at least 25g of protein. This challenge will help you build and maintain muscle mass, support recovery after workouts, and keep you feeling fuller for longer.",
    progress: 1,
    total: 3,
    reward: 150,
    daysLeft: 5,
    color: "#3b82f6",
    bgColor: "#dbeafe",
    icon: "fitness",
    startDate: "May 20, 2023",
    endDate: "May 27, 2023",
    category: "Fitness",
    participants: 189,
    tasks: [
      { id: 1, title: "Cook a high-protein breakfast", completed: true, date: "May 20, 2023" },
      { id: 2, title: "Prepare a protein-rich lunch", completed: false },
      { id: 3, title: "Make a high-protein dinner", completed: false },
    ],
    relatedRecipes: [
      {
        id: "6",
        title: "Grilled Salmon",
        image:
          "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        difficulty: "Advanced",
        prepTime: "30 min",
      },
      {
        id: "2",
        title: "Mediterranean Salad",
        image:
          "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        difficulty: "Intermediate",
        prepTime: "20 min",
      },
    ],
    nutritionGoals: {
      protein: 40,
      carbs: 35,
      fat: 25,
    },
  },
}

export default function ChallengeDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const [challenge, setChallenge] = useState<Challenge | null>(null)

  useEffect(() => {
    if (id && MOCK_CHALLENGES[id as string]) {
      setChallenge(MOCK_CHALLENGES[id as string])
    }
  }, [id])

  const toggleTaskCompletion = (taskId: number) => {
    if (!challenge) return

    const updatedTasks = challenge.tasks?.map((task) =>
      task.id === taskId
        ? { ...task, completed: !task.completed, date: !task.completed ? new Date().toLocaleDateString() : undefined }
        : task,
    )

    const completedTasksCount = updatedTasks?.filter((task) => task.completed).length || 0

    setChallenge({
      ...challenge,
      tasks: updatedTasks,
      progress: completedTasksCount,
    })
  }

  const navigateToRecipe = (recipeId: string) => {
    router.push(`/(tabs)/recipe/${recipeId}`)
  }

  if (!challenge) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading challenge...</Text>
      </View>
    )
  }

  return (
    <LinearGradient colors={["#dcfce7", "#f0fdf4"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#166534" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="share-social-outline" size={24} color="#166534" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Challenge Header */}
          <View style={styles.challengeHeaderContainer}>
            <View style={[styles.iconContainer, { backgroundColor: challenge.bgColor }]}>
              <Ionicons name={challenge.icon as any} size={40} color={challenge.color} />
            </View>
            <Text style={styles.challengeTitle}>{challenge.title}</Text>
            <Badge
              text={challenge.category || "Challenge"}
              color={challenge.color}
              backgroundColor={challenge.bgColor}
            />
          </View>

          {/* Challenge Progress */}
          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Your Progress</Text>
              <Badge text={`${challenge.daysLeft} days left`} color="#f97316" backgroundColor="#ffedd5" />
            </View>

            <View style={styles.progressBarContainer}>
              <ProgressBar
                progress={challenge.progress / challenge.total}
                colors={[challenge.color, challenge.color]}
                height={12}
              />
              <Text style={[styles.progressText, { color: challenge.color }]}>
                {challenge.progress}/{challenge.total} completed
              </Text>
            </View>

            <View style={styles.rewardContainer}>
              <Ionicons name="trophy" size={20} color="#f59e0b" />
              <Text style={styles.rewardText}>{challenge.reward} XP Reward upon completion</Text>
            </View>
          </Card>

          {/* Challenge Description */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>About This Challenge</Text>
            <Text style={styles.descriptionText}>{challenge.longDescription || challenge.description}</Text>

            <View style={styles.challengeMetaContainer}>
              <View style={styles.challengeMetaItem}>
                <Ionicons name="calendar-outline" size={16} color="#64748b" />
                <Text style={styles.challengeMetaText}>
                  {challenge.startDate} - {challenge.endDate}
                </Text>
              </View>
              <View style={styles.challengeMetaItem}>
                <Ionicons name="people-outline" size={16} color="#64748b" />
                <Text style={styles.challengeMetaText}>{challenge.participants} participants</Text>
              </View>
            </View>
          </Card>

          {/* Challenge Tasks */}
          {challenge.tasks && (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Challenge Tasks</Text>

              {challenge.tasks.map((task) => (
                <TouchableOpacity key={task.id} style={styles.taskItem} onPress={() => toggleTaskCompletion(task.id)}>
                  <View
                    style={[
                      styles.taskCheckbox,
                      task.completed ? { backgroundColor: challenge.color, borderColor: challenge.color } : {},
                    ]}
                  >
                    {task.completed && <Ionicons name="checkmark" size={16} color="white" />}
                  </View>
                  <View style={styles.taskContent}>
                    <Text
                      style={[
                        styles.taskTitle,
                        task.completed ? { textDecorationLine: "line-through", color: "#9ca3af" } : {},
                      ]}
                    >
                      {task.title}
                    </Text>
                    {task.completed && task.date && <Text style={styles.taskDate}>Completed on {task.date}</Text>}
                  </View>
                </TouchableOpacity>
              ))}
            </Card>
          )}

          {/* Nutrition Goals */}
          {challenge.nutritionGoals && (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Nutrition Goals</Text>
              <Text style={styles.nutritionDescription}>
                Aim for this macronutrient distribution in your meals for this challenge:
              </Text>

              <NutritionChart
                protein={challenge.nutritionGoals.protein}
                carbs={challenge.nutritionGoals.carbs}
                fat={challenge.nutritionGoals.fat}
              />
            </Card>
          )}

          {/* Related Recipes */}
          {challenge.relatedRecipes && (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Recommended Recipes</Text>
              <Text style={styles.recipesDescription}>These recipes will help you complete this challenge:</Text>

              <View style={styles.recipesContainer}>
                {challenge.relatedRecipes.map((recipe) => (
                  <TouchableOpacity
                    key={recipe.id}
                    style={styles.recipeCard}
                    onPress={() => navigateToRecipe(recipe.id)}
                  >
                    <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
                    <View style={styles.recipeInfo}>
                      <Text style={styles.recipeTitle}>{recipe.title}</Text>
                      <View style={styles.recipeMetaContainer}>
                        <View style={styles.recipeMeta}>
                          <Ionicons name="time-outline" size={14} color="#64748b" />
                          <Text style={styles.recipeMetaText}>{recipe.prepTime}</Text>
                        </View>
                        <Badge
                          text={recipe.difficulty}
                          color={
                            recipe.difficulty === "Beginner"
                              ? "#166534"
                              : recipe.difficulty === "Intermediate"
                                ? "#9a3412"
                                : "#7e22ce"
                          }
                          backgroundColor={
                            recipe.difficulty === "Beginner"
                              ? "#dcfce7"
                              : recipe.difficulty === "Intermediate"
                                ? "#ffedd5"
                                : "#f3e8ff"
                          }
                          small
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          )}

          {/* Action Button */}
          <View style={styles.actionButtonContainer}>
            <Button
              text="Share Progress"
              color="white"
              backgroundColor={challenge.color}
              onPress={() => alert("Sharing functionality coming soon!")}
            />
          </View>

          {/* Bottom padding */}
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
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerActions: {
    flexDirection: "row",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  challengeHeaderContainer: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  challengeTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 12,
  },
  progressCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 8,
  },
  rewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    padding: 12,
    borderRadius: 8,
  },
  rewardText: {
    fontSize: 14,
    color: "#92400e",
    marginLeft: 8,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#4b5563",
    marginBottom: 16,
  },
  challengeMetaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  challengeMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  challengeMetaText: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 6,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: "#1e293b",
    marginBottom: 4,
  },
  taskDate: {
    fontSize: 12,
    color: "#64748b",
  },
  nutritionDescription: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 16,
  },
  recipesDescription: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 16,
  },
  recipesContainer: {
    gap: 12,
  },
  recipeCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recipeImage: {
    width: 100,
    height: 100,
  },
  recipeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  recipeMetaContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  recipeMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  recipeMetaText: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 4,
  },
  actionButtonContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  bottomPadding: {
    height: 100,
  },
})
