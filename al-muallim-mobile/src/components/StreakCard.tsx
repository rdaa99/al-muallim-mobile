import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useFonts } from '../context/FontSizeContext';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
}

export const StreakCard: React.FC<StreakCardProps> = ({
  currentStreak,
  longestStreak,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { fonts } = useFonts();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.streakBox}>
        <Text style={styles.emoji}>🔥</Text>
        <Text style={[styles.streakNumber, { color: colors.text, fontSize: fonts.title }]}>
          {currentStreak}
        </Text>
        <Text style={[styles.streakLabel, { color: colors.textSecondary, fontSize: fonts.caption }]}>
          {t('dashboard.consecutiveDays')}
        </Text>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <View style={styles.streakBox}>
        <Text style={styles.emoji}>🏆</Text>
        <Text style={[styles.streakNumber, { color: colors.text, fontSize: fonts.title }]}>
          {longestStreak}
        </Text>
        <Text style={[styles.streakLabel, { color: colors.textSecondary, fontSize: fonts.caption }]}>
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
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
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
    fontWeight: 'bold',
  },
  streakLabel: {
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 60,
    marginHorizontal: 16,
  },
});
