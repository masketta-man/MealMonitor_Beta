import { Redirect } from "expo-router"
import { useAuth } from "@/hooks/useAuth"

export default function Page() {
  const { user } = useAuth()
  
  // Redirect based on authentication status
  if (user) {
    return <Redirect href="/(tabs)/" />
  } else {
    return <Redirect href="/(auth)/login" />
  }
}
