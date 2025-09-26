"use client"

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

// Components
import Badge from "@/components/Badge"
import Button from "@/components/Button"
import Card from "@/components/Card"
import FilterChip from "@/components/FilterChip"

// Define Recipe type
interface Recipe {
  id: string
  title: string
  image: string
  ingredients: string[]
  difficulty: string
  mealType: string
  prepTime: string
  calories: number
  protein: number
  carbs: number
  fat: number
  points: number
  isFavorite: boolean
  hasAllIngredients: boolean
  nutritionScore: number
  matchPercentage?: number
}

// Filter options
const MEAL_TYPES = ["All", "Breakfast", "Lunch", "Dinner", "Snack"]
const DIFFICULTY_LEVELS = ["All", "Beginner", "Intermediate", "Advanced"]
const SORT_OPTIONS = ["Recommended", "Points (High to Low)", "Prep Time", "Nutrition Score"]

// Mock data for recipes
const MOCK_RECIPES: Recipe[] = [
  {
    id: "1",
    title: "Avocado & Egg Toast",
    image:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    ingredients: ["Avocado", "Eggs", "Bread", "Tomatoes", "Salt", "Pepper"],
    difficulty: "Beginner",
    mealType: "Breakfast",
    prepTime: "15 min",
    calories: 320,
    protein: 15,
    carbs: 30,
    fat: 18,
    points: 45,
    isFavorite: false,
    hasAllIngredients: true,
    nutritionScore: 8.5,
  },
  {
    id: "2",
    title: "Mediterranean Salad",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    ingredients: ["Chicken", "Lettuce", "Cucumber", "Olives", "Feta Cheese", "Olive Oil", "Lemon"],
    difficulty: "Intermediate",
    mealType: "Lunch",
    prepTime: "20 min",
    calories: 380,
    protein: 25,
    carbs: 15,
    fat: 22,
    points: 60,
    isFavorite: true,
    hasAllIngredients: false,
    nutritionScore: 9.2,
  },
  {
    id: "3",
    title: "Vegetable Stir Fry",
    image:
      "https://images.unsplash.com/photo-1532550907401-a500c9a57435?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    ingredients: ["Tofu", "Broccoli", "Carrots", "Peppers", "Soy Sauce", "Ginger", "Garlic"],
    difficulty: "Intermediate",
    mealType: "Dinner",
    prepTime: "25 min",
    calories: 340,
    protein: 18,
    carbs: 35,
    fat: 12,
    points: 75,
    isFavorite: false,
    hasAllIngredients: true,
    nutritionScore: 9.0,
  },
  {
    id: "4",
    title: "Simple Omelette",
    image:
      "https://images.unsplash.com/photo-1510693206972-df098062cb71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    ingredients: ["Eggs", "Cheese", "Milk", "Salt", "Pepper", "Butter"],
    difficulty: "Beginner",
    mealType: "Breakfast",
    prepTime: "10 min",
    calories: 280,
    protein: 18,
    carbs: 2,
    fat: 22,
    points: 40,
    isFavorite: false,
    hasAllIngredients: true,
    nutritionScore: 7.5,
  },
  {
    id: "5",
    title: "Quinoa Bowl",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    ingredients: ["Quinoa", "Avocado", "Black Beans", "Corn", "Lime", "Cilantro"],
    difficulty: "Intermediate",
    mealType: "Lunch",
    prepTime: "25 min",
    calories: 420,
    protein: 15,
    carbs: 65,
    fat: 14,
    points: 65,
    isFavorite: false,
    hasAllIngredients: false,
    nutritionScore: 9.5,
  },
  {
    id: "6",
    title: "Grilled Salmon",
    image:
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
    ingredients: ["Salmon", "Lemon", "Garlic", "Olive Oil", "Dill", "Salt", "Pepper"],
    difficulty: "Advanced",
    mealType: "Dinner",
    prepTime: "30 min",
    calories: 450,
    protein: 40,
    carbs: 5,
    fat: 28,
    points: 85,
    isFavorite: false,
    hasAllIngredients: false,
    nutritionScore: 9.8,
  },
]

