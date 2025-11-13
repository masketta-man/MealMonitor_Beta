"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert, useWindowDimensions } from "react-native"
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
import TagChip from "@/components/TagChip"

import type { RecipeWithDetails } from "@/services/recipeService"

// Filter options
const MEAL_TYPES = ["All", "Breakfast", "Lunch", "Dinner", "Snack"]
const DIFFICULTY_LEVELS = ["All", "Beginner", "Intermediate", "Advanced"]
const SORT_OPTIONS = [
  "Recommended",
  "Points (High to Low)",
  "Calories (Low to High)",
  "Calories (High to Low)",
  "Prep Time (Shortest)",
  "Nutrition Score",
  "Newest First",
  "A-Z"
]

export default function RecipesScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const params = useLocalSearchParams<{ suggestions?: string }>()
  const { width } = useWindowDimensions()
  const isWeb = width > 768
  const [searchQuery, setSearchQuery] = useState("")
  const [recipes, setRecipes] = useState<RecipeWithDetails[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<RecipeWithDetails[]>([])
  const [selectedMealType, setSelectedMealType] = useState("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All")
  const [selectedSortOption, setSelectedSortOption] = useState("Recommended")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<Array<{ tag: string; type: string }>>([])
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
      
      // Extract unique tags from all recipes (normalize capitalization)
      const tagsSet = new Map<string, { display: string; type: string }>()
      recipesData.forEach(recipe => {
        if (recipe.tags) {
          recipe.tags.forEach((tag: any) => {
            const normalized = tag.tag.toLowerCase()
            // Keep first occurrence's display version or use title case
            if (!tagsSet.has(normalized)) {
              tagsSet.set(normalized, { 
                display: tag.tag,
                type: tag.tag_type || 'other'
              })
            }
          })
        }
      })
      const uniqueTags = Array.from(tagsSet.entries()).map(([_, data]) => ({ 
        tag: data.display, 
        type: data.type 
      }))
      setAvailableTags(uniqueTags.sort((a, b) => a.tag.localeCompare(b.tag)))
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
      // Use enhanced recommendations with tagging system
      const suggestedRecipes = await recipeService.getEnhancedRecommendations(user.id, {
        limit: 20,
        maxPrepTime: selectedSortOption === 'Prep Time (Shortest)' ? 30 : undefined
      })
      setRecipes(suggestedRecipes)
      setFilteredRecipes(suggestedRecipes)
      
      // Extract tags from suggested recipes too (normalize capitalization)
      const tagsSet = new Map<string, { display: string; type: string }>()
      suggestedRecipes.forEach(recipe => {
        if (recipe.tags) {
          recipe.tags.forEach((tag: any) => {
            const normalized = tag.tag.toLowerCase()
            if (!tagsSet.has(normalized)) {
              tagsSet.set(normalized, { 
                display: tag.tag,
                type: tag.tag_type || 'other'
              })
            }
          })
        }
      })
      const uniqueTags = Array.from(tagsSet.entries()).map(([_, data]) => ({ 
        tag: data.display, 
        type: data.type 
      }))
      setAvailableTags(uniqueTags.sort((a, b) => a.tag.localeCompare(b.tag)))
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

      // Apply tag filter (case-insensitive)
      if (selectedTags.length > 0) {
        filtered = filtered.filter((recipe) => {
          if (!recipe.tags) return false
          const recipeTags = recipe.tags.map((t: any) => t.tag.toLowerCase())
          return selectedTags.every(tag => recipeTags.includes(tag.toLowerCase()))
        })
      }

      // Apply sorting
      const sortedRecipes = [...filtered]
      switch (selectedSortOption) {
        case "Points (High to Low)":
          sortedRecipes.sort((a, b) => b.points - a.points)
          break
        case "Calories (Low to High)":
          sortedRecipes.sort((a, b) => (a.calories || 0) - (b.calories || 0))
          break
        case "Calories (High to Low)":
          sortedRecipes.sort((a, b) => (b.calories || 0) - (a.calories || 0))
          break
        case "Prep Time (Shortest)":
          sortedRecipes.sort((a, b) => a.prep_time - b.prep_time)
          break
        case "Nutrition Score":
          sortedRecipes.sort((a, b) => (b.nutrition_score || 0) - (a.nutrition_score || 0))
          break
        case "Newest First":
          sortedRecipes.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
          break
        case "A-Z":
          sortedRecipes.sort((a, b) => a.title.localeCompare(b.title))
          break
        case "Recommended":
        default:
          // 'Recommended' - use smart sorting based on multiple factors
          if (showSuggestions) {
            // Sort by recommendation score or match percentage
            sortedRecipes.sort((a, b) => (b.recommendationScore || b.matchPercentage || 0) - (a.recommendationScore || a.matchPercentage || 0))
          } else {
            // Smart recommendation: balanced scoring with normalized values
            sortedRecipes.sort((a, b) => {
              // Normalize nutrition score (0-10 range) to 0-100
              const nutritionScoreA = ((a.nutrition_score || 0) / 10) * 100
              const nutritionScoreB = ((b.nutrition_score || 0) / 10) * 100
              
              // Normalize points (typical range 0-300) to 0-100
              const normalizedPointsA = Math.min(((a.points || 0) / 300) * 100, 100)
              const normalizedPointsB = Math.min(((b.points || 0) / 300) * 100, 100)
              
              // Ingredient availability bonus (0-100)
              const ingredientBonusA = a.hasAllIngredients ? 100 : 0
              const ingredientBonusB = b.hasAllIngredients ? 100 : 0
              
              // Calculate weighted score (all components now 0-100)
              // 35% nutrition score, 35% points, 30% ingredient availability
              const scoreA = (nutritionScoreA * 0.35) + (normalizedPointsA * 0.35) + (ingredientBonusA * 0.30)
              const scoreB = (nutritionScoreB * 0.35) + (normalizedPointsB * 0.35) + (ingredientBonusB * 0.30)
              
              return scoreB - scoreA
            })
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
  }, [searchQuery, selectedMealType, selectedDifficulty, selectedSortOption, selectedTags, showIngredientFilter, recipes, showSuggestions])

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

  // Helper to get recommendation badges
  const getRecommendationBadges = (recipe: RecipeWithDetails) => {
    const badges = []
    const currentHour = new Date().getHours()
    let preferredMealType = 'Snack'
    if (currentHour >= 6 && currentHour < 11) preferredMealType = 'Breakfast'
    else if (currentHour >= 11 && currentHour < 16) preferredMealType = 'Lunch'
    else if (currentHour >= 16 && currentHour < 22) preferredMealType = 'Dinner'

    // Time-appropriate badge
    if (recipe.meal_type === preferredMealType) {
      badges.push({ text: `⏰ Perfect for ${preferredMealType}`, color: '#1e40af', bg: '#dbeafe' })
    }

    // High ingredient match badge
    if (recipe.matchPercentage && recipe.matchPercentage >= 80) {
      badges.push({ text: '✨ Perfect Match', color: '#166534', bg: '#dcfce7' })
    }

    return badges
  }

  // Render recipe card
  const renderRecipeCard = ({ item }: { item: RecipeWithDetails }) => {
    const recommendationBadges = showSuggestions ? getRecommendationBadges(item) : []
    
    return (
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

          {/* Recommendation badges */}
          {recommendationBadges.length > 0 && (
            <View style={styles.recommendationBadgesContainer}>
              {recommendationBadges.map((badge, index) => (
                <Badge
                  key={index}
                  text={badge.text}
                  color={badge.color}
                  backgroundColor={badge.bg}
                  small
                  style={index > 0 ? styles.secondBadge : undefined}
                />
              ))}
            </View>
          )}

          {showSuggestions && item.matchPercentage && (
            <View style={styles.matchContainer}>
              <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
              <Text style={styles.matchText}>{Math.round(item.matchPercentage)}% ingredient match</Text>
            </View>
          )}

          {showSuggestions && item.recommendationScore && (
            <View style={styles.recommendationScoreSection}>
              <View style={styles.recommendationScoreContainer}>
                <Ionicons name="star" size={16} color="#f59e0b" />
                <Text style={styles.recommendationScoreText}>
                  {Math.round(item.recommendationScore)}% Overall Match
                </Text>
              </View>
              {item.scoringBreakdown && (
                <View style={styles.scoreBreakdownContainer}>
                  <View style={styles.scoreBreakdownRow}>
                    <Ionicons name="nutrition-outline" size={12} color="#64748b" />
                    <Text style={styles.scoreBreakdownText}>
                      Calorie Goal: {Math.round(item.scoringBreakdown.calorieAlignment * 0.15)}%
                    </Text>
                  </View>
                  <View style={styles.scoreBreakdownRow}>
                    <Ionicons name="restaurant-outline" size={12} color="#64748b" />
                    <Text style={styles.scoreBreakdownText}>
                      Preferences: {Math.round(item.scoringBreakdown.userPreference * 0.15)}%
                    </Text>
                  </View>
                  <View style={styles.scoreBreakdownRow}>
                    <Ionicons name="pricetag-outline" size={12} color="#64748b" />
                    <Text style={styles.scoreBreakdownText}>
                      Tags: {Math.round(item.scoringBreakdown.tagMatch * 0.25)}%
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {item.tags && item.tags.length > 0 && (
            <View style={styles.recipeTagsContainer}>
              {item.tags.slice(0, 3).map((tag: any, index: number) => (
                <TagChip
                  key={index}
                  label={tag.tag}
                  category={tag.tag_type}
                  size="small"
                />
              ))}
              {item.tags.length > 3 && (
                <Text style={styles.moreTagsText}>+{item.tags.length - 3} more</Text>
              )}
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
  }

  return (
    <LinearGradient colors={["#dcfce7", "#f0fdf4"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header */}
        <View style={[styles.header, isWeb && styles.headerWeb]}>
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

        {/* Recipe List with Filters */}
        <FlatList
          data={isLoading ? [] : filteredRecipes}
          renderItem={renderRecipeCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.recipeListContainer, isWeb && styles.recipeListContainerWeb]}
          showsVerticalScrollIndicator={false}
          numColumns={isWeb ? 2 : 1}
          key={isWeb ? 'web' : 'mobile'}
          columnWrapperStyle={isWeb ? styles.columnWrapper : undefined}
          ListHeaderComponent={
            <View style={[styles.contentWrapper, isWeb && styles.contentWrapperWeb]}>
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

              {/* Filter Toggle Button */}
              <View style={styles.filterToggleContainer}>
                <TouchableOpacity style={styles.filterToggle} onPress={() => setShowFilters(!showFilters)}>
                  <Ionicons name={showFilters ? "chevron-up" : "chevron-down"} size={20} color="#166534" />
                  <Text style={styles.filterToggleText}>{showFilters ? "Hide" : "Show"} Filters</Text>
                </TouchableOpacity>
              </View>

              {/* Filters Section */}
              {showFilters && (
                <View style={styles.filtersContainer}>
                  <Text style={styles.filterSectionTitle}>Meal Type</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={isWeb}
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
                    showsHorizontalScrollIndicator={isWeb}
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
                    showsHorizontalScrollIndicator={isWeb}
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

                  {/* Tag Filter */}
                  {availableTags.length > 0 && (
                    <View style={styles.tagFilterSection}>
                      <View style={styles.tagFilterHeader}>
                        <View style={styles.tagFilterHeaderLeft}>
                          <Text style={styles.filterSectionTitle}>Filter by Tags</Text>
                          {selectedTags.length > 0 && (
                            <View style={styles.tagCountBadge}>
                              <Text style={styles.tagCountText}>{selectedTags.length}</Text>
                            </View>
                          )}
                        </View>
                        {selectedTags.length > 0 && (
                          <TouchableOpacity onPress={() => setSelectedTags([])} style={styles.clearTagsButton}>
                            <Ionicons name="close-circle" size={16} color="#ef4444" />
                            <Text style={styles.clearTagsText}>Clear All</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      <View style={styles.tagChipsContainer}>
                        {availableTags.map((tagObj) => {
                          const isSelected = selectedTags.includes(tagObj.tag)
                          return (
                            <TouchableOpacity
                              key={tagObj.tag}
                              style={[
                                styles.tagFilterChip,
                                isSelected && styles.tagFilterChipSelected
                              ]}
                              onPress={() => {
                                if (isSelected) {
                                  setSelectedTags(selectedTags.filter(t => t !== tagObj.tag))
                                } else {
                                  setSelectedTags([...selectedTags, tagObj.tag])
                                }
                              }}
                            >
                              {isSelected && (
                                <Ionicons name="checkmark-circle" size={14} color="#22c55e" style={{ marginRight: 4 }} />
                              )}
                              <Text style={[
                                styles.tagFilterChipText,
                                isSelected && styles.tagFilterChipTextSelected
                              ]}>
                                {tagObj.tag}
                              </Text>
                            </TouchableOpacity>
                          )
                        })}
                      </View>
                    </View>
                  )}

                  <View style={styles.ingredientFilterContainer}>
                    <TouchableOpacity
                      style={styles.ingredientFilterButton}
                      onPress={() => setShowIngredientFilter(!showIngredientFilter)}
                    >
                      <View style={[styles.checkboxContainer, showIngredientFilter ? styles.checkboxChecked : {}]}>
                        {showIngredientFilter && <Ionicons name="checkmark" size={16} color="white" />}
                      </View>
                      <Text style={styles.ingredientFilterText}>Show only recipes I can make with my ingredients</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          }
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#22c55e" />
                <Text style={styles.loadingText}>Loading recipes...</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="restaurant-outline" size={64} color="#9ca3af" />
                <Text style={styles.emptyTitle}>No recipes found</Text>
                <Text style={styles.emptyText}>Try adjusting your filters or search for different ingredients</Text>
              </View>
            )
          }
        />
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
  headerWeb: {
    paddingHorizontal: 24,
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
  recipeListContainerWeb: {
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 24,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  recipeCard: {
    marginBottom: 16,
    marginHorizontal: 8,
    padding: 0,
    overflow: "hidden",
    flex: 1,
    maxWidth: "100%",
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
  filterToggleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#166534",
    marginLeft: 8,
  },
  recommendationBadgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
    gap: 6,
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
  recommendationScoreSection: {
    marginBottom: 8,
    backgroundColor: "#fffbeb",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  recommendationScoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  recommendationScoreText: {
    fontSize: 13,
    color: "#92400e",
    fontWeight: "600",
    marginLeft: 4,
  },
  scoreBreakdownContainer: {
    paddingLeft: 20,
    gap: 4,
  },
  scoreBreakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  scoreBreakdownText: {
    fontSize: 11,
    color: "#64748b",
  },
  recipeTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
    alignItems: "center",
  },
  moreTagsText: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "500",
    marginLeft: 4,
  },
  tagFilterSection: {
    marginTop: 16,
  },
  tagFilterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tagFilterHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tagCountBadge: {
    backgroundColor: "#22c55e",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
  },
  tagCountText: {
    fontSize: 12,
    color: "white",
    fontWeight: "700",
  },
  clearTagsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearTagsText: {
    fontSize: 13,
    color: "#ef4444",
    fontWeight: "600",
  },
  tagChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    marginBottom: 4,
  },
  tagFilterChipSelected: {
    backgroundColor: "#dcfce7",
    borderColor: "#22c55e",
  },
  tagFilterChipText: {
    fontSize: 13,
    color: "#4b5563",
    fontWeight: "500",
  },
  tagFilterChipTextSelected: {
    color: "#166534",
    fontWeight: "600",
  },
  tagScrollViewWeb: {
    maxWidth: "100%",
    paddingBottom: 8,
  },
})
