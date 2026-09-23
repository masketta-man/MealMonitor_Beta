import Card from "@/components/Card"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const LOGO = require("@/assets/images/MM.png")

// NOTE: This is placeholder policy content describing how the app is intended to
// handle data. Replace the copy below with your reviewed, final privacy policy
// before release — it is not legal advice.
const SECTIONS: { heading: string; body: string }[] = [
  {
    heading: "What we collect",
    body: "Account details you provide (name, username, email) and the preferences you set during onboarding and in Settings — such as dietary preferences, health goals, activity level, and any health conditions you choose to share. We also store your in-app activity: pantry ingredients, cooked meals, calorie logs, ratings, streaks, and achievements.",
  },
  {
    heading: "How we use it",
    body: "Your data powers the core features: matching recipes to your pantry and goals, tailoring recommendations, tracking calories and progress, and running challenges and achievements. Health conditions are used only to gently rank suitable recipes higher — never to make medical decisions.",
  },
  {
    heading: "Health information",
    body: "Any health conditions or dietary needs you enter are used solely to personalize recipe suggestions within the app. This is not medical advice, and the app is not a substitute for guidance from a qualified professional.",
  },
  {
    heading: "Storage and security",
    body: "Your data is stored with our backend provider (Supabase) and protected by row-level security so that you can only access your own records. We use industry-standard encryption in transit.",
  },
  {
    heading: "Your choices",
    body: "You can review and update your preferences, dietary restrictions, and health conditions at any time in Settings. You can request deletion of your account and associated data by contacting support.",
  },
  {
    heading: "Contact",
    body: "Questions about your data or this policy? Reach out to the support contact provided in the app store listing.",
  },
]

export default function PrivacyScreen() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isWeb = width > 768

  const goBack = () => {
    if (typeof router.canGoBack === "function" && router.canGoBack()) {
      router.back()
    } else {
      router.replace("/")
    }
  }

  return (
    <LinearGradient colors={["#dcfce7", "#f0fdf4"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Navigation bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Ionicons name="arrow-back" size={24} color="#166534" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Data Privacy</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={[
            styles.contentContainer,
            isWeb && styles.contentContainerWeb,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Brand identity block */}
          <View style={styles.brandBlock}>
            <Image
              source={LOGO}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="MealMonitor logo"
            />
            <Text style={styles.appName}>MealMonitor</Text>
            <Text style={styles.tagline}>Your privacy, plainly explained</Text>
          </View>

          <Card style={styles.card}>
            <Text style={styles.intro}>
              Your privacy matters. Here&rsquo;s a plain-language summary of
              what MealMonitor collects and how it&rsquo;s used.
            </Text>

            {SECTIONS.map((section) => (
              <View key={section.heading} style={styles.section}>
                <Text style={styles.sectionHeading}>{section.heading}</Text>
                <Text style={styles.sectionBody}>{section.body}</Text>
              </View>
            ))}
          </Card>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
    color: "#166534",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  contentContainerWeb: {
    maxWidth: 800,
    alignSelf: "center",
    width: "100%",
  },
  brandBlock: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 8,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  appName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#166534",
    marginBottom: 4,
  },
  tagline: {
    fontSize: 13,
    color: "#4b5563",
  },
  card: {
    padding: 20,
  },
  intro: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 20,
  },
  section: {
    marginBottom: 18,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 21,
  },
})
