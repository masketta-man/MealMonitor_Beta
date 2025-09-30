import { useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔐 useAuth: Initializing auth hook...')
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 useAuth: Initial session loaded:', { 
        session: !!session, 
        userId: session?.user?.id 
      })
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔐 useAuth: Auth state changed:', { 
        event: _event, 
        hasSession: !!session, 
        userId: session?.user?.id 
      })
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('🔐 useAuth: Attempting sign in...')
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (!error && data.session) {
      console.log('🔐 useAuth: Sign in successful, updating state immediately')
      // Manually update state to ensure immediate response
      setSession(data.session)
      setUser(data.session.user)
    }
    
    setLoading(false)
    console.log('🔐 useAuth: Sign in completed:', { 
      success: !error, 
      hasSession: !!data.session,
      userId: data.session?.user?.id 
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    console.log('🔐 useAuth: Attempting sign up...')
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    })
    
    if (!error && data.session) {
      console.log('🔐 useAuth: Sign up successful, updating state immediately')
      // Manually update state for immediate response
      setSession(data.session)
      setUser(data.session.user)
    }
    
    setLoading(false)
    console.log('🔐 useAuth: Sign up completed:', { 
      success: !error, 
      hasSession: !!data.session,
      userId: data.session?.user?.id 
    })
    return { data, error }
  }

  const signOut = async () => {
    console.log('🔐 useAuth: Attempting sign out...')
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setSession(null)
      setUser(null)
    }
    setLoading(false)
    console.log('🔐 useAuth: Sign out completed:', { success: !error })
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  }

  return {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }
}