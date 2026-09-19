import { getStepType } from "@/utils/stepType"
import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { StyleSheet, Text, View } from "react-native"

interface Instruction {
  step_number: number
  instruction: string
  timer?: number
}

interface StepPreviewProps {
  instructions: Instruction[]
  currentStep: number
}

export default function StepPreview({
  instructions,
  currentStep,
}: StepPreviewProps) {
  const upcomingSteps = instructions.slice(currentStep + 1, currentStep + 3)

  if (upcomingSteps.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="eye-outline" size={20} color="#166534" />
          <Text style={styles.headerText}>Coming Up</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle" size={32} color="#22c55e" />
          <Text style={styles.emptyText}>
            You&rsquo;re on the last step! Finish strong! 🎉
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="eye-outline" size={20} color="#166534" />
        <Text style={styles.headerText}>Coming Up</Text>
      </View>

      {upcomingSteps.map((instruction, index) => (
        <View key={instruction.step_number} style={styles.previewItem}>
          <View style={styles.previewBadge}>
            <Text style={styles.previewBadgeText}>
              {index === 0 ? "Next" : "Then"}
            </Text>
          </View>
          <View style={styles.previewContent}>
            <View style={styles.previewHeader}>
              <View style={styles.stepNumberRow}>
                <Ionicons
                  name={getStepType(instruction.instruction).icon}
                  size={13}
                  color={getStepType(instruction.instruction).color}
                />
                <Text style={styles.stepNumber}>
                  Step {instruction.step_number}
                </Text>
              </View>
              {instruction.timer && instruction.timer > 0 && (
                <View style={styles.timerBadge}>
                  <Ionicons name="time-outline" size={12} color="#4b5563" />
                  <Text style={styles.timerText}>{instruction.timer}m</Text>
                </View>
              )}
            </View>
            <Text style={styles.previewText} numberOfLines={2}>
              {instruction.instruction}
            </Text>
          </View>
        </View>
      ))}

      <View style={styles.hint}>
        <Ionicons name="information-circle-outline" size={14} color="#6b7280" />
        <Text style={styles.hintText}>
          Prepare ingredients for upcoming steps while waiting
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fffbeb",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fef3c7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#166534",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#4b5563",
    textAlign: "center",
  },
  previewItem: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 12,
  },
  previewBadge: {
    backgroundColor: "#fbbf24",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    minWidth: 48,
    alignItems: "center",
  },
  previewBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "white",
    textTransform: "uppercase",
  },
  previewContent: {
    flex: 1,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  stepNumberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400e",
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  timerText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4b5563",
  },
  previewText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#78350f",
  },
  hint: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#fef3c7",
    gap: 6,
  },
  hintText: {
    flex: 1,
    fontSize: 11,
    fontStyle: "italic",
    color: "#6b7280",
  },
})
