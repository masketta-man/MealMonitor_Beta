"use client"

import { CalorieCounter } from "@/components/CalorieCounter"
import { LevelProgress } from "@/components/LevelProgress"
import { APP_TUTORIAL_STEPS } from "@/constants/tutorialSteps"
import { useTutorial } from "@/contexts/TutorialContext"
import { useAuth } from "@/hooks/useAuth"
import { calorieService } from "@/services/calorieService"
import { challengeService } from "@/services/challengeService"
import { ingredientService } from "@/services/ingredientService"
import { recipeService } from "@/services/recipeService"
import { userService } from "@/services/userService"
import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

// Components
import Badge from "@/components/Badge"
import Button from "@/components/Button"
import Card from "@/components/Card"
import ProgressBar from "@/components/ProgressBar"

interface UserStats {
  profile: any
  stats: {
    mealsCompleted: number
    challengesCompleted: number
    badgesEarned: number
  }
  levelProgress: {
    level: number
    currentLevelXp: number
    nextLevelXp: number
    progress: number
  } | null
}

interface Recipe {
  id: string
  title: string
  image_url: string | null
  prep_time: number
  difficulty: string
  meal_type: string
  points: number
  calories?: number | null
  nutrition_score: number | null
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
  const params = useLocalSearchParams()
  const { user } = useAuth()
  const { shouldShowTutorial, startTutorial } = useTutorial()
  const { width } = useWindowDimensions()
  const isWeb = width > 768 // Tablet and above
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [recommendedRecipes, setRecommendedRecipes] = useState<Recipe[]>([])
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([])
  const [availableIngredients, setAvailableIngredients] = useState<number>(0)
  const [calorieData, setCalorieData] = useState<{ current: number; goal: number; goalMet: boolean }>({ current: 0, goal: 2000, goalMet: false })
  const [loading, setLoading] = useState(true)
  const [tutorialTriggered, setTutorialTriggered] = useState(false)

  useEffect(() => {
    console.log('🏠 Dashboard: useEffect triggered', { 
      hasUser: !!user, 
      userId: user?.id, 
      loading 
    })
    
    if (user) {
      console.log('🏠 Dashboard: User found, loading data...')
      loadUserData()
    } else if (!loading) {
      console.log('🏠 Dashboard: No user, redirecting to login')
      router.replace("/(auth)/login")
    }
  }, [user])

  // Reload data when screen comes into focus (e.g., after completing a recipe)
  useFocusEffect(
    useCallback(() => {
      console.log('🏠 Dashboard: Screen focused, reloading data...')
      if (user) {
        loadUserData()
      }
    }, [user])
  )

  // Trigger tutorial after initial load for new users or when coming from onboarding
  useEffect(() => {
    if (!loading && !tutorialTriggered) {
      // Check if we should start tutorial from onboarding
      if (params.startTutorial === 'true') {
        console.log('Starting tutorial from onboarding completion')
        setTimeout(() => {
          startTutorial(APP_TUTORIAL_STEPS)
          setTutorialTriggered(true)
        }, 500)
      } else if (shouldShowTutorial) {
        console.log('Starting tutorial for new user')
        setTimeout(() => {
          startTutorial(APP_TUTORIAL_STEPS)
          setTutorialTriggered(true)
        }, 1000)
      }
    }
  }, [shouldShowTutorial, tutorialTriggered, loading, params.startTutorial])

  const loadUserData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Load user stats
      const stats = await userService.getUserStats(user.id)
      setUserStats(stats)

      // Load calorie data - always use getOrCreateTodaysLog to sync with settings
      const todaysLog = await calorieService.getOrCreateTodaysLog(user.id)
      if (todaysLog) {
        setCalorieData({
          current: todaysLog.total_calories,
          goal: todaysLog.calorie_goal,
          goalMet: todaysLog.goal_met,
        })
      }

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

