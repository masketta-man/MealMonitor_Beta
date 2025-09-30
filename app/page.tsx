import { Redirect } from "expo-router"
import { useAuth } from "@/hooks/useAuth"
import { useEffect } from "react"

export default function Page() {
  const { user, loading, session } = useAuth()

  useEffect(() => {
    console.log('🏠 Root Page: Auth state:', { 
      hasUser: !!user, 
      hasSession: !!session, 
      loading,
      userId: user?.id 
    })
  }, [user, session, loading])

  // Show loading while auth state is being determined
  if (loading) {
    console.log('🏠 Root Page: Still loading auth state...')
    return null
  }
  
  // Redirect based on authentication status
  if (user && session) {
    console.log('🏠 Root Page: Redirecting to main app')
    return <Redirect href="/(tabs)/" />
  } else {
    console.log('🏠 Root Page: Redirecting to login')
    return <Redirect href="/(auth)/login" />
  }
}
