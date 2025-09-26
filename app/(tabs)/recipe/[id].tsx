"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"

// Components
import Card from "@/components/Card"
import Badge from "@/components/Badge"
import Button from "@/components/Button"

// Mock recipe data
interface Ingredient {
  name: string
  amount: string
}

interface Recipe {
  id: string
  title: string
  image: string
  description: string
  ingredients: Ingredient[]
  instructions: string[]
  difficulty: string
  mealType: string
  prepTime: string
  calories: number
  protein: number
  carbs: number
  fat: number
  points: number
  isFavorite: boolean
  nutritionScore: number
}

type RecipeCollection = {
  [key: string]: Recipe
}

const MOCK_RECIPES: RecipeCollection = {
  "1": {
    id: "1",
    title: "Avocado & Egg Toast",
    image:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    description:
      "A delicious and nutritious breakfast option that combines creamy avocado with perfectly cooked eggs on top of crispy whole grain toast. This recipe is high in healthy fats and protein to keep you energized throughout the morning.",
    ingredients: [
      { name: "Avocado", amount: "1 medium" },
      { name: "Eggs", amount: "2 large" },
      { name: "Whole grain bread", amount: "2 slices" },
      { name: "Cherry tomatoes", amount: "1/2 cup" },
      { name: "Salt", amount: "to taste" },
      { name: "Black pepper", amount: "to taste" },
      { name: "Red pepper flakes", amount: "optional" },
      { name: "Lemon juice", amount: "1 teaspoon" },
    ],
    instructions: [
      "Toast the bread slices until golden and crispy.",
      "In a small pan, fry the eggs to your liking (sunny side up recommended).",
      "Mash the avocado in a bowl and add lemon juice, salt, and pepper.",
      "Spread the mashed avocado on the toast.",
      "Place the fried egg on top of the avocado.",
      "Slice cherry tomatoes in half and arrange them around the egg.",
      "Sprinkle with red pepper flakes if desired.",
      "Serve immediately and enjoy!",
    ],
    difficulty: "Beginner",
    mealType: "Breakfast",
    prepTime: "15 min",
    calories: 320,
    protein: 15,
    carbs: 30,
    fat: 18,
    points: 45,
    isFavorite: false,
    nutritionScore: 8.5,
  },
  "2": {
    id: "2",
    title: "Mediterranean Salad",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    description:
      "A refreshing and healthy Mediterranean-inspired salad featuring grilled chicken, fresh vegetables, olives, and feta cheese. This balanced meal is perfect for lunch or a light dinner.",
    ingredients: [
      { name: "Grilled chicken breast", amount: "6 oz" },
      { name: "Romaine lettuce", amount: "2 cups" },
      { name: "Cucumber", amount: "1/2 medium" },
      { name: "Kalamata olives", amount: "1/4 cup" },
      { name: "Feta cheese", amount: "1/4 cup" },
      { name: "Cherry tomatoes", amount: "1/2 cup" },
      { name: "Red onion", amount: "1/4 small" },
      { name: "Olive oil", amount: "2 tablespoons" },
      { name: "Lemon juice", amount: "1 tablespoon" },
      { name: "Dried oregano", amount: "1/2 teaspoon" },
      { name: "Salt and pepper", amount: "to taste" },
    ],
    instructions: [
      "Chop the romaine lettuce and place in a large bowl.",
      "Dice the cucumber, tomatoes, and red onion.",
      "Slice the olives in half.",
      "Crumble the feta cheese.",
      "Add all vegetables and cheese to the bowl with lettuce.",
      "Slice the grilled chicken breast and add to the salad.",
      "In a small bowl, whisk together olive oil, lemon juice, oregano, salt, and pepper.",
      "Pour the dressing over the salad and toss gently to combine.",
      "Serve immediately or chill for 30 minutes to let flavors meld.",
    ],
    difficulty: "Intermediate",
    mealType: "Lunch",
    prepTime: "20 min",
    calories: 380,
    protein: 25,
    carbs: 15,
    fat: 22,
    points: 60,
    isFavorite: true,
    nutritionScore: 9.2,
  },
  "3": {
    id: "3",
    title: "Vegetable Stir Fry",
    image:
      "https://images.unsplash.com/photo-1532550907401-a500c9a57435?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    description:
      "A quick and flavorful vegetable stir fry with tofu that's packed with nutrients and plant-based protein. This versatile dish can be customized with your favorite vegetables and served over rice or noodles.",
    ingredients: [
      { name: "Tofu", amount: "14 oz" },
      { name: "Broccoli", amount: "1 cup" },
      { name: "Carrots", amount: "2 medium" },
      { name: "Bell peppers", amount: "1 large" },
      { name: "Soy sauce", amount: "3 tbsp" },
      { name: "Ginger", amount: "1 tbsp, minced" },
      { name: "Garlic", amount: "2 cloves, minced" },
      { name: "Vegetable oil", amount: "2 tbsp" },
      { name: "Sesame oil", amount: "1 tsp" },
      { name: "Red pepper flakes", amount: "1/4 tsp (optional)" },
      { name: "Green onions", amount: "2, sliced" },
    ],
    instructions: [
      "Press tofu to remove excess water, then cut into cubes.",
      "Chop all vegetables into bite-sized pieces.",
      "Heat oil in a wok or large pan over high heat.",
      "Add tofu and cook until golden brown on all sides.",
      "Remove tofu and set aside.",
      "Add garlic and ginger to the pan and stir for 30 seconds.",
      "Add vegetables and stir-fry for 5-7 minutes until tender-crisp.",
      "Return tofu to the pan and add soy sauce.",
      "Stir everything together and cook for another 2 minutes.",
      "Drizzle with sesame oil and sprinkle with green onions.",
      "Serve hot over rice or noodles.",
    ],
    difficulty: "Intermediate",
    mealType: "Dinner",
    prepTime: "25 min",
    calories: 340,
    protein: 18,
    carbs: 35,
    fat: 12,
    points: 75,
    isFavorite: false,
    nutritionScore: 9.0,
  },
}