  const handleStartCooking = (recipeId: string) => {
    router.push(`/(tabs)/cooking/${recipeId}`)
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
  const levelProgress = userStats?.levelProgress

  return (
    <LinearGradient colors={["#dcfce7", "#f0fdf4"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header */}
        <View style={[styles.header, isWeb && styles.headerWeb]}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Hello, {profile?.full_name?.split(' ')[0] || 'Chef'}! </Text>
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
          <View style={[styles.contentWrapper, isWeb && styles.contentWrapperWeb]}>
            {/* Calorie Counter */}
            <View style={styles.calorieSection}>
            <CalorieCounter
              currentCalories={calorieData.current}
              goalCalories={calorieData.goal}
              goalMet={calorieData.goalMet}
            />
          </View>

          {/* User Progress Card */}
          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.levelBadge}>
                <Ionicons name="star" size={16} color="#f59e0b" />
                <Text style={styles.levelText}>Level {levelProgress?.level || profile?.level || 1}</Text>
              </View>
              <Text style={styles.expText}>
                {levelProgress?.currentLevelXp ?? profile?.experience ?? 0}/{levelProgress?.nextLevelXp ?? 500} XP
              </Text>
            </View>
            <LevelProgress
              level={levelProgress?.level || profile?.level || 1}
              currentXp={levelProgress?.currentLevelXp ?? profile?.experience ?? 0}
              nextLevelXp={levelProgress?.nextLevelXp ?? 500}
              progress={levelProgress?.progress ?? ((profile?.experience || 0) % 500) / 500}
              showDetails={false}
            />

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
          {recommendedRecipes.map((recipe) => {
            // Determine time-appropriate badge
            const currentHour = new Date().getHours()
            let preferredMealType = 'Snack'
            if (currentHour >= 6 && currentHour < 11) preferredMealType = 'Breakfast'
            else if (currentHour >= 11 && currentHour < 16) preferredMealType = 'Lunch'
            else if (currentHour >= 16 && currentHour < 22) preferredMealType = 'Dinner'
            
            const isTimeAppropriate = recipe.meal_type === preferredMealType
            const isPerfectMatch = recipe.matchPercentage && recipe.matchPercentage >= 80
            
            return (
              <Card key={recipe.id} style={styles.recipeCard} onPress={() => navigateToRecipe(recipe.id)}>
                <Image 
                  source={{ uri: recipe.image_url || 'https://via.placeholder.com/200x120?text=No+Image' }} 
                  style={styles.recipeImage} 
                />
                {isTimeAppropriate && (
                  <View style={styles.timeBadgeOverlay}>
                    <Text style={styles.timeBadgeText}>⏰ {preferredMealType}</Text>
                  </View>
                )}
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
                      <Text style={styles.matchText}>
                        {Math.round(recipe.matchPercentage)}% ingredient match
                      </Text>
                      {isPerfectMatch && <Text style={styles.perfectMatchEmoji}> ✨</Text>}
                    </View>
                  )}
                  {recipe.calories && (
                    <View style={styles.calorieInfo}>
                      <Ionicons name="flame-outline" size={12} color="#f59e0b" />
                      <Text style={styles.calorieText}>{recipe.calories} cal</Text>
                    </View>
                  )}
                  <Button
                    text="Start Cooking"
                    color="white"
                    backgroundColor="#22c55e"
                    onPress={() => handleStartCooking(recipe.id)}
                    style={styles.cookButton}
                  />
                </View>
              </Card>
            )
          })}
          </ScrollView>

          {/* Active Challenges */}
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

            {/* Bottom padding for tab bar */}
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
  contentWrapper: {
    width: "100%",
  },
  contentWrapperWeb: {
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 24,
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
  headerWeb: {
    paddingHorizontal: 24,
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
  calorieSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 16,
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
  timeBadgeOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#1e40af",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  timeBadgeText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "600",
  },
  perfectMatchEmoji: {
    fontSize: 10,
  },
  calorieInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "#fef3c7",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  calorieText: {
    fontSize: 10,
    color: "#92400e",
    fontWeight: "500",
    marginLeft: 4,
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