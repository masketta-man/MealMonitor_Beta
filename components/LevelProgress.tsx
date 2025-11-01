import { View, Text, StyleSheet } from "react-native"
import ProgressBar from "./ProgressBar"

interface LevelProgressProps {
  level: number
  currentXp: number
  nextLevelXp: number
  progress: number
  showDetails?: boolean
}

export function LevelProgress({ level, currentXp, nextLevelXp, progress, showDetails = true }: LevelProgressProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1)
  const xpRemaining = Math.max(nextLevelXp - currentXp, 0)
  const nearLevelUp = clampedProgress >= 0.8 && clampedProgress < 1

  return (
    <View style={styles.container}>
      {showDetails && (
        <View style={styles.header}>
          <Text style={styles.levelText}>Level {level}</Text>
          <Text style={styles.xpText}>
            {currentXp}/{nextLevelXp} XP
          </Text>
        </View>
      )}

      <ProgressBar
        progress={clampedProgress}
        colors={nearLevelUp ? ["#fbbf24", "#f59e0b"] : ["#4ade80", "#22c55e"]}
        height={10}
      />

      {nearLevelUp && showDetails && (
        <Text style={styles.remainingText}>Only {xpRemaining} XP to reach level {level + 1}!</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  levelText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#166534",
  },
  xpText: {
    fontSize: 12,
    color: "#64748b",
  },
  remainingText: {
    marginTop: 6,
    fontSize: 12,
    color: "#f59e0b",
    fontWeight: "600",
    textAlign: "center",
  },
})
