"use client"

import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { useRouter } from "expo-router"
import { useRef, useState } from "react"
import { Animated, Platform, Pressable, StyleSheet, Text, View, PanResponder } from "react-native"

export default function FloatingActionButton() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const animation = useRef(new Animated.Value(0)).current
  const buttonAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current
  
  // Dragging state
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current
  const [isDragging, setIsDragging] = useState(false)
  const [isLongPressActive, setIsLongPressActive] = useState(false)
  const dragStartPosition = useRef({ x: 0, y: 0 })
  const lastDragTime = useRef(0)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)

  // PanResponder for dragging - only activates after long press
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only allow movement if long press is active AND moved > 10px
        if (!isLongPressActive) return false
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10
      },
      onPanResponderGrant: () => {
        // Only activate if long press happened
        if (!isLongPressActive) return
        
        // Close menu if open
        if (isOpen) {
          toggleMenu()
        }
        setIsDragging(true)
        // Store the current position
        dragStartPosition.current = {
          x: (pan.x as any)._value || 0,
          y: (pan.y as any)._value || 0,
        }
      },
      onPanResponderMove: (_, gestureState) => {
        // Only move if long press is active
        if (!isLongPressActive || !isDragging) return
        
        // Update position based on drag
        pan.setValue({
          x: dragStartPosition.current.x + gestureState.dx,
          y: dragStartPosition.current.y + gestureState.dy,
        })
      },
      onPanResponderRelease: (_, gestureState) => {
        // Clear long press timer
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current)
          longPressTimer.current = null
        }
        
        setIsLongPressActive(false)
        
        if (isDragging) {
          setIsDragging(false)
          lastDragTime.current = Date.now()
          
          // Calculate final position
          const finalX = dragStartPosition.current.x + gestureState.dx
          const finalY = dragStartPosition.current.y + gestureState.dy
          
          // Animate to final position
          Animated.spring(pan, {
            toValue: { x: finalX, y: finalY },
            useNativeDriver: false,
            friction: 7,
          }).start()
          
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          }
        }
      },
      onPanResponderTerminate: () => {
        // Clean up on gesture cancellation
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current)
          longPressTimer.current = null
        }
        setIsLongPressActive(false)
        setIsDragging(false)
      },
    })
  ).current

  const toggleMenu = () => {
    // Don't toggle if dragging or recently dragged (within 300ms)
    if (isDragging || (Date.now() - lastDragTime.current) < 300) return
    
    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }

    const toValue = isOpen ? 0 : 1

    // Main rotation animation
    Animated.spring(animation, {
      toValue,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start()

    // Staggered button animations for smoother effect (only 2 buttons now)
    if (!isOpen) {
      // Opening: stagger buttons
      Animated.stagger(50, [
        Animated.spring(buttonAnimations[0], {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(buttonAnimations[1], {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      // Closing: animate all together
      Animated.parallel([
        Animated.spring(buttonAnimations[0], {
          toValue: 0,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.spring(buttonAnimations[1], {
          toValue: 0,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start()
    }

    setIsOpen(!isOpen)
  }

  const addIngredientStyle = {
    transform: [
      { scale: buttonAnimations[0] },
      {
        translateY: buttonAnimations[0].interpolate({
          inputRange: [0, 1],
          outputRange: [0, -80],
        }),
      },
    ],
    opacity: buttonAnimations[0],
  }

  const mealSuggestionStyle = {
    transform: [
      { scale: buttonAnimations[1] },
      {
        translateY: buttonAnimations[1].interpolate({
          inputRange: [0, 1],
          outputRange: [0, -140],
        }),
      },
    ],
    opacity: buttonAnimations[1],
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

  const navigateToAddIngredients = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
    toggleMenu()
    setTimeout(() => router.push("/(tabs)/ingredients"), 100)
  }

  const navigateToMealSuggestions = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
    toggleMenu()
    setTimeout(() => router.push("/(tabs)/recipes?suggestions=true"), 100)
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Background overlay when menu is open */}
      {isOpen && (
        <Pressable 
          style={styles.overlay} 
          onPress={toggleMenu}
          accessibilityLabel="Close menu"
          accessibilityRole="button"
        />
      )}

      {/* Add Ingredients Button */}
      <Animated.View 
        style={[styles.actionButton, styles.secondaryButton, addIngredientStyle]}
        pointerEvents={isOpen ? "auto" : "none"}
      >
        <Pressable 
          onPress={navigateToAddIngredients} 
          style={({ pressed }) => [
            styles.actionButtonInner,
            pressed && styles.pressed
          ]}
          accessibilityLabel="Add ingredients"
          accessibilityRole="button"
          accessibilityHint="Navigate to ingredients screen"
        >
          <Ionicons name="basket" size={20} color="white" />
        </Pressable>
        <View style={styles.actionLabel}>
          <Text style={styles.actionLabelText}>Add Ingredients</Text>
        </View>
      </Animated.View>

      {/* Meal Suggestions Button */}
      <Animated.View 
        style={[styles.actionButton, styles.secondaryButton, mealSuggestionStyle]}
        pointerEvents={isOpen ? "auto" : "none"}
      >
        <Pressable 
          onPress={navigateToMealSuggestions} 
          style={({ pressed }) => [
            styles.actionButtonInner,
            pressed && styles.pressed
          ]}
          accessibilityLabel="Get meal suggestions"
          accessibilityRole="button"
          accessibilityHint="Navigate to recipe suggestions based on your ingredients"
        >
          <Ionicons name="nutrition" size={20} color="white" />
        </Pressable>
        <View style={styles.actionLabel}>
          <Text style={styles.actionLabelText}>Meal Suggestions</Text>
        </View>
      </Animated.View>

      {/* Main FAB Button */}
      <Animated.View style={[styles.actionButton, styles.mainButton, rotation]}>
        <Pressable 
          onPress={toggleMenu}
          onLongPress={() => {
            // Start long press - enable dragging
            setIsLongPressActive(true)
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
            }
          }}
          delayLongPress={500}
          style={({ pressed }) => [
            styles.actionButtonInner,
            pressed && !isDragging && styles.pressed,
            isLongPressActive && styles.longPressActive,
          ]}
          accessibilityLabel={isOpen ? "Close menu" : "Open quick actions menu. Long press to move"}
          accessibilityRole="button"
          accessibilityState={{ expanded: isOpen }}
        >
          <Ionicons name="add" size={24} color="white" />
        </Pressable>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: 56,
  },
  overlay: {
    position: "absolute",
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: "rgba(0,0,0,0.2)",
    ...Platform.select({
      web: {
        backdropFilter: "blur(2px)",
      },
    }),
  },
  actionButton: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)",
      },
    }),
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
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 120,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.3)",
      },
    }),
  },
  actionLabelText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  longPressActive: {
    transform: [{ scale: 1.1 }],
    opacity: 0.9,
  },
})
