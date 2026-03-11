import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface WeeklyProgressProps {
  data: number[];
  dailyGoal: number;
  language?: string;
}

const DAYS_LTR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const DAYS_RTL = ['Sam', 'Ven', 'Jeu', 'Mer', 'Mar', 'Lun', 'Dim'];

export const WeeklyProgress: React.FC<WeeklyProgressProps> = ({ data, dailyGoal, language }) => {
  const maxValue = Math.max(...data, dailyGoal);
  const isRTL = language === 'ar';
  const displayData = isRTL ? data.slice().reverse() : data;
  const DAYS = isRTL ? DAYS_RTL : DAYS_LTR;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progression cette semaine</Text>
      <View style={[styles.chart, isRTL && { direction: 'rtl' }]}>
        {displayData.map((value, index) => {
          const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const isGoalMet = value >= dailyGoal;
          const todayIndex = new Date().getDay();
          const isToday = isRTL ? index === (data.length - 1 - todayIndex) : index === todayIndex;

          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
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
              <Text style={[styles.dayLabel, isToday && styles.todayLabel]}>
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
    backgroundColor: '#fff',
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
    color: '#333',
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
    backgroundColor: '#f5f5f5',
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
    color: '#666',
    marginTop: 8,
  },
  todayLabel: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
});
