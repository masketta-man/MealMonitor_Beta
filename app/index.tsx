import Button from "@/components/Button"
import { useAuth } from "@/hooks/useAuth"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { Redirect, useRouter } from "expo-router"
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const LOGO = require("@/assets/images/MM.png")

const FEATURES: {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  description: string
}[] = [
  {
    icon: "basket-outline",
    title: "Cook what you have",
    description:
      "Tell us what's in your kitchen and get recipes you can make right now.",
  },
  {
    icon: "flame-outline",
    title: "Stay on track",
    description:
      "Set a calorie goal and log your meals as you cook, no extra work.",
  },
  {
    icon: "trophy-outline",
    title: "Make it a habit",
    description:
      "Earn XP, keep streaks, and take on cooking quests that fit your pace.",
  },
]

export default function Landing() {
  const { user, session, loading } = useAuth()
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isWeb = width > 768

  // Already signed in: hand straight off to the app. The root layout also gates
  // this, but redirecting here avoids a flash of the landing screen for a
  // returning user who still has a session.
  if (!loading && user && session) {
    return <Redirect href="/(tabs)/" />
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    )
  }

  return (
    <LinearGradient colors={["#dcfce7", "#f0fdf4"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.wrapper, isWeb && styles.wrapperWeb]}>
            {/* Hero */}
            <View style={styles.hero}>
              <Image
                source={LOGO}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel="MealMonitor logo"
              />
              <Text style={styles.appName}>MealMonitor</Text>
              <Text style={styles.tagline}>
                Turn what&rsquo;s in your kitchen into meals worth cooking.
              </Text>
            </View>

            {/* Value props */}
            <View style={styles.features}>
              {FEATURES.map((feature) => (
                <View key={feature.title} style={styles.feature}>
                  <View style={styles.featureIcon}>
                    <Ionicons name={feature.icon} size={22} color="#22c55e" />
                  </View>
                  <View style={styles.featureText}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>
                      {feature.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                text="Get Started"
                color="white"
                backgroundColor="#22c55e"
                onPress={() => router.push("/(auth)/signup")}
                style={styles.primaryButton}
              />
              <Button
                text="I already have an account"
                color="#22c55e"
                backgroundColor="transparent"
                outline="#22c55e"
                onPress={() => router.push("/(auth)/login")}
                style={styles.secondaryButton}
              />
            </View>
          </View>
        </ScrollView>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  wrapper: {
    width: "100%",
  },
  wrapperWeb: {
    maxWidth: 460,
    alignSelf: "center",
  },
  hero: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 132,
    height: 132,
    marginBottom: 16,
  },
  appName: {
    fontSize: 34,
    fontWeight: "800",
    color: "#166534",
    marginBottom: 10,
  },
  tagline: {
    fontSize: 17,
    color: "#475569",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  features: {
    marginBottom: 40,
    gap: 20,
  },
  feature: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    minHeight: 52,
  },
  secondaryButton: {
    minHeight: 52,
  },
})
