import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native'

interface TagChipProps {
  label: string
  category?: string
  color?: string
  backgroundColor?: string
  onPress?: () => void
  size?: 'small' | 'medium'
  style?: ViewStyle
  textStyle?: TextStyle
}

const TagChip: React.FC<TagChipProps> = ({
  label,
  category,
  color,
  backgroundColor,
  onPress,
  size = 'small',
  style,
  textStyle,
}) => {
  const getCategoryColor = (cat?: string) => {
    switch (cat?.toLowerCase()) {
      case 'dietary':
        return { bg: '#dcfce7', text: '#166534' }
      case 'cuisine':
        return { bg: '#dbeafe', text: '#1e40af' }
      case 'cooking_method':
        return { bg: '#ffedd5', text: '#9a3412' }
      case 'meal_time':
        return { bg: '#f3e8ff', text: '#7e22ce' }
      case 'allergen':
        return { bg: '#fee2e2', text: '#991b1b' }
      case 'ingredient_type':
        return { bg: '#fef3c7', text: '#92400e' }
      case 'taste_profile':
        return { bg: '#fce7f3', text: '#9f1239' }
      case 'health_benefit':
        return { bg: '#d1fae5', text: '#065f46' }
      default:
        return { bg: '#f3f4f6', text: '#4b5563' }
    }
  }

  const colors = getCategoryColor(category)
  const chipBackgroundColor = backgroundColor || colors.bg
  const chipTextColor = color || colors.text

  const sizeStyle = size === 'small' ? styles.chipSmall : styles.chipMedium
  const textSizeStyle = size === 'small' ? styles.textSmall : styles.textMedium

  const Wrapper = onPress ? TouchableOpacity : View

  return (
    <Wrapper
      onPress={onPress}
      style={[
        styles.chip,
        sizeStyle,
        { backgroundColor: chipBackgroundColor },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          textSizeStyle,
          { color: chipTextColor },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    marginBottom: 6,
  },
  chipSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chipMedium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  text: {
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 11,
  },
  textMedium: {
    fontSize: 13,
  },
})

export default TagChip
