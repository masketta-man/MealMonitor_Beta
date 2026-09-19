import { Ionicons } from "@expo/vector-icons"
import React, { useState } from "react"
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import Button from "./Button"

interface RatingDimension {
  label: string
  icon: string
  description: string
  rating: number
}

interface EnhancedRatingModalProps {
  visible: boolean
  onClose: () => void
  onSubmit: (rating: RatingData) => void
  recipeTitle: string
  suggestedPrepTime: number
}

export interface RatingData {
  overallRating: number
  difficulty: number
  timeAccuracy: number
  taste: number
  instructions: number
  actualTime: number
  modifications: string
  wouldCookAgain: boolean
}

export default function EnhancedRatingModal({
  visible,
  onClose,
  onSubmit,
  recipeTitle,
  suggestedPrepTime,
}: EnhancedRatingModalProps) {
  const [overallRating, setOverallRating] = useState(0)
  const [dimensions, setDimensions] = useState<RatingDimension[]>([
    {
      label: "Difficulty",
      icon: "bar-chart-outline",
      description: "How hard was it to make?",
      rating: 0,
    },
    {
      label: "Time Accuracy",
      icon: "time-outline",
      description: "Was the prep time accurate?",
      rating: 0,
    },
    {
      label: "Taste",
      icon: "heart-outline",
      description: "How delicious was it?",
      rating: 0,
    },
    {
      label: "Instructions",
      icon: "book-outline",
      description: "Were instructions clear?",
      rating: 0,
    },
  ])

  const [actualTime, setActualTime] = useState(suggestedPrepTime)
  const [modifications, setModifications] = useState("")
  const [wouldCookAgain, setWouldCookAgain] = useState(true)

  const updateDimensionRating = (index: number, rating: number) => {
    const newDimensions = [...dimensions]
    newDimensions[index].rating = rating
    setDimensions(newDimensions)
  }

  const handleSubmit = () => {
    const ratingData: RatingData = {
      overallRating,
      difficulty: dimensions[0].rating,
      timeAccuracy: dimensions[1].rating,
      taste: dimensions[2].rating,
      instructions: dimensions[3].rating,
      actualTime,
      modifications,
      wouldCookAgain,
    }

    onSubmit(ratingData)
    resetForm()
  }

  const resetForm = () => {
    setOverallRating(0)
    setDimensions(
      dimensions.map((dim) => ({
        ...dim,
        rating: 0,
      })),
    )
    setActualTime(suggestedPrepTime)
    setModifications("")
    setWouldCookAgain(true)
  }

  const allRatingsComplete =
    overallRating > 0 && dimensions.every((dim) => dim.rating > 0)

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#1f2937" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Rate Your Experience</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {recipeTitle}
              </Text>
            </View>
            <View style={styles.placeholder} />
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Overall Rating */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Overall Rating</Text>
              <Text style={styles.sectionSubtitle}>
                How would you rate this recipe overall?
              </Text>
              <View style={styles.starContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setOverallRating(star)}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={star <= overallRating ? "star" : "star-outline"}
                      size={40}
                      color={star <= overallRating ? "#fbbf24" : "#d1d5db"}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {overallRating > 0 && (
                <Text style={styles.ratingLabel}>
                  {getRatingLabel(overallRating)}
                </Text>
              )}
            </View>

            {/* Detailed Ratings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detailed Feedback</Text>
              <Text style={styles.sectionSubtitle}>
                Help us improve recommendations
              </Text>

              {dimensions.map((dimension, index) => (
                <View key={index} style={styles.dimensionCard}>
                  <View style={styles.dimensionHeader}>
                    <View style={styles.dimensionInfo}>
                      <Ionicons
                        name={dimension.icon as any}
                        size={20}
                        color="#22c55e"
                      />
                      <View style={styles.dimensionText}>
                        <Text style={styles.dimensionLabel}>
                          {dimension.label}
                        </Text>
                        <Text style={styles.dimensionDescription}>
                          {dimension.description}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.dimensionStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => updateDimensionRating(index, star)}
                        style={styles.smallStarButton}
                      >
                        <Ionicons
                          name={
                            star <= dimension.rating ? "star" : "star-outline"
                          }
                          size={24}
                          color={
                            star <= dimension.rating ? "#fbbf24" : "#d1d5db"
                          }
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            {/* Actual Time Taken */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How long did it take?</Text>
              <Text style={styles.sectionSubtitle}>
                Suggested: {suggestedPrepTime} minutes
              </Text>
              <View style={styles.timeAdjuster}>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setActualTime(Math.max(5, actualTime - 5))}
                >
                  <Ionicons name="remove" size={24} color="#22c55e" />
                </TouchableOpacity>
                <View style={styles.timeDisplay}>
                  <Text style={styles.timeValue}>{actualTime}</Text>
                  <Text style={styles.timeLabel}>minutes</Text>
                </View>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setActualTime(actualTime + 5)}
                >
                  <Ionicons name="add" size={24} color="#22c55e" />
                </TouchableOpacity>
              </View>
              {actualTime !== suggestedPrepTime && (
                <Text
                  style={[
                    styles.timeDifference,
                    actualTime > suggestedPrepTime
                      ? styles.timeDifferenceOver
                      : styles.timeDifferenceUnder,
                  ]}
                >
                  {actualTime > suggestedPrepTime ? "+" : ""}
                  {actualTime - suggestedPrepTime} minutes{" "}
                  {actualTime > suggestedPrepTime ? "over" : "under"} estimate
                </Text>
              )}
            </View>

            {/* Would Cook Again */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Would you cook this again?</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    wouldCookAgain && styles.toggleButtonActive,
                  ]}
                  onPress={() => setWouldCookAgain(true)}
                >
                  <Ionicons
                    name="thumbs-up"
                    size={24}
                    color={wouldCookAgain ? "white" : "#9ca3af"}
                  />
                  <Text
                    style={[
                      styles.toggleButtonText,
                      wouldCookAgain && styles.toggleButtonTextActive,
                    ]}
                  >
                    Yes!
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    !wouldCookAgain && styles.toggleButtonActiveNo,
                  ]}
                  onPress={() => setWouldCookAgain(false)}
                >
                  <Ionicons
                    name="thumbs-down"
                    size={24}
                    color={!wouldCookAgain ? "white" : "#9ca3af"}
                  />
                  <Text
                    style={[
                      styles.toggleButtonText,
                      !wouldCookAgain && styles.toggleButtonTextActive,
                    ]}
                  >
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Modifications */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Any modifications or notes?
              </Text>
              <Text style={styles.sectionSubtitle}>Optional</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Added extra garlic, Used less salt, Kids loved it..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                value={modifications}
                onChangeText={setModifications}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.bottomPadding} />
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            {!allRatingsComplete && (
              <View style={styles.warningBanner}>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color="#f59e0b"
                />
                <Text style={styles.warningText}>
                  Please complete all ratings to submit
                </Text>
              </View>
            )}
            <Button
              text="Submit Rating"
              color="white"
              backgroundColor="#22c55e"
              onPress={handleSubmit}
              disabled={!allRatingsComplete}
              style={[
                styles.submitButton,
                !allRatingsComplete && styles.submitButtonDisabled,
              ]}
            />
            <TouchableOpacity onPress={onClose} style={styles.skipButton}>
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

