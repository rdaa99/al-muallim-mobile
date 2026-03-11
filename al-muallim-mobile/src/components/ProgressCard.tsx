import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useFonts } from '../context/FontSizeContext';

interface ProgressCardProps {
  title: string;
  value: number;
  total?: number;
  unit?: string;
  color?: string;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  value,
  total,
  unit = '',
  color = '#4CAF50',
}) => {
  const percentage = total ? Math.round((value / total) * 100) : 0;
  const { colors } = useTheme();
  const { fonts } = useFonts();

  return (
    <View style={[styles.card, { borderLeftColor: color, backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.textSecondary, fontSize: fonts.body }]}>{title}</Text>
      <Text style={[styles.value, { color: colors.text, fontSize: fonts.title }]}>
        {value}{unit} {total && `/ ${total}${unit}`}
      </Text>
      {total && (
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
      )}
      {total && <Text style={[styles.percentage, { color: colors.textSecondary, fontSize: fonts.caption }]}>{percentage}%</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
    borderLeftWidth: 4,
  },
  title: {
    marginBottom: 8,
  },
  value: {
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
    marginTop: 4,
    textAlign: 'right',
  },
});
