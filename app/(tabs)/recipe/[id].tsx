"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useAuth } from "@/hooks/useAuth"
import { recipeService } from "@/services/recipeService"

// Components
import Card from "@/components/Card"
import Badge from "@/components/Badge"
import Button from "@/components/Button"

import type { RecipeWithDetails } from "@/services/recipeService"

export default function RecipeDetailScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ id: string }>()
  const { user } = useAuth()
  const [recipe, setRecipe] = useState<RecipeWithDetails | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id && user) {
      loadRecipe()
    }
  }, [params.id, user])

  const loadRecipe = async () => {
    if (!params.id || !user) return

    try {
      setIsLoading(true)
      const recipeData = await recipeService.getRecipe(params.id, user.id)
      if (recipeData) {
        setRecipe(recipeData)
        setIsFavorite(recipeData.isFavorite || false)
      } else {
        Alert.alert('Error', 'Recipe not found')
        router.back()
      }
    } catch (error) {
      console.error('Error loading recipe:', error)
      Alert.alert('Error', 'Failed to load recipe. Please try again.')
      router.back()
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = async () => {
    if (!user || !params.id) return

    try {
      const newFavoriteStatus = await recipeService.toggleFavorite(user.id, params.id)
      setIsFavorite(newFavoriteStatus)
    } catch (error) {
      console.error('Error toggling favorite:', error)
      Alert.alert('Error', 'Failed to update favorite status. Please try again.')
    }
  }

  const handleEditRecipe = () => {
    if (params.id) {
      router.push(`/(tabs)/edit-recipe/${params.id}`)
    }
  }

  const handleStartCooking = () => {
    if (params.id) {
      router.push(`/(tabs)/cooking/${params.id}`)
    }
  }

  if (isLoading || !recipe) {
    return (
      <LinearGradient colors={["#dcfce7", "#f0fdf4"]} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#22c55e" />
            <Text style={styles.loadingText}>Loading recipe...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={["#dcfce7", "#f0fdf4"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{recipe.title}</Text>
          <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? "#ef4444" : "#1f2937"}
            />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Recipe Image */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: recipe.image_url || 'https://via.placeholder.com/300x200' }} style={styles.recipeImage} resizeMode="cover" />
            <View style={styles.badgesOverlay}>
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
              />
              <Badge
                text={recipe.meal_type}
                color={
                  recipe.meal_type === "Breakfast" ? "#1e40af" : recipe.meal_type === "Lunch" ? "#0e7490" : "#7e22ce"
                }
                backgroundColor={
                  recipe.meal_type === "Breakfast" ? "#dbeafe" : recipe.meal_type === "Lunch" ? "#cffafe" : "#f3e8ff"
                }
                style={styles.secondBadge}
              />
            </View>
            <Badge text={`+${recipe.points} pts`} color="white" backgroundColor="#22c55e" style={styles.pointsBadge} />
          </View>

          {/* Recipe Title and Meta */}
          <View style={styles.titleContainer}>
            <Text style={styles.recipeTitle}>{recipe.title}</Text>
            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={18} color="#4b5563" />
                <Text style={styles.metaText}>{recipe.prep_time}m</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="flame-outline" size={18} color="#4b5563" />
                <Text style={styles.metaText}>{recipe.calories || 0} cal</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="star-outline" size={18} color="#4b5563" />
                <Text style={styles.metaText}>{recipe.nutrition_score || 0}</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{recipe.description}</Text>
          </Card>

          {/* Nutrition Info */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Nutrition Information</Text>
            <View style={styles.nutritionContainer}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{recipe.calories || 0}</Text>
                <Text style={styles.nutritionLabel}>Calories</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{recipe.protein || 0}g</Text>
                <Text style={styles.nutritionLabel}>Protein</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{recipe.carbs || 0}g</Text>
                <Text style={styles.nutritionLabel}>Carbs</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{recipe.fat || 0}g</Text>
                <Text style={styles.nutritionLabel}>Fat</Text>
              </View>
            </View>
          </Card>

          {/* Ingredients */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <View style={styles.ingredientsList}>
              {recipe.ingredients.map((ingredient: any, index: number) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.ingredientDot} />
                  <Text style={styles.ingredientName}>{ingredient.name}</Text>
                  <Text style={styles.ingredientAmount}>{ingredient.amount}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Instructions */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <View style={styles.instructionsList}>
              {recipe.instructions.map((instruction, index: number) => (
                <View key={index} style={styles.instructionItem}>
                  <View style={styles.instructionNumber}>
                    <Text style={styles.instructionNumberText}>{instruction.step_number}</Text>
                  </View>
                  <Text style={styles.instructionText}>{instruction.instruction}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              text="Edit Recipe"
              color="#166534"
              backgroundColor="#dcfce7"
              style={styles.editButton}
              onPress={handleEditRecipe}
            />
            <Button
              text="Start Cooking"
              color="white"
              backgroundColor="#22c55e"
              style={styles.cookButton}
              onPress={handleStartCooking}
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
    marginTop: 12,
    fontSize: 16,
    color: "#4b5563",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    elevation: 2,
  },
  headerActions: {
    flexDirection: "row",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    elevation: 2,
  },
  imageContainer: {
    position: "relative",
    height: 300,
    width: "100%",
  },
  recipeImage: {
    width: "100%",
    height: "100%",
  },
  badgesOverlay: {
    position: "absolute",
    top: 60,
    left: 16,
    flexDirection: "row",
  },
  secondBadge: {
    marginLeft: 8,
  },
  pointsBadge: {
    position: "absolute",
    top: 60,
    right: 16,
  },
  titleContainer: {
    padding: 16,
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    boxShadow: "0px -4px 10px rgba(0, 0, 0, 0.05)",
    elevation: 2,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#166534",
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  metaText: {
    fontSize: 14,
    color: "#4b5563",
    marginLeft: 4,
  },
  section: {
    margin: 16,
    marginTop: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#4b5563",
  },
  nutritionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nutritionItem: {
    alignItems: "center",
    flex: 1,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#166534",
  },
  nutritionLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  ingredientsList: {
    marginBottom: 8,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  ingredientDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
    marginRight: 12,
  },
  ingredientName: {
    flex: 1,
    fontSize: 14,
    color: "#1f2937",
  },
  ingredientAmount: {
    fontSize: 14,
    color: "#64748b",
  },
  instructionsList: {
    marginBottom: 8,
  },
  instructionItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  instructionNumberText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#166534",
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: "#4b5563",
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  editButton: {
    flex: 1,
    marginRight: 8,
  },
  cookButton: {
    flex: 1,
    marginLeft: 8,
  },
  bottomPadding: {
    height: 100,
  },
})
