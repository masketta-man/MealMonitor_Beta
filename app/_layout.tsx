"use client"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { StyleSheet, View } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import FloatingActionButton from "../components/FloatingActionButton"
import TabNavigation from "../components/TabNavigation"

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="create-recipe"
          options={{
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="edit-recipe/[id]"
          options={{
            presentation: "modal",
          }}
        />
      </Stack>

      {/* Custom Tab Navigation */}
      <TabNavigation />

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <FloatingActionButton />
      </View>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    bottom: 70, // Position above the tab bar
    alignItems: "center",
    left: 0,
    right: 0,
    zIndex: 101,
  },
})
