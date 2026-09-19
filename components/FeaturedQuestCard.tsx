import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Badge from "./Badge"
import CircularProgress from "./CircularProgress"
import DifficultyIndicator from "./DifficultyIndicator"

interface FeaturedQuestCardProps {
  title: string
  description: string
  icon: string
  color: string
  bgColor: string
  rewardPoints: number
  totalTasks: number
  completedTasks: number
  daysLeft?: number
  difficulty?: "easy" | "medium" | "hard"
  onPress: () => void
}

export default function FeaturedQuestCard({
  title,
  description,
  icon,
  color,
  bgColor,
  rewardPoints,
  totalTasks,
  completedTasks,
  daysLeft,
  difficulty,
  onPress,
}: FeaturedQuestCardProps) {
  const progress = totalTasks > 0 ? completedTasks / totalTasks : 0

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <LinearGradient
        colors={[color, `${color}dd`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Background Pattern */}
        <View style={styles.backgroundPattern}>
          <Ionicons name={icon as any} size={120} color="rgba(255,255,255,0.1)" />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon as any} size={24} color="white" />
          </View>
          <View style={styles.headerBadges}>
            {difficulty && (
              <View style={styles.difficultyBadge}>
                <DifficultyIndicator
                  difficulty={difficulty}
                  size="small"
                  showLabel={false}
                />
              </View>
            )}
            <Badge text="Featured" color={color} backgroundColor="white" />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        </View>

        {/* Progress and Stats */}
        <View style={styles.footer}>
          <View style={styles.progressSection}>
            <CircularProgress
              progress={progress}
              size={60}
              strokeWidth={6}
              color="white"
              backgroundColor="rgba(255,255,255,0.3)"
            >
              <Text style={styles.progressText}>
                {completedTasks}/{totalTasks}
              </Text>
            </CircularProgress>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Tasks Completed</Text>
              {daysLeft !== undefined && (
                <View style={styles.daysLeftContainer}>
                  <Ionicons name="time-outline" size={14} color="white" />
                  <Text style={styles.daysLeftText}>
                    {daysLeft} {daysLeft === 1 ? "day" : "days"} left
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.rewardSection}>
            <View style={styles.rewardIcon}>
              <Ionicons name="trophy" size={24} color="#fbbf24" />
            </View>
            <Text style={styles.rewardPoints}>+{rewardPoints}</Text>
            <Text style={styles.rewardLabel}>XP</Text>
          </View>
        </View>

        {/* Call to Action */}
        <View style={styles.cta}>
          <Text style={styles.ctaText}>Continue Quest</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  backgroundPattern: {
    position: "absolute",
    right: -20,
    bottom: -20,
    opacity: 0.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerBadges: {
    flexDirection: "row",
    gap: 8,
  },
  difficultyBadge: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 6,
  },
  content: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "white",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  progressSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
  },
  progressInfo: {
    flex: 1,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
    marginBottom: 4,
  },
  daysLeftContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  daysLeftText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.9)",
  },
  rewardSection: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  rewardIcon: {
    marginBottom: 4,
  },
  rewardPoints: {
    fontSize: 18,
    fontWeight: "800",
    color: "white",
  },
  rewardLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
})
