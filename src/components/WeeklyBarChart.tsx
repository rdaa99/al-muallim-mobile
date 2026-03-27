import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ThemeColors } from '../context/ThemeContext';

interface WeeklyBarChartProps {
  data: number[];
  dailyGoal: number;
  language?: string;
  colors?: ThemeColors;
}

export const WeeklyBarChart: React.FC<WeeklyBarChartProps> = ({
  data,
  dailyGoal,
  language,
  colors,
}) => {
  const { t } = useTranslation();
  const maxValue = Math.max(...data, dailyGoal, 1);
  const isRTL = language === 'ar';

  const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
  const displayData = isRTL ? data.slice().reverse() : data;
  const displayKeys = isRTL ? [...DAY_KEYS].reverse() : DAY_KEYS;

  const cardBg = colors?.card || colors?.surface || '#fff';
  const barBgColor = colors?.border || '#f0f0f0';
  const labelColor = colors?.textSecondary || '#666';

  const todayIndex = new Date().getDay();

  return (
    <View style={[styles.container, { backgroundColor: cardBg }]}>
      <View style={[styles.chart, isRTL && { direction: 'rtl' }]}>
        {displayData.map((value, index) => {
          const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const isGoalMet = value >= dailyGoal;
          const isToday = isRTL
            ? index === data.length - 1 - todayIndex
            : index === todayIndex;

          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barValueContainer}>
                {value > 0 && (
                  <Text style={[styles.barValue, { color: labelColor }]}>
                    {value}
                  </Text>
                )}
              </View>
              <View style={[styles.barWrapper, { backgroundColor: barBgColor }]}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${heightPercent}%`,
                      backgroundColor: isGoalMet ? '#4CAF50' : '#FFC107',
                    },
                    isToday && styles.todayBar,
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.dayLabel,
                  { color: labelColor },
                  isToday && { color: '#2196F3', fontWeight: 'bold' },
                ]}
              >
                {t(`days.${displayKeys[index]}`)}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Goal indicator */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={[styles.legendText, { color: labelColor }]}>
            {t('stats.goalMet')}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FFC107' }]} />
          <Text style={[styles.legendText, { color: labelColor }]}>
            {t('stats.goalPending')}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barValueContainer: {
    height: 20,
    justifyContent: 'center',
  },
  barValue: {
    fontSize: 10,
    fontWeight: '600',
  },
  barWrapper: {
    width: 20,
    height: 100,
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 10,
    minHeight: 4,
  },
  todayBar: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  dayLabel: {
    fontSize: 11,
    marginTop: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },
});
