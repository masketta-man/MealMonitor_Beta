"use client"
import TutorialOverlay from "@/components/TutorialOverlay"
import { APP_TUTORIAL_STEPS } from "@/constants/tutorialSteps"
import { TutorialProvider, useTutorial } from "@/contexts/TutorialContext"
import { useAuth } from "@/hooks/useAuth"
import { useFrameworkReady } from '@/hooks/useFrameworkReady'
import { supabase } from "@/lib/supabase"
import { Stack, useRouter, useSegments } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import FloatingActionButton from "../components/FloatingActionButton"
import TabNavigation from "../components/TabNavigation"

function AppContent() {
  const { user, loading, session } = useAuth()
  const [isInitialized, setIsInitialized] = useState(false)
  const segments = useSegments()
  const router = useRouter()
  const { isTutorialActive, currentSteps, completeTutorial, skipTutorial } = useTutorial()

  useEffect(() => {
    // Wait for auth to be fully initialized
    if (!loading) {
      setIsInitialized(true)
    }
  }, [loading])

  // Fallback timeout to force initialization after 12 seconds
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      if (!isInitialized) {
        console.log('⚠️ Layout: Forcing initialization due to timeout')
        setIsInitialized(true)
      }
    }, 12000)

    return () => clearTimeout(fallbackTimeout)
  }, [isInitialized])

  useEffect(() => {
    if (!isInitialized) return

    const inAuthGroup = segments[0] === '(auth)'
    const inOnboarding = segments[1] === 'onboarding'

    console.log('🔐 Layout: Navigation check:', {
      hasUser: !!user,
      hasSession: !!session,
      inAuthGroup,
      inOnboarding,
      segments
    })

    // Check if user needs onboarding
    const checkOnboardingStatus = async () => {
      if (user && session) {
        const { data: profile } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', user.id)
          .maybeSingle()

        console.log('🔐 Layout: Profile check:', profile)

        if (!profile?.onboarding_completed && !inOnboarding) {
          // User needs to complete onboarding
          console.log('🔐 Layout: Redirecting to onboarding')
          router.replace('/(auth)/onboarding')
        } else if (profile?.onboarding_completed && inAuthGroup) {
          // User has completed onboarding, redirect to tabs
          console.log('🔐 Layout: Redirecting to tabs')
          router.replace('/(tabs)')
        }
      } else if (!user && !session && !inAuthGroup) {
        // Redirect to login if not authenticated and not in auth group
        console.log('🔐 Layout: Redirecting to login')
        router.replace('/(auth)/login')
      }
    }

    checkOnboardingStatus()
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
    <>
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
          <View style={styles.fabContainer} pointerEvents="box-none">
            <FloatingActionButton />
          </View>
        </>
      )}

      {/* Tutorial Overlay */}
      <TutorialOverlay
        visible={isTutorialActive}
        steps={currentSteps.length > 0 ? currentSteps : APP_TUTORIAL_STEPS}
        onComplete={completeTutorial}
        onSkip={skipTutorial}
      />
    </>
  )
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <SafeAreaProvider>
      <TutorialProvider>
        <AppContent />
      </TutorialProvider>
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
    zIndex: 9999, // Very high z-index to ensure FAB is always on top
    elevation: 9999, // For Android
  },
})