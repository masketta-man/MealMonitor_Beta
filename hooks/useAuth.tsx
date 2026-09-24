import { supabase } from "@/lib/supabase"
import { Session, User } from "@supabase/supabase-js"
import * as Linking from "expo-linking"
import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react"

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  initialized: boolean
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ data: any; error: any }>
  signUp: (
    email: string,
    password: string,
    userData?: any,
  ) => Promise<{ data: any; error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ data: any; error: any }>
  resendConfirmationEmail: (email: string) => Promise<{ data: any; error: any }>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/**
 * Single source of truth for auth. Previously `useAuth` was a plain hook, so
 * every component that called it got its own state and its own
 * `onAuthStateChange` subscription. On sign-out those independent copies could
 * fall out of sync, leaving the app in a broken half-logged-out state. Hosting
 * the state in one provider means one subscription and one shared value, so a
 * sign-out anywhere propagates everywhere.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  // Read the latest `initialized` inside the auth-change listener without making
  // it an effect dependency (which would tear down and re-create the single
  // subscription every time it flips).
  const initializedRef = useRef(false)

  useEffect(() => {
    console.log("🔐 AuthProvider: Initializing auth...")

    // Timeout for session loading (10 seconds)
    const timeout = setTimeout(() => {
      console.log(
        "⚠️ AuthProvider: Session loading timeout - proceeding without session",
      )
      setSession(null)
      setUser(null)
      setInitialized(true)
      initializedRef.current = true
      setLoading(false)
    }, 10000)

    // Get initial session with error handling
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        clearTimeout(timeout)

        if (error) {
          console.error("❌ AuthProvider: Error loading session:", error)
          setSession(null)
          setUser(null)
        } else {
          console.log("🔐 AuthProvider: Initial session loaded:", {
            session: !!session,
            userId: session?.user?.id,
          })
          setSession(session)
          setUser(session?.user ?? null)
        }

        setInitialized(true)
        initializedRef.current = true

        // Small delay to ensure state propagation
        setTimeout(() => {
          setLoading(false)
        }, 50)
      })
      .catch((error) => {
        clearTimeout(timeout)
        console.error("❌ AuthProvider: Failed to get session:", error)
        setSession(null)
        setUser(null)
        setInitialized(true)
        initializedRef.current = true
        setLoading(false)
      })

    // Listen for auth changes (single subscription for the whole app)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("🔐 AuthProvider: Auth state changed:", {
        event: _event,
        hasSession: !!session,
        userId: session?.user?.id,
      })

      // When email confirmation is enabled, Supabase fires SIGNED_IN with a
      // session immediately after signUp even though the email isn't confirmed
      // yet. If we accept that session, the root layout gate redirects the user
      // out of the "Check your inbox" screen before they see it. Clear the
      // session so the app stays unauthenticated and the signup screen keeps
      // control until the user confirms their email.
      if (
        session &&
        session.user &&
        !session.user.email_confirmed_at &&
        _event === "SIGNED_IN"
      ) {
        console.log(
          "🔐 AuthProvider: Clearing unconfirmed user session to keep Check Your Inbox screen",
        )
        setSession(null)
        setUser(null)
        if (initializedRef.current) setLoading(false)
        return
      }

      setSession(session)
      setUser(session?.user ?? null)

      if (initializedRef.current) {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log("🔐 AuthProvider: Attempting sign in...")
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (!error && data.session) {
      console.log("🔐 AuthProvider: Sign in successful, updating state")
      setSession(data.session)
      setUser(data.session.user)

      setTimeout(() => {
        setLoading(false)
      }, 100)
    } else {
      setLoading(false)
    }

    console.log("🔐 AuthProvider: Sign in completed:", {
      success: !error,
      hasSession: !!data.session,
      userId: data.session?.user?.id,
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    console.log("🔐 AuthProvider: Attempting sign up...")
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        // On web use the production domain; on native use the mealmonitor://
        // deep link so Supabase can redirect back into the app after confirmation.
        emailRedirectTo:
          typeof window !== "undefined" &&
          window.location?.hostname !== "localhost"
            ? "https://mealmonitor.space"
            : Linking.createURL("/"),
      },
    })

    if (!error && data.session) {
      console.log("🔐 AuthProvider: Sign up successful, updating state")
      setSession(data.session)
      setUser(data.session.user)

      setTimeout(() => {
        setLoading(false)
      }, 100)
    } else {
      setLoading(false)
    }

    console.log("🔐 AuthProvider: Sign up completed:", {
      success: !error,
      hasSession: !!data.session,
      userId: data.session?.user?.id,
    })
    return { data, error }
  }

  const signOut = async () => {
    console.log("🔐 AuthProvider: Attempting sign out...")
    // Clear local state first so every consumer sees the logged-out state
    // immediately, even if the network call is slow. The onAuthStateChange
    // listener will also fire, but we don't rely on its timing.
    const { error } = await supabase.auth.signOut()
    setSession(null)
    setUser(null)
    setLoading(false)
    console.log("🔐 AuthProvider: Sign out completed:", { success: !error })
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
    console.log("🔐 AuthProvider: Resending confirmation email...")
    const { data, error } = await supabase.auth.resend({
      type: "signup",
      email,
    })
    console.log("🔐 AuthProvider: Resend completed:", { success: !error })
    return { data, error }
  }

  const value: AuthContextValue = {
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Read the shared auth state. Same return shape as before, so existing callers
 * need no changes — but now they all share one provider instead of each
 * spinning up its own state and subscription.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
