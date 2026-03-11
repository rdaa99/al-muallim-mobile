import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useFonts } from '../context/FontSizeContext';
import { useRecitationStore } from '../store/recitationStore';
import { Surah } from '../types';

const SAMPLE_SURAHS: Surah[] = [
  { number: 1, name: 'الفاتحة', englishName: 'Al-Fatiha', ayahsCount: 7, revelationType: 'Meccan' },
  { number: 112, name: 'الإخلاص', englishName: 'Al-Ikhlas', ayahsCount: 4, revelationType: 'Meccan' },
  { number: 113, name: 'الفلق', englishName: 'Al-Falaq', ayahsCount: 5, revelationType: 'Meccan' },
  { number: 114, name: 'الناس', englishName: 'An-Nas', ayahsCount: 6, revelationType: 'Meccan' },
];

export const FocusModeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { fonts } = useFonts();

  const [selectedSurahs, setSelectedSurahs] = useState<Set<number>>(new Set());
  const [sessionDuration, setSessionDuration] = useState(10); // minutes
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const progress = useRecitationStore();

  useEffect(() => {
    if (isSessionActive && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsSessionActive(false);
            Alert.alert(t('focus.sessionComplete'), t('focus.timeUp'));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isSessionActive, timeRemaining]);

  const toggleSurah = (surahNumber: number) => {
    setSelectedSurahs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(surahNumber)) {
        newSet.delete(surahNumber);
      } else {
        newSet.add(surahNumber);
      }
      return newSet;
    });
  };

  const startSession = () => {
    if (selectedSurahs.size === 0) {
      Alert.alert(t('focus.selectSurah'), t('focus.selectAtLeastOne'));
      return;
    }
    setTimeRemaining(sessionDuration * 60);
    setIsSessionActive(true);
  };

  const endSession = () => {
    setIsSessionActive(false);
    setTimeRemaining(0);
    Alert.alert(t('focus.sessionEnded'), t('focus.keepPracticing'));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={[styles.backIcon, { color: colors.primary }]}>←</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text, fontSize: fonts.heading }]}>
          {t('focus.title')}
        </Text>

        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {!isSessionActive ? (
          <>
            {/* Surah Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.subheading }]}>
                {t('focus.selectSurahs')}
              </Text>

              {SAMPLE_SURAHS.map((surah) => (
                <TouchableOpacity
                  key={surah.number}
                  style={[
                    styles.surahCard,
                    {
                      backgroundColor: selectedSurahs.has(surah.number)
                        ? colors.primary + '20'
                        : colors.card,
                      borderColor: selectedSurahs.has(surah.number)
                        ? colors.primary
                        : colors.border,
                    },
                  ]}
                  onPress={() => toggleSurah(surah.number)}
                >
                  <View style={styles.surahInfo}>
                    <Text style={[styles.surahName, { color: colors.text, fontSize: fonts.body }]}>
                      {surah.name}
                    </Text>
                    <Text style={[styles.surahEnglish, { color: colors.textSecondary }]}>
                      {surah.englishName}
                    </Text>
                  </View>

                  {selectedSurahs.has(surah.number) && (
                    <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Duration Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.subheading }]}>
                {t('focus.duration')}
              </Text>

              <View style={styles.durationOptions}>
                {[5, 10, 15, 20, 30].map((mins) => (
                  <TouchableOpacity
                    key={mins}
                    style={[
                      styles.durationButton,
                      {
                        backgroundColor:
                          sessionDuration === mins ? colors.primary : colors.surface,
                      },
                    ]}
                    onPress={() => setSessionDuration(mins)}
                  >
                    <Text
                      style={[
                        styles.durationText,
                        { color: sessionDuration === mins ? '#fff' : colors.text },
                      ]}
                    >
                      {mins} {t('focus.minutes')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Start Button */}
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: colors.primary }]}
              onPress={startSession}
            >
              <Text style={styles.startButtonText}>{t('focus.startSession')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Active Session */}
            <View style={styles.sessionContainer}>
              <Text style={[styles.timerLabel, { color: colors.textSecondary }]}>
                {t('focus.timeRemaining')}
              </Text>

              <Text style={[styles.timer, { color: colors.text, fontSize: 72 }]}>
                {formatTime(timeRemaining)}
              </Text>

              <Text style={[styles.selectedCount, { color: colors.textSecondary }]}>
                {selectedSurahs.size} {t('focus.surahsSelected')}
              </Text>

              <TouchableOpacity
                style={[styles.endButton, { backgroundColor: '#F44336' }]}
                onPress={endSession}
              >
                <Text style={styles.endButtonText}>{t('focus.endSession')}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  backButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
  },
  title: {
    fontWeight: 'bold',
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  surahCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 8,
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontWeight: '600',
  },
  surahEnglish: {
    fontSize: 12,
    marginTop: 2,
  },
  checkmark: {
    fontSize: 24,
  },
  durationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  durationButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  durationText: {
    fontWeight: '600',
  },
  startButton: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sessionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  timerLabel: {
    marginBottom: 16,
    fontWeight: '600',
  },
  timer: {
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  selectedCount: {
    marginTop: 16,
    marginBottom: 32,
  },
  endButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  endButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
