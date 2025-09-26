"use client"

import { useState } from "react"
import { StyleSheet, View, Pressable, Animated, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"

export default function FloatingActionButton() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const animation = useState(new Animated.Value(0))[0]

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1

    Animated.spring(animation, {
      toValue,
      friction: 6,
      useNativeDriver: true,
    }).start()

    setIsOpen(!isOpen)
  }

  const scanRecipeStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -80],
        }),
      },
    ],
    opacity: animation,
  }

  const addIngredientStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -140],
        }),
      },
    ],
    opacity: animation,
  }

  const mealSuggestionStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -200],
        }),
      },
    ],
    opacity: animation,
  }

  const rotation = {
    transform: [
      {
        rotate: animation.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "45deg"],
        }),
      },
    ],
  }

  const navigateToCreateRecipe = () => {
    toggleMenu()
    router.push("/create-recipe")
  }

  const navigateToAddIngredients = () => {
    toggleMenu()
    router.push("/(tabs)/ingredients")
  }

  const navigateToMealSuggestions = () => {
    toggleMenu()
    router.push("/(tabs)/recipes?suggestions=true")
  }

  return (
    <View style={styles.container}>
      {/* Background overlay when menu is open */}
      {isOpen && <Pressable style={styles.overlay} onPress={toggleMenu} />}

      {/* Add Ingredients Button */}
      <Animated.View style={[styles.actionButton, styles.secondaryButton, addIngredientStyle]}>
        <Pressable onPress={navigateToAddIngredients} style={styles.actionButtonInner}>
          <Ionicons name="basket" size={20} color="white" />
        </Pressable>
        <View style={styles.actionLabel}>
          <Text style={styles.actionLabelText}>Add Ingredients</Text>
        </View>
      </Animated.View>

      {/* Meal Suggestions Button */}
      <Animated.View style={[styles.actionButton, styles.secondaryButton, mealSuggestionStyle]}>
        <Pressable onPress={navigateToMealSuggestions} style={styles.actionButtonInner}>
          <Ionicons name="nutrition" size={20} color="white" />
        </Pressable>
        <View style={styles.actionLabel}>
          <Text style={styles.actionLabelText}>Meal Suggestions</Text>
        </View>
      </Animated.View>

      {/* Create Recipe Button */}
      <Animated.View style={[styles.actionButton, styles.secondaryButton, scanRecipeStyle]}>
        <Pressable onPress={navigateToCreateRecipe} style={styles.actionButtonInner}>
          <Ionicons name="restaurant" size={20} color="white" />
        </Pressable>
        <View style={styles.actionLabel}>
          <Text style={styles.actionLabelText}>Create Recipe</Text>
        </View>
      </Animated.View>

      {/* Main FAB Button */}
      <Animated.View style={[styles.actionButton, styles.mainButton, rotation]}>
        <Pressable onPress={toggleMenu} style={styles.actionButtonInner}>
          <Ionicons name="add" size={24} color="white" />
        </Pressable>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    position: "relative",
  },
  overlay: {
    position: "absolute",
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  actionButton: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
    elevation: 5,
  },
  actionButtonInner: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  mainButton: {
    backgroundColor: "#22c55e",
  },
  secondaryButton: {
    backgroundColor: "#16a34a",
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  actionLabel: {
    position: "absolute",
    right: 60,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actionLabelText: {
    color: "white",
    fontSize: 12,
  },
})
