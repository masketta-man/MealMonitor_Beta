"use client"
import TutorialOverlay from "@/components/TutorialOverlay"
import { APP_TUTORIAL_STEPS } from "@/constants/tutorialSteps"
import { TutorialProvider, useTutorial } from "@/contexts/TutorialContext"
import { AuthProvider, useAuth } from "@/hooks/useAuth"
import { hideSplashScreen, useFrameworkReady } from "@/hooks/useFrameworkReady"
import { notificationService } from "@/services/notificationService"
import { userService } from "@/services/userService"
import * as Notifications from "expo-notifications"
import { Stack, useRouter, useSegments } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useRef, useState } from "react"
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    View,
} from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import FloatingActionButton from "../components/FloatingActionButton"
import TabNavigation from "../components/TabNavigation"

function AppContent() {
  const { user, loading, session } = useAuth()
  const [isInitialized, setIsInitialized] = useState(false)
  const segments = useSegments()
  const router = useRouter()
  const { isTutorialActive, currentSteps, completeTutorial, skipTutorial } =
    useTutorial()
  const notificationListener = useRef<Notifications.Subscription | null>(null)
  const responseListener = useRef<Notifications.Subscription | null>(null)

  // Derived from the current route so both the redirect gate and the render below
  // agree on where the user is. expo-router types segments as a fixed-length tuple,
  // so widen it before indexing past the first entry.
  const routeSegments = segments as string[]
  const inAuthGroup = routeSegments[0] === "(auth)"
  const inOnboarding = routeSegments[1] === "onboarding"
  // The landing screen is the index route (app/index.tsx), so its segment array is
  // empty. It's a valid place for a logged-out user to sit, so the gate must not
  // redirect away from it.
  const inLanding = routeSegments.length === 0
  // Privacy is a public screen accessible without authentication, both from the
  // signup flow and from settings. The gate must not redirect logged-out users
  // away from it.
  const inPrivacy = routeSegments[0] === "privacy"

  // Register for push notifications when user is authenticated (native only)
  useEffect(() => {
    if (Platform.OS === "web") return

    if (user && session) {
      notificationService.registerForPushNotifications(user.id)

      // Check for expiring quests daily
      const checkExpiring = () => {
        notificationService.checkExpiringQuests(user.id)
      }

      checkExpiring() // Check immediately
      const interval = setInterval(checkExpiring, 1000 * 60 * 60) // Check hourly

      return () => clearInterval(interval)
    }
  }, [user, session])

  // Setup notification listeners (native only)
  useEffect(() => {
    if (Platform.OS === "web") return

    // Listener for notifications received while app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification)
      })

    // Listener for when user taps on notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data
        console.log("Notification tapped:", data)

        // Navigate based on notification type
        if (data.type === "quest_expiring" || data.type === "quest_completed") {
          router.push("/(tabs)/challenges")
        } else if (data.type === "new_quests") {
          router.push("/(tabs)/challenges")
        }
      })

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current,
        )
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current)
      }
    }
  }, [router])

  useEffect(() => {
    // Wait for auth to be fully initialized
    if (!loading) {
      setIsInitialized(true)
      // Hide splash screen once auth is initialized
      hideSplashScreen()
    }
  }, [loading])

  // Fallback timeout to force initialization after 8 seconds
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      if (!isInitialized) {
        console.log("⚠️ Layout: Forcing initialization due to timeout")
        setIsInitialized(true)
        // Force hide splash screen even on timeout
        hideSplashScreen()
      }
    }, 8000)

    return () => clearTimeout(fallbackTimeout)
  }, [isInitialized])

  // Id of the user whose onboarding is confirmed complete.
  //
  // `onboarding_completed` flips at most once in a user's lifetime, so re-fetching
  // it on every navigation was both wasteful and racy: overlapping requests could
  // resolve out of order and fight over router.replace, producing a flash of
  // onboarding before the tabs.
  //
  // Only the completed state is cached. Caching "not completed" would pin a user
  // to onboarding forever, because the gate would keep reading the stale value
  // after they finished.
  const onboardedUserIdRef = useRef<string | null>(null)

  // Drop the cache on user change (including sign-out) so the next user can't
  // inherit the previous one's gate result.
  useEffect(() => {
    if (!user || onboardedUserIdRef.current !== user.id) {
      onboardedUserIdRef.current = null
    }
  }, [user])

  useEffect(() => {
    if (!isInitialized) return

    let cancelled = false

    console.log("🔐 Layout: Navigation check:", {
      hasUser: !!user,
      hasSession: !!session,
      inAuthGroup,
      inOnboarding,
      segments,
    })

    const resolveOnboardingCompleted = async (
      userId: string,
    ): Promise<boolean> => {
      if (onboardedUserIdRef.current === userId) return true

      const profile = await userService.getProfile(userId)

      // No profile row means onboarding hasn't finished: the row is only created
      // when onboarding completes.
      if (!profile) return false

      const completed = !!profile.onboarding_completed
      if (completed) onboardedUserIdRef.current = userId
      return completed
    }

    const checkOnboardingStatus = async () => {
      if (user && session) {
        const completed = await resolveOnboardingCompleted(user.id)

        // A newer navigation superseded this check while we were awaiting.
        if (cancelled) return

        console.log("🔐 Layout: Onboarding completed:", completed)

        if (!completed && !inOnboarding) {
          console.log("🔐 Layout: Redirecting to onboarding")
          router.replace("/(auth)/onboarding")
        } else if (completed && inAuthGroup) {
          console.log("🔐 Layout: Redirecting to tabs")
          router.replace("/(tabs)")
        }
      } else if (
        !user &&
        !session &&
        !inAuthGroup &&
        !inLanding &&
        !inPrivacy
      ) {
        // Not authenticated: send to the landing screen (the index route, which
        // offers Get Started / Log In), not straight to the login form.
        console.log("🔐 Layout: Redirecting to landing")
        router.replace("/")
      }
    }

    checkOnboardingStatus()

    return () => {
      cancelled = true
    }
  }, [
    user,
    session,
    segments,
    isInitialized,
    inAuthGroup,
    inOnboarding,
    inLanding,
    inPrivacy,
    router,
  ])

  console.log("🔐 Layout: Auth state:", {
    hasUser: !!user,
    hasSession: !!session,
    loading,
    userId: user?.id,
    isInitialized,
  })

  // Show loading until auth is fully initialized
  if (loading || !isInitialized) {
    console.log("🔐 Layout: Still loading or not initialized...")
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Loading MealMonitor...</Text>
        </View>
      </SafeAreaProvider>
    )
  }

  console.log("🔐 Layout: Auth initialized, rendering app...")

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* create-recipe and edit-recipe/[id] are not declared here: they live
            under app/(tabs)/ and are registered in that group's layout. Declaring
            them at the root logged "No route named ... exists in nested children"
            on every render and had no effect on their presentation. */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="privacy" options={{ headerShown: false }} />
      </Stack>

      {/* Tab navigation and FAB are for the authenticated app shell only. They must
          stay hidden inside the (auth) group: while a new user is in onboarding,
          tapping either one lets them escape setup entirely. */}
      {user && session && !inAuthGroup && (
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
  useFrameworkReady()

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <TutorialProvider>
          <AppContent />
        </TutorialProvider>
      </AuthProvider>
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
