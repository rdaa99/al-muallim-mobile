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

export const DashboardScreen: React.FC = () => {
  const { progress } = useUserStore();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { fonts } = useFonts();
  const navigation = useNavigation();

  const handleQuickAction = (action: string) => {
    if (action !== 'stats') {
      navigation.navigate('AudioPlayer' as never);
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
          unit=" versets"
          color="#FF9800"
        />

        <WeeklyProgress
          data={progress.weeklyProgress}
          dailyGoal={progress.dailyGoal}
        />

        <View style={[styles.quickActions, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.heading }]}>
            Actions rapides
          </Text>
          <View style={styles.actionGrid}>
            {[ 
              { icon: '📖', label: 'Continuer', action: 'continue' },
              { icon: '🎯', label: 'Réviser', action: 'review' },
              { icon: '🎧', label: 'Écouter', action: 'listen' },
              { icon: '📊', label: 'Stats', action: 'stats' },
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
  greeting: { fontWeight: 'bold', textAlign: 'right' },
  subtitle: { marginTop: 4 },
  sectionTitle: { fontWeight: '600', marginBottom: 12, marginHorizontal: 16 },
  quickActions: { marginTop: 16, padding: 16 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionButton: { flex: 1, minWidth: '45%', borderRadius: 12, padding: 16, alignItems: 'center', elevation: 3 },
  actionIcon: { fontSize: 32, marginBottom: 8 },
  actionLabel: { fontSize: 14, fontWeight: '500' },
  footer: { height: 20 },
});
