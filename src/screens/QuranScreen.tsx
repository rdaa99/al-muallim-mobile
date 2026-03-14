import React, { useState, useEffect } from 'react';
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
import { getVersesBySurah } from '../services/database';
import type { Verse, Surah } from '../types';

const { width } = Dimensions.get('window');

interface QuranScreenProps {}

// Tajwid color rules (simplified)
const applyTajweedColors = (text: string): React.ReactNode[] => {
  const words = text.split(' ');
  
  return words.map((word, index) => {
    // Apply basic tajwid rules (simplified for demo)
    let color = '#000'; // Default black
    
    // Ghunna (nasal sound) - noon/meem with shadda
    if (/[نًٍّ]|مّ/.test(word)) {
      color = '#2196F3'; // Blue
    }
    // Madd (elongation) - alif/waw/ya with madd
    else if (/[آ]/.test(word)) {
      color = '#4CAF50'; // Green
    }
    // Qalqala (bouncing letters) - qaf, ta, ba, jim, dal
    else if (/[قًٍٍ]|طًٍٍ]|بًٍٍ]|جًٍٍ]|دًٍٍ]/.test(word)) {
      color = '#FF9800'; // Orange
    }
    // Idgham (merging)
    else if (word.length > 3 && /ن|م|و|ي/.test(word[2])) {
      color = '#9C27B0'; // Purple
    }
    
    return (
      <Text key={index} style={[styles.verseWord, { color }]}>
        {word}{' '}
      </Text>
    );
  });
};

// Default surah
const DEFAULT_SURAH: Surah = {
  number: 1,
  name: 'الفاتحة',
  englishName: 'Al-Fatiha',
  ayahsCount: 7,
  revelationType: 'Meccan',
};

export const QuranScreen: React.FC<QuranScreenProps> = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { fonts } = useFonts();

  const [currentSurah, setCurrentSurah] = useState<Surah>(DEFAULT_SURAH);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [visibleVerses, setVisibleVerses] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load surah verses
  useEffect(() => {
    const loadVerses = async () => {
      try {
        setLoading(true);
        const fetchedVerses = await getVersesBySurah(currentSurah.number);
        setVerses(fetchedVerses);
        // Show only first verse initially
        setVisibleVerses(new Set([1]));
      } catch (error) {
        console.error('Error loading verses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVerses();
  }, [currentSurah.number]);

  // Handle tap to reveal next verse
  const handleVerseTap = (verseNumber: number) => {
    setVisibleVerses(prev => {
      const newSet = new Set(prev);
      newSet.add(verseNumber);
      // Also reveal next verse
      if (verseNumber < verses.length) {
        newSet.add(verseNumber + 1);
      }
      return newSet;
    });
  };

  // Render verse with tajweed colors
  const renderVerse = (verse: Verse, index: number) => {
    const isVisible = visibleVerses.has(verse.verseNumber);
    const isRevealed = visibleVerses.has(verse.verseNumber);
    
    return (
      <TouchableOpacity
        key={verse.id}
        style={styles.verseContainer}
        onPress={() => handleVerseTap(verse.verseNumber)}
        activeOpacity={0.7}
      >
        {/* Verse number */}
        <View style={styles.verseNumberContainer}>
          <Text style={[styles.verseNumber, { color: colors.textSecondary }]}>
            ﴿{verse.verseNumber}﴾
          </Text>
        </View>

        {/* Arabic text with tajweed colors */}
        {isRevealed ? (
          <View style={styles.verseTextContainer}>
            <Text style={[styles.verseText, { fontSize: fonts.heading }]}>
              {applyTajweedColors(verse.text)}
            </Text>
          </View>
        ) : (
          <View style={[styles.hiddenVerse, { backgroundColor: colors.border }]} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.surahHeader}>
          <Text style={[styles.surahName, { color: colors.text }]}>
            {currentSurah.name}
          </Text>
          <Text style={[styles.surahEnglish, { color: colors.textSecondary }]}>
            {currentSurah.englishName}
          </Text>
        </View>

        <View style={styles.placeholder} />
      </View>

      {/* Bismillah */}
      {currentSurah.number !== 9 && currentSurah.number !== 1 && (
        <Text style={[styles.bismillah, { color: colors.text }]}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </Text>
      )}

      {/* Verses */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Chargement...
          </Text>
        ) : (
          verses.map((verse, index) => renderVerse(verse, index))
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
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    fontSize: 24,
    color: '#2196F3',
    width: 40,
  },
  surahHeader: {
    alignItems: 'center',
    flex: 1,
  },
  surahName: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  surahEnglish: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  bismillah: {
    fontSize: 24,
    textAlign: 'center',
    paddingVertical: 20,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  verseContainer: {
    marginBottom: 24,
  },
  verseNumberContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  verseNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  verseTextContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 10,
  },
  verseText: {
    writingDirection: 'rtl',
    textAlign: 'right',
    lineHeight: 48,
  },
  verseWord: {
    writingDirection: 'rtl',
  },
  hiddenVerse: {
    height: 60,
    borderRadius: 8,
    marginHorizontal: 20,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});
