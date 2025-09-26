import type React from "react"
import { TouchableOpacity, Text, StyleSheet } from "react-native"

interface FilterChipProps {
  label: string
  isSelected: boolean
  onPress: () => void
}

const FilterChip: React.FC<FilterChipProps> = ({ label, isSelected, onPress }) => {
  return (
    <TouchableOpacity style={[styles.container, isSelected ? styles.selectedContainer : {}]} onPress={onPress}>
      <Text style={[styles.label, isSelected ? styles.selectedLabel : {}]}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginRight: 8,
  },
  selectedContainer: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
  },
  selectedLabel: {
    color: "white",
  },
})

export default FilterChip
