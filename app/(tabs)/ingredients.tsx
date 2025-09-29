"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Pressable } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useAuth } from "@/hooks/useAuth"
import { ingredientService, type UserIngredientWithDetails } from "@/services/ingredientService"

// Components
import Card from "@/components/Card"
import Badge from "@/components/Badge"

type IngredientCategory = "Fruits" | "Vegetables" | "Protein" | "Dairy" | "Grains" | "Pantry"

// Define category styles
const CATEGORY_STYLES: Record<IngredientCategory, { color: string; bgColor: string }> = {
  Fruits: { color: "#f97316", bgColor: "#ffedd5" },
  Vegetables: { color: "#22c55e", bgColor: "#dcfce7" },
  Protein: { color: "#ef4444", bgColor: "#fee2e2" },
  Dairy: { color: "#3b82f6", bgColor: "#dbeafe" },
  Grains: { color: "#eab308", bgColor: "#fef9c3" },
  Pantry: { color: "#8b5cf6", bgColor: "#f3e8ff" },
}

export default function IngredientsScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [ingredients, setIngredients] = useState<UserIngredientWithDetails[]>([])
  const [filteredIngredients, setFilteredIngredients] = useState<UserIngredientWithDetails[]>([])
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory | "All">("All")
  const [showInStockOnly, setShowInStockOnly] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadIngredients()
    }
  }, [user])

  // Toggle ingredient stock status
  const toggleIngredientStock = async (ingredientId: string) => {
    if (!user) return

    try {
      const newStockStatus = await ingredientService.toggleIngredientStock(user.id, ingredientId)
      
      // Update local state
      const updatedIngredients = ingredients.map((userIngredient) =>
        userIngredient.ingredient_id === ingredientId 
          ? { ...userIngredient, in_stock: newStockStatus } 
          : userIngredient,
      )
      setIngredients(updatedIngredients)
      filterIngredients(searchQuery, selectedCategory, showInStockOnly, updatedIngredients)

      // Show a message to the user about meal suggestions
      if (newStockStatus) {
        setTimeout(() => {
          alert("Your meal suggestions have been updated based on your available ingredients!")
        }, 500)
      }
    } catch (error) {
      console.error('Error toggling ingredient stock:', error)
      alert('Failed to update ingredient status. Please try again.')
    }
  }

  const loadIngredients = async () => {
    if (!user) return

    try {
      setLoading(true)
      const userIngredients = await ingredientService.getUserIngredients(user.id)
      setIngredients(userIngredients)
      setFilteredIngredients(userIngredients)
    } catch (error) {
      console.error('Error loading ingredients:', error)
      alert('Failed to load ingredients. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Filter ingredients based on search query, category, and stock status
  const filterIngredients = (
    query: string,
    category: IngredientCategory | "All",
    inStockOnly: boolean,
    ingredientsList: UserIngredientWithDetails[] = ingredients,
  ) => {
    let filtered = [...ingredientsList]

    // Apply search filter
    if (query) {
      filtered = filtered.filter((userIngredient) => 
        userIngredient.ingredient.name.toLowerCase().includes(query.toLowerCase())
      )
    }

    // Apply category filter
    if (category !== "All") {
      filtered = filtered.filter((userIngredient) => 
        userIngredient.ingredient.category === category
      )
    }

    // Apply in-stock filter
    if (inStockOnly) {
      filtered = filtered.filter((userIngredient) => userIngredient.in_stock)
    }

    setFilteredIngredients(filtered)
  }

  // Group ingredients by category
  const groupedIngredients: Record<string, UserIngredientWithDetails[]> = {}
  filteredIngredients.forEach((item) => {
    const category = item.ingredient.category
    if (!groupedIngredients[category]) {
      groupedIngredients[category] = []
    }
    groupedIngredients[category].push(item)
  })

  // Render ingredient item
  const renderIngredientItem = ({ item }: { item: UserIngredientWithDetails }) => {
    const categoryStyle = CATEGORY_STYLES[item.ingredient.category as IngredientCategory]
    return (
      <Card style={styles.ingredientCard}>
        <View style={styles.ingredientHeader}>
          <View style={styles.ingredientTitleContainer}>
            <Badge text={item.ingredient.category} color={categoryStyle.color} backgroundColor={categoryStyle.bgColor} small />
            <Text style={styles.ingredientName}>{item.ingredient.name}</Text>
          </View>
          <TouchableOpacity
            style={[styles.stockButton, item.in_stock ? styles.inStockButton : styles.outOfStockButton]}
            onPress={() => toggleIngredientStock(item.ingredient_id)}
          >
            <Text
              style={[styles.stockButtonText, item.in_stock ? styles.inStockButtonText : styles.outOfStockButtonText]}
            >
              {item.in_stock ? "In Stock" : "Out of Stock"}
            </Text>
          </TouchableOpacity>
        </View>

        {item.in_stock && (
          <View style={styles.ingredientDetails}>
            {item.quantity && (
              <View style={styles.detailItem}>
                <Ionicons name="cube-outline" size={16} color="#4b5563" />
                <Text style={styles.detailText}>Quantity: {item.quantity}</Text>
              </View>
            )}
            {item.expiry_date && (
              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={16} color="#4b5563" />
                <Text style={styles.detailText}>Expires: {new Date(item.expiry_date).toLocaleDateString()}</Text>
              </View>
            )}
          </View>
        )}
      </Card>
    )
  }

  if (loading) {
    return (
      <LinearGradient colors={["#dcfce7", "#f0fdf4"]} style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your ingredients...</Text>
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#166534" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Ingredients</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              alert("Add ingredient feature coming soon!")
            }}
          >
            <Ionicons name="add" size={24} color="#166534" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search ingredients..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text)
                filterIngredients(text, selectedCategory, showInStockOnly)
              }}
            />
            {searchQuery ? (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("")
                  filterIngredients("", selectedCategory, showInStockOnly)
                }}
              >
                <Ionicons name="close-circle" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryFilters}>
            <Pressable
              style={[styles.categoryChip, selectedCategory === "All" ? styles.selectedCategoryChip : {}]}
              onPress={() => {
                setSelectedCategory("All")
                filterIngredients(searchQuery, "All", showInStockOnly)
              }}
            >
              <Text
                style={[styles.categoryChipText, selectedCategory === "All" ? styles.selectedCategoryChipText : {}]}
              >
                All
              </Text>
            </Pressable>

            {Object.keys(CATEGORY_STYLES).map((category) => {
              const catKey = category as IngredientCategory
              return (
                <Pressable
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === catKey ? styles.selectedCategoryChip : {},
                    { backgroundColor: selectedCategory === catKey ? CATEGORY_STYLES[catKey].color : "white" },
                  ]}
                  onPress={() => {
                    setSelectedCategory(catKey)
                    filterIngredients(searchQuery, catKey, showInStockOnly)
                  }}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === catKey ? styles.selectedCategoryChipText : {},
                      { color: selectedCategory === catKey ? "white" : CATEGORY_STYLES[catKey].color },
                    ]}
                  >
                    {category}
                  </Text>
                </Pressable>
              )
            })}
          </ScrollView>

          <TouchableOpacity
            style={styles.stockFilterButton}
            onPress={() => {
              setShowInStockOnly(!showInStockOnly)
              filterIngredients(searchQuery, selectedCategory, !showInStockOnly)
            }}
          >
            <View style={[styles.checkbox, showInStockOnly ? styles.checkboxChecked : {}]}>
              {showInStockOnly && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text style={styles.stockFilterText}>Show in-stock only</Text>
          </TouchableOpacity>
        </View>

        {/* Ingredients List */}
        <FlatList
          data={filteredIngredients}
          renderItem={renderIngredientItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ingredientsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="nutrition-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyTitle}>No ingredients found</Text>
              <Text style={styles.emptyText}>Try adjusting your filters or add new ingredients</Text>
            </View>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#166534",
  },
  addButton: {
    padding: 8,
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputContainer: {
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
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  categoryFilters: {
    paddingVertical: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "white",
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  selectedCategoryChip: {
    backgroundColor: "#22c55e",
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
  },
  selectedCategoryChipText: {
    color: "white",
  },
  stockFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  checkbox: {
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
  stockFilterText: {
    fontSize: 14,
    color: "#4b5563",
  },
  ingredientsList: {
    padding: 16,
    paddingTop: 8,
  },
  ingredientCard: {
    marginBottom: 12,
    padding: 16,
  },
  ingredientHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  ingredientTitleContainer: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 8,
  },
  stockButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  inStockButton: {
    backgroundColor: "#dcfce7",
  },
  outOfStockButton: {
    backgroundColor: "#fee2e2",
  },
  stockButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },
  inStockButtonText: {
    color: "#166534",
  },
  outOfStockButtonText: {
    color: "#b91c1c",
  },
  ingredientDetails: {
    marginTop: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: "#4b5563",
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
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
})
