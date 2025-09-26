import type React from "react"
import { View, Text, StyleSheet } from "react-native"

interface NutritionChartProps {
  protein: number
  carbs: number
  fat: number
}

const NutritionChart: React.FC<NutritionChartProps> = ({ protein, carbs, fat }) => {
  // Calculate percentages
  const total = protein + carbs + fat
  const proteinPercentage = Math.round((protein / total) * 100)
  const carbsPercentage = Math.round((carbs / total) * 100)
  const fatPercentage = Math.round((fat / total) * 100)

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <View
          style={[
            styles.chartSegment,
            {
              backgroundColor: "#22c55e",
              flex: proteinPercentage,
            },
          ]}
        />
        <View
          style={[
            styles.chartSegment,
            {
              backgroundColor: "#3b82f6",
              flex: carbsPercentage,
            },
          ]}
        />
        <View
          style={[
            styles.chartSegment,
            {
              backgroundColor: "#f59e0b",
              flex: fatPercentage,
            },
          ]}
        />
      </View>

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#22c55e" }]} />
          <Text style={styles.legendText}>Protein {proteinPercentage}%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#3b82f6" }]} />
          <Text style={styles.legendText}>Carbs {carbsPercentage}%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#f59e0b" }]} />
          <Text style={styles.legendText}>Fat {fatPercentage}%</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  chartContainer: {
    flexDirection: "row",
    height: 20,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 12,
  },
  chartSegment: {
    height: "100%",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#4b5563",
  },
})

export default NutritionChart