export default function RecipesScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ suggestions?: string }>()
  const [searchQuery, setSearchQuery] = useState("")
  const [recipes, setRecipes] = useState<Recipe[]>(MOCK_RECIPES)
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>(MOCK_RECIPES)
  const [selectedMealType, setSelectedMealType] = useState("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All")
  const [selectedSortOption, setSelectedSortOption] = useState("Recommended")
  const [showFilters, setShowFilters] = useState(false)
  const [showIngredientFilter, setShowIngredientFilter] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Check if we should show suggestions
  useEffect(() => {
    if (params.suggestions === "true" && !showSuggestions) {
      setShowSuggestions(true)
      // In a real app, this would use actual ingredient data
      const suggestedRecipes = MOCK_RECIPES.map((recipe) => ({
        ...recipe,
        matchPercentage: recipe.hasAllIngredients ? 100 : Math.floor(Math.random() * 50) + 50
      })).sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0))

      setRecipes(suggestedRecipes)
      setFilteredRecipes(suggestedRecipes)
    }
  }, [params.suggestions, showSuggestions])

  // Filter recipes based on search query and filters
  useEffect(() => {
    setIsLoading(true)

    const filterAndSortRecipes = () => {
      let filtered = [...recipes]

      // Apply search filter
      if (searchQuery) {
        filtered = filtered.filter(
          (recipe) =>
            recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            recipe.ingredients.some((ingredient) => ingredient.toLowerCase().includes(searchQuery.toLowerCase())),
        )
      }

      // Apply meal type filter
      if (selectedMealType !== "All") {
        filtered = filtered.filter((recipe) => recipe.mealType === selectedMealType)
      }

      // Apply difficulty filter
      if (selectedDifficulty !== "All") {
        filtered = filtered.filter((recipe) => recipe.difficulty === selectedDifficulty)
      }

      // Apply ingredient filter if enabled
      if (showIngredientFilter) {
        filtered = filtered.filter((recipe) => recipe.hasAllIngredients)
      }

      // Apply sorting
      const sortedRecipes = [...filtered]
      switch (selectedSortOption) {
        case "Points (High to Low)":
          sortedRecipes.sort((a, b) => b.points - a.points)
          break
        case "Prep Time":
          sortedRecipes.sort((a, b) => Number.parseInt(a.prepTime) - Number.parseInt(b.prepTime))
          break
        case "Nutrition Score":
          sortedRecipes.sort((a, b) => b.nutritionScore - a.nutritionScore)
          break
        default:
          // 'Recommended' - if showing suggestions, sort by match percentage
          if (showSuggestions) {
            sortedRecipes.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0))
          }
          break
      }

      return sortedRecipes
    }

    const timer = setTimeout(() => {
      const filtered = filterAndSortRecipes()
      setFilteredRecipes(filtered)
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, selectedMealType, selectedDifficulty, selectedSortOption, showIngredientFilter, recipes, showSuggestions])

  // Toggle favorite status for a recipe
  const toggleFavorite = (id: string) => {
    const updatedRecipes = recipes.map((recipe) =>
      recipe.id === id ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe,
    )
    setRecipes(updatedRecipes)
  }

  // Navigate to recipe detail
  const navigateToRecipe = (id: string) => {
    router.push(`/(tabs)/recipe/${id}`)
  }

  // Render recipe card
  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <Card style={styles.recipeCard}>
      <View style={styles.recipeImageContainer}>
        <Image source={{ uri: item.image }} style={styles.recipeImage} resizeMode="cover" />
        <TouchableOpacity style={styles.favoriteButton} onPress={() => toggleFavorite(item.id)}>
          <Ionicons
            name={item.isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={item.isFavorite ? "#ef4444" : "white"}
          />
        </TouchableOpacity>
        <Badge text={`+${item.points}`} color="white" backgroundColor="#22c55e" style={styles.pointsBadgeOverlay} />
      </View>

      <View style={styles.recipeContent}>
        <Text style={styles.recipeTitle}>{item.title}</Text>

        {showSuggestions && item.matchPercentage && (
          <View style={styles.matchContainer}>
            <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
            <Text style={styles.matchText}>{item.matchPercentage}% match</Text>
          </View>
        )}

        <View style={styles.recipeMetaContainer}>
          <View style={styles.recipeMeta}>
            <Ionicons name="time-outline" size={16} color="#4b5563" />
            <Text style={styles.recipeMetaText}>{item.prepTime}</Text>
          </View>
          <View style={styles.recipeMeta}>
            <Ionicons name="flame-outline" size={16} color="#4b5563" />
            <Text style={styles.recipeMetaText}>{item.calories} cal</Text>
          </View>
          <View style={styles.recipeMeta}>
            <MaterialCommunityIcons name="food-apple-outline" size={16} color="#4b5563" />
            <Text style={styles.recipeMetaText}>{item.nutritionScore}</Text>
          </View>
        </View>

        <View style={styles.ingredientsContainer}>
          <Text style={styles.ingredientsTitle}>Ingredients:</Text>
          <Text style={styles.ingredientsList}>
            {item.ingredients.slice(0, 4).join(", ")}
            {item.ingredients.length > 4 ? "..." : ""}
          </Text>
          {!item.hasAllIngredients && (
            <Badge
              text="Missing ingredients"
              color="#9a3412"
              backgroundColor="#ffedd5"
              small
              style={styles.missingIngredientsBadge}
            />
          )}
        </View>

        <View style={styles.recipeFooter}>
          <View style={styles.recipeBadges}>
            <Badge
              text={item.difficulty}
              color={
                item.difficulty === "Beginner" ? "#166534" : item.difficulty === "Intermediate" ? "#9a3412" : "#7e22ce"
              }
              backgroundColor={
                item.difficulty === "Beginner" ? "#dcfce7" : item.difficulty === "Intermediate" ? "#ffedd5" : "#f3e8ff"
              }
              small
            />
            <Badge
              text={item.mealType}
              color={item.mealType === "Breakfast" ? "#1e40af" : item.mealType === "Lunch" ? "#0e7490" : "#7e22ce"}
              backgroundColor={
                item.mealType === "Breakfast" ? "#dbeafe" : item.mealType === "Lunch" ? "#cffafe" : "#f3e8ff"
              }
              small
              style={styles.secondBadge}
            />
          </View>
          <Button
            text="View Recipe"
            color="white"
            backgroundColor="#22c55e"
            onPress={() => navigateToRecipe(item.id)}
          />
        </View>
      </View>
    </Card>
  )

  return (
    <LinearGradient colors={["#dcfce7", "#f0fdf4"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Recipes</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton} onPress={() => alert("Saved recipes coming soon!")}>
              <Ionicons name="bookmark-outline" size={24} color="#166534" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={() => router.push("/(tabs)/ingredients")}>
              <Ionicons name="nutrition-outline" size={24} color="#166534" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search recipes or ingredients..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
            <Ionicons name="options-outline" size={22} color="#166534" />
          </TouchableOpacity>
        </View>

        {/* Suggestion Banner */}
        {showSuggestions && (
          <View style={styles.suggestionBanner}>
            <Ionicons name="nutrition" size={20} color="#166534" />
            <Text style={styles.suggestionText}>Showing recipes based on your available ingredients</Text>
            <TouchableOpacity
              style={styles.clearSuggestionsButton}
              onPress={() => {
                setShowSuggestions(false)
                setRecipes(MOCK_RECIPES)
                router.setParams({ suggestions: "false" })
              }}
            >
              <Ionicons name="close-circle" size={20} color="#166534" />
            </TouchableOpacity>
          </View>
        )}

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <Text style={styles.filterSectionTitle}>Meal Type</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChipsContainer}
            >
              {MEAL_TYPES.map((type) => (
                <FilterChip
                  key={type}
                  label={type}
                  isSelected={selectedMealType === type}
                  onPress={() => setSelectedMealType(type)}
                />
              ))}
            </ScrollView>

            <Text style={styles.filterSectionTitle}>Difficulty</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChipsContainer}
            >
              {DIFFICULTY_LEVELS.map((level) => (
                <FilterChip
                  key={level}
                  label={level}
                  isSelected={selectedDifficulty === level}
                  onPress={() => setSelectedDifficulty(level)}
                />
              ))}
            </ScrollView>

            <Text style={styles.filterSectionTitle}>Sort By</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChipsContainer}
            >
              {SORT_OPTIONS.map((option) => (
                <FilterChip
                  key={option}
                  label={option}
                  isSelected={selectedSortOption === option}
                  onPress={() => setSelectedSortOption(option)}
                />
              ))}
            </ScrollView>

            <View style={styles.ingredientFilterContainer}>
              <TouchableOpacity
                style={styles.ingredientFilterButton}
                onPress={() => setShowIngredientFilter(!showIngredientFilter)}
              >
                <View style={[styles.checkboxContainer, showIngredientFilter ? styles.checkboxChecked : {}]}>
                  {showIngredientFilter && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <Text style={styles.ingredientFilterText}>Show only recipes with ingredients I have</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Recipe List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#22c55e" />
            <Text style={styles.loadingText}>Loading recipes...</Text>
          </View>
        ) : filteredRecipes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No recipes found</Text>
            <Text style={styles.emptyText}>Try adjusting your filters or search for different ingredients</Text>
          </View>
        ) : (
          <FlatList
            data={filteredRecipes}
            renderItem={renderRecipeCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.recipeListContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0fdf4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#166534",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 44,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
  },
  filterButton: {
    backgroundColor: "white",
    borderRadius: 20,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  filtersContainer: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    margin: 16,
    marginTop: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#166534",
    marginTop: 8,
    marginBottom: 8,
  },
  filterChipsContainer: {
    paddingBottom: 8,
  },
  ingredientFilterContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  ingredientFilterButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxContainer: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: "#22c55e",
  },
  ingredientFilterText: {
    fontSize: 14,
    color: "#4b5563",
  },
  recipeListContainer: {
    padding: 16,
    paddingBottom: 100, // Extra padding for bottom tab bar
  },
  recipeCard: {
    marginBottom: 16,
    padding: 0,
    overflow: "hidden",
  },
  recipeImageContainer: {
    position: "relative",
    height: 180,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  recipeImage: {
    width: "100%",
    height: "100%",
  },
  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  pointsBadgeOverlay: {
    position: "absolute",
    top: 10,
    left: 10,
  },
  recipeContent: {
    padding: 16,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#166534",
    marginBottom: 8,
  },
  recipeMetaContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  recipeMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  recipeMetaText: {
    fontSize: 14,
    color: "#4b5563",
    marginLeft: 4,
  },
  ingredientsContainer: {
    marginBottom: 12,
  },
  ingredientsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 4,
  },
  ingredientsList: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 4,
  },
  missingIngredientsBadge: {
    alignSelf: "flex-start",
    marginTop: 4,
  },
  recipeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  recipeBadges: {
    flexDirection: "row",
  },
  secondBadge: {
    marginLeft: 8,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#166534",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#4b5563",
    textAlign: "center",
  },
  suggestionBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: "#166534",
    marginLeft: 8,
  },
  clearSuggestionsButton: {
    padding: 4,
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
})
