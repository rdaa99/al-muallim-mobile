import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ThemeColors } from '../context/ThemeContext';

interface StatsCardProps {
  icon: string;
  value: number;
  label: string;
  subLabel?: string;
  color: string;
  colors?: ThemeColors;
  isPercentage?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  value,
  label,
  subLabel,
  color,
  colors,
  isPercentage = false,
}) => {
  const cardBg = colors?.card || '#fff';
  const textColor = colors?.text || '#333';
  const labelColor = colors?.textSecondary || '#666';

  return (
    <View style={[styles.container, { backgroundColor: cardBg }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.value, { color: textColor }]}>
        {isPercentage ? value : value}
        {subLabel && !isPercentage && (
          <Text style={[styles.subLabelInline, { color: labelColor }]}> {subLabel}</Text>
        )}
        {isPercentage && '%'}
      </Text>
      <Text style={[styles.label, { color: labelColor }]} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: '45%',
    margin: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    fontSize: 28,
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subLabelInline: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});
