import React from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useUserStore } from '../store/userStore';
import { ProgressCard } from '../components/ProgressCard';
import { StreakCard } from '../components/StreakCard';
import { WeeklyProgress } from '../components/WeeklyProgress';

export const DashboardScreen: React.FC = () => {
  const { progress } = useUserStore();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>السلام عليكم</Text>
          <Text style={styles.subtitle}>Bienvenue dans Al-Muallim</Text>
        </View>

        <StreakCard
          currentStreak={progress.currentStreak}
          longestStreak={progress.longestStreak}
        />

        <ProgressCard
          title="Sourates mémorisées"
          value={progress.surahsMemorized}
          total={114}
          color="#2196F3"
        />

        <ProgressCard
          title="Versets mémorisés"
          value={progress.ayahsMemorized}
          total={progress.totalAyahs}
          unit=""
          color="#4CAF50"
        />

        <ProgressCard
          title="Objectif journalier"
          value={progress.ayahsMemorized % progress.dailyGoal}
          total={progress.dailyGoal}
          unit=" versets"
          color="#FF9800"
        />

        <WeeklyProgress
          data={progress.weeklyProgress}
          dailyGoal={progress.dailyGoal}
        />

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.actionGrid}>
            <View style={styles.actionButton}>
              <Text style={styles.actionIcon}>📖</Text>
              <Text style={styles.actionLabel}>Continuer</Text>
            </View>
            <View style={styles.actionButton}>
              <Text style={styles.actionIcon}>🎯</Text>
              <Text style={styles.actionLabel}>Réviser</Text>
            </View>
            <View style={styles.actionButton}>
              <Text style={styles.actionIcon}>🎧</Text>
              <Text style={styles.actionLabel}>Écouter</Text>
            </View>
            <View style={styles.actionButton}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionLabel}>Stats</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginHorizontal: 16,
  },
  quickActions: {
    marginTop: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    height: 20,
  },
});
