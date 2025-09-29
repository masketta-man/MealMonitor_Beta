"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useAuth } from "@/hooks/useAuth"
import { recipeService } from "@/services/recipeService"

// Components
import Badge from "@/components/Badge"
import Button from "@/components/Button"
import Card from "@/components/Card"
import FilterChip from "@/components/FilterChip"

import type { RecipeWithDetails } from "@/services/recipeService"

// Filter options
const MEAL_TYPES = ["All", "Breakfast", "Lunch", "Dinner", "Snack"]
const DIFFICULTY_LEVELS = ["All", "Beginner", "Intermediate", "Advanced"]
const SORT_OPTIONS = ["Recommended", "Points (High to Low)", "Prep Time", "Nutrition Score"]

export default function RecipesScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const params = useLocalSearchParams<{ suggestions?: string }>()
  const [searchQuery, setSearchQuery] = useState("")
  const [recipes, setRecipes] = useState<RecipeWithDetails[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<RecipeWithDetails[]>([])
  const [selectedMealType, setSelectedMealType] = useState("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All")
  const [selectedSortOption, setSelectedSortOption] = useState("Recommended")
  const [showFilters, setShowFilters] = useState(false)
  const [showIngredientFilter, setShowIngredientFilter] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    if (user) {
      loadRecipes()
    }
  }, [user])

  // Check if we should show suggestions
  useEffect(() => {
    if (params.suggestions === "true" && !showSuggestions && user) {
      setShowSuggestions(true)
      loadSuggestedRecipes()
    }
  }, [params.suggestions, showSuggestions, user])

  const loadRecipes = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const recipesData = await recipeService.getRecipes({ userId: user.id })
      setRecipes(recipesData)
      setFilteredRecipes(recipesData)
    } catch (error) {
      console.error('Error loading recipes:', error)
      Alert.alert('Error', 'Failed to load recipes. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const loadSuggestedRecipes = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const suggestedRecipes = await recipeService.getRecommendations(user.id, 20)
      setRecipes(suggestedRecipes)
      setFilteredRecipes(suggestedRecipes)
    } catch (error) {
      console.error('Error loading suggested recipes:', error)
      Alert.alert('Error', 'Failed to load recipe suggestions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

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
            recipe.ingredients.some((ingredient) => ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())),
        )
      }

      // Apply meal type filter
      if (selectedMealType !== "All") {
        filtered = filtered.filter((recipe) => recipe.meal_type === selectedMealType)
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
          sortedRecipes.sort((a, b) => a.prep_time - b.prep_time)
          break
        case "Nutrition Score":
          sortedRecipes.sort((a, b) => (b.nutrition_score || 0) - (a.nutrition_score || 0))
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
    if (!user) return

    recipeService.toggleFavorite(user.id, id).then((isFavorite) => {
      const updatedRecipes = recipes.map((recipe) =>
        recipe.id === id ? { ...recipe, isFavorite } : recipe,
      )
      setRecipes(updatedRecipes)
      
      // Update filtered recipes as well
      const updatedFilteredRecipes = filteredRecipes.map((recipe) =>
        recipe.id === id ? { ...recipe, isFavorite } : recipe,
      )
      setFilteredRecipes(updatedFilteredRecipes)
    }).catch((error) => {
      console.error('Error toggling favorite:', error)
      Alert.alert('Error', 'Failed to update favorite status. Please try again.')
    })
  }

  // Navigate to recipe detail
  const navigateToRecipe = (id: string) => {
    router.push(`/(tabs)/recipe/${id}`)
  }

  // Render recipe card
  const renderRecipeCard = ({ item }: { item: RecipeWithDetails }) => (
    <Card style={styles.recipeCard}>
      <View style={styles.recipeImageContainer}>
        <Image source={{ uri: item.image_url || 'https://via.placeholder.com/300x200' }} style={styles.recipeImage} resizeMode="cover" />
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
            <Text style={styles.recipeMetaText}>{item.prep_time}m</Text>
          </View>
          <View style={styles.recipeMeta}>
            <Ionicons name="flame-outline" size={16} color="#4b5563" />
            <Text style={styles.recipeMetaText}>{item.calories || 0} cal</Text>
          </View>
          <View style={styles.recipeMeta}>
            <MaterialCommunityIcons name="food-apple-outline" size={16} color="#4b5563" />
            <Text style={styles.recipeMetaText}>{item.nutrition_score || 0}</Text>
          </View>
        </View>

        <View style={styles.ingredientsContainer}>
          <Text style={styles.ingredientsTitle}>Ingredients:</Text>
          <Text style={styles.ingredientsList}>
            {item.ingredients.slice(0, 4).map(ing => ing.name).join(", ")}
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
              text={item.meal_type}
              color={item.meal_type === "Breakfast" ? "#1e40af" : item.meal_type === "Lunch" ? "#0e7490" : "#7e22ce"}
              backgroundColor={
                item.meal_type === "Breakfast" ? "#dbeafe" : item.meal_type === "Lunch" ? "#cffafe" : "#f3e8ff"
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
                loadRecipes()
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
