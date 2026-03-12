import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useFonts } from '../context/FontSizeContext';
import { useRecitationStore } from '../store/recitationStore';
import { getQuranDB } from '../database/QuranDB';
import { Surah } from '../types';

const { width } = Dimensions.get('window');

type RecitationMode = 'learning' | 'test' | 'flow' | 'hifz';

interface RecitationScreenProps {
  route?: {
    params?: {
      surah?: Surah;
      mode?: RecitationMode;
    };
  };
}

interface Verse {
  id: number;
  surahNumber: number;
  verseNumber: number;
  text: string;
  juz: number;
  page: number;
}

export const RecitationScreen: React.FC<RecitationScreenProps> = ({ route }) => {
  const defaultSurah: Surah = {
    number: 1,
    name: 'الفاتحة',
    englishName: 'Al-Fatiha',
    ayahsCount: 7,
    revelationType: 'Meccan',
  };

  const surah = route?.params?.surah || defaultSurah;
  const initialMode = route?.params?.mode || 'learning';
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { fonts } = useFonts();

  const [mode, setMode] = useState<RecitationMode>(initialMode);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [revealedVerses, setRevealedVerses] = useState<Set<number>>(new Set());
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    progress,
    updateProgress,
    markVerseMemorized,
  } = useRecitationStore();

  // Load verses from SQLite DB
  useEffect(() => {
    const loadVerses = async () => {
      try {
        const db = await getQuranDB();
        const fetchedVerses = await db.getVersesBySurah(surah.number);
        setVerses(fetchedVerses);
      } catch (error) {
        console.error('Error loading verses:', error);
        // Fallback to sample verses if DB fails
        setVerses([
          { id: 1, surahNumber: 1, verseNumber: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', juz: 1, page: 1 },
          { id: 2, surahNumber: 1, verseNumber: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', juz: 1, page: 1 },
          { id: 3, surahNumber: 1, verseNumber: 3, text: 'الرَّحْمَٰنِ الرَّحِيمِ', juz: 1, page: 1 },
          { id: 4, surahNumber: 1, verseNumber: 4, text: 'مَالِكِ يَوْمِ الدِّينِ', juz: 1, page: 1 },
          { id: 5, surahNumber: 1, verseNumber: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', juz: 1, page: 1 },
          { id: 6, surahNumber: 1, verseNumber: 6, text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', juz: 1, page: 1 },
          { id: 7, surahNumber: 1, verseNumber: 7, text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', juz: 1, page: 1 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    loadVerses();
  }, [surah.number]);

  const currentVerse = verses[currentVerseIndex];

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Chargement des versets...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state - no verses loaded
  if (verses.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Impossible de charger les versets
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => setLoading(true)}
          >
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  useEffect(() => {
    if (mode === 'learning' && isPlaying && currentVerse) {
      const words = currentVerse.text.split(' ').length;
      const interval = setInterval(() => {
        setCurrentWordIndex((prev) => {
          if (prev >= words - 1) {
            // Move to next verse
            if (currentVerseIndex < verses.length - 1) {
              setCurrentVerseIndex(currentVerseIndex + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return prev;
            }
          }
          return prev + 1;
        });
      }, 800);

      return () => clearInterval(interval);
    }
  }, [mode, isPlaying, currentVerseIndex, currentVerse, verses.length]);

  const handleModeChange = (newMode: RecitationMode) => {
    setMode(newMode);
    setCurrentWordIndex(0);
    setIsPlaying(false);
    setRevealedVerses(new Set());
  };

  const handleRevealVerse = (verseIndex: number) => {
    setRevealedVerses((prev) => new Set([...prev, verseIndex]));
  };

  const handleMarkMemorized = (verseIndex: number) => {
    markVerseMemorized(surah.number, verseIndex + 1);
    if (verseIndex < verses.length - 1) {
      setCurrentVerseIndex(verseIndex + 1);
    }
  };

  const renderModeSelector = () => (
    <View style={styles.modeSelector}>
      {(['learning', 'test', 'flow', 'hifz'] as RecitationMode[]).map((m) => (
        <TouchableOpacity
          key={m}
          style={[
            styles.modeButton,
            { backgroundColor: mode === m ? colors.primary : colors.surface },
          ]}
          onPress={() => handleModeChange(m)}
        >
          <Text
            style={[
              styles.modeText,
              { color: mode === m ? '#fff' : colors.text },
            ]}
          >
            {t(`recitation.modes.${m}`)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderLearningMode = () => (
    <View style={styles.verseContainer}>
      <Text style={[styles.verseNumber, { color: colors.textSecondary }]}>
        {t('audio.verse')} {currentVerse?.verseNumber}
      </Text>

      <View style={styles.wordsContainer}>
        {currentVerse.text.split(' ').map((word, index) => (
          <Text
            key={index}
            style={[
              styles.wordText,
              {
                color: index <= currentWordIndex ? colors.text : colors.textSecondary,
                fontSize: fonts.title,
                opacity: index <= currentWordIndex ? 1 : 0.3,
              },
            ]}
          >
            {word}
          </Text>
        ))}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: colors.primary }]}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: colors.surface }]}
          onPress={() => setCurrentWordIndex(0)}
          disabled={currentWordIndex === 0}
        >
          <Text style={styles.navIcon}>↺</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: colors.surface }]}
          onPress={() => setCurrentVerseIndex(Math.max(0, currentVerseIndex - 1))}
          disabled={currentVerseIndex === 0}
        >
          <Text style={styles.navIcon}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: colors.surface }]}
          onPress={() => setCurrentVerseIndex(Math.min(verses.length - 1, currentVerseIndex + 1))}
          disabled={currentVerseIndex === verses.length - 1}
        >
          <Text style={styles.navIcon}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTestMode = () => (
    <ScrollView style={styles.scrollView}>
      {verses.map((verse, verseIndex) => (
        <View key={verseIndex} style={[styles.verseCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.verseNumber, { color: colors.textSecondary }]}>
            {t('audio.verse')} {verse.verseNumber}
          </Text>

          {revealedVerses.has(verseIndex) ? (
            <Text style={[styles.verseText, { color: colors.text, fontSize: fonts.subheading }]}>
              {verse.text}
            </Text>
          ) : (
            <View style={styles.hiddenVerse}>
              <Text style={[styles.hiddenText, { color: colors.textSecondary }]}>
                ••••••••••••
              </Text>
            </View>
          )}

          <View style={styles.verseActions}>
            {!revealedVerses.has(verseIndex) ? (
              <TouchableOpacity
                style={[styles.revealButton, { backgroundColor: colors.primary }]}
                onPress={() => handleRevealVerse(verseIndex)}
              >
                <Text style={styles.revealText}>{t('recitation.reveal')}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.ratingButtons}>
                <TouchableOpacity
                  style={[styles.ratingButton, { backgroundColor: '#4CAF50' }]}
                  onPress={() => handleMarkMemorized(verseIndex)}
                >
                  <Text style={styles.ratingText}>✓</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.ratingButton, { backgroundColor: '#FFC107' }]}
                  onPress={() => handleRevealVerse(verseIndex)}
                >
                  <Text style={styles.ratingText}>⟳</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderFlowMode = () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.flowContainer}>
        {verses.map((verse, index) => (
          <View key={index} style={styles.flowVerse}>
            <Text style={[styles.verseText, { color: colors.text, fontSize: fonts.subheading }]}>
              {verse.text}
            </Text>
            <Text style={[styles.verseNumberSmall, { color: colors.textSecondary }]}>
              ﴿{verse.verseNumber}﴾
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderHifzMode = () => (
    <View style={styles.hifzContainer}>
      <Text style={[styles.hifzTitle, { color: colors.text, fontSize: fonts.heading }]}>
        {t('recitation.hifzMode')}
      </Text>

      <View style={styles.progressContainer}>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {t('recitation.progress')}: {currentVerseIndex + 1}/{verses.length}
        </Text>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentVerseIndex + 1) / verses.length) * 100}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
      </View>

      <View style={[styles.verseBox, { backgroundColor: colors.card }]}>
        <Text style={[styles.verseText, { color: colors.text, fontSize: fonts.title }]}>
          {currentVerse.text}
        </Text>
      </View>

      <View style={styles.hifzControls}>
        <TouchableOpacity
          style={[styles.hifzButton, { backgroundColor: '#F44336' }]}
          onPress={() => setCurrentVerseIndex(Math.max(0, currentVerseIndex - 1))}
        >
          <Text style={styles.hifzButtonText}>← {t('recitation.review')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.hifzButton, { backgroundColor: '#4CAF50' }]}
          onPress={() => {
            markVerseMemorized(surah.number, currentVerseIndex + 1);
            if (currentVerseIndex < verses.length - 1) {
              setCurrentVerseIndex(currentVerseIndex + 1);
            }
          }}
        >
          <Text style={styles.hifzButtonText}>{t('recitation.next')} →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backIcon, { color: colors.primary }]}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerTitle}>
          <Text style={[styles.surahName, { color: colors.text, fontSize: fonts.heading }]}>
            {surah.name}
          </Text>
          <Text style={[styles.surahEnglish, { color: colors.textSecondary }]}>
            {surah.englishName}
          </Text>
        </View>

        <View style={styles.placeholder} />
      </View>

      {renderModeSelector()}

      {mode === 'learning' && renderLearningMode()}
      {mode === 'test' && renderTestMode()}
      {mode === 'flow' && renderFlowMode()}
      {mode === 'hifz' && renderHifzMode()}
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
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  surahName: {
    fontWeight: 'bold',
  },
  surahEnglish: {
    fontSize: 12,
  },
  placeholder: {
    width: 44,
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 70,
  },
  modeText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  verseContainer: {
    flex: 1,
    padding: 20,
  },
  verseNumber: {
    textAlign: 'center',
    marginBottom: 16,
  },
  wordsContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 32,
  },
  wordText: {
    marginHorizontal: 6,
    marginVertical: 4,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 24,
    color: '#fff',
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  verseCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  verseText: {
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 36,
  },
  hiddenVerse: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  hiddenText: {
    fontSize: 24,
  },
  verseActions: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  revealButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  revealText: {
    color: '#fff',
    fontWeight: '600',
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  ratingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 20,
    color: '#fff',
  },
  flowContainer: {
    padding: 20,
  },
  flowVerse: {
    marginBottom: 24,
    alignItems: 'flex-end',
  },
  verseNumberSmall: {
    fontSize: 14,
    marginTop: 4,
  },
  hifzContainer: {
    flex: 1,
    padding: 20,
  },
  hifzTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 24,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  verseBox: {
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
  },
  hifzControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  hifzButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  hifzButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default RecitationScreen;
