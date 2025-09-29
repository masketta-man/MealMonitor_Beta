"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useAuth } from "@/hooks/useAuth"
import { userService } from "@/services/userService"
import { recipeService } from "@/services/recipeService"
import { challengeService } from "@/services/challengeService"
import { ingredientService } from "@/services/ingredientService"

// Components
import Card from "@/components/Card"
import Badge from "@/components/Badge"
import Button from "@/components/Button"
import ProgressBar from "@/components/ProgressBar"

interface UserStats {
  profile: any
  stats: {
    mealsCompleted: number
    challengesCompleted: number
    badgesEarned: number
  }
}

interface Recipe {
  id: string
  title: string
  image_url: string
  prep_time: number
  difficulty: string
  meal_type: string
  points: number
  nutrition_score: number
  isFavorite?: boolean
  hasAllIngredients?: boolean
  matchPercentage?: number
}

interface Challenge {
  id: string
  title: string
  description: string
  progress?: number
  total_tasks: number
  reward_points: number
  daysLeft?: number
  color: string
  bg_color: string
  icon: string
}

export default function HomeScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [recommendedRecipes, setRecommendedRecipes] = useState<Recipe[]>([])
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([])
  const [availableIngredients, setAvailableIngredients] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Load user stats
      const stats = await userService.getUserStats(user.id)
      setUserStats(stats)

      // Load recipe recommendations
      const recipes = await recipeService.getRecommendations(user.id, 5)
      setRecommendedRecipes(recipes)

      // Load active challenges
      const challenges = await challengeService.getUserActiveChallenges(user.id)
      const challengesWithStyle = challenges.map(challenge => ({
        ...challenge,
        color: getChallengeColor(challenge.category),
        bg_color: getChallengeBgColor(challenge.category),
        icon: getChallengeIcon(challenge.category),
        daysLeft: challenge.daysLeft || 0,
        progress: challenge.userProgress?.completed_tasks || 0,
      }))
      setActiveChallenges(challengesWithStyle)

      // Load available ingredients count
      const ingredients = await ingredientService.getUserInStockIngredients(user.id)
      setAvailableIngredients(ingredients.length)

    } catch (error) {
      console.error('Error loading user data:', error)
      Alert.alert('Error', 'Failed to load user data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getChallengeColor = (category: string) => {
    const colors: Record<string, string> = {
      'Nutrition': '#a855f7',
      'Fitness': '#3b82f6',
      'Cooking': '#22c55e',
      'Exploration': '#f59e0b',
    }
    return colors[category] || '#6b7280'
  }

  const getChallengeBgColor = (category: string) => {
    const colors: Record<string, string> = {
      'Nutrition': '#f3e8ff',
      'Fitness': '#dbeafe',
      'Cooking': '#dcfce7',
      'Exploration': '#fef3c7',
    }
    return colors[category] || '#f3f4f6'
  }

  const getChallengeIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Nutrition': 'leaf',
      'Fitness': 'fitness',
      'Cooking': 'restaurant',
      'Exploration': 'compass',
    }
    return icons[category] || 'star'
  }

  const navigateToRecipe = (id: string) => {
    router.push(`/(tabs)/recipe/${id}`)
  }

  const navigateToChallenge = (id: string) => {
    router.push(`/(tabs)/challenges/${id}`)
  }

  const navigateToIngredients = () => {
    router.push("/(tabs)/ingredients")
  }

  const navigateToRecipes = () => {
    router.push("/(tabs)/recipes")
  }

  const navigateToProfile = () => {
    router.push("/(tabs)/profile")
  }

  const handleCompleteRecipe = async (recipeId: string) => {
    if (!user) return

    try {
      const success = await recipeService.completeRecipe(user.id, recipeId)
      if (success) {
        Alert.alert('Recipe Completed!', 'Great job! You earned points for completing this recipe.')
        loadUserData() // Refresh data
      } else {
        Alert.alert('Error', 'Failed to mark recipe as completed. Please try again.')
      }
    } catch (error) {
      console.error('Error completing recipe:', error)
      Alert.alert('Error', 'Something went wrong. Please try again.')
    }
  }

  if (loading) {
    return (
      <LinearGradient colors={["#dcfce7", "#f0fdf4"]} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your personalized dashboard...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  const profile = userStats?.profile
  const expPercentage = profile ? (profile.experience / ((profile.level * 500) || 500)) * 100 : 0

  return (
    <LinearGradient colors={["#dcfce7", "#f0fdf4"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Hello, {profile?.full_name?.split(' ')[0] || 'Chef'}! 👋</Text>
            <Text style={styles.subGreeting}>Ready to cook something delicious?</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={navigateToProfile}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {profile?.full_name?.charAt(0) || 'U'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* User Progress Card */}
          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.levelBadge}>
                <Ionicons name="star" size={16} color="#f59e0b" />
                <Text style={styles.levelText}>Level {profile?.level || 1}</Text>
              </View>
              <Text style={styles.expText}>
                {profile?.experience || 0}/{(profile?.level || 1) * 500} XP
              </Text>
            </View>
            <ProgressBar progress={expPercentage / 100} colors={["#4ade80", "#22c55e"]} height={8} />
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profile?.streak_days || 0}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userStats?.stats.mealsCompleted || 0}</Text>
                <Text style={styles.statLabel}>Meals</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userStats?.stats.badgesEarned || 0}</Text>
                <Text style={styles.statLabel}>Badges</Text>
              </View>
            </View>
          </Card>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity style={styles.quickAction} onPress={navigateToIngredients}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#dcfce7" }]}>
                <Ionicons name="basket" size={24} color="#22c55e" />
              </View>
              <Text style={styles.quickActionText}>My Pantry</Text>
              <Text style={styles.quickActionSubtext}>{availableIngredients} items</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction} onPress={() => router.push("/(tabs)/recipes?suggestions=true")}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#fef3c7" }]}>
                <Ionicons name="nutrition" size={24} color="#f59e0b" />
              </View>
              <Text style={styles.quickActionText}>Meal Ideas</Text>
              <Text style={styles.quickActionSubtext}>Based on pantry</Text>
            </TouchableOpacity>
          </View>

          {/* Recommended Recipes */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <TouchableOpacity onPress={navigateToRecipes}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recipesScroll}>
            {recommendedRecipes.map((recipe) => (
              <Card key={recipe.id} style={styles.recipeCard} onPress={() => navigateToRecipe(recipe.id)}>
                <Image source={{ uri: recipe.image_url }} style={styles.recipeImage} />
                <View style={styles.recipeContent}>
                  <Text style={styles.recipeTitle} numberOfLines={2}>{recipe.title}</Text>
                  <View style={styles.recipeMetaRow}>
                    <View style={styles.recipeMeta}>
                      <Ionicons name="time-outline" size={14} color="#64748b" />
                      <Text style={styles.recipeMetaText}>{recipe.prep_time}m</Text>
                    </View>
                    <Badge 
                      text={`+${recipe.points}`} 
                      color="white" 
                      backgroundColor="#22c55e" 
                      size="small"
                    />
                  </View>
                  {recipe.matchPercentage && (
                    <View style={styles.matchContainer}>
                      <Ionicons name="checkmark-circle" size={12} color="#22c55e" />
                      <Text style={styles.matchText}>{recipe.matchPercentage}% match</Text>
                    </View>
                  )}
                  <Button
                    text="Cook Now"
                    color="white"
                    backgroundColor="#22c55e"
                    onPress={() => handleCompleteRecipe(recipe.id)}
                    style={styles.cookButton}
                  />
                </View>
              </Card>
            ))}
          </ScrollView>

          {/* Active Challenges */}
          {activeChallenges.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Active Challenges</Text>
                <TouchableOpacity onPress={() => router.push("/(tabs)/challenges")}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>

              {activeChallenges.slice(0, 2).map((challenge) => (
                <Card key={challenge.id} style={styles.challengeCard} onPress={() => navigateToChallenge(challenge.id)}>
                  <View style={styles.challengeHeader}>
                    <View style={styles.challengeTitleContainer}>
                      <View style={[styles.challengeIcon, { backgroundColor: challenge.bg_color }]}>
                        <Ionicons name={challenge.icon as any} size={20} color={challenge.color} />
                      </View>
                      <View style={styles.challengeInfo}>
                        <Text style={styles.challengeTitle}>{challenge.title}</Text>
                        <Text style={styles.challengeDescription} numberOfLines={2}>
                          {challenge.description}
                        </Text>
                      </View>
                    </View>
                    <Badge 
                      text={`+${challenge.reward_points}`} 
                      color="white" 
                      backgroundColor={challenge.color}
                    />
                  </View>
                  
                  <View style={styles.challengeProgress}>
                    <ProgressBar
                      progress={(challenge.progress || 0) / challenge.total_tasks}
                      colors={[challenge.color, challenge.color]}
                      height={6}
                    />
                    <View style={styles.challengeProgressText}>
                      <Text style={[styles.progressLabel, { color: challenge.color }]}>
                        {challenge.progress || 0}/{challenge.total_tasks} completed
                      </Text>
                      <Text style={styles.daysLeftText}>{challenge.daysLeft} days left</Text>
                    </View>
                  </View>
                </Card>
              ))}
            </>
          )}

          {/* Bottom padding for tab bar */}
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
    paddingBottom: 80, // Space for tab bar
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
    textAlign: "center",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0fdf4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "800",
    color: "#166534",
    marginBottom: 2,
  },
  subGreeting: {
    fontSize: 14,
    color: "#64748b",
  },
  profileButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
  },
  profileAvatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  progressCard: {
    margin: 16,
    padding: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400e",
    marginLeft: 4,
  },
  expText: {
    fontSize: 14,
    color: "#64748b",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#166534",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  quickActionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  quickAction: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 2,
  },
  quickActionSubtext: {
    fontSize: 12,
    color: "#64748b",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#166534",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#22c55e",
  },
  recipesScroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  recipeCard: {
    width: 200,
    marginRight: 12,
    padding: 0,
    overflow: "hidden",
  },
  recipeImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  recipeContent: {
    padding: 12,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  recipeMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
  matchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  matchText: {
    fontSize: 10,
    color: "#166534",
    fontWeight: "500",
    marginLeft: 2,
  },
  cookButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  challengeCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  challengeTitleContainer: {
    flexDirection: "row",
    flex: 1,
    marginRight: 12,
  },
  challengeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: "#64748b",
  },
  challengeProgress: {
    marginTop: 8,
  },
  challengeProgressText: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  daysLeftText: {
    fontSize: 12,
    color: "#64748b",
  },
  bottomPadding: {
    height: 50,
  },
})