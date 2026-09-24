"use client"

import { useAuth } from "@/hooks/useAuth"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useState } from "react"
import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

// Components
import Button from "@/components/Button"
import Card from "@/components/Card"

const LOGO = require("@/assets/images/MM.png")

export default function LoginScreen() {
  const router = useRouter()
  const { signIn, resendConfirmationEmail } = useAuth()
  const { width } = useWindowDimensions()
  const isWeb = width > 768
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emailUnconfirmed, setEmailUnconfirmed] = useState(false)
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">(
    "idle",
  )
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    general?: string
  }>({})

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleLogin = async () => {
    setErrors({})
    let validationErrors: { email?: string; password?: string } = {}

    if (!email.trim()) {
      validationErrors.email = "Email is required"
    } else if (!validateEmail(email)) {
      validationErrors.email = "Please enter a valid email address"
    }

    if (!password) {
      validationErrors.password = "Password is required"
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    console.log("🔑 Login: Starting login process...")
    setIsLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      console.log("🔑 Login: Login failed:", error.message)

      let errorMessage = "An error occurred during login. Please try again."

      if (error.message.includes("Invalid login credentials")) {
        errorMessage =
          "Invalid email or password. Please check your credentials and try again."
      } else if (error.message.includes("Email not confirmed")) {
        setEmailUnconfirmed(true)
        setIsLoading(false)
        return
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        errorMessage =
          "Network error. Please check your internet connection and try again."
      } else if (error.message.includes("User not found")) {
        errorMessage = "No account found with this email. Please sign up first."
      }

      setErrors({ general: errorMessage })
      setIsLoading(false)
    } else {
      console.log("🔑 Login: Login successful")
    }
  }

  const handleResendConfirmation = async () => {
    setResendState("sending")
    const { error } = await resendConfirmationEmail(email)
    if (error) {
      setResendState("idle")
      setErrors({ general: "Could not resend. Please try again in a moment." })
    } else {
      setResendState("sent")
    }
  }

  const navigateToSignUp = () => {
    router.push("/(auth)/signup")
  }

  const navigateToForgotPassword = () => {
    router.push("/(auth)/forgot-password")
  }

  return (
    <LinearGradient colors={["#dcfce7", "#f0fdf4"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={LOGO}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="MealMonitor logo"
            />
            <Text style={styles.appName}>MealMonitor</Text>
            <Text style={styles.tagline}>Cook with what you already have</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View
            style={[styles.contentWrapper, isWeb && styles.contentWrapperWeb]}
          >
            <Card style={styles.loginCard}>
              <Text style={styles.title}>Welcome</Text>
              <Text style={styles.subtitle}>
                Log in to continue, or create an account to get started.
              </Text>

              {emailUnconfirmed ? (
                <View style={styles.confirmationBanner}>
                  <Ionicons name="mail-outline" size={20} color="#166534" />
                  <View style={styles.confirmationBannerText}>
                    <Text style={styles.confirmationBannerTitle}>
                      Please verify your email first
                    </Text>
                    <Text style={styles.confirmationBannerBody}>
                      Check your inbox for a confirmation link. Once you tap it
                      you can log in here.
                    </Text>
                    <TouchableOpacity
                      onPress={handleResendConfirmation}
                      disabled={resendState !== "idle"}
                    >
                      <Text style={styles.confirmationResendText}>
                        {resendState === "sending"
                          ? "Sending..."
                          : resendState === "sent"
                            ? "✓ Email sent"
                            : "Resend confirmation email"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                errors.general && (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle" size={20} color="#dc2626" />
                    <Text style={styles.errorBannerText}>{errors.general}</Text>
                  </View>
                )
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.email && styles.inputWrapperError,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#64748b"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text)
                      if (errors.email) {
                        setErrors((prev) => ({ ...prev, email: undefined }))
                      }
                    }}
                    placeholder="Enter your email"
                    placeholderTextColor="#9ca3af"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {errors.email && (
                  <View style={styles.errorContainer}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={14}
                      color="#dc2626"
                    />
                    <Text style={styles.errorText}>{errors.email}</Text>
                  </View>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.password && styles.inputWrapperError,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#64748b"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text)
                      if (errors.password) {
                        setErrors((prev) => ({ ...prev, password: undefined }))
                      }
                    }}
                    placeholder="Enter your password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#64748b"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <View style={styles.errorContainer}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={14}
                      color="#dc2626"
                    />
                    <Text style={styles.errorText}>{errors.password}</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={navigateToForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <Button
                text={isLoading ? "Signing In..." : "Sign In"}
                color="white"
                backgroundColor="#22c55e"
                onPress={handleLogin}
                disabled={isLoading}
                style={styles.loginButton}
              />

              {/* Signing up is the path most first-time visitors need, so it gets a
                  real secondary button rather than a text link buried in body copy. */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>New here?</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button
                text="Create an Account"
                color="#22c55e"
                backgroundColor="transparent"
                outline="#22c55e"
                onPress={navigateToSignUp}
                disabled={isLoading}
                style={styles.signupButton}
              />
            </Card>
          </View>
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
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 96,
    height: 96,
    marginBottom: 12,
  },
  appName: {
    fontSize: 32,
    fontWeight: "800",
    color: "#166534",
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    color: "#64748b",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentWrapper: {
    width: "100%",
  },
  contentWrapperWeb: {
    maxWidth: 500,
    alignSelf: "center",
    width: "100%",
  },
  loginCard: {
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
  },
  inputContainer: {
    marginBottom: 20,
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
  inputWrapperError: {
    borderColor: "#dc2626",
    backgroundColor: "#fef2f2",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 13,
    color: "#dc2626",
    marginLeft: 4,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errorBannerText: {
    fontSize: 14,
    color: "#dc2626",
    marginLeft: 8,
    flex: 1,
  },
  confirmationBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#22c55e",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  confirmationBannerText: {
    flex: 1,
  },
  confirmationBannerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 4,
  },
  confirmationBannerBody: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
    marginBottom: 8,
  },
  confirmationResendText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#22c55e",
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#22c55e",
    fontWeight: "600",
  },
  loginButton: {
    marginBottom: 20,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  dividerText: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "600",
  },
  signupButton: {
    marginBottom: 4,
  },
})
