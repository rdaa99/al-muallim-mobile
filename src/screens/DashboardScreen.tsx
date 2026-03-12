import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/appStore';
import { useTheme } from '../context/ThemeContext';
import { useFonts } from '../context/FontSizeContext';
import { ProgressCard } from '../components/ProgressCard';
import { StreakCard } from '../components/StreakCard';
import { WeeklyProgress } from '../components/WeeklyProgress';
import { useUserStore } from '../stores/userStore';
import { getWeeklyReviewCounts } from '../services/database';
import type { RootTabParamList } from '../types';

type DashboardNavProp = BottomTabNavigationProp<RootTabParamList, 'Dashboard'>;

export const DashboardScreen: React.FC = () => {
  const { stats, dailyReview, loadStats, loadTodayReview } = useAppStore();
  const { settings } = useUserStore();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { fonts } = useFonts();
  const navigation = useNavigation<DashboardNavProp>();
  const isRTL = settings?.language === 'ar';
  const [weeklyData, setWeeklyData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    loadStats();
    loadTodayReview();
    getWeeklyReviewCounts().then(setWeeklyData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'continue':
      case 'review':
        navigation.navigate('Review');
        break;
      case 'listen':
        navigation.navigate('AudioPlayer');
        break;
      case 'stats':
        loadStats();
        break;
    }
  };

  const todayCompleted = dailyReview?.completed_count || 0;
  const todayDue = dailyReview?.due_count || 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }, isRTL && { direction: 'rtl' }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.text, fontSize: fonts.hero, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('common.welcome')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: fonts.body }]}>
            {t('dashboard.title')}
          </Text>
        </View>

        <StreakCard
          currentStreak={stats?.streak_days || 0}
          longestStreak={stats?.longest_streak || 0}
          colors={colors}
        />

        <ProgressCard
          title={t('dashboard.ayahsMemorized')}
          value={stats?.total_learned || 0}
          total={stats?.total_verses || 995}
          color={colors.primary}
          colors={colors}
        />

        <ProgressCard
          title={t('dashboard.dailyGoal')}
          value={todayCompleted}
          total={Math.max(todayDue, 1)}
          unit={` ${t('dashboard.verses')}`}
          color="#FF9800"
          colors={colors}
        />

        <WeeklyProgress
          data={weeklyData}
          dailyGoal={10}
          language={settings?.language || 'fr'}
          colors={colors}
        />

        <View style={[styles.quickActions, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.heading }]}>
            {t('dashboard.quickActions')}
          </Text>
          <View style={styles.actionGrid}>
            {[
              { icon: '\uD83D\uDCD6', label: t('dashboard.continue'), action: 'continue' },
              { icon: '\uD83C\uDFAF', label: t('dashboard.reviewBtn'), action: 'review' },
              { icon: '\uD83C\uDFA7', label: t('dashboard.listen'), action: 'listen' },
              { icon: '\uD83D\uDCCA', label: t('dashboard.stats'), action: 'stats' },
            ].map(({ icon, label, action }) => (
              <TouchableOpacity
                key={action}
                style={[styles.actionButton, { backgroundColor: colors.card }]}
                onPress={() => handleQuickAction(action)}
              >
                <Text style={styles.actionIcon}>{icon}</Text>
                <Text style={[styles.actionLabel, { color: colors.text }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 10 },
  greeting: { fontWeight: 'bold' },
  subtitle: { marginTop: 4 },
  sectionTitle: { fontWeight: '600', marginBottom: 12, marginHorizontal: 16 },
  quickActions: { marginTop: 16, padding: 16, marginHorizontal: 16, borderRadius: 12 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionButton: { flex: 1, minWidth: '45%', borderRadius: 12, padding: 16, alignItems: 'center', elevation: 3 },
  actionIcon: { fontSize: 32, marginBottom: 8 },
  actionLabel: { fontSize: 14, fontWeight: '500' },
  footer: { height: 20 },
});
