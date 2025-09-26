import { Redirect } from "expo-router"

export default function Page() {
  // Redirect to the tabs home page
  return <Redirect href="/(tabs)/" />
}
