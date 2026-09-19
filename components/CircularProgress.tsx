import { useEffect, useRef } from "react"
import { Animated, StyleSheet, Text, View } from "react-native"
import Svg, { Circle } from "react-native-svg"

interface CircularProgressProps {
  progress: number // 0 to 1
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  showPercentage?: boolean
  children?: React.ReactNode
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

export default function CircularProgress({
  progress,
  size = 100,
  strokeWidth = 8,
  color = "#22c55e",
  backgroundColor = "#e5e7eb",
  showPercentage = false,
  children,
}: CircularProgressProps) {
  const animatedProgress = useRef(new Animated.Value(0)).current
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    Animated.spring(animatedProgress, {
      toValue: progress,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start()
  }, [progress])

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  })

  const percentage = Math.round(progress * 100)

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.centerContent}>
        {showPercentage ? (
          <Text style={[styles.percentage, { color }]}>{percentage}%</Text>
        ) : (
          children
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  centerContent: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  percentage: {
    fontSize: 20,
    fontWeight: "800",
  },
})
