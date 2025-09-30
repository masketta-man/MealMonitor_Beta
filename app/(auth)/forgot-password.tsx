import { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useAuth } from "@/hooks/useAuth"

// Components
import Button from "@/components/Button"
import Card from "@/components/Card"

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address")
      return
    }

    setIsLoading(true)
    const { error } = await resetPassword(email)
    
    if (error) {
      Alert.alert("Error", error.message)
    } else {
      Alert.alert(
        "Reset Email Sent",
        "Check your email for password reset instructions.",
        [{ text: "OK", onPress: () => router.back() }]
      )
    }
    setIsLoading(false)
  }

  return (
    <LinearGradient colors={["#dcfce7", "#f0fdf4"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#166534" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reset Password</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Card style={styles.resetCard}>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you instructions to reset your password.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <Button
              text={isLoading ? "Sending..." : "Send Reset Email"}
              color="white"
              backgroundColor="#22c55e"
              onPress={handleResetPassword}
              disabled={isLoading}
              style={styles.resetButton}
            />

            <TouchableOpacity style={styles.backToLogin} onPress={() => router.back()}>
              <Text style={styles.backToLoginText}>Back to Login</Text>
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
    justifyContent: "space-between",
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
    fontSize: 18,
    fontWeight: "700",
    color: "#166534",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  resetCard: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#166534",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
  },
  resetButton: {
    marginBottom: 24,
  },
  backToLogin: {
    alignItems: "center",
  },
  backToLoginText: {
    fontSize: 14,
    color: "#22c55e",
    fontWeight: "600",
  },
})