import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ThemeColors } from '../context/ThemeContext';

interface ProgressCardProps {
  title: string;
  value: number;
  total?: number;
  unit?: string;
  color?: string;
  colors?: ThemeColors;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  value,
  total,
  unit = '',
  color = '#4CAF50',
  colors,
}) => {
  const percentage = total ? Math.round((value / total) * 100) : 0;

  const cardBg = colors?.card || '#fff';
  const titleColor = colors?.textSecondary || '#666';
  const valueColor = colors?.text || '#333';
  const barBg = colors?.border || '#e0e0e0';
  const percentColor = colors?.textSecondary || '#999';

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderLeftColor: color }]}>
      <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
      <Text style={[styles.value, { color: valueColor }]}>
        {value}{unit} {total != null && `/ ${total}${unit}`}
      </Text>
      {total != null && (
        <View style={[styles.progressBar, { backgroundColor: barBg }]}>
          <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
      )}
      {total != null && <Text style={[styles.percentage, { color: percentColor }]}>{percentage}%</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  title: {
    fontSize: 14,
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
});
