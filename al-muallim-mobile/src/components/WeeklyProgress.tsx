import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useFonts } from '../context/FontSizeContext';

interface WeeklyProgressProps {
  data: number[];
  dailyGoal: number;
}

export const WeeklyProgress: React.FC<WeeklyProgressProps> = ({ data, dailyGoal }) => {
  const maxValue = Math.max(...data, dailyGoal);
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { fonts } = useFonts();

  const DAYS = [
    t('days.sun'), t('days.mon'), t('days.tue'), t('days.wed'),
    t('days.thu'), t('days.fri'), t('days.sat'),
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text, fontSize: fonts.subheading }]}>
        {t('dashboard.weeklyProgress')}
      </Text>
      <View style={styles.chart}>
        {data.map((value, index) => {
          const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const isGoalMet = value >= dailyGoal;
          const isToday = index === new Date().getDay();

          return (
            <View key={index} style={styles.barContainer}>
              <View style={[styles.barWrapper, { backgroundColor: colors.border }]}>
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
              <Text style={[styles.dayLabel, { color: colors.textSecondary, fontSize: fonts.caption }, isToday && styles.todayLabel]}>
                {DAYS[index]}
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
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  title: {
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
    marginTop: 8,
  },
  todayLabel: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
});
