import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ThemeColors } from '../context/ThemeContext';

interface WeeklyProgressProps {
  data: number[];
  dailyGoal: number;
  language?: string;
  colors?: ThemeColors;
}

export const WeeklyProgress: React.FC<WeeklyProgressProps> = ({ data, dailyGoal, language, colors }) => {
  const { t } = useTranslation();
  const maxValue = Math.max(...data, dailyGoal);
  const isRTL = language === 'ar';

  const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
  const displayData = isRTL ? data.slice().reverse() : data;
  const displayKeys = isRTL ? [...DAY_KEYS].reverse() : DAY_KEYS;

  const cardBg = colors?.card || '#fff';
  const titleColor = colors?.text || '#333';
  const barBgColor = colors?.border || '#f5f5f5';
  const labelColor = colors?.textSecondary || '#666';

  return (
    <View style={[styles.container, { backgroundColor: cardBg }]}>
      <Text style={[styles.title, { color: titleColor }]}>
        {t('dashboard.weeklyProgress')}
      </Text>
      <View style={[styles.chart, isRTL && { direction: 'rtl' }]}>
        {displayData.map((value, index) => {
          const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const isGoalMet = value >= dailyGoal;
          const todayIndex = new Date().getDay();
          const isToday = isRTL ? index === (data.length - 1 - todayIndex) : index === todayIndex;

          return (
            <View key={index} style={styles.barContainer}>
              <View style={[styles.barWrapper, { backgroundColor: barBgColor }]}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${height}%`,
                      backgroundColor: isGoalMet ? '#4CAF50' : '#FFC107',
                    },
                    isToday && styles.todayBar,
                  ]}
                />
              </View>
              <Text style={[styles.dayLabel, { color: labelColor }, isToday && styles.todayLabel]}>
                {t(`days.${displayKeys[index]}`)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
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
  },
  todayBar: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  dayLabel: {
    fontSize: 11,
    marginTop: 8,
  },
  todayLabel: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
});
