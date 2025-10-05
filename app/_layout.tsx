"use client"
import { Stack, useRouter, useSegments } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { StyleSheet, View } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { useAuth } from "@/hooks/useAuth"
import { useEffect, useState } from "react"
import { ActivityIndicator, Text } from "react-native"
import FloatingActionButton from "../components/FloatingActionButton"
import TabNavigation from "../components/TabNavigation"
import { useFrameworkReady } from '@/hooks/useFrameworkReady'

export default function RootLayout() {
  useFrameworkReady();
  const { user, loading, session } = useAuth()
  const [isInitialized, setIsInitialized] = useState(false)
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    // Wait for auth to be fully initialized
    if (!loading) {
      setIsInitialized(true)
    }
  }, [loading])

  useEffect(() => {
    if (!isInitialized) return

    const inAuthGroup = segments[0] === '(auth)'

    console.log('🔐 Layout: Navigation check:', {
      hasUser: !!user,
      hasSession: !!session,
      inAuthGroup,
      segments
    })

    if (!user && !session && !inAuthGroup) {
      // Redirect to login if not authenticated and not in auth group
      console.log('🔐 Layout: Redirecting to login')
      router.replace('/(auth)/login')
    } else if (user && session && inAuthGroup) {
      // Redirect to tabs if authenticated and still in auth group
      console.log('🔐 Layout: Redirecting to tabs')
      router.replace('/(tabs)')
    }
  }, [user, session, segments, isInitialized])

  console.log('🔐 Layout: Auth state:', {
    hasUser: !!user,
    hasSession: !!session,
    loading,
    userId: user?.id,
    isInitialized
  })

  // Show loading until auth is fully initialized
  if (loading || !isInitialized) {
    console.log('🔐 Layout: Still loading or not initialized...')
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Loading MealMonitor...</Text>
        </View>
      </SafeAreaProvider>
    )
  }

  console.log('🔐 Layout: Auth initialized, rendering app...')

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="create-recipe"
          options={{
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="edit-recipe/[id]"
          options={{
            presentation: "modal",
          }}
        />
      </Stack>

      {/* Only show tab navigation and FAB when user is authenticated */}
      {user && session && (
        <>
          <TabNavigation />
          <View style={styles.fabContainer}>
            <FloatingActionButton />
          </View>
        </>
      )}
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#166534",
    fontWeight: "600",
  },
  fabContainer: {
    position: "absolute",
    bottom: 70, // Position above the tab bar
    alignItems: "center",
    left: 0,
    right: 0,
    zIndex: 101,
  },
})