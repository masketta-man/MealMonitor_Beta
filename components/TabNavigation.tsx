"use client"

import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, usePathname } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useEffect, useRef } from "react"
import * as Haptics from "expo-haptics"

interface TabItem {
  name: string
  route: string
  icon: keyof typeof Ionicons.glyphMap
  activeIcon: keyof typeof Ionicons.glyphMap
  label: string
}

const tabs: TabItem[] = [
  {
    name: "home",
    route: "/(tabs)/",
    icon: "home-outline",
    activeIcon: "home",
    label: "Home",
  },
  {
    name: "recipes",
    route: "/(tabs)/recipes",
    icon: "restaurant-outline",
    activeIcon: "restaurant",
    label: "Recipes",
  },
  {
    name: "challenges",
    route: "/(tabs)/challenges",
    icon: "trophy-outline",
    activeIcon: "trophy",
    label: "Challenges",
  },
  {
    name: "profile",
    route: "/(tabs)/profile",
    icon: "person-outline",
    activeIcon: "person",
    label: "Profile",
  },
]

export default function TabNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const insets = useSafeAreaInsets()
  const tabAnimations = useRef(tabs.map(() => new Animated.Value(0))).current

  // Determine which tab is active based on the current route
  const activeTabIndex = tabs.findIndex((tab) => {
    if (pathname === tab.route) return true
    if (pathname.startsWith(tab.route) && tab.route !== "/(tabs)/") return true
    return false
  })

  // Animate the active tab indicator
  useEffect(() => {
    // Reset all animations
    tabAnimations.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: index === activeTabIndex ? 1 : 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }).start()
    })
  }, [activeTabIndex, tabAnimations])

  const handleTabPress = (route: string, index: number) => {
    if (index !== activeTabIndex) {
      // Provide haptic feedback on tab press
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      router.push(route)
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom ? insets.bottom : 8,
        },
      ]}
    >
      {tabs.map((tab, index) => {
        const isActive = index === activeTabIndex

        // Animation values
        const scale = tabAnimations[index].interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.1],
        })

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabButton}
            onPress={() => handleTabPress(tab.route, index)}
            activeOpacity={0.7}
          >
            <Animated.View style={[styles.tabContent, { transform: [{ scale }] }]}>
              {isActive && <View style={styles.activeIndicator} />}
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={24}
                color={isActive ? "#22c55e" : "#94a3b8"}
              />
              <Text style={[styles.tabLabel, isActive ? styles.activeTabLabel : {}]}>{tab.label}</Text>
            </Animated.View>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    flexDirection: "row",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 8,
    boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 8, // Keep elevation for Android
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderBottomWidth: 0,
    zIndex: 100,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabContent: {
    alignItems: "center",
    paddingVertical: 4,
    position: "relative",
  },
  activeIndicator: {
    position: "absolute",
    top: -12,
    width: 20,
    height: 3,
    backgroundColor: "#22c55e",
    borderRadius: 1.5,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
    color: "#64748b",
  },
  activeTabLabel: {
    color: "#22c55e",
    fontWeight: "600",
  },
})
