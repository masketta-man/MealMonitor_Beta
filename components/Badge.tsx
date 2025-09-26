import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
  label?: string;
  text?: string; // Alias for label
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: BadgeSize | 'sm' | 'md' | 'lg';
  color?: string;
  backgroundColor?: string;
  small?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  label,
  text,
  variant = 'primary',
  style,
  textStyle,
  size = 'medium',
  color,
  backgroundColor,
  small,
  ...rest
}) => {
  // Handle legacy size prop (small: boolean)
  const normalizedSize: BadgeSize = small 
    ? 'small' 
    : (size === 'sm' || size === 'md' || size === 'lg'
        ? { sm: 'small', md: 'medium', lg: 'large' }[size] as BadgeSize
        : size as BadgeSize);

  const displayText = text || label || '';

  // Type-safe way to access variant styles
  const variantBgStyle = styles[`${variant}Badge` as keyof typeof styles] as ViewStyle;
  const variantTextStyle = styles[`${variant}Text` as keyof typeof styles] as TextStyle;
  const sizeStyle = styles[`${normalizedSize}Badge` as keyof typeof styles] as ViewStyle;
  const textSizeStyle = styles[`${normalizedSize}Text` as keyof typeof styles] as TextStyle;

  const badgeStyle = [
    styles.badge,
    !backgroundColor && variantBgStyle,
    sizeStyle,
    backgroundColor && { backgroundColor },
    style,
  ];

  const badgeTextStyle = [
    styles.text,
    textSizeStyle,
    color ? { color } : variantTextStyle,
    textStyle,
  ] as TextStyle[];

  return (
    <View style={badgeStyle} {...rest}>
      <Text style={badgeTextStyle}>
        {displayText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Base styles
  badge: {
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
  },
  
  // Size variants
  smallBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  mediumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  largeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
  
  // Color variants
  primaryBadge: {
    backgroundColor: '#e3f2fd',
  },
  primaryText: {
    color: '#1565c0',
  },
  secondaryBadge: {
    backgroundColor: '#f3e5f5',
  },
  secondaryText: {
    color: '#7b1fa2',
  },
  successBadge: {
    backgroundColor: '#e8f5e9',
  },
  successText: {
    color: '#2e7d32',
  },
  warningBadge: {
    backgroundColor: '#fff8e1',
  },
  warningText: {
    color: '#f57f17',
  },
  errorBadge: {
    backgroundColor: '#ffebee',
  },
  errorText: {
    color: '#c62828',
  },
  infoBadge: {
    backgroundColor: '#e1f5fe',
  },
  infoText: {
    color: '#0277bd',
  },
});

export default Badge;