function getRatingLabel(rating: number): string {
  switch (rating) {
    case 1:
      return "😞 Poor"
    case 2:
      return "😐 Fair"
    case 3:
      return "😊 Good"
    case 4:
      return "😄 Great"
    case 5:
      return "🤩 Excellent!"
    default:
      return ""
  }
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  closeButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#166534",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  placeholder: {
    width: 32,
  },
  scrollContent: {
    maxHeight: "100%",
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16,
  },
  starContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#166534",
    textAlign: "center",
  },
  dimensionCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  dimensionHeader: {
    marginBottom: 12,
  },
  dimensionInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  dimensionText: {
    flex: 1,
  },
  dimensionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  dimensionDescription: {
    fontSize: 12,
    color: "#6b7280",
  },
  dimensionStars: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  smallStarButton: {
    padding: 4,
  },
  timeAdjuster: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    gap: 24,
  },
  timeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
  },
  timeDisplay: {
    alignItems: "center",
    minWidth: 80,
  },
  timeValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#166534",
  },
  timeLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  timeDifference: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 12,
    fontWeight: "600",
  },
  timeDifferenceOver: {
    color: "#dc2626",
  },
  timeDifferenceUnder: {
    color: "#16a34a",
  },
  toggleContainer: {
    flexDirection: "row",
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: "#22c55e",
  },
  toggleButtonActiveNo: {
    backgroundColor: "#ef4444",
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9ca3af",
  },
  toggleButtonTextActive: {
    color: "white",
  },
  textInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: "#1f2937",
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  bottomPadding: {
    height: 20,
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: "#92400e",
  },
  submitButton: {
    marginBottom: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  skipButton: {
    paddingVertical: 8,
    alignItems: "center",
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
})
