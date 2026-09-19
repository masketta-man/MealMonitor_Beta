import { Ionicons } from "@expo/vector-icons"
import { StyleSheet, Text, View } from "react-native"

interface DifficultyIndicatorProps {
  difficulty: "easy" | "medium" | "hard" | null | undefined
  size?: "small" | "medium" | "large"
  showLabel?: boolean
}

export default function DifficultyIndicator({
  difficulty,
  size = "medium",
  showLabel = true,
}: DifficultyIndicatorProps) {
  const getDifficultyConfig = () => {
    switch (difficulty) {
      case "easy":
        return {
          icon: "leaf" as const,
          color: "#22c55e",
          bgColor: "#dcfce7",
          label: "Easy",
        }
      case "medium":
        return {
          icon: "flash" as const,
          color: "#f59e0b",
          bgColor: "#fef3c7",
          label: "Medium",
        }
      case "hard":
        return {
          icon: "flame" as const,
          color: "#ef4444",
          bgColor: "#fee2e2",
          label: "Hard",
        }
      default:
        return {
          icon: "star" as const,
          color: "#64748b",
          bgColor: "#f1f5f9",
          label: "Normal",
        }
    }
  }

  const config = getDifficultyConfig()
  const iconSize = size === "small" ? 12 : size === "large" ? 20 : 16
  const containerPadding = size === "small" ? 6 : size === "large" ? 10 : 8

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: config.bgColor, padding: containerPadding },
      ]}
    >
      <Ionicons name={config.icon} size={iconSize} color={config.color} />
      {showLabel && (
        <Text
          style={[
            styles.label,
            {
              color: config.color,
              fontSize: size === "small" ? 11 : size === "large" ? 14 : 12,
            },
          ]}
        >
          {config.label}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    gap: 4,
  },
  label: {
    fontWeight: "600",
  },
})