export default function RecipeDetailScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ id: string }>()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    if (params.id && MOCK_RECIPES[params.id]) {
      const recipeData = MOCK_RECIPES[params.id]
      setRecipe(recipeData)
      setIsFavorite(recipeData.isFavorite)
    } else {
      // Handle case where recipe is not found
      router.back()
    }
  }, [params.id])

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  const handleEditRecipe = () => {
    // Navigate to edit recipe screen with the current recipe id
    if (params.id) {
      router.push(`/edit-recipe/${params.id}`)
    }
  }

  const handleStartCooking = () => {
    // Navigate to cooking screen with the current recipe id
    if (params.id) {
      router.push(`/cooking/${params.id}`)
    }
  }

  if (!recipe) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
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
            <Image source={{ uri: recipe.image }} style={styles.recipeImage} resizeMode="cover" />
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
                text={recipe.mealType}
                color={
                  recipe.mealType === "Breakfast" ? "#1e40af" : recipe.mealType === "Lunch" ? "#0e7490" : "#7e22ce"
                }
                backgroundColor={
                  recipe.mealType === "Breakfast" ? "#dbeafe" : recipe.mealType === "Lunch" ? "#cffafe" : "#f3e8ff"
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
                <Text style={styles.metaText}>{recipe.prepTime}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="flame-outline" size={18} color="#4b5563" />
                <Text style={styles.metaText}>{recipe.calories} cal</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="star-outline" size={18} color="#4b5563" />
                <Text style={styles.metaText}>{recipe.nutritionScore}</Text>
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
                <Text style={styles.nutritionValue}>{recipe.calories}</Text>
                <Text style={styles.nutritionLabel}>Calories</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{recipe.protein}g</Text>
                <Text style={styles.nutritionLabel}>Protein</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{recipe.carbs}g</Text>
                <Text style={styles.nutritionLabel}>Carbs</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{recipe.fat}g</Text>
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
              {recipe.instructions.map((instruction: string, index: number) => (
                <View key={index} style={styles.instructionItem}>
                  <View style={styles.instructionNumber}>
                    <Text style={styles.instructionNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.instructionText}>{instruction}</Text>
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
