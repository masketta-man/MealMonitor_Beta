import React, { useEffect, useRef } from 'react'
import { Modal, View, Text, StyleSheet, Animated, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Button from './Button'

interface LevelUpModalProps {
  visible: boolean
  newLevel: number
  onClose: () => void
}

const { width, height } = Dimensions.get('window')

export default function LevelUpModal({ visible, newLevel, onClose }: LevelUpModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const starAnim1 = useRef(new Animated.Value(0)).current
  const starAnim2 = useRef(new Animated.Value(0)).current
  const starAnim3 = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0)
      fadeAnim.setValue(0)
      starAnim1.setValue(0)
      starAnim2.setValue(0)
      starAnim3.setValue(0)
      pulseAnim.setValue(1)

      // Start animations sequence
      Animated.parallel([
        // Fade in background
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Scale in main content
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // After main animation, start stars
        Animated.stagger(150, [
          Animated.spring(starAnim1, {
            toValue: 1,
            friction: 5,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.spring(starAnim2, {
            toValue: 1,
            friction: 5,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.spring(starAnim3, {
            toValue: 1,
            friction: 5,
            tension: 100,
            useNativeDriver: true,
          }),
        ]).start()

        // Continuous pulse animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start()
      })
    }
  }, [visible])

  const getStarTransform = (anim: Animated.Value, angle: number, distance: number) => {
    return {
      transform: [
        {
          translateX: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, Math.cos(angle) * distance],
          }),
        },
        {
          translateY: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, Math.sin(angle) * distance],
          }),
        },
        {
          scale: anim,
        },
        {
          rotate: anim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
          }),
        },
      ],
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={['rgba(34, 197, 94, 0.95)', 'rgba(22, 101, 52, 0.95)']}
          style={styles.gradient}
        >
          <Animated.View
            style={[
              styles.contentContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Animated stars */}
            <View style={styles.starsContainer}>
              <Animated.View style={[styles.star, getStarTransform(starAnim1, -Math.PI / 4, 60)]}>
                <Ionicons name="star" size={30} color="#fbbf24" />
              </Animated.View>
              <Animated.View style={[styles.star, getStarTransform(starAnim2, Math.PI / 4, 60)]}>
                <Ionicons name="star" size={30} color="#fbbf24" />
              </Animated.View>
              <Animated.View style={[styles.star, getStarTransform(starAnim3, Math.PI, 60)]}>
                <Ionicons name="star" size={30} color="#fbbf24" />
              </Animated.View>
            </View>

            {/* Trophy icon with pulse */}
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="trophy" size={60} color="#fbbf24" />
              </View>
            </Animated.View>

            {/* Level up text */}
            <Text style={styles.title}>Level Up!</Text>
            <Text style={styles.subtitle}>Congratulations!</Text>

            {/* New level display */}
            <View style={styles.levelContainer}>
              <Text style={styles.levelLabel}>You've reached</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelNumber}>{newLevel}</Text>
              </View>
            </View>

            <Text style={styles.message}>
              Keep cooking to unlock more rewards and badges!
            </Text>

            {/* Continue button */}
            <Button
              text="Continue"
              color="white"
              backgroundColor="#22c55e"
              onPress={onClose}
              style={styles.button}
            />
          </Animated.View>
        </LinearGradient>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: width * 0.85,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  starsContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    position: 'absolute',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fbbf24',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#22c55e',
    marginBottom: 24,
  },
  levelContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  levelLabel: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 12,
  },
  levelBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#22c55e',
  },
  levelNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#166534',
  },
  message: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
  },
})
