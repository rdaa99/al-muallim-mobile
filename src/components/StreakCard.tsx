import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
}

export const StreakCard: React.FC<StreakCardProps> = ({
  currentStreak,
  longestStreak,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.streakBox}>
        <Text style={styles.emoji}>🔥</Text>
        <Text style={styles.streakNumber}>{currentStreak}</Text>
        <Text style={styles.streakLabel}>Jours consécutifs</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.streakBox}>
        <Text style={styles.emoji}>🏆</Text>
        <Text style={styles.streakNumber}>{longestStreak}</Text>
        <Text style={styles.streakLabel}>Record</Text>
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
    color: '#333',
  },
  streakLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
});
