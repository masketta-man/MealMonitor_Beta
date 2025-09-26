import { Ionicons } from "@expo/vector-icons"
import { Tabs } from "expo-router"

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: "none", // Hide the default tab bar since you're using a custom one
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: "Recipes",
          tabBarIcon: ({ color }) => <Ionicons name="restaurant" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: "Challenges",
          tabBarIcon: ({ color }) => <Ionicons name="trophy" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ingredients"
        options={{
          title: "Ingredients",
          tabBarIcon: ({ color }) => <Ionicons name="basket" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="recipe/[id]"
        options={{
          href: null, // This makes the tab not appear in the tab bar
        }}
      />
      <Tabs.Screen
        name="challenges/[id]"
        options={{
          href: null, // This makes the tab not appear in the tab bar
        }}
      />
      <Tabs.Screen
        name="create-recipe"
        options={{
          href: null, // This makes the tab not appear in the tab bar
        }}
      />
      <Tabs.Screen
        name="edit-recipe/[id]"
        options={{
          href: null, // This makes the tab not appear in the tab bar
        }}
      />
    </Tabs>
  )
}
