import Card from "@/components/Card"
import { useAuth } from "@/hooks/useAuth"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useState } from "react"
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Button from "@/components/Button"

export default function ConfirmEmailScreen() {
  const router = useRouter()
  const { email } = useLocalSearchParams<{ email: string }>()
  const { resendConfirmationEmail } = useAuth()
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">(
    "idle",
  )
  const [resendError, setResendError] = useState("")

  const handleResend = async () => {
    if (!email) return
    setResendState("sending")
    setResendError("")
    const { error } = await resendConfirmationEmail(email)
    if (error) {
      setResendError("Could not resend. Please try again in a moment.")
      setResendState("idle")
    } else {
      setResendState("sent")
    }
  }

  return (
    <LinearGradient colors={["#dcfce7", "#f0fdf4"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <View style={styles.placeholder} />
          <Text style={styles.headerTitle}>Confirm Your Email</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Card style={styles.card}>
            {/* Icon */}
            <View style={styles.iconWrapper}>
              <Ionicons name="mail-outline" size={48} color="#22c55e" />
            </View>

            <Text style={styles.title}>Check your inbox</Text>
            <Text style={styles.body}>
              We sent a confirmation link to{" "}
              <Text style={styles.emailText}>{email}</Text>.
            </Text>
            <Text style={styles.body}>
              Tap the link in the email to activate your account, then come back
              here to log in.
            </Text>

            {resendError !== "" && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color="#dc2626" />
                <Text style={styles.errorText}>{resendError}</Text>
              </View>
            )}

            {resendState === "sent" && (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={16} color="#166534" />
                <Text style={styles.successText}>
                  Sent — check your inbox again.
                </Text>
              </View>
            )}

            <Button
              text="Go to Log In"
              color="white"
              backgroundColor="#22c55e"
              onPress={() => router.replace("/(auth)/login")}
              style={styles.button}
            />

            <TouchableOpacity
              onPress={handleResend}
              disabled={resendState !== "idle"}
              style={styles.resendButton}
            >
              <Text
                style={[
                  styles.resendText,
                  resendState !== "idle" && styles.resendTextDisabled,
                ]}
              >
                {resendState === "sending"
                  ? "Sending..."
                  : "Resend confirmation email"}
              </Text>
            </TouchableOpacity>
          </Card>
        </View>
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  placeholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#166534",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    padding: 28,
    alignItems: "center",
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#166534",
    marginBottom: 12,
    textAlign: "center",
  },
  body: {
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 8,
  },
  emailText: {
    fontWeight: "700",
    color: "#166534",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    width: "100%",
  },
  errorText: {
    fontSize: 13,
    color: "#dc2626",
    flex: 1,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    width: "100%",
  },
  successText: {
    fontSize: 13,
    color: "#166534",
    flex: 1,
  },
  button: {
    marginTop: 24,
    width: "100%",
  },
  resendButton: {
    marginTop: 16,
    padding: 8,
  },
  resendText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#22c55e",
    textAlign: "center",
  },
  resendTextDisabled: {
    color: "#9ca3af",
  },
})
