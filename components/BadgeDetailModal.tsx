import { Ionicons } from "@expo/vector-icons"
import { Modal, Pressable, StyleSheet, Text, View } from "react-native"
import type { BadgeWithProgress } from "@/services/badgeService"

interface BadgeDetailModalProps {
  badge: BadgeWithProgress | null
  onClose: () => void
}

/**
 * Turns a badge's machine requirement (type + value) into a plain-language
 * sentence telling the user exactly how to earn it. The `badges.requirement_type`
 * column is an enum string, so this is the single place that maps each type to
 * human copy; an unrecognised type falls back to a generic phrasing rather than
 * leaking the raw enum.
 */
const describeRequirement = (
  requirementType: string,
  value: number,
): string => {
  const plural = value === 1
  switch (requirementType) {
    case "meals_completed":
      return `Cook and complete ${value} ${plural ? "recipe" : "recipes"}.`
    case "challenges_completed":
      return `Finish ${value} ${plural ? "quest" : "quests"}.`
    case "streak_days":
      return `Keep a daily cooking streak going for ${value} ${
        plural ? "day" : "days"
      } in a row.`
    case "points_earned":
      return `Earn a total of ${value} points from cooking and quests.`
    case "ingredients_used":
      return `Cook with ${value} different ${
        plural ? "ingredient" : "ingredients"
      }.`
    default:
      return `Reach ${value} to unlock this badge.`
  }
}

export default function BadgeDetailModal({
  badge,
  onClose,
}: BadgeDetailModalProps) {
  if (!badge) return null

  const remaining = Math.max(0, badge.requirement_value - badge.progress)
  const progressPct = Math.min(
    100,
    (badge.progress / badge.requirement_value) * 100,
  )

  return (
    <Modal
      visible={!!badge}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Tap the backdrop to dismiss; taps on the card itself are swallowed. */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={8}
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={22} color="#64748b" />
          </Pressable>

          <View
            style={[
              styles.iconContainer,
              { backgroundColor: badge.isEarned ? badge.color : "#e2e8f0" },
            ]}
          >
            <Ionicons
              name={badge.icon as keyof typeof Ionicons.glyphMap}
              size={36}
              color={badge.isEarned ? "white" : "#94a3b8"}
            />
          </View>

          <Text style={styles.name}>{badge.name}</Text>

          {badge.description ? (
            <Text style={styles.description}>{badge.description}</Text>
          ) : null}

          <View style={styles.howToBox}>
            <View style={styles.howToHeader}>
              <Ionicons
                name={badge.isEarned ? "checkmark-circle" : "flag-outline"}
                size={16}
                color={badge.isEarned ? "#22c55e" : "#166534"}
              />
              <Text style={styles.howToTitle}>
                {badge.isEarned ? "How you earned it" : "How to earn it"}
              </Text>
            </View>
            <Text style={styles.howToText}>
              {describeRequirement(
                badge.requirement_type,
                badge.requirement_value,
              )}
            </Text>
          </View>

          {badge.isEarned ? (
            <View style={styles.earnedRow}>
              <Ionicons name="trophy" size={16} color="#f59e0b" />
              <Text style={styles.earnedText}>
                {badge.earnedAt
                  ? `Earned on ${new Date(badge.earnedAt).toLocaleDateString()}`
                  : "Earned"}
              </Text>
            </View>
          ) : (
            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progressPct}%`,
                      backgroundColor: badge.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {badge.progress}/{badge.requirement_value}
                {remaining > 0 ? `  ·  ${remaining} to go` : ""}
              </Text>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 4,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  howToBox: {
    width: "100%",
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  howToHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  howToTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#166534",
  },
  howToText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  earnedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  earnedText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400e",
  },
  progressSection: {
    width: "100%",
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
})
