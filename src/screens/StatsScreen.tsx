import React, { useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useStatsStore } from '@/stores/statsStore';
import { useTheme } from '../context/ThemeContext';
import { useFonts } from '../context/FontSizeContext';
import { useUserStore } from '../stores/userStore';
import { CircularProgressBar } from '../components/CircularProgressBar';
import { StatsCard } from '../components/StatsCard';
import { WeeklyBarChart } from '../components/WeeklyBarChart';
import { CalendarHeatmap } from '../components/CalendarHeatmap';
import { JuzProgressList } from '../components/JuzProgressList';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const StatsScreen: React.FC = () => {
  const { stats, loading, refreshAll } = useStatsStore();
  const { settings } = useUserStore();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { fonts } = useFonts();
  const isRTL = settings?.language === 'ar';

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = () => {
    refreshAll();
  };

  // Calculate overall progress percentage
  const overallProgress = stats
    ? Math.round((stats.total_learned / stats.total_verses) * 100)
    : 0;

  // Calculate retention rate percentage
  const retentionRate = stats
    ? Math.round(stats.retention_rate * 100)
    : 0;

  // Prepare calendar data from stats
  const calendarData = stats?.calendar || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }, isRTL && { direction: 'rtl' }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, fontSize: fonts.hero }]}>
            {t('stats.title')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: fonts.body }]}>
            {t('stats.subtitle')}
          </Text>
        </View>

        {/* Main Progress Circle */}
        <View style={[styles.progressSection, { backgroundColor: colors.surface }]}>
          <CircularProgressBar
            percentage={overallProgress}
            size={SCREEN_WIDTH * 0.4}
            strokeWidth={12}
            color={colors.primary}
            backgroundColor={colors.border}
          />
          <View style={styles.progressInfo}>
            <Text style={[styles.progressNumber, { color: colors.text }]}>
              {stats?.total_learned || 0}
            </Text>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
              {t('stats.versesMemorized')}
            </Text>
            <Text style={[styles.progressTotal, { color: colors.textSecondary }]}>
              {t('stats.outOf', { total: stats?.total_verses || 995 })}
            </Text>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <StatsCard
            icon="🔥"
            value={stats?.streak_days || 0}
            label={t('stats.currentStreak')}
            subLabel={t('stats.days')}
            color="#FF6B6B"
            colors={colors}
          />
          <StatsCard
            icon="🏆"
            value={stats?.longest_streak || 0}
            label={t('stats.longestStreak')}
            subLabel={t('stats.days')}
            color="#FFD93D"
            colors={colors}
          />
          <StatsCard
            icon="📚"
            value={stats?.total_mastered || 0}
            label={t('stats.mastered')}
            subLabel={t('stats.verses')}
            color="#6BCB77"
            colors={colors}
          />
          <StatsCard
            icon="✅"
            value={retentionRate}
            label={t('stats.retention')}
            subLabel="%"
            color="#4D96FF"
            colors={colors}
            isPercentage
          />
        </View>

        {/* Learning Progress */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.heading }]}>
            {t('stats.learningProgress')}
          </Text>
          <View style={styles.progressBars}>
            <ProgressBarRow
              label={t('stats.mastered')}
              value={stats?.total_mastered || 0}
              total={stats?.total_verses || 995}
              color="#6BCB77"
              colors={colors}
            />
            <ProgressBarRow
              label={t('stats.consolidating')}
              value={stats?.total_consolidating || 0}
              total={stats?.total_verses || 995}
              color="#FFD93D"
              colors={colors}
            />
            <ProgressBarRow
              label={t('stats.learning')}
              value={stats?.total_learning || 0}
              total={stats?.total_verses || 995}
              color="#4D96FF"
              colors={colors}
            />
          </View>
        </View>

        {/* Weekly Progress Chart */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.heading }]}>
            {t('stats.weeklyProgress')}
          </Text>
          <WeeklyBarChart
            data={stats?.daily_stats?.slice(0, 7).map(d => d.versesReviewed) || [0, 0, 0, 0, 0, 0, 0]}
            dailyGoal={settings?.dailyNewLines || 10}
            language={settings?.language || 'fr'}
            colors={colors}
          />
        </View>

        {/* Calendar Heatmap */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.heading }]}>
            {t('stats.monthlyActivity')}
          </Text>
          <CalendarHeatmap
            data={calendarData}
            colors={colors}
          />
        </View>

        {/* Juz Progress */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.heading }]}>
            {t('stats.juzProgress')}
          </Text>
          <JuzProgressList
            data={stats?.verses_by_juz || []}
            colors={colors}
          />
        </View>

        {/* Session Stats */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.heading }]}>
            {t('stats.sessionStats')}
          </Text>
          <View style={styles.sessionStatsGrid}>
            <View style={styles.sessionStat}>
              <Text style={[styles.sessionValue, { color: colors.text }]}>
                {stats?.total_review_sessions || 0}
              </Text>
              <Text style={[styles.sessionLabel, { color: colors.textSecondary }]}>
                {t('stats.totalSessions')}
              </Text>
            </View>
            <View style={styles.sessionStat}>
              <Text style={[styles.sessionValue, { color: colors.text }]}>
                {stats?.average_session_duration || 0}
              </Text>
              <Text style={[styles.sessionLabel, { color: colors.textSecondary }]}>
                {t('stats.avgSessionDuration')}
              </Text>
            </View>
            <View style={styles.sessionStat}>
              <Text style={[styles.sessionValue, { color: colors.text }]}>
                {stats?.verses_per_session || 0}
              </Text>
              <Text style={[styles.sessionLabel, { color: colors.textSecondary }]}>
                {t('stats.versesPerSession')}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            {t('stats.lastUpdated')}: {stats?.this_month || 0} {t('stats.versesThisMonth')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Progress Bar Row Component
interface ProgressBarRowProps {
  label: string;
  value: number;
  total: number;
  color: string;
  colors: any;
}

const ProgressBarRow: React.FC<ProgressBarRowProps> = ({ label, value, total, color, colors }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <View style={styles.progressBarRow}>
      <View style={styles.progressBarHeader}>
        <Text style={[styles.progressBarLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.progressBarValue, { color: colors.textSecondary }]}>
          {value} ({percentage}%)
        </Text>
      </View>
      <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
        <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 4,
  },
  progressSection: {
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  progressInfo: {
    alignItems: 'center',
    marginTop: 16,
  },
  progressNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  progressLabel: {
    fontSize: 16,
    marginTop: 4,
  },
  progressTotal: {
    fontSize: 14,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  progressBars: {
    gap: 12,
  },
  progressBarRow: {
    marginBottom: 8,
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressBarLabel: {
    fontSize: 14,
  },
  progressBarValue: {
    fontSize: 12,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  sessionStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sessionStat: {
    alignItems: 'center',
  },
  sessionValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sessionLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});
