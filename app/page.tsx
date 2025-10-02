import { Redirect } from "expo-router"
import { useAuth } from "@/hooks/useAuth"
import { useEffect, useState } from "react"
import { View, ActivityIndicator, Text, StyleSheet } from "react-native"

export default function Page() {
  const { user, loading, session } = useAuth()
  const [navigationReady, setNavigationReady] = useState(false)

  useEffect(() => {
    console.log('🏠 Root Page: Auth state:', {
      hasUser: !!user, 
      hasSession: !!session, 
      loading, 
      userId: user?.id,
      navigationReady
    })
    
    // Set navigation ready after auth state is determined
    if (!loading) {
      const timer = setTimeout(() => {
        setNavigationReady(true)
      }, 100) // Small delay to ensure state is fully propagated
      
      return () => clearTimeout(timer)
    }
  }, [user, session, loading, navigationReady])

  // Show loading while auth state is being determined or navigation isn't ready
  if (loading || !navigationReady) {
    console.log('🏠 Root Page: Still loading auth state...')
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    )
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
})
