import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useFonts } from '../context/FontSizeContext';

const { width } = Dimensions.get('window');

interface WordBreakdownProps {
  route?: {
    params?: {
      verseText?: string;
      surahNumber?: number;
      verseNumber?: number;
    };
  };
}

export const WordBreakdownScreen: React.FC<WordBreakdownProps> = ({ route }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { fonts } = useFonts();

  const verseText = route?.params?.verseText || 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
  const surahNumber = route?.params?.surahNumber || 1;
  const verseNumber = route?.params?.verseNumber || 1;

  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showTransliteration, setShowTransliteration] = useState(false);

  // Sample word data (in real app, fetch from DB)
  const wordData = [
    {
      arabic: 'بِسْمِ',
      transliteration: 'Bismi',
      translation: 'In the name of',
      root: 'س م و',
      grammar: 'Preposition + noun',
    },
    {
      arabic: 'اللَّهِ',
      transliteration: 'Allahi',
      translation: 'Allah',
      root: 'إ ل ه',
      grammar: 'Proper noun (genitive)',
    },
    {
      arabic: 'الرَّحْمَٰنِ',
      transliteration: 'Ar-Rahmani',
      translation: 'The Most Gracious',
      root: 'ر ح م',
      grammar: 'Adjective (intensive form)',
    },
    {
      arabic: 'الرَّحِيمِ',
      transliteration: 'Ar-Rahimi',
      translation: 'The Most Merciful',
      root: 'ر ح م',
      grammar: 'Adjective (active participle)',
    },
  ];

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
          <Text style={[styles.title, { color: colors.text, fontSize: fonts.heading }]}>
            {t('wordBreakdown.title')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('audio.verse')} {verseNumber} - Sourate {surahNumber}
          </Text>
        </View>

        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Toggle Buttons */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              { backgroundColor: showTranslation ? colors.primary : colors.surface },
            ]}
            onPress={() => setShowTranslation(!showTranslation)}
          >
            <Text style={[styles.toggleText, { color: showTranslation ? '#fff' : colors.text }]}>
              {t('wordBreakdown.translation')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              { backgroundColor: showTransliteration ? colors.primary : colors.surface },
            ]}
            onPress={() => setShowTransliteration(!showTransliteration)}
          >
            <Text style={[styles.toggleText, { color: showTransliteration ? '#fff' : colors.text }]}>
              {t('wordBreakdown.transliteration')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Words Display */}
        <View style={styles.wordsContainer}>
          {wordData.map((word, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.wordCard,
                {
                  backgroundColor: selectedWordIndex === index ? colors.primary + '20' : colors.card,
                  borderColor: selectedWordIndex === index ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedWordIndex(selectedWordIndex === index ? null : index)}
            >
              <Text style={[styles.arabicWord, { color: colors.text, fontSize: fonts.title }]}>
                {word.arabic}
              </Text>

              {showTransliteration && (
                <Text style={[styles.transliteration, { color: colors.textSecondary, fontSize: fonts.body }]}>
                  {word.transliteration}
                </Text>
              )}

              {showTranslation && (
                <Text style={[styles.translation, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                  {word.translation}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Word Detail */}
        {selectedWordIndex !== null && (
          <View style={[styles.detailCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.detailTitle, { color: colors.text, fontSize: fonts.subheading }]}>
              {wordData[selectedWordIndex].arabic}
            </Text>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                {t('wordBreakdown.root')}:
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {wordData[selectedWordIndex].root}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                {t('wordBreakdown.grammar')}:
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {wordData[selectedWordIndex].grammar}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                {t('wordBreakdown.meaning')}:
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {wordData[selectedWordIndex].translation}
              </Text>
            </View>
          </View>
        )}

        {/* Full Verse */}
        <View style={[styles.verseCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.verseLabel, { color: colors.textSecondary }]}>
            {t('wordBreakdown.fullVerse')}
          </Text>
          <Text style={[styles.verseText, { color: colors.text, fontSize: fonts.subheading }]}>
            {verseText}
          </Text>
        </View>
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
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  toggleText: {
    fontWeight: '600',
  },
  wordsContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  wordCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 80,
    alignItems: 'center',
  },
  arabicWord: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transliteration: {
    fontStyle: 'italic',
    marginBottom: 2,
  },
  translation: {
    textAlign: 'center',
  },
  detailCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  detailTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontWeight: '600',
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  verseCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  verseLabel: {
    marginBottom: 12,
    fontWeight: '600',
  },
  verseText: {
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 32,
  },
});
