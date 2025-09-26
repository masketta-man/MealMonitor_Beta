import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ColorValue } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0 to 1
  colors?: readonly [ColorValue, ColorValue, ...ColorValue[]];
  height?: number;
  backgroundColor?: string;
  style?: object;
}

const ProgressBar = ({ 
  progress, 
  colors = ['#4ade80', '#22c55e'] as const, 
  height = 8,
  backgroundColor = '#f1f5f9',
  style = {}
}: ProgressBarProps) => {
  // Ensure progress is between 0 and 1
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  
  return (
    <View style={[styles.container, { height, backgroundColor }, style]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.progress, { width: `${clampedProgress * 100}%` }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
  },
  progress: {
    height: '100%',
    borderRadius: 10,
  },
});

export default ProgressBar;