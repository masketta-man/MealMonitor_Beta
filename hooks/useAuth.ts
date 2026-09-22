import { supabase } from "@/lib/supabase"
import { Session, User } from "@supabase/supabase-js"
import * as Linking from "expo-linking"
import { useEffect, useState } from "react"

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    console.log("🔐 useAuth: Initializing auth hook...")

    // Timeout for session loading (10 seconds)
    const timeout = setTimeout(() => {
      console.log(
        "⚠️ useAuth: Session loading timeout - proceeding without session",
      )
      setSession(null)
      setUser(null)
      setInitialized(true)
      setLoading(false)
    }, 10000)

    // Get initial session with error handling
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        clearTimeout(timeout)

        if (error) {
          console.error("❌ useAuth: Error loading session:", error)
          setSession(null)
          setUser(null)
        } else {
          console.log("🔐 useAuth: Initial session loaded:", {
            session: !!session,
            userId: session?.user?.id,
          })
          setSession(session)
          setUser(session?.user ?? null)
        }

        setInitialized(true)

        // Small delay to ensure state propagation
        setTimeout(() => {
          setLoading(false)
        }, 50)
      })
      .catch((error) => {
        clearTimeout(timeout)
        console.error("❌ useAuth: Failed to get session:", error)
        setSession(null)
        setUser(null)
        setInitialized(true)
        setLoading(false)
      })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("🔐 useAuth: Auth state changed:", {
        event: _event,
        hasSession: !!session,
        userId: session?.user?.id,
      })
      setSession(session)
      setUser(session?.user ?? null)

      if (initialized) {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [initialized])

  const signIn = async (email: string, password: string) => {
    console.log("🔐 useAuth: Attempting sign in...")
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (!error && data.session) {
      console.log("🔐 useAuth: Sign in successful, updating state immediately")
      // Manually update state to ensure immediate response
      setSession(data.session)
      setUser(data.session.user)

      // Force a small delay to ensure state propagation
      setTimeout(() => {
        setLoading(false)
      }, 100)
    } else {
      setLoading(false)
    }

    console.log("🔐 useAuth: Sign in completed:", {
      success: !error,
      hasSession: !!data.session,
      userId: data.session?.user?.id,
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    console.log("🔐 useAuth: Attempting sign up...")
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        // Where the confirmation email link should return the user. Works for
        // web (origin) and native (mealmonitor:// deep link) via expo-linking.
        // The account-creation email is sent by Supabase when email
        // confirmations are enabled for the project (Auth > Providers > Email).
        emailRedirectTo: Linking.createURL("/"),
      },
    })

    if (!error && data.session) {
      console.log("🔐 useAuth: Sign up successful, updating state immediately")
      // Manually update state for immediate response
      setSession(data.session)
      setUser(data.session.user)

      setTimeout(() => {
        setLoading(false)
      }, 100)
    } else {
      setLoading(false)
    }

    console.log("🔐 useAuth: Sign up completed:", {
      success: !error,
      hasSession: !!data.session,
      userId: data.session?.user?.id,
    })
    return { data, error }
  }

  const signOut = async () => {
    console.log("🔐 useAuth: Attempting sign out...")
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setSession(null)
      setUser(null)
    }
    setLoading(false)
    console.log("🔐 useAuth: Sign out completed:", { success: !error })
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  }

  /**
   * Re-send the signup confirmation email. Only relevant when email confirmation
   * is enabled on the Supabase project, in which case signUp returns a user with
   * no session until the link is followed.
   */
  const resendConfirmationEmail = async (email: string) => {
    console.log("🔐 useAuth: Resending confirmation email...")
    const { data, error } = await supabase.auth.resend({
      type: "signup",
      email,
    })
    console.log("🔐 useAuth: Resend completed:", { success: !error })
    return { data, error }
  }

  return {
    session,
    user,
    loading,
    initialized,
    signIn,
    signUp,
    signOut,
    resetPassword,
    resendConfirmationEmail,
  }
}
