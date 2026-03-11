import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useAppStore } from '@/stores/appStore';

const { width } = Dimensions.get('window');

export const DashboardScreen: React.FC = () => {
  const { stats, loading, loadStats } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, [loadStats]);

  if (loading && !stats) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Chargement des statistiques...</Text>
      </View>
    );
  }

  // Empty state for new users
  if (!stats || (stats.total_learned === 0 && stats.total_mastered === 0)) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10B981']} />
        }
      >
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📖</Text>
          <Text style={styles.emptyTitle}>Bienvenue !</Text>
          <Text style={styles.emptyText}>
            Commencez votre voyage de mémorisation du Coran. Vos statistiques apparaîtront ici.
          </Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>
              Commencez par les petites sourates à la fin du Coran pour progresser rapidement.
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  const progressPercentage = stats.total_verses > 0
    ? Math.round((stats.mastered / stats.total_verses) * 100)
    : 0;

  const learnedPercentage = stats.total_verses > 0
    ? Math.round((stats.total_learned / stats.total_verses) * 100)
    : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10B981']} />
      }
    >
      {/* Streak */}
      <View style={styles.streakCard}>
        <Text style={styles.streakEmoji}>🔥</Text>
        <Text style={styles.streakNumber}>{stats.streak_days}</Text>
        <Text style={styles.streakLabel}>jours consécutifs</Text>
      </View>

      {/* Progress Overview */}
      <View style={styles.progressCard}>
        <Text style={styles.cardTitle}>Progression globale</Text>
        <View style={styles.progressCircle}>
          <Text style={styles.progressNumber}>{progressPercentage}%</Text>
        </View>
        <Text style={styles.progressText}>
          {stats.mastered} / {stats.total_verses} versets maîtrisés
        </Text>

        {/* Simple bar chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chartRow}>
            <Text style={styles.chartLabel}>Maîtrisés</Text>
            <View style={styles.chartBar}>
              <View
                style={[
                  styles.chartFill,
                  styles.masteredFill,
                  { width: `${progressPercentage}%` },
                ]}
              />
            </View>
            <Text style={styles.chartValue}>{stats.mastered}</Text>
          </View>

          <View style={styles.chartRow}>
            <Text style={styles.chartLabel}>En cours</Text>
            <View style={styles.chartBar}>
              <View
                style={[
                  styles.chartFill,
                  styles.learningFill,
                  { width: `${Math.min(learnedPercentage - progressPercentage, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.chartValue}>{stats.consolidating + stats.learning}</Text>
          </View>

          <View style={styles.chartRow}>
            <Text style={styles.chartLabel}>Restants</Text>
            <View style={styles.chartBar}>
              <View
                style={[
                  styles.chartFill,
                  styles.remainingFill,
                  { width: `${100 - learnedPercentage}%` },
                ]}
              />
            </View>
            <Text style={styles.chartValue}>{stats.total_verses - stats.total_learned}</Text>
          </View>
        </View>
      </View>

      {/* Status Distribution */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Répartition</Text>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>✅ Maîtrisés</Text>
          <Text style={[styles.statValue, styles.masteredValue]}>{stats.mastered}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>🔄 En consolidation</Text>
          <Text style={[styles.statValue, styles.consolidatingValue]}>{stats.consolidating}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>📖 En apprentissage</Text>
          <Text style={[styles.statValue, styles.learningValue]}>{stats.learning}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>📊 Taux de rétention</Text>
          <Text style={styles.statValue}>{Math.round(stats.retention_rate * 100)}%</Text>
        </View>
      </View>

      {/* Juz Progress */}
      {stats.verses_by_juz && stats.verses_by_juz.length > 0 && (
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
      )}

      {/* Quick Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statsGridItem}>
          <Text style={styles.statsGridNumber}>{stats.total_learned}</Text>
          <Text style={styles.statsGridLabel}>Appris</Text>
        </View>
        <View style={styles.statsGridItem}>
          <Text style={styles.statsGridNumber}>{stats.streak_days}</Text>
          <Text style={styles.statsGridLabel}>Jours</Text>
        </View>
        <View style={styles.statsGridItem}>
          <Text style={styles.statsGridNumber}>{stats.mastered}</Text>
          <Text style={styles.statsGridLabel}>Maîtrisés</Text>
        </View>
      </View>

      {/* Pull to refresh hint */}
      <Text style={styles.pullHint}>Tirez vers le bas pour actualiser ↻</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 20,
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  tipCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: width - 80,
  },
  tipIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  tipText: {
    color: '#CBD5E1',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
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
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
  chartContainer: {
    marginTop: 20,
    width: '100%',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  chartLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    width: 80,
    opacity: 0.9,
  },
  chartBar: {
    flex: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  chartFill: {
    height: '100%',
    borderRadius: 6,
  },
  masteredFill: {
    backgroundColor: '#FFFFFF',
  },
  learningFill: {
    backgroundColor: '#FCD34D',
  },
  remainingFill: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  chartValue: {
    color: '#FFFFFF',
    fontSize: 12,
    width: 40,
    textAlign: 'right',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
  masteredValue: {
    color: '#10B981',
  },
  consolidatingValue: {
    color: '#F59E0B',
  },
  learningValue: {
    color: '#3B82F6',
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statsGridItem: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statsGridNumber: {
    color: '#10B981',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsGridLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  pullHint: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
});
