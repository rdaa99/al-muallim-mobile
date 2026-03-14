import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useFonts } from '../context/FontSizeContext';
import { usePlanningStore } from '../stores/planningStore';

const { width } = Dimensions.get('window');

export const PlanningScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { fonts } = useFonts();

  const {
    todayPlan,
    streak,
    dailyNewVersesGoal,
    dailyReviewVersesGoal,
    dailyMinutesGoal,
    reminderTime,
    remindersEnabled,
    setDailyGoals,
    toggleReminders,
    updateTodayProgress,
    completeTodaySession,
    loadTodayPlan,
  } = usePlanningStore();

  useEffect(() => {
    loadTodayPlan();
  }, []);

  const totalGoal = dailyNewVersesGoal + dailyReviewVersesGoal;
  const totalDone = (todayPlan?.newVersesDone || 0) + (todayPlan?.reviewVersesDone || 0);
  const progressPercent = totalGoal > 0 ? (totalDone / totalGoal) * 100 : 0;

  const handleStartSession = () => {
    // Navigate to review/new verses session
    navigation.navigate('Review' as never);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, fontSize: fonts.hero }]}>
            {t('planning.title', 'Daily Planning')}
          </Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Streak Card */}
        <View style={[styles.streakCard, { backgroundColor: colors.surface }]}>
          <View style={styles.streakHeader}>
            <Text style={styles.streakIcon}>🔥</Text>
            <View style={styles.streakInfo}>
              <Text style={[styles.streakNumber, { color: colors.text }]}>
                {streak.currentStreak} {t('planning.days', 'days')}
              </Text>
              <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>
                {t('planning.currentStreak', 'Current Streak')}
              </Text>
            </View>
          </View>
          <View style={styles.streakRecord}>
            <Text style={[styles.streakRecordText, { color: colors.textSecondary }]}>
              🏆 Record: {streak.longestStreak} days
            </Text>
          </View>
        </View>

        {/* Today's Progress */}
        <View style={[styles.progressCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.progressTitle, { color: colors.text }]}>
            {t('planning.todaysProgress', "Today's Progress")}
          </Text>

          {/* Progress bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercent}%`, backgroundColor: colors.primary },
                ]}
              />
            </View>
            <Text style={[styles.progressPercent, { color: colors.text }]}>
              {progressPercent.toFixed(0)}%
            </Text>
          </View>

          {/* Goals */}
          <View style={styles.goalsContainer}>
            <View style={styles.goalItem}>
              <Text style={[styles.goalLabel, { color: colors.textSecondary }]}>
                📖 New verses
              </Text>
              <Text style={[styles.goalValue, { color: colors.text }]}>
                {todayPlan?.newVersesDone || 0} / {dailyNewVersesGoal}
              </Text>
            </View>

            <View style={styles.goalItem}>
              <Text style={[styles.goalLabel, { color: colors.textSecondary }]}>
                🔄 Review verses
              </Text>
              <Text style={[styles.goalValue, { color: colors.text }]}>
                {todayPlan?.reviewVersesDone || 0} / {dailyReviewVersesGoal}
              </Text>
            </View>
          </View>

          {/* Start Session Button */}
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: colors.primary }]}
            onPress={handleStartSession}
          >
            <Text style={styles.startButtonText}>
              {t('planning.startSession', '🚀 Start Session')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Daily Goals Settings */}
        <View style={[styles.settingsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.settingsTitle, { color: colors.text }]}>
            {t('planning.dailyGoals', 'Daily Goals')}
          </Text>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              📖 New verses per day
            </Text>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
              {dailyNewVersesGoal}
            </Text>
          </View>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              🔄 Review verses per day
            </Text>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
              {dailyReviewVersesGoal}
            </Text>
          </View>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              ⏱️ Daily minutes
            </Text>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
              {dailyMinutesGoal} min
            </Text>
          </View>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              🔔 Reminders
            </Text>
            <TouchableOpacity onPress={toggleReminders}>
              <Text style={[styles.settingValue, { color: colors.primary }]}>
                {remindersEnabled ? `✓ ${reminderTime}` : '✗ Off'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar Preview */}
        <View style={[styles.calendarCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.calendarTitle, { color: colors.text }]}>
            {t('planning.calendar', 'Monthly Calendar')}
          </Text>
          <Text style={[styles.calendarHint, { color: colors.textSecondary }]}>
            📅 Calendar view coming soon...
          </Text>
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  date: {
    marginTop: 4,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  streakCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  streakLabel: {
    fontSize: 14,
    marginTop: 2,
  },
  streakRecord: {
    marginTop: 12,
    alignItems: 'center',
  },
  streakRecordText: {
    fontSize: 14,
  },
  progressCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBarBg: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressPercent: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: 'bold',
  },
  goalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  goalItem: {
    alignItems: 'center',
  },
  goalLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  goalValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  startButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  settingsCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  calendarCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  calendarHint: {
    fontSize: 14,
  },
  footer: {
    height: 20,
  },
});
