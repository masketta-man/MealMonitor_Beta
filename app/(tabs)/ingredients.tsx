"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Pressable } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"

// Components
import Card from "@/components/Card"
import Badge from "@/components/Badge"

// Define types
type IngredientCategory = "Fruits" | "Vegetables" | "Protein" | "Dairy" | "Grains" | "Pantry"

interface Ingredient {
  id: number
  name: string
  category: IngredientCategory
  inStock: boolean
  quantity?: string
  expiryDate?: string
}

interface CategoryStyle {
  color: string
  bgColor: string
}

// Define category styles
const CATEGORY_STYLES: Record<IngredientCategory, CategoryStyle> = {
  Fruits: { color: "#f97316", bgColor: "#ffedd5" },
  Vegetables: { color: "#22c55e", bgColor: "#dcfce7" },
  Protein: { color: "#ef4444", bgColor: "#fee2e2" },
  Dairy: { color: "#3b82f6", bgColor: "#dbeafe" },
  Grains: { color: "#eab308", bgColor: "#fef9c3" },
  Pantry: { color: "#8b5cf6", bgColor: "#f3e8ff" },
}

// Mock data for ingredients
const MOCK_INGREDIENTS: Ingredient[] = [
  { id: 1, name: "Avocado", category: "Fruits", inStock: true, quantity: "2", expiryDate: "2023-06-15" },
  { id: 2, name: "Eggs", category: "Protein", inStock: true, quantity: "12", expiryDate: "2023-06-20" },
  { id: 3, name: "Bread", category: "Grains", inStock: true, quantity: "1 loaf", expiryDate: "2023-06-10" },
  { id: 4, name: "Tomatoes", category: "Vegetables", inStock: true, quantity: "4", expiryDate: "2023-06-12" },
  { id: 5, name: "Chicken Breast", category: "Protein", inStock: false },
  { id: 6, name: "Rice", category: "Grains", inStock: false },
  { id: 7, name: "Quinoa", category: "Grains", inStock: true, quantity: "500g", expiryDate: "2023-08-30" },
  { id: 8, name: "Cucumber", category: "Vegetables", inStock: true, quantity: "2", expiryDate: "2023-06-14" },
  { id: 9, name: "Milk", category: "Dairy", inStock: true, quantity: "1L", expiryDate: "2023-06-18" },
  { id: 10, name: "Cheese", category: "Dairy", inStock: true, quantity: "200g", expiryDate: "2023-06-25" },
  { id: 11, name: "Olive Oil", category: "Pantry", inStock: true, quantity: "500ml", expiryDate: "2023-12-31" },
  { id: 12, name: "Salt", category: "Pantry", inStock: true },
  { id: 13, name: "Pepper", category: "Pantry", inStock: true },
  { id: 14, name: "Bananas", category: "Fruits", inStock: true, quantity: "5", expiryDate: "2023-06-10" },
  { id: 15, name: "Apples", category: "Fruits", inStock: true, quantity: "6", expiryDate: "2023-06-20" },
]

export default function IngredientsScreen() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [ingredients, setIngredients] = useState<Ingredient[]>(MOCK_INGREDIENTS)
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>(MOCK_INGREDIENTS)
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory | "All">("All")
  const [showInStockOnly, setShowInStockOnly] = useState(false)

  // Toggle ingredient stock status
  const toggleIngredientStock = (id: number) => {
    const updatedIngredients = ingredients.map((ingredient) =>
      ingredient.id === id ? { ...ingredient, inStock: !ingredient.inStock } : ingredient,
    )
    setIngredients(updatedIngredients)
    filterIngredients(searchQuery, selectedCategory, showInStockOnly, updatedIngredients)

    // Show a message to the user about meal suggestions
    if (updatedIngredients.find((i) => i.id === id)?.inStock) {
      // Only show when toggling to "in stock"
      setTimeout(() => {
        alert("Your meal suggestions have been updated based on your available ingredients!")
      }, 500)
    }
  }

  // Filter ingredients based on search query, category, and stock status
  const filterIngredients = (
    query: string,
    category: IngredientCategory | "All",
    inStockOnly: boolean,
    ingredientsList: Ingredient[] = ingredients,
  ) => {
    let filtered = [...ingredientsList]

    // Apply search filter
    if (query) {
      filtered = filtered.filter((ingredient) => ingredient.name.toLowerCase().includes(query.toLowerCase()))
    }

    // Apply category filter
    if (category !== "All") {
      filtered = filtered.filter((ingredient) => ingredient.category === category)
    }

    // Apply in-stock filter
    if (inStockOnly) {
      filtered = filtered.filter((ingredient) => ingredient.inStock)
    }

    setFilteredIngredients(filtered)
  }

  // Group ingredients by category
  const groupedIngredients: Record<string, Ingredient[]> = {}
  filteredIngredients.forEach((item) => {
    if (!groupedIngredients[item.category]) {
      groupedIngredients[item.category] = []
    }
    groupedIngredients[item.category].push(item)
  })

  // Render ingredient item
  const renderIngredientItem = ({ item }: { item: Ingredient }) => {
    const categoryStyle = CATEGORY_STYLES[item.category as IngredientCategory]
    return (
      <Card style={styles.ingredientCard}>
        <View style={styles.ingredientHeader}>
          <View style={styles.ingredientTitleContainer}>
            <Badge text={item.category} color={categoryStyle.color} backgroundColor={categoryStyle.bgColor} small />
            <Text style={styles.ingredientName}>{item.name}</Text>
          </View>
          <TouchableOpacity
            style={[styles.stockButton, item.inStock ? styles.inStockButton : styles.outOfStockButton]}
            onPress={() => toggleIngredientStock(item.id)}
          >
            <Text
              style={[styles.stockButtonText, item.inStock ? styles.inStockButtonText : styles.outOfStockButtonText]}
            >
              {item.inStock ? "In Stock" : "Out of Stock"}
            </Text>
          </TouchableOpacity>
        </View>

        {item.inStock && (
          <View style={styles.ingredientDetails}>
            {item.quantity && (
              <View style={styles.detailItem}>
                <Ionicons name="cube-outline" size={16} color="#4b5563" />
                <Text style={styles.detailText}>Quantity: {item.quantity}</Text>
              </View>
            )}
            {item.expiryDate && (
              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={16} color="#4b5563" />
                <Text style={styles.detailText}>Expires: {item.expiryDate}</Text>
              </View>
            )}
          </View>
        )}
      </Card>
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
              const newId = Math.max(...ingredients.map((i) => i.id)) + 1
              const newIngredient = {
                id: newId,
                name: "New Ingredient",
                category: "Pantry" as IngredientCategory,
                inStock: true,
              }
              const updatedIngredients = [...ingredients, newIngredient]
              setIngredients(updatedIngredients)
              setFilteredIngredients(updatedIngredients)
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
          keyExtractor={(item) => item.id.toString()}
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
