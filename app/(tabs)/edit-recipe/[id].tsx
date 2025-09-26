"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"

// Types
import { Recipe, RecipeCollection, Ingredient } from "@/types/recipe"

// Components
import Card from "@/components/Card"
import Button from "@/components/Button"

// Mock recipe data
const MOCK_RECIPES: RecipeCollection = {
  "1": {
    id: "1",
    name: "Avocado & Egg Toast",
    prepTime: "15",
    difficulty: "Beginner",
    mealType: "Breakfast",
    ingredients: [
      { name: "Avocado", amount: "1 medium" },
      { name: "Eggs", amount: "2 large" },
      { name: "Whole grain bread", amount: "2 slices" },
      { name: "Cherry tomatoes", amount: "1/2 cup" },
      { name: "Salt", amount: "to taste" },
      { name: "Black pepper", amount: "to taste" },
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
  },
  "2": {
    id: "2",
    name: "Mediterranean Salad",
    prepTime: "20",
    difficulty: "Intermediate",
    mealType: "Lunch",
    ingredients: [
      { name: "Grilled chicken breast", amount: "6 oz" },
      { name: "Romaine lettuce", amount: "2 cups" },
      { name: "Cucumber", amount: "1/2 medium" },
      { name: "Kalamata olives", amount: "1/4 cup" },
      { name: "Feta cheese", amount: "1/4 cup" },
      { name: "Cherry tomatoes", amount: "1/2 cup" },
    ],
    instructions: [
      "Chop the romaine lettuce and place in a large bowl.",
      "Dice the cucumber, tomatoes, and red onion.",
      "Slice the olives in half.",
      "Crumble the feta cheese.",
      "Add all vegetables and cheese to the bowl with lettuce.",
      "Slice the grilled chicken breast and add to the salad.",
    ],
  },
  "3": {
    id: "3",
    name: "Vegetable Stir Fry",
    prepTime: "25",
    difficulty: "Intermediate",
    mealType: "Dinner",
    ingredients: [
      { name: "Tofu", amount: "14 oz" },
      { name: "Broccoli", amount: "1 cup" },
      { name: "Carrots", amount: "2 medium" },
      { name: "Bell peppers", amount: "1 large" },
      { name: "Soy sauce", amount: "3 tbsp" },
      { name: "Ginger", amount: "1 tbsp, minced" },
      { name: "Garlic", amount: "2 cloves, minced" },
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
      "Serve hot over rice or noodles.",
    ],
  },
}

export default function EditRecipeScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ id: string }>()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [recipeName, setRecipeName] = useState("")
  const [prepTime, setPrepTime] = useState("")
  const [difficulty, setDifficulty] = useState("Beginner")
  const [mealType, setMealType] = useState("Breakfast")
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: "", amount: "" }])
  const [instructions, setInstructions] = useState<string[]>([""])

  const difficultyOptions = ["Beginner", "Intermediate", "Advanced"]
  const mealTypeOptions = ["Breakfast", "Lunch", "Dinner", "Snack"]

  // Load recipe data
  useEffect(() => {
    // In a real app, you would fetch the recipe by ID from an API
    if (params.id) {
      const selectedRecipe = MOCK_RECIPES[params.id]
      if (selectedRecipe) {
        setRecipe(selectedRecipe)
        setRecipeName(selectedRecipe.name || selectedRecipe.title || "")
        setPrepTime(selectedRecipe.prepTime || "")
        setDifficulty(selectedRecipe.difficulty || "Beginner")
        setMealType(selectedRecipe.mealType || "Breakfast")
        setIngredients(selectedRecipe.ingredients || [{ name: "", amount: "" }])
        setInstructions(selectedRecipe.instructions || [""])
      }
    }
  }, [params.id])

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "" }])
  }

  const updateIngredient = (index: number, field: "name" | "amount", value: string) => {
    const updatedIngredients = [...ingredients]
    updatedIngredients[index][field] = value
    setIngredients(updatedIngredients)
  }

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      const updatedIngredients = [...ingredients]
      updatedIngredients.splice(index, 1)
      setIngredients(updatedIngredients)
    }
  }

  const addInstruction = () => {
    setInstructions([...instructions, ""])
  }

  const updateInstruction = (index: number, value: string) => {
    const updatedInstructions = [...instructions]
    updatedInstructions[index] = value
    setInstructions(updatedInstructions)
  }

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      const updatedInstructions = [...instructions]
      updatedInstructions.splice(index, 1)
      setInstructions(updatedInstructions)
    }
  }

  const handleSave = () => {
    // In a real app, you would save the recipe to an API
    if (params.id) {
      console.log("Saving recipe:", {
        id: params.id,
        name: recipeName,
        prepTime,
        difficulty,
        mealType,
        ingredients,
        instructions,
      })

      // Navigate back to the recipe detail screen
      router.back()
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#166534" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Recipe</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Recipe Basic Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Recipe Name</Text>
            <TextInput
              style={styles.textInput}
              value={recipeName}
              onChangeText={setRecipeName}
              placeholder="Enter recipe name"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Preparation Time (minutes)</Text>
            <TextInput
              style={styles.textInput}
              value={prepTime}
              onChangeText={setPrepTime}
              placeholder="e.g. 30"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Difficulty</Text>
            <View style={styles.optionsContainer}>
              {difficultyOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionButton, difficulty === option ? styles.optionButtonSelected : {}]}
                  onPress={() => setDifficulty(option)}
                >
                  <Text style={[styles.optionButtonText, difficulty === option ? styles.optionButtonTextSelected : {}]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Meal Type</Text>
            <View style={styles.optionsContainer}>
              {mealTypeOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionButton, mealType === option ? styles.optionButtonSelected : {}]}
                  onPress={() => setMealType(option)}
                >
                  <Text style={[styles.optionButtonText, mealType === option ? styles.optionButtonTextSelected : {}]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>

        {/* Ingredients */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>

          {ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientRow}>
              <View style={styles.ingredientInputs}>
                <TextInput
                  style={[styles.textInput, styles.ingredientNameInput]}
                  value={ingredient.name}
                  onChangeText={(value) => updateIngredient(index, "name", value)}
                  placeholder="Ingredient name"
                  placeholderTextColor="#9ca3af"
                />
                <TextInput
                  style={[styles.textInput, styles.ingredientAmountInput]}
                  value={ingredient.amount}
                  onChangeText={(value) => updateIngredient(index, "amount", value)}
                  placeholder="Amount"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeIngredient(index)}
                disabled={ingredients.length === 1}
              >
                <Ionicons name="trash-outline" size={20} color={ingredients.length === 1 ? "#d1d5db" : "#ef4444"} />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
            <Ionicons name="add-circle-outline" size={20} color="#22c55e" />
            <Text style={styles.addButtonText}>Add Ingredient</Text>
          </TouchableOpacity>
        </Card>

        {/* Instructions */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>

          {instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionRow}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>{index + 1}</Text>
              </View>
              <TextInput
                style={[styles.textInput, styles.instructionInput]}
                value={instruction}
                onChangeText={(value) => updateInstruction(index, value)}
                placeholder="Describe this step..."
                placeholderTextColor="#9ca3af"
                multiline
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeInstruction(index)}
                disabled={instructions.length === 1}
              >
                <Ionicons name="trash-outline" size={20} color={instructions.length === 1 ? "#d1d5db" : "#ef4444"} />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addButton} onPress={addInstruction}>
            <Ionicons name="add-circle-outline" size={20} color="#22c55e" />
            <Text style={styles.addButtonText}>Add Step</Text>
          </TouchableOpacity>
        </Card>

        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <Button text="Save Changes" color="white" backgroundColor="#22c55e" onPress={handleSave} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
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
    boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.05)",
    elevation: 2,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#166534",
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#22c55e",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1f2937",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginRight: 8,
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: "#dcfce7",
    borderColor: "#22c55e",
  },
  optionButtonText: {
    fontSize: 14,
    color: "#4b5563",
  },
  optionButtonTextSelected: {
    color: "#166534",
    fontWeight: "600",
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ingredientInputs: {
    flex: 1,
    flexDirection: "row",
  },
  ingredientNameInput: {
    flex: 2,
    marginRight: 8,
  },
  ingredientAmountInput: {
    flex: 1,
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#22c55e",
    marginLeft: 4,
  },
  instructionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginTop: 8,
  },
  instructionNumberText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#166534",
  },
  instructionInput: {
    flex: 1,
    minHeight: 80,
    textAlignVertical: "top",
  },
  saveButtonContainer: {
    padding: 16,
    marginBottom: 32,
  },
})
