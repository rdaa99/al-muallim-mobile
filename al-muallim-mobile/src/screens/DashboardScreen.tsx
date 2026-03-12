import React from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../store/userStore';
import { useTheme } from '../context/ThemeContext';
import { useFonts } from '../context/FontSizeContext';
import { ProgressCard } from '../components/ProgressCard';
import { StreakCard } from '../components/StreakCard';
import { WeeklyProgress } from '../components/WeeklyProgress';
import { Surah } from '../types';

export const DashboardScreen: React.FC = () => {
  const { progress } = useUserStore();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { fonts } = useFonts();
  const navigation = useNavigation();

  const defaultSurah: Surah = {
    number: 1,
    name: 'الفاتحة',
    englishName: 'Al-Fatiha',
    ayahsCount: 7,
    revelationType: 'Meccan',
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'recitation':
        (navigation as any).navigate('Recitation', { surah: defaultSurah, mode: 'learning' });
        break;
      case 'wordBreakdown':
        (navigation as any).navigate('WordBreakdown', { surahNumber: 1, verseNumber: 1 });
        break;
      case 'focusMode':
        (navigation as any).navigate('FocusMode');
        break;
      case 'audio':
        (navigation as any).navigate('Tabs', { screen: 'AudioPlayer' });
        break;
      case 'stats':
        // Future stats screen
        break;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.text, fontSize: fonts.hero }]}>
            {t('common.welcome')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: fonts.body }]}>
            {t('dashboard.title')}
          </Text>
        </View>

        <StreakCard
          currentStreak={progress.currentStreak}
          longestStreak={progress.longestStreak}
        />

        <ProgressCard
          title={t('dashboard.surahsMemorized')}
          value={progress.surahsMemorized}
          total={114}
          color="#2196F3"
        />

        <ProgressCard
          title={t('dashboard.ayahsMemorized')}
          value={progress.ayahsMemorized}
          total={progress.totalAyahs}
          unit=""
          color="#4CAF50"
        />

        <ProgressCard
          title={t('dashboard.dailyGoal')}
          value={progress.ayahsMemorized % progress.dailyGoal}
          total={progress.dailyGoal}
          unit={` ${t('dashboard.verses')}`}
          color="#FF9800"
        />

        <WeeklyProgress
          data={progress.weeklyProgress}
          dailyGoal={progress.dailyGoal}
        />

        {/* New Features Section */}
        <View style={[styles.quickActions, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.heading }]}>
            {t('dashboard.quickActions')}
          </Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card }]}
              onPress={() => handleQuickAction('recitation')}
            >
              <Text style={styles.actionIcon}>🎯</Text>
              <Text style={[styles.actionLabel, { color: colors.text, fontSize: fonts.body }]}>
                Récitation
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card }]}
              onPress={() => handleQuickAction('wordBreakdown')}
            >
              <Text style={styles.actionIcon}>📚</Text>
              <Text style={[styles.actionLabel, { color: colors.text, fontSize: fonts.body }]}>
                Analyse Mots
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card }]}
              onPress={() => handleQuickAction('focusMode')}
            >
              <Text style={styles.actionIcon}>🧘</Text>
              <Text style={[styles.actionLabel, { color: colors.text, fontSize: fonts.body }]}>
                Mode Focus
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card }]}
              onPress={() => handleQuickAction('audio')}
            >
              <Text style={styles.actionIcon}>🎧</Text>
              <Text style={[styles.actionLabel, { color: colors.text, fontSize: fonts.body }]}>
                {t('dashboard.listen')}
              </Text>
            </TouchableOpacity>
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
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontWeight: 'bold',
    textAlign: 'right',
  },
  subtitle: {
    marginTop: 4,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
    marginHorizontal: 16,
  },
  quickActions: {
    marginTop: 16,
    padding: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionLabel: {
    fontWeight: '500',
  },
  footer: {
    height: 20,
  },
});
