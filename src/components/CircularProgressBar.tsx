import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CircularProgressBarProps {
  percentage: number;
  size: number;
  strokeWidth?: number;
  color: string;
  backgroundColor: string;
  showPercentage?: boolean;
}

/**
 * A simple circular progress indicator using border styling.
 * Shows a filled ring with the progress percentage in the center.
 */
export const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  percentage,
  size,
  strokeWidth = 10,
  color,
  backgroundColor,
  showPercentage = true,
}) => {
  const innerSize = size - strokeWidth * 2;
  const safePercentage = Math.min(100, Math.max(0, percentage));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background ring */}
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: backgroundColor,
          },
        ]}
      />

      {/* Progress indicator - simplified as a half-filled arc */}
      <View
        style={[
          styles.progressRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            borderLeftColor: safePercentage >= 25 ? color : 'transparent',
            borderTopColor: safePercentage >= 25 ? color : 'transparent',
            borderRightColor: safePercentage >= 50 ? color : 'transparent',
            borderBottomColor: safePercentage >= 75 ? color : 'transparent',
            transform: [{ rotate: `${(safePercentage / 100) * 360 - 90}deg` }],
          },
        ]}
      />

      {/* Inner circle with percentage */}
      <View
        style={[
          styles.innerCircle,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor,
          },
        ]}
      >
        {showPercentage && (
          <View style={styles.percentageContainer}>
            <Text style={[styles.percentageText, { color }]}>
              {safePercentage}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
  progressRing: {
    position: 'absolute',
  },
  innerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
});
