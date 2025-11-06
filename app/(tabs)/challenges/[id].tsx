import { useState, useEffect, useCallback } from "react"
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router"

// Components
import Card from "@/components/Card"
import Badge from "@/components/Badge"
import Button from "@/components/Button"
import ProgressBar from "@/components/ProgressBar"
import NutritionChart from "@/components/NutritionChart"

// Hooks and Services
import { useAuth } from "@/hooks/useAuth"
import { challengeService, ChallengeWithDetails } from "@/services/challengeService"

// Task completion status interface
interface TaskStatus {
  [taskId: string]: boolean
}


export default function ChallengeDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const { user } = useAuth()
  const [challenge, setChallenge] = useState<ChallengeWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completingTask, setCompletingTask] = useState(false)

  const fetchChallenge = useCallback(async () => {
    if (!id || !user) {
      setLoading(false)
      return
    }

    try {
      setError(null)
      const challengeData = await challengeService.getChallenge(id as string, user.id)
      
      if (challengeData) {
        // Ensure user has started this challenge
        if (!challengeData.userProgress) {
          await challengeService.startChallenge(user.id, id as string)
          // Refetch to get updated progress
          const updatedChallenge = await challengeService.getChallenge(id as string, user.id)
          setChallenge(updatedChallenge)
        } else {
          setChallenge(challengeData)
        }
      } else {
        setError("Challenge not found")
      }
    } catch (err) {
      console.error("Error fetching challenge:", err)
      setError("Failed to load challenge")
    } finally {
      setLoading(false)
    }
  }, [id, user])

  useEffect(() => {
    fetchChallenge()
  }, [fetchChallenge])

  // Reload challenge when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Challenge detail screen focused, reloading data...')
      fetchChallenge()
    }, [fetchChallenge])
  )

  const toggleTaskCompletion = async (taskId: string) => {
    if (!challenge || !user || completingTask) return

    setCompletingTask(true)
    try {
      // Check if task is currently completed
      const taskProgress = challenge.userTaskProgress?.find(tp => tp.task_id === taskId)
      const isCompleted = taskProgress?.is_completed || false

      let success: boolean
      if (isCompleted) {
        // Uncomplete the task
        success = await challengeService.uncompleteTask(user.id, challenge.id, taskId)
      } else {
        // Complete the task
        success = await challengeService.completeTask(user.id, challenge.id, taskId)
      }

      if (success) {
        // Refresh challenge data
        await fetchChallenge()
        
        // Show success message if challenge is completed
        const updatedChallenge = await challengeService.getChallenge(challenge.id, user.id)
        console.log('Challenge update:', {
          challengeId: challenge.id,
          completedTasks: updatedChallenge?.userProgress?.completed_tasks,
          totalTasks: updatedChallenge?.total_tasks,
          isCompleted: updatedChallenge?.userProgress?.is_completed
        })
        
        if (updatedChallenge?.userProgress?.is_completed && !isCompleted) {
          console.log('🎉 Challenge completed! Showing alert and redirecting...')
          if (Platform.OS === 'web') {
            // Web platform - navigate first, then show alert
            router.back()
            setTimeout(() => {
              alert(`🎉 Challenge Completed! Congratulations! You've earned ${challenge.reward_points} points!`)
            }, 100)
          } else {
            // Native platform - use Alert.alert
            Alert.alert(
              "🎉 Challenge Completed!",
              `Congratulations! You've earned ${challenge.reward_points} points!`,
              [{ text: "Awesome!", onPress: () => router.back() }]
            )
          }
        }
      }
    } catch (err) {
      console.error("Error toggling task:", err)
      if (Platform.OS === 'web') {
        alert("Failed to update task. Please try again.")
      } else {
        Alert.alert("Error", "Failed to update task. Please try again.")
      }
    } finally {
      setCompletingTask(false)
    }
  }

  const navigateToRecipe = (recipeId: string) => {
    router.push(`/(tabs)/recipe/${recipeId}`)
  }

  if (loading) {
    return (
      <LinearGradient colors={["#dcfce7", "#f0fdf4"]} style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#166534" />
            <Text style={styles.loadingText}>Loading challenge...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  if (error || !challenge) {
    return (
      <LinearGradient colors={["#dcfce7", "#f0fdf4"]} style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#166534" />
            </TouchableOpacity>
          </View>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#dc2626" />
            <Text style={styles.errorTitle}>{error || "Challenge not found"}</Text>
            <Button text="Go Back" color="white" backgroundColor="#166534" onPress={() => router.back()} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  const completedTasks = challenge.userProgress?.completed_tasks || 0
  const totalTasks = challenge.total_tasks
  const daysLeft = challenge.daysLeft || 0
  const startDate = new Date(challenge.start_date).toLocaleDateString()
  const endDate = new Date(challenge.end_date).toLocaleDateString()

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
            <View style={[styles.iconContainer, { backgroundColor: challenge.bg_color }]}>
              <Ionicons name={challenge.icon as any} size={40} color={challenge.color} />
            </View>
            <Text style={styles.challengeTitle}>{challenge.title}</Text>
            <Badge
              text={challenge.category || "Challenge"}
              color={challenge.color}
              backgroundColor={challenge.bg_color}
            />
          </View>

          {/* Challenge Progress */}
          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Your Progress</Text>
              <Badge text={`${daysLeft} days left`} color="#f97316" backgroundColor="#ffedd5" />
            </View>

            <View style={styles.progressBarContainer}>
              <ProgressBar
                progress={completedTasks / totalTasks}
                colors={[challenge.color, challenge.color]}
                height={12}
              />
              <Text style={[styles.progressText, { color: challenge.color }]}>
                {completedTasks}/{totalTasks} completed
              </Text>
            </View>

            <View style={styles.rewardContainer}>
              <Ionicons name="trophy" size={20} color="#f59e0b" />
              <Text style={styles.rewardText}>{challenge.reward_points} XP Reward upon completion</Text>
            </View>
          </Card>

          {/* Challenge Description */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>About This Challenge</Text>
            <Text style={styles.descriptionText}>{challenge.long_description || challenge.description}</Text>

            <View style={styles.challengeMetaContainer}>
              <View style={styles.challengeMetaItem}>
                <Ionicons name="calendar-outline" size={16} color="#64748b" />
                <Text style={styles.challengeMetaText}>
                  {startDate} - {endDate}
                </Text>
              </View>
              <View style={styles.challengeMetaItem}>
                <Ionicons name="time-outline" size={16} color="#64748b" />
                <Text style={styles.challengeMetaText}>{daysLeft} days remaining</Text>
              </View>
            </View>
          </Card>

          {/* Challenge Tasks */}
          {challenge.tasks && challenge.tasks.length > 0 && (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Challenge Tasks</Text>

              {challenge.tasks.map((task) => {
                const taskProgress = challenge.userTaskProgress?.find(tp => tp.task_id === task.id)
                const isCompleted = taskProgress?.is_completed || false
                const completedDate = taskProgress?.completed_at 
                  ? new Date(taskProgress.completed_at).toLocaleDateString()
                  : null

                return (
                  <TouchableOpacity 
                    key={task.id} 
                    style={styles.taskItem} 
                    onPress={() => toggleTaskCompletion(task.id)}
                    disabled={completingTask}
                  >
                    <View
                      style={[
                        styles.taskCheckbox,
                        isCompleted ? { backgroundColor: challenge.color, borderColor: challenge.color } : {},
                      ]}
                    >
                      {isCompleted && <Ionicons name="checkmark" size={16} color="white" />}
                    </View>
                    <View style={styles.taskContent}>
                      <Text
                        style={[
                          styles.taskTitle,
                          isCompleted ? { textDecorationLine: "line-through", color: "#9ca3af" } : {},
                        ]}
                      >
                        {task.title}
                      </Text>
                      {isCompleted && completedDate && (
                        <Text style={styles.taskDate}>Completed on {completedDate}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )
              })}
            </Card>
          )}

          {/* Note: Nutrition Goals and Related Recipes can be added in future updates */}

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
  loadingText: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#dc2626",
    marginTop: 16,
    marginBottom: 24,
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
