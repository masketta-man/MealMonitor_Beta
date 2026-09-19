import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"
import { useEffect, useRef, useState } from "react"
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

interface QuestCompletionCelebrationProps {
  visible: boolean
  questTitle: string
  rewardPoints: number
  onClose: () => void
  onViewHistory?: () => void
}

interface ConfettiPiece {
  id: number
  x: number
  color: string
  delay: number
  duration: number
}

const { width, height } = Dimensions.get("window")

export default function QuestCompletionCelebration({
  visible,
  questTitle,
  rewardPoints,
  onClose,
  onViewHistory,
}: QuestCompletionCelebrationProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])
  const scaleAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const bounceAnim = useRef(new Animated.Value(0)).current

  const colors = [
    "#22c55e",
    "#16a34a",
    "#dcfce7",
    "#f59e0b",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#fbbf24",
  ]

  useEffect(() => {
    if (visible) {
      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

      // Generate confetti pieces
      const pieces: ConfettiPiece[] = []
      for (let i = 0; i < 50; i++) {
        pieces.push({
          id: i,
          x: Math.random() * width,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 200,
          duration: 2000 + Math.random() * 1000,
        })
      }
      setConfetti(pieces)

      // Animate modal entrance
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()

      // Bounce animation for trophy
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start()
    } else {
      // Reset animations
      scaleAnim.setValue(0)
      fadeAnim.setValue(0)
      bounceAnim.setValue(0)
      setConfetti([])
    }
  }, [visible])

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose()
    })
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Confetti Animation */}
        {confetti.map((piece) => (
          <ConfettiParticle key={piece.id} {...piece} />
        ))}

        {/* Overlay */}
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        {/* Celebration Modal */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <LinearGradient
            colors={["#dcfce7", "#f0fdf4"]}
            style={styles.modalContent}
          >
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>

            {/* Trophy Animation */}
            <Animated.View
              style={[
                styles.trophyContainer,
                {
                  transform: [{ translateY: bounceAnim }],
                },
              ]}
            >
              <View style={styles.trophyCircle}>
                <Ionicons name="trophy" size={64} color="#f59e0b" />
              </View>
            </Animated.View>

            {/* Success Message */}
            <Text style={styles.congratsText}>Quest Completed!</Text>
            <Text style={styles.questTitle}>{questTitle}</Text>

            {/* Rewards */}
            <View style={styles.rewardsContainer}>
              <View style={styles.rewardCard}>
                <View style={styles.rewardIconContainer}>
                  <Ionicons name="star" size={32} color="#22c55e" />
                </View>
                <Text style={styles.rewardValue}>+{rewardPoints}</Text>
                <Text style={styles.rewardLabel}>XP Earned</Text>
              </View>
            </View>

            {/* Achievement Badge */}
            <View style={styles.achievementBadge}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color="#22c55e"
              />
              <Text style={styles.achievementText}>
                Keep up the great work!
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonsContainer}>
              {onViewHistory && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => {
                    handleClose()
                    onViewHistory()
                  }}
                >
                  <Text style={styles.secondaryButtonText}>View History</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleClose}
              >
                <LinearGradient
                  colors={["#22c55e", "#16a34a"]}
                  style={styles.primaryButtonGradient}
                >
                  <Text style={styles.primaryButtonText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  )
}

// Confetti Particle Component
function ConfettiParticle({
  x,
  color,
  delay,
  duration,
}: Omit<ConfettiPiece, "id">) {
  const translateY = useRef(new Animated.Value(-20)).current
  const translateX = useRef(new Animated.Value(0)).current
  const rotate = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const startAnimation = () => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height + 100,
          duration: duration,
          delay: delay,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: (Math.random() - 0.5) * 100,
          duration: duration,
          delay: delay,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: Math.random() * 720 - 360,
          duration: duration,
          delay: delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: duration * 0.8,
          delay: delay + duration * 0.2,
          useNativeDriver: true,
        }),
      ]).start()
    }

    startAnimation()
  }, [])

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        {
          left: x,
          backgroundColor: color,
          transform: [
            { translateY },
            { translateX },
            { rotate: rotate.interpolate({
                inputRange: [0, 360],
                outputRange: ["0deg", "360deg"],
              }),
            },
          ],
          opacity,
        },
      ]}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  confettiPiece: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalContent: {
    padding: 32,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  trophyContainer: {
    marginBottom: 24,
  },
  trophyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  congratsText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#166534",
    marginBottom: 8,
    textAlign: "center",
  },
  questTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 24,
    textAlign: "center",
  },
  rewardsContainer: {
    width: "100%",
    marginBottom: 24,
  },
  rewardCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  rewardIconContainer: {
    marginBottom: 12,
  },
  rewardValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#166534",
    marginBottom: 4,
  },
  rewardLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  achievementBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 24,
    gap: 8,
  },
  achievementText: {
    fontSize: 14,
    color: "#166534",
    fontWeight: "600",
  },
  buttonsContainer: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  secondaryButton: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#22c55e",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#22c55e",
  },
})
