import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAppStore } from '@/stores/appStore';

export const DashboardScreen: React.FC = () => {
  const { stats, loading, loadStats } = useAppStore();

  useEffect(() => {
    loadStats();
  }, []);

  if (loading || !stats) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const progressPercentage = stats.total_verses > 0
    ? Math.round((stats.mastered / stats.total_verses) * 100)
    : 0;

  return (
    <ScrollView style={styles.container}>
      {/* Streak */}
      <View style={styles.streakCard}>
        <Text style={styles.streakEmoji}>🔥</Text>
        <Text style={styles.streakNumber}>{stats.streak_days}</Text>
        <Text style={styles.streakLabel}>jours consécutifs</Text>
      </View>

      {/* Progress Overview */}
      <View style={styles.progressCard}>
        <Text style={styles.cardTitle}>Progression globale</Text>
        <Text style={styles.progressNumber}>{progressPercentage}%</Text>
        <Text style={styles.progressText}>
          {stats.mastered} / {stats.total_verses} verses maîtrisés
        </Text>
      </View>

      {/* Status Distribution */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Répartition</Text>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>✅ Maîtrisés</Text>
          <Text style={styles.statValue}>{stats.mastered}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>🔄 En consolidation</Text>
          <Text style={styles.statValue}>{stats.consolidating}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>📖 En apprentissage</Text>
          <Text style={styles.statValue}>{stats.learning}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>📊 Taux de rétention</Text>
          <Text style={styles.statValue}>{Math.round(stats.retention_rate * 100)}%</Text>
        </View>
      </View>

      {/* Juz Progress */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Progression par Juz</Text>
        {stats.verses_by_juz.slice(0, 5).map((juz) => (
          <View key={juz.juz_number} style={styles.juzRow}>
            <Text style={styles.juzLabel}>Juz {juz.juz_number}</Text>
            <View style={styles.juzBar}>
              <View
                style={[
                  styles.juzProgress,
                  { width: `${(juz.mastered / juz.total) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.juzCount}>
              {juz.mastered}/{juz.total}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 20,
  },
  streakCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  streakEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  streakNumber: {
    color: '#F59E0B',
    fontSize: 56,
    fontWeight: 'bold',
  },
  streakLabel: {
    color: '#94A3B8',
    fontSize: 16,
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  progressNumber: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  statLabel: {
    color: '#CBD5E1',
    fontSize: 16,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  juzRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  juzLabel: {
    color: '#CBD5E1',
    fontSize: 14,
    width: 60,
  },
  juzBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  juzProgress: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  juzCount: {
    color: '#94A3B8',
    fontSize: 12,
    width: 40,
    textAlign: 'right',
  },
});
