import { TouchableOpacity, Text, StyleSheet, type ViewStyle, ViewStyle as RNViewStyle } from "react-native"

interface ButtonProps {
  text: string
  color: string
  backgroundColor: string
  onPress: () => void
  style?: RNViewStyle
  disabled?: boolean
  outline?: string
}

const Button = ({
  text,
  color,
  backgroundColor,
  onPress,
  style = {},
  disabled = false,
  outline,
}: ButtonProps) => {
  const buttonStyles: RNViewStyle = {
    ...styles.button,
    ...(outline
      ? {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: outline,
        }
      : { backgroundColor: disabled ? "#e2e8f0" : backgroundColor }),
  }


  return (
    <TouchableOpacity
      style={[buttonStyles, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, { color: disabled ? "#94a3b8" : outline ? outline : color }]}>
        {text}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  text: {
    fontWeight: "700",
    fontSize: 16,
  },
})

export default Button
