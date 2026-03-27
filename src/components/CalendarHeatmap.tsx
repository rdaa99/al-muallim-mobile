import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ThemeColors } from '../context/ThemeContext';

interface CalendarHeatmapProps {
  data: { date: string; has_activity: boolean }[];
  colors?: ThemeColors;
}

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({
  data,
  colors,
}) => {
  const bgColor = colors?.surface || '#fff';
  const textColor = colors?.text || '#333';
  const labelColor = colors?.textSecondary || '#666';
  const activeColor = colors?.primary || '#10B981';
  const inactiveColor = colors?.border || '#e0e0e0';

  // Group data by weeks (7 days each)
  const weeks: { date: string; has_activity: boolean }[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  // Get month labels
  const getMonthLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  // Get unique month labels with their positions
  const monthLabels: { label: string; weekIndex: number }[] = [];
  let lastMonth = '';
  data.forEach((day, index) => {
    const month = getMonthLabel(day.date);
    if (month !== lastMonth && index % 7 === 0) {
      monthLabels.push({ label: month, weekIndex: Math.floor(index / 7) });
      lastMonth = month;
    }
  });

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Month labels */}
      <View style={styles.monthLabelsContainer}>
        {monthLabels.map(({ label, weekIndex }) => (
          <Text
            key={`${label}-${weekIndex}`}
            style={[styles.monthLabel, { color: labelColor }]}
          >
            {label}
          </Text>
        ))}
      </View>

      {/* Heatmap grid */}
      <View style={styles.gridContainer}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekColumn}>
            {week.map((day, dayIndex) => (
              <View
                key={`${weekIndex}-${dayIndex}`}
                style={[
                  styles.dayCell,
                  {
                    backgroundColor: day.has_activity ? activeColor : inactiveColor,
                    opacity: day.has_activity ? 1 : 0.3,
                  },
                ]}
              />
            ))}
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={[styles.legendText, { color: labelColor }]}>Less</Text>
        {[0.3, 0.6, 1].map((opacity, index) => (
          <View
            key={index}
            style={[
              styles.legendCell,
              {
                backgroundColor: index === 0 ? inactiveColor : activeColor,
                opacity: index === 0 ? 0.3 : opacity,
              },
            ]}
          />
        ))}
        <Text style={[styles.legendText, { color: labelColor }]}>More</Text>
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <Text style={[styles.summaryText, { color: textColor }]}>
          {data.filter(d => d.has_activity).length} {data.filter(d => d.has_activity).length === 1 ? 'day' : 'days'} active
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
  },
  monthLabelsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  monthLabel: {
    fontSize: 10,
    width: 32,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  weekColumn: {
    flexDirection: 'column',
    marginHorizontal: 1,
  },
  dayCell: {
    width: 10,
    height: 10,
    borderRadius: 2,
    margin: 1,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 4,
  },
  legendCell: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 10,
    marginHorizontal: 4,
  },
  summary: {
    alignItems: 'center',
    marginTop: 8,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
