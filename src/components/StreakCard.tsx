import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ThemeColors } from '../context/ThemeContext';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  colors?: ThemeColors;
}

export const StreakCard: React.FC<StreakCardProps> = ({
  currentStreak,
  longestStreak,
  colors,
}) => {
  const { t } = useTranslation();

  const cardBg = colors?.card || '#fff';
  const numberColor = colors?.text || '#333';
  const labelColor = colors?.textSecondary || '#666';
  const dividerColor = colors?.border || '#e0e0e0';

  return (
    <View style={[styles.container, { backgroundColor: cardBg }]}>
      <View style={styles.streakBox}>
        <Text style={styles.emoji}>🔥</Text>
        <Text style={[styles.streakNumber, { color: numberColor }]}>{currentStreak}</Text>
        <Text style={[styles.streakLabel, { color: labelColor }]}>
          {t('dashboard.consecutiveDays')}
        </Text>
      </View>
      <View style={[styles.divider, { backgroundColor: dividerColor }]} />
      <View style={styles.streakBox}>
        <Text style={styles.emoji}>🏆</Text>
        <Text style={[styles.streakNumber, { color: numberColor }]}>{longestStreak}</Text>
        <Text style={[styles.streakLabel, { color: labelColor }]}>
          {t('dashboard.record')}
        </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakBox: {
    flex: 1,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  streakLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 60,
    marginHorizontal: 16,
  },
});
