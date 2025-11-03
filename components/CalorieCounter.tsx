import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

interface CalorieCounterProps {
  currentCalories: number
  goalCalories: number
  goalMet: boolean
}

export function CalorieCounter({ currentCalories, goalCalories, goalMet }: CalorieCounterProps) {
  const progress = goalCalories > 0 ? Math.min(currentCalories / goalCalories, 1) : 0
  const percentage = Math.round(progress * 100)
  const remaining = Math.max(goalCalories - currentCalories, 0)

  const getProgressColor = () => {
    if (goalMet && currentCalories > 0) return '#22c55e'
    if (currentCalories > goalCalories) return '#ef4444'
    return '#f59e0b'
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="flame" size={24} color="#f59e0b" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Today's Calories</Text>
          <Text style={styles.subtitle}>
            {currentCalories} / {goalCalories} cal
          </Text>
        </View>
        {goalMet && currentCalories > 0 && (
          <View style={styles.badgeContainer}>
            <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
          </View>
        )}
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
                backgroundColor: getProgressColor(),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{percentage}%</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{remaining}</Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text
            style={[
              styles.statValue,
              { color: goalMet && currentCalories > 0 ? '#22c55e' : '#64748b' },
            ]}
          >
            {goalMet && currentCalories > 0 ? '+50' : '0'}
          </Text>
          <Text style={styles.statLabel}>XP Today</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  badgeContainer: {
    marginLeft: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    minWidth: 45,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: '#e2e8f0',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#64748b',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
})
