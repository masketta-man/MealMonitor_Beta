import { useAuth } from "@/hooks/useAuth"
import {
    ingredientService,
    type UserIngredientWithDetails,
} from "@/services/ingredientService"
import { Database } from "@/types/database"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

type Ingredient = Database["public"]["Tables"]["ingredients"]["Row"]

// Components
import Badge from "@/components/Badge"
import Card from "@/components/Card"

type IngredientCategory =
  | "Fruits"
  | "Vegetables"
  | "Protein"
  | "Dairy"
  | "Grains"
  | "Pantry"

// Define category styles
const CATEGORY_STYLES: Record<
  IngredientCategory,
  { color: string; bgColor: string }
> = {
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
  const { width } = useWindowDimensions()
  const isWeb = width > 768
  const [searchQuery, setSearchQuery] = useState("")
  const [ingredients, setIngredients] = useState<UserIngredientWithDetails[]>(
    [],
  )
  const [filteredIngredients, setFilteredIngredients] = useState<
    UserIngredientWithDetails[]
  >([])
  const [selectedCategory, setSelectedCategory] = useState<
    IngredientCategory | "All"
  >("All")
  const [loading, setLoading] = useState(true)

  // Add ingredient modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [availableIngredients, setAvailableIngredients] = useState<
    Ingredient[]
  >([])
  const [modalSearchQuery, setModalSearchQuery] = useState("")
  const [modalSelectedCategory, setModalSelectedCategory] = useState<
    IngredientCategory | "All"
  >("All")
  const [filteredAvailableIngredients, setFilteredAvailableIngredients] =
    useState<Ingredient[]>([])
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null)
  const [quantity, setQuantity] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [addingIngredient, setAddingIngredient] = useState(false)

  useEffect(() => {
    if (user) {
      loadIngredients()
    }
  }, [user])

  useEffect(() => {
    if (showAddModal) {
      loadAvailableIngredients()
    }
  }, [showAddModal])

  useEffect(() => {
    filterAvailableIngredients()
  }, [
    modalSearchQuery,
    modalSelectedCategory,
    availableIngredients,
    ingredients,
  ])

  const loadIngredients = async () => {
    if (!user) return

    try {
      setLoading(true)
      const userIngredients = await ingredientService.getUserIngredients(
        user.id,
      )
      setIngredients(userIngredients)
      setFilteredIngredients(userIngredients)
    } catch (error) {
      console.error("Error loading ingredients:", error)
      Alert.alert("Error", "Failed to load ingredients. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableIngredients = async () => {
    try {
      const allIngredients = await ingredientService.getAllIngredients()
      setAvailableIngredients(allIngredients)
    } catch (error) {
      console.error("Error loading available ingredients:", error)
      Alert.alert("Error", "Failed to load ingredients list.")
    }
  }

  const filterAvailableIngredients = () => {
    // Get IDs of ingredients user already has
    const userIngredientIds = new Set(ingredients.map((ui) => ui.ingredient_id))

    // Filter out ingredients user already has
    let filtered = availableIngredients.filter(
      (ing) => !userIngredientIds.has(ing.id),
    )

    // Apply category filter
    if (modalSelectedCategory !== "All") {
      filtered = filtered.filter(
        (ing) => ing.category === modalSelectedCategory,
      )
    }

    // Apply search filter
    if (modalSearchQuery) {
      filtered = filtered.filter((ing) =>
        ing.name.toLowerCase().includes(modalSearchQuery.toLowerCase()),
      )
    }

    setFilteredAvailableIngredients(filtered)
  }

  const handleAddIngredient = async () => {
    if (!user || !selectedIngredient) return

    try {
      setAddingIngredient(true)
      const result = await ingredientService.addUserIngredient(
        user.id,
        selectedIngredient.id,
        quantity || undefined,
        expiryDate || undefined,
      )

      if (result) {
        Alert.alert(
          "Success",
          `${selectedIngredient.name} has been added to your pantry!`,
        )
        // Reload ingredients to show the new one
        await loadIngredients()
        // Close modal and reset form
        closeAddModal()
      } else {
        Alert.alert("Error", "Failed to add ingredient. Please try again.")
      }
    } catch (error) {
      console.error("Error adding ingredient:", error)
      Alert.alert("Error", "Failed to add ingredient. Please try again.")
    } finally {
      setAddingIngredient(false)
    }
  }

  const handleDeleteIngredient = async (
    userIngredientId: string,
    ingredientName: string,
  ) => {
    console.log("Delete button pressed for:", ingredientName, userIngredientId)

    // Web-compatible confirmation
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `Are you sure you want to remove ${ingredientName} from your pantry?`,
      )
      console.log("Web confirmation result:", confirmed)

      if (!confirmed) {
        console.log("Deletion cancelled by user")
        return
      }

      console.log("Delete confirmed for:", ingredientName)
      try {
        const success =
          await ingredientService.removeUserIngredient(userIngredientId)
        console.log("Delete result:", success)

        if (success) {
          console.log("Updating local state after deletion")
          // Update local state - filter out the deleted ingredient
          const updatedIngredients = ingredients.filter(
            (ing) => ing.id !== userIngredientId,
          )
          const updatedFilteredIngredients = filteredIngredients.filter(
            (ing) => ing.id !== userIngredientId,
          )

          setIngredients(updatedIngredients)
          setFilteredIngredients(updatedFilteredIngredients)

          console.log(
            "State updated. Remaining ingredients:",
            updatedIngredients.length,
          )
          alert(`${ingredientName} has been removed from your pantry.`)
        } else {
          alert("Failed to delete ingredient. Please try again.")
        }
      } catch (error) {
        console.error("Error deleting ingredient:", error)
        alert("Failed to delete ingredient. Please try again.")
      }
    } else {
      // Native platform - use Alert.alert
      Alert.alert(
        "Delete Ingredient",
        `Are you sure you want to remove ${ingredientName} from your pantry?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              console.log("Delete confirmed for:", ingredientName)
              try {
                const success =
                  await ingredientService.removeUserIngredient(userIngredientId)
                console.log("Delete result:", success)

                if (success) {
                  console.log("Updating local state after deletion")
                  // Update local state - filter out the deleted ingredient
                  const updatedIngredients = ingredients.filter(
                    (ing) => ing.id !== userIngredientId,
                  )
                  const updatedFilteredIngredients = filteredIngredients.filter(
                    (ing) => ing.id !== userIngredientId,
                  )

                  setIngredients(updatedIngredients)
                  setFilteredIngredients(updatedFilteredIngredients)

                  console.log(
                    "State updated. Remaining ingredients:",
                    updatedIngredients.length,
                  )
                  Alert.alert(
                    "Success",
                    `${ingredientName} has been removed from your pantry.`,
                  )
                } else {
                  Alert.alert(
                    "Error",
                    "Failed to delete ingredient. Please try again.",
                  )
                }
              } catch (error) {
                console.error("Error deleting ingredient:", error)
                Alert.alert(
                  "Error",
                  "Failed to delete ingredient. Please try again.",
                )
              }
            },
          },
        ],
      )
    }
  }

  const openAddModal = () => {
    setShowAddModal(true)
    setModalSearchQuery("")
    setModalSelectedCategory("All")
    setSelectedIngredient(null)
    setQuantity("")
    setExpiryDate("")
  }

  const closeAddModal = () => {
    setShowAddModal(false)
    setModalSearchQuery("")
    setModalSelectedCategory("All")
    setSelectedIngredient(null)
    setQuantity("")
    setExpiryDate("")
  }

  // Filter ingredients based on search query and category
  const filterIngredients = (
    query: string,
    category: IngredientCategory | "All",
    ingredientsList: UserIngredientWithDetails[] = ingredients,
  ) => {
    let filtered = [...ingredientsList]

    // Apply search filter
    if (query) {
      filtered = filtered.filter((userIngredient) =>
        userIngredient.ingredient.name
          .toLowerCase()
          .includes(query.toLowerCase()),
      )
    }

    // Apply category filter
    if (category !== "All") {
      filtered = filtered.filter(
        (userIngredient) => userIngredient.ingredient.category === category,
      )
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
  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return null
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const exp = new Date(expiryDate)
    exp.setHours(0, 0, 0, 0)
    const daysLeft = Math.ceil(
      (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    )
    if (daysLeft < 0)
      return {
        label: "Expired",
        color: "#dc2626",
        bg: "#fef2f2",
        icon: "close-circle" as const,
        daysLeft,
      }
    if (daysLeft <= 3)
      return {
        label: daysLeft === 0 ? "Expires today" : `${daysLeft}d left`,
        color: "#d97706",
        bg: "#fffbeb",
        icon: "warning" as const,
        daysLeft,
      }
    return {
      label: "Fresh",
      color: "#16a34a",
      bg: "#dcfce7",
      icon: "checkmark-circle" as const,
      daysLeft,
    }
  }

  const renderIngredientItem = ({
    item,
  }: {
    item: UserIngredientWithDetails
  }) => {
    const categoryStyle =
      CATEGORY_STYLES[item.ingredient.category as IngredientCategory]
    const expiry = getExpiryStatus(item.expiry_date)
    const isExpired = expiry !== null && expiry.daysLeft < 0

    return (
      <Card
        style={[
          styles.ingredientCard,
          isExpired && styles.ingredientCardExpired,
        ]}
      >
        <View style={styles.ingredientHeader}>
          <View style={styles.ingredientTitleContainer}>
            <Badge
              text={item.ingredient.category}
              color={categoryStyle.color}
              backgroundColor={categoryStyle.bgColor}
              small
            />
            <Text style={styles.ingredientName}>{item.ingredient.name}</Text>
          </View>
          <View style={styles.ingredientActions}>
            {expiry && (
              <View style={[styles.expiryChip, { backgroundColor: expiry.bg }]}>
                <Ionicons name={expiry.icon} size={12} color={expiry.color} />
                <Text style={[styles.expiryChipText, { color: expiry.color }]}>
                  {expiry.label}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() =>
                handleDeleteIngredient(item.id, item.ingredient.name)
              }
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={20} color="#dc2626" />
            </TouchableOpacity>
          </View>
        </View>

        {(item.quantity || item.expiry_date) && (
          <View style={styles.ingredientDetails}>
            {item.quantity && (
              <View style={styles.detailItem}>
                <Ionicons name="cube-outline" size={16} color="#4b5563" />
                <Text style={styles.detailText}>Notes: {item.quantity}</Text>
              </View>
            )}
            {item.expiry_date && expiry && (
              <View style={styles.detailItem}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={expiry.color}
                />
                <Text
                  style={[
                    styles.detailText,
                    {
                      color: expiry.color,
                      fontWeight:
                        isExpired || expiry.daysLeft <= 3 ? "600" : "400",
                    },
                  ]}
                >
                  {isExpired
                    ? `Expired ${new Date(item.expiry_date).toLocaleDateString()}`
                    : `Expires ${new Date(item.expiry_date).toLocaleDateString()}`}
                </Text>
              </View>
            )}
          </View>
        )}

        {isExpired && (
          <View style={styles.expiredBanner}>
            <Ionicons name="information-circle" size={14} color="#dc2626" />
            <Text style={styles.expiredBannerText}>
              Not counted towards recipe matching
            </Text>
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
        <View style={[styles.header, isWeb && styles.headerWeb]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#166534" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Ingredients</Text>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Ionicons name="add" size={24} color="#166534" />
          </TouchableOpacity>
        </View>

        {/* Ingredients List with Header */}
        <FlatList
          data={filteredIngredients}
          renderItem={renderIngredientItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.ingredientsList,
            isWeb && styles.ingredientsListWeb,
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View
              style={[styles.contentWrapper, isWeb && styles.contentWrapperWeb]}
            >
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                  <Ionicons
                    name="search"
                    size={20}
                    color="#9ca3af"
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search ingredients..."
                    placeholderTextColor="#9ca3af"
                    value={searchQuery}
                    onChangeText={(text) => {
                      setSearchQuery(text)
                      filterIngredients(text, selectedCategory)
                    }}
                  />
                  {searchQuery ? (
                    <TouchableOpacity
                      onPress={() => {
                        setSearchQuery("")
                        filterIngredients("", selectedCategory)
                      }}
                    >
                      <Ionicons name="close-circle" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>

              {/* Filters */}
              <View style={styles.filtersContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoryFilters}
                >
                  <Pressable
                    style={[
                      styles.categoryChip,
                      selectedCategory === "All"
                        ? styles.selectedCategoryChip
                        : {},
                    ]}
                    onPress={() => {
                      setSelectedCategory("All")
                      filterIngredients(searchQuery, "All")
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedCategory === "All"
                          ? styles.selectedCategoryChipText
                          : {},
                      ]}
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
                          selectedCategory === catKey
                            ? styles.selectedCategoryChip
                            : {},
                          {
                            backgroundColor:
                              selectedCategory === catKey
                                ? CATEGORY_STYLES[catKey].color
                                : "white",
                          },
                        ]}
                        onPress={() => {
                          setSelectedCategory(catKey)
                          filterIngredients(searchQuery, catKey)
                        }}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            selectedCategory === catKey
                              ? styles.selectedCategoryChipText
                              : {},
                            {
                              color:
                                selectedCategory === catKey
                                  ? "white"
                                  : CATEGORY_STYLES[catKey].color,
                            },
                          ]}
                        >
                          {category}
                        </Text>
                      </Pressable>
                    )
                  })}
                </ScrollView>
              </View>

              {/* Prominent, labeled entry point. The header "+" alone was easy to
                  miss, leaving users unsure how to add ingredients. */}
              <TouchableOpacity
                style={styles.addIngredientCta}
                onPress={openAddModal}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle" size={20} color="white" />
                <Text style={styles.addIngredientCtaText}>Add Ingredient</Text>
              </TouchableOpacity>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="nutrition-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyTitle}>No ingredients found</Text>
              <Text style={styles.emptyText}>
                Add ingredients you have on hand to get recipe matches.
              </Text>
              <TouchableOpacity
                style={styles.emptyAddButton}
                onPress={openAddModal}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle" size={20} color="white" />
                <Text style={styles.emptyAddButtonText}>Add Ingredient</Text>
              </TouchableOpacity>
            </View>
          }
        />

        {/* Add Ingredient Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          transparent={true}
          onRequestClose={closeAddModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Ingredient</Text>
                <TouchableOpacity onPress={closeAddModal}>
                  <Ionicons name="close" size={28} color="#166534" />
                </TouchableOpacity>
              </View>

              {!selectedIngredient ? (
                <>
                  {/* Search Bar */}
                  <View style={styles.modalSearchContainer}>
                    <Ionicons
                      name="search"
                      size={20}
                      color="#9ca3af"
                      style={styles.searchIcon}
                    />
                    <TextInput
                      style={styles.modalSearchInput}
                      placeholder="Search ingredients..."
                      placeholderTextColor="#9ca3af"
                      value={modalSearchQuery}
                      onChangeText={setModalSearchQuery}
                      autoFocus
                    />
                  </View>

                  {/* Category filter chips */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.modalCategoryFilters}
                    contentContainerStyle={styles.modalCategoryFiltersContent}
                  >
                    <Pressable
                      style={[
                        styles.categoryChip,
                        modalSelectedCategory === "All"
                          ? styles.selectedCategoryChip
                          : {},
                      ]}
                      onPress={() => setModalSelectedCategory("All")}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          modalSelectedCategory === "All"
                            ? styles.selectedCategoryChipText
                            : {},
                        ]}
                      >
                        All
                      </Text>
                    </Pressable>

                    {Object.keys(CATEGORY_STYLES).map((category) => {
                      const catKey = category as IngredientCategory
                      const active = modalSelectedCategory === catKey
                      return (
                        <Pressable
                          key={category}
                          style={[
                            styles.categoryChip,
                            {
                              backgroundColor: active
                                ? CATEGORY_STYLES[catKey].color
                                : "white",
                            },
                          ]}
                          onPress={() => setModalSelectedCategory(catKey)}
                        >
                          <Text
                            style={[
                              styles.categoryChipText,
                              {
                                color: active
                                  ? "white"
                                  : CATEGORY_STYLES[catKey].color,
                              },
                            ]}
                          >
                            {category}
                          </Text>
                        </Pressable>
                      )
                    })}
                  </ScrollView>

                  {/* Available Ingredients List */}
                  <FlatList
                    data={filteredAvailableIngredients}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                      const categoryStyle =
                        CATEGORY_STYLES[item.category as IngredientCategory]
                      return (
                        <TouchableOpacity
                          style={styles.modalIngredientItem}
                          onPress={() => setSelectedIngredient(item)}
                        >
                          <Badge
                            text={item.category}
                            color={categoryStyle.color}
                            backgroundColor={categoryStyle.bgColor}
                            small
                          />
                          <Text style={styles.modalIngredientName}>
                            {item.name}
                          </Text>
                          <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#9ca3af"
                          />
                        </TouchableOpacity>
                      )
                    }}
                    ListEmptyComponent={
                      <View style={styles.modalEmptyState}>
                        <Ionicons
                          name="search-outline"
                          size={48}
                          color="#cbd5e1"
                        />
                        <Text style={styles.modalEmptyText}>
                          {availableIngredients.length === 0
                            ? "Loading ingredients..."
                            : "No ingredients found"}
                        </Text>
                      </View>
                    }
                  />
                </>
              ) : (
                <>
                  {/* Selected Ingredient Details Form */}
                  <ScrollView style={styles.ingredientForm}>
                    <View style={styles.selectedIngredientHeader}>
                      <TouchableOpacity
                        onPress={() => setSelectedIngredient(null)}
                        style={styles.backButton}
                      >
                        <Ionicons name="arrow-back" size={24} color="#166534" />
                      </TouchableOpacity>
                      <Text style={styles.selectedIngredientName}>
                        {selectedIngredient.name}
                      </Text>
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>Notes (Optional)</Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder="e.g., 500g, 2 cans, half a bag"
                        placeholderTextColor="#9ca3af"
                        value={quantity}
                        onChangeText={setQuantity}
                      />
                      <Text style={styles.formHint}>
                        For your reference only — doesn&rsquo;t affect recipe
                        matching.
                      </Text>
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>
                        Expiry Date (Optional)
                      </Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#9ca3af"
                        value={expiryDate}
                        onChangeText={setExpiryDate}
                      />
                      <Text style={styles.formHint}>
                        Format: YYYY-MM-DD (e.g., 2025-12-31)
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.addIngredientButton,
                        addingIngredient && styles.addIngredientButtonDisabled,
                      ]}
                      onPress={handleAddIngredient}
                      disabled={addingIngredient}
                    >
                      {addingIngredient ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <>
                          <Ionicons name="add-circle" size={24} color="white" />
                          <Text style={styles.addIngredientButtonText}>
                            Add to Pantry
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </ScrollView>
                </>
              )}
            </View>
          </View>
        </Modal>
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
  addIngredientCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#22c55e",
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 12,
    borderRadius: 14,
  },
  addIngredientCtaText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
  ingredientsList: {
    padding: 16,
    paddingTop: 8,
  },
  ingredientsListWeb: {
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 24,
  },
  ingredientCard: {
    marginBottom: 12,
    padding: 16,
  },
  ingredientCardExpired: {
    borderLeftWidth: 3,
    borderLeftColor: "#dc2626",
  },
  expiryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 3,
    marginRight: 8,
  },
  expiryChipText: {
    fontSize: 11,
    fontWeight: "700",
  },
  expiredBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#fee2e2",
  },
  expiredBannerText: {
    fontSize: 12,
    color: "#dc2626",
    fontWeight: "600",
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
  emptyAddButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#22c55e",
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  emptyAddButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
  ingredientActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButton: {
    padding: 10,
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    minWidth: 40,
    minHeight: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#166534",
  },
  modalSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  modalSearchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#1f2937",
  },
  modalCategoryFilters: {
    flexGrow: 0,
    marginBottom: 12,
  },
  modalCategoryFiltersContent: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    alignItems: "center",
  },
  modalIngredientItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalIngredientName: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
    marginLeft: 12,
    fontWeight: "600",
  },
  modalEmptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  modalEmptyText: {
    fontSize: 16,
    color: "#9ca3af",
    marginTop: 16,
  },
  ingredientForm: {
    padding: 20,
  },
  selectedIngredientHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  selectedIngredientName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#166534",
    marginLeft: 12,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1f2937",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  formHint: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },
  addIngredientButton: {
    backgroundColor: "#166534",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  addIngredientButtonDisabled: {
    opacity: 0.6,
  },
  addIngredientButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
  },
})
