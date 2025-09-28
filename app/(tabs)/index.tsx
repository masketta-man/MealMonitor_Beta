"use client"

import Button from "@/components/Button"
import { useAuth } from "@/hooks/useAuth"
import { userService } from "@/services/userService"
import { recipeService } from "@/services/recipeService"
import { ingredientService } from "@/services/ingredientService"
import { challengeService } from "@/services/challengeService"

import { useState, useEffect, useCallback } from "react"
import { ScrollView, StyleSheet, View, Text, Image, Pressable, FlatList, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useFocusEffect } from "expo-router"
import type { RecipeWithDetails } from "@/services/recipeService"
import type { ChallengeWithDetails } from "@/services/challengeService"
import type { UserIngredientWithDetails } from "@/services/ingredientService"

// Define types for user data
interface UserData {
  name: string
  level: number
  experience: number
  nextLevelExp: number
  streakDays: number
  badges: Array<{
    id: string
    name: string
    icon: string
    color: string
    earned: boolean
  }>
}

export default function HomeScreen() {
  const router = useRouter()
  const { user } = useAuth()
  
  // State
  const [userData, setUserData] = useState<UserData | null>(null)
  const [recommendedMeals, setRecommendedMeals] = useState<RecipeWithDetails[]>([])
  const [suggestedMeals, setSuggestedMeals] = useState<RecipeWithDetails[]>([])
  const [activeChallenge, setActiveChallenge] = useState<ChallengeWithDetails | null>(null)
  const [availableIngredients, setAvailableIngredients] = useState<UserIngredientWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  // Load data when screen focuses
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadHomeData()
      }
    }, [user])
  )

  const loadHomeData = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Load user profile and stats
      const userStats = await userService.getUserStats(user.id)
      if (userStats.profile) {
        const nextLevelExp = (userStats.profile.level) * 500 // 500 XP per level
        setUserData({
          name: userStats.profile.full_name?.split(' ')[0] || 'User',
          level: userStats.profile.level,
          experience: userStats.profile.experience,
          nextLevelExp,
          streakDays: userStats.profile.streak_days,
          badges: [], // Will be loaded separately
        })
      }

      // Load recommended meals
      const recipes = await recipeService.getRecipes({ userId: user.id })
      setRecommendedMeals(recipes.slice(0, 3))

      // Load meal recommendations based on ingredients
      const recommendations = await recipeService.getRecommendations(user.id, 3)
      setSuggestedMeals(recommendations)

      // Load active challenges
      const challenges = await challengeService.getUserActiveChallenges(user.id)
      if (challenges.length > 0) {
        setActiveChallenge(challenges[0])
      }

      // Load user ingredients
      const ingredients = await ingredientService.getUserIngredients(user.id)
      setAvailableIngredients(ingredients.slice(0, 8)) // Show first 8
      
    } catch (error) {
      console.error('Error loading home data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleIngredient = async (ingredientId: string) => {
    if (!user) return

    try {
      const newStatus = await ingredientService.toggleIngredientStock(user.id, ingredientId)
      
      // Update local state
      setAvailableIngredients(prev => 
        prev.map(ing => 
          ing.ingredient_id === ingredientId 
            ? { ...ing, in_stock: newStatus }
            : ing
        )
      )

      // Reload suggestions after ingredient change
      const recommendations = await recipeService.getRecommendations(user.id, 3)
      setSuggestedMeals(recommendations)
      
    } catch (error) {
      console.error('Error toggling ingredient:', error)
    }
  }

  const navigateToRecipe = (id: string) => {
    router.push(`/(tabs)/recipe/${id}`)
  }

  const navigateToChallenge = (id: string) => {
    router.push(`/(tabs)/challenges/${id}`)
  }

  if (loading || !userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading your dashboard...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // Define types for achievement data
  interface AchievementDetails {
    name: string;
    description: string;
    requirement: string;
    progress: number;
    total: number;
    reward: string;
    tips: readonly string[];
  }

  interface Badge {
    id: number;
    name: string;
    icon: string;
    color: string;
    earned: boolean;
    description?: string;
    requirement?: string;
    reward?: string;
    progress?: number;
    total?: number;
    tips?: readonly string[];
  }
  
  type AchievementKey = keyof typeof achievementDetails;

  const [selectedAchievement, setSelectedAchievement] = useState<Badge | null>(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  // Add achievement details data
  const achievementDetails = {
    1: {
      name: "Veggie Master",
      description: "Cook 10 vegetarian recipes to earn this badge. Discover the power of plant-based cooking!",
      requirement: "Cook 10 vegetarian recipes",
      progress: 7,
      total: 10,
      reward: "50 XP + Vegetarian Recipe Collection",
      tips: [
        "Try incorporating more colorful vegetables",
        "Experiment with plant-based proteins",
        "Learn about seasonal vegetables",
      ],
    },
    2: {
      name: "Protein Pro",
      description: "Master the art of protein preparation by cooking 15 protein-rich meals.",
      requirement: "Cook 15 protein-rich meals",
      progress: 12,
      total: 15,
      reward: "75 XP + Protein Guide",
      tips: ["Learn different cooking methods for proteins", "Try various protein sources", "Focus on lean proteins"],
    },
    3: {
      name: "Hydration Hero",
      description: "Stay hydrated by tracking your water intake for 30 consecutive days.",
      requirement: "Track water intake for 30 days",
      progress: 0,
      total: 30,
      reward: "100 XP + Hydration Tracker",
      tips: ["Set daily water reminders", "Keep a water bottle nearby", "Track your intake regularly"],
    },
    4: {
      name: "Meal Planner",
      description: "Plan your meals in advance by creating 20 meal plans.",
      requirement: "Create 20 meal plans",
      progress: 15,
      total: 20,
      reward: "60 XP + Advanced Meal Planner",
      tips: ["Plan meals for the whole week", "Consider nutritional balance", "Prep ingredients in advance"],
    },
  } as const;

  const handleAchievementPress = (badge: Badge) => {
    const details = achievementDetails[badge.id as AchievementKey];
    if (details) {
      // Create a new badge object with the details
      const badgeWithDetails: Badge = {
        ...badge,
        description: details.description,
        requirement: details.requirement,
        reward: details.reward,
        progress: details.progress,
        total: details.total,
        tips: details.tips
      };
      setSelectedAchievement(badgeWithDetails);
      setShowAchievementModal(true);
    }
  }

  // Calculate experience percentage for progress bar
  const expPercentage = (userData.experience / userData.nextLevelExp) * 100

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with user info and level */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{userData.name.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Hello, {userData.name}!</Text>
              <Text style={styles.streakText}>
                <Ionicons name="flame" size={16} color="#f97316" /> {userData.streakDays} day streak
              </Text>
            </View>
          </View>
          <View style={styles.levelContainer}>
            <Text style={styles.levelText}>Level {userData.level}</Text>
          </View>
        </View>

        {/* Experience progress bar */}
        <View style={styles.expContainer}>
          <View style={styles.expBar}>
            <View style={[styles.expProgress, { width: `${expPercentage}%` }]} />
          </View>
          <Text style={styles.expText}>
            {userData.experience}/{userData.nextLevelExp} XP to Level {userData.level + 1}
          </Text>
        </View>

        {/* Active Challenge Section */}
        {activeChallenge && <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Challenge</Text>
            <Pressable onPress={() => router.push("/(tabs)/challenges")}>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>

          <Pressable style={styles.challengeCard} onPress={() => navigateToChallenge(activeChallenge.id)}>
            <View style={styles.challengeHeader}>
              <View style={styles.challengeTitleContainer}>
                <Ionicons name="trophy" size={20} color="#f59e0b" />
                <Text style={styles.challengeTitle}>{activeChallenge.title}</Text>
              </View>
              <Text style={styles.challengeDaysLeft}>{activeChallenge.daysLeft} days left</Text>
            </View>

            <Text style={styles.challengeDescription}>{activeChallenge.description}</Text>

            <View style={styles.challengeProgressContainer}>
              <View style={styles.challengeProgressBar}>
                <View
                  style={[
                    styles.challengeProgressFill,
                    { width: `${((activeChallenge.userProgress?.completed_tasks || 0) / activeChallenge.total_tasks) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.challengeProgressText}>
                {activeChallenge.userProgress?.completed_tasks || 0}/{activeChallenge.total_tasks}
              </Text>
            </View>

            <View style={styles.challengeReward}>
              <Ionicons name="star" size={16} color="#f59e0b" />
              <Text style={styles.challengeRewardText}>{activeChallenge.reward_points} XP Reward</Text>
            </View>
          </Pressable>
        </View>}

        {/* Recommended Meals Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended Meals</Text>
            <Pressable onPress={() => router.push("/(tabs)/recipes")}>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>

          <FlatList
            data={recommendedMeals}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable style={styles.mealCard} onPress={() => navigateToRecipe(item.id)}>
                <Image source={{ uri: item.image_url || 'https://via.placeholder.com/300x200' }} style={styles.mealImage} resizeMode="cover" />
                <View style={styles.mealInfo}>
                  <Text style={styles.mealName}>{item.title}</Text>
                  <View style={styles.mealMetaContainer}>
                    <View style={styles.mealMeta}>
                      <Ionicons name="time-outline" size={14} color="#64748b" />
                      <Text style={styles.mealMetaText}>{item.prep_time} min</Text>
                    </View>
                    <View style={styles.mealMeta}>
                      <Ionicons name="star-outline" size={14} color="#64748b" />
                      <Text style={styles.mealMetaText}>{item.difficulty}</Text>
                    </View>
                  </View>
                  <View style={styles.pointsContainer}>
                    <Ionicons name="trophy-outline" size={14} color="#22c55e" />
                    <Text style={styles.pointsText}>{item.points} pts</Text>
                  </View>
                </View>
              </Pressable>
            )}
            contentContainerStyle={styles.mealsList}
          />
        </View>

        {/* My Ingredients Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Ingredients</Text>
            <Pressable onPress={() => router.push("/(tabs)/ingredients")}>
              <Text style={styles.seeAllText}>Edit All</Text>
            </Pressable>
          </View>

          <View style={styles.ingredientsContainer}>
            {availableIngredients.map((ingredient) => (
              <Pressable
                key={ingredient.id}
                style={[
                  styles.ingredientChip,
                  ingredient.in_stock ? styles.ingredientSelected : styles.ingredientUnselected,
                ]}
                onPress={() => toggleIngredient(ingredient.ingredient_id)}
              >
                {ingredient.in_stock && (
                  <Ionicons name="checkmark-circle" size={14} color="#22c55e" style={styles.ingredientIcon} />
                )}
                <Text
                  style={[
                    styles.ingredientText,
                    ingredient.in_stock ? styles.ingredientTextSelected : styles.ingredientTextUnselected,
                  ]}
                >
                  {ingredient.ingredient.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Meal Suggestions Based on Ingredients */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Suggested Meals</Text>
            <Pressable onPress={() => router.push("/(tabs)/recipes")}>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>

          {suggestedMeals.length > 0 ? (
            <FlatList
              data={suggestedMeals}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable style={styles.mealCard} onPress={() => navigateToRecipe(item.id)}>
                  <Image source={{ uri: item.image_url || 'https://via.placeholder.com/300x200' }} style={styles.mealImage} resizeMode="cover" />
                  <View style={styles.mealInfo}>
                    <Text style={styles.mealName}>{item.title}</Text>
                    <View style={styles.matchContainer}>
                      <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
                      <Text style={styles.matchText}>{Math.round(item.matchPercentage || 0)}% match</Text>
                    </View>
                    <View style={styles.mealMetaContainer}>
                      <View style={styles.mealMeta}>
                        <Ionicons name="time-outline" size={14} color="#64748b" />
                        <Text style={styles.mealMetaText}>{item.prep_time} min</Text>
                      </View>
                      <View style={styles.mealMeta}>
                        <Ionicons name="star-outline" size={14} color="#64748b" />
                        <Text style={styles.mealMetaText}>{item.difficulty}</Text>
                      </View>
                    </View>
                    <View style={styles.pointsContainer}>
                      <Ionicons name="trophy-outline" size={14} color="#22c55e" />
                      <Text style={styles.pointsText}>{item.points} pts</Text>
                    </View>
                  </View>
                </Pressable>
              )}
              contentContainerStyle={styles.mealsList}
              ListEmptyComponent={
                <View style={styles.emptyMealSuggestions}>
                  <Text style={styles.emptyMealText}>No meal suggestions available.</Text>
                  <Text style={styles.emptyMealSubtext}>Add more ingredients to get suggestions.</Text>
                </View>
              }
            />
          ) : (
            <View style={styles.emptyMealSuggestions}>
              <Ionicons name="restaurant-outline" size={40} color="#9ca3af" />
              <Text style={styles.emptyMealText}>No meal suggestions available.</Text>
              <Text style={styles.emptyMealSubtext}>Add more ingredients to get suggestions.</Text>
            </View>
          )}
        </View>

        {/* Achievements Section */}
        {userData.badges.length > 0 && <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Achievements</Text>
            <Pressable onPress={() => router.push("/(tabs)/profile")}>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>

          <View style={styles.badgesContainer}>
            {userData.badges.map((badge) => (
              <TouchableOpacity
                key={badge.id}
                style={styles.badgeItem}
                onPress={() => handleAchievementPress(badge)}
                activeOpacity={0.7}
              >
                <View style={[styles.badgeIcon, { backgroundColor: badge.earned ? badge.color : "#e2e8f0" }]}>
                  <Ionicons
                    name={badge.icon as any}
                    size={24}
                    color={badge.earned ? "white" : "#94a3b8"}
                  />
                </View>
                <Text style={[styles.badgeName, { color: badge.earned ? "#1e293b" : "#94a3b8" }]}>{badge.name}</Text>
                {!badge.earned && <Text style={styles.badgeLocked}>Locked</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>}

        {/* Achievement Detail Modal */}
        {showAchievementModal && selectedAchievement && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowAchievementModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>

              <View style={styles.modalHeader}>
                <View
                  style={[
                    styles.modalBadgeIcon,
                    { backgroundColor: selectedAchievement.earned ? selectedAchievement.color : "#e2e8f0" },
                  ]}
                >
                  <Ionicons
                    name={selectedAchievement.icon as any}
                    size={32}
                    color={selectedAchievement.earned ? "white" : "#94a3b8"}
                  />
                </View>
                <Text style={styles.modalTitle}>{selectedAchievement.name}</Text>
                {selectedAchievement.earned ? (
                  <View style={styles.earnedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                    <Text style={styles.earnedText}>Earned</Text>
                  </View>
                ) : (
                  <View style={styles.lockedBadge}>
                    <Ionicons name="lock-closed" size={16} color="#94a3b8" />
                    <Text style={styles.lockedText}>Locked</Text>
                  </View>
                )}
              </View>

              <Text style={styles.modalDescription}>{selectedAchievement.description}</Text>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Requirement</Text>
                <Text style={styles.modalSectionText}>{selectedAchievement.requirement}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Progress</Text>
                <View style={styles.modalProgressContainer}>
                  <View style={styles.modalProgressBar}>
                    <View
                      style={[
                        styles.modalProgressFill,
                        {
                          width: `${(selectedAchievement.progress! / selectedAchievement.total!) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.modalProgressText}>
                    {selectedAchievement.progress}/{selectedAchievement.total}
                  </Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Reward</Text>
                <Text style={styles.modalSectionText}>{selectedAchievement.reward}</Text>
              </View>

              {selectedAchievement.tips && selectedAchievement.tips.length > 0 && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Tips</Text>
                  {selectedAchievement.tips.map((tip: string, index: number) => (
                    <View key={index} style={styles.modalTip}>
                      <View style={styles.modalTipDot} />
                      <Text style={styles.modalTipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              )}

              <Button
                text="Close"
                color="white"
                backgroundColor="#22c55e"
                onPress={() => setShowAchievementModal(false)}
                style={styles.modalCloseButtonBottom}
              />
            </View>
          </View>
        )}

        {/* Bottom padding to account for tab bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
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
    paddingTop: 16,
    paddingBottom: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  greeting: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  streakText: {
    fontSize: 14,
    color: "#64748b",
  },
  levelContainer: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelText: {
    color: "#22c55e",
    fontWeight: "bold",
  },
  expContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  expBar: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    marginBottom: 8,
  },
  expProgress: {
    height: "100%",
    backgroundColor: "#22c55e",
    borderRadius: 4,
  },
  expText: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "right",
  },
  sectionContainer: {
    marginBottom: 24,
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
    fontWeight: "bold",
    color: "#1e293b",
  },
  seeAllText: {
    fontSize: 14,
    color: "#22c55e",
  },
  challengeCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  challengeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  challengeTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginLeft: 8,
  },
  challengeDaysLeft: {
    fontSize: 12,
    color: "#f97316",
    fontWeight: "500",
  },
  challengeDescription: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 12,
  },
  challengeProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  challengeProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    marginRight: 8,
  },
  challengeProgressFill: {
    height: "100%",
    backgroundColor: "#f59e0b",
    borderRadius: 4,
  },
  challengeProgressText: {
    fontSize: 12,
    color: "#64748b",
    width: 30,
  },
  challengeReward: {
    flexDirection: "row",
    alignItems: "center",
  },
  challengeRewardText: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 4,
  },
  mealsList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  mealCard: {
    backgroundColor: "white",
    borderRadius: 16,
    width: 200,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    overflow: "hidden",
  },
  mealImage: {
    width: "100%",
    height: 120,
  },
  mealInfo: {
    padding: 12,
  },
  mealName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  mealMetaContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  mealMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  mealMetaText: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 4,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  pointsText: {
    fontSize: 12,
    color: "#22c55e",
    fontWeight: "500",
    marginLeft: 4,
  },
  ingredientsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
  },
  ingredientChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  ingredientSelected: {
    backgroundColor: "#dcfce7",
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  ingredientUnselected: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  ingredientIcon: {
    marginRight: 4,
  },
  ingredientText: {
    fontSize: 12,
  },
  ingredientTextSelected: {
    color: "#22c55e",
  },
  ingredientTextUnselected: {
    color: "#64748b",
  },
  badgesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  badgeItem: {
    alignItems: "center",
    width: "23%",
  },
  badgeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    textAlign: "center",
  },
  badgeLocked: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 2,
  },
  bottomPadding: {
    height: 100, // Adjust based on tab bar height
  },
  matchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  matchText: {
    fontSize: 12,
    color: "#166534",
    fontWeight: "500",
    marginLeft: 4,
  },
  emptyMealSuggestions: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  emptyMealText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4b5563",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyMealSubtext: {
    fontSize: 14,
    color: "#9ca3b8",
    textAlign: "center",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    margin: 20,
    maxHeight: "80%",
    width: "90%",
    position: "relative",
  },
  modalCloseButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1001,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 20,
  },
  modalBadgeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 8,
    textAlign: "center",
  },
  earnedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  earnedText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#22c55e",
    marginLeft: 4,
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  lockedText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94a3b8",
    marginLeft: 4,
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 24,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  modalSectionText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  modalProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    marginRight: 12,
  },
  modalProgressFill: {
    height: "100%",
    backgroundColor: "#22c55e",
    borderRadius: 4,
  },
  modalProgressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
    minWidth: 40,
  },
  modalTip: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  modalTipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22c55e",
    marginTop: 7,
    marginRight: 12,
  },
  modalTipText: {
    flex: 1,
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  modalCloseButtonBottom: {
    marginTop: 16,
  },
})
