import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/appStore';
import { useTheme } from '../context/ThemeContext';
import { AudioPlayer } from '@/components/AudioPlayer';

export const ReviewScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const {
    currentVerse,
    dailyReview,
    loading,
    error,
    reviewIndex,
    loadTodayReview,
    submitReview,
    nextVerse,
  } = useAppStore();

  const [showTranslation, setShowTranslation] = useState(false);
  const [showArabic, setShowArabic] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));
  const isAnimating = useRef(false);

  // Tarteel-style: Start with HIDDEN text (empty screen)
  const [textRevealed, setTextRevealed] = useState(false);

  useEffect(() => {
    loadTodayReview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset reveal state when verse changes
  useEffect(() => {
    setShowTranslation(false);
    setShowArabic(false);
    setTextRevealed(false); // Reset Tarteel mode
  }, [currentVerse?.id]);

  const animateTransition = (callback: () => void) => {
    if (isAnimating.current) {return;}
    isAnimating.current = true;

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      callback();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        isAnimating.current = false;
      });
    });
  };

  const handleSubmit = (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    animateTransition(() => {
      submitReview(quality);
    });
  };

  const handleSkip = () => {
    animateTransition(() => {
      nextVerse();
    });
  };

  const toggleArabic = () => {
    setShowArabic(!showArabic);
  };

  // Session progress: use reviewIndex for in-session tracking
  const sessionCompleted = reviewIndex;
  const sessionTotal = dailyReview?.due_count || 0;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          {t('review.loading', 'Chargement des révisions...')}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={loadTodayReview}>
          <Text style={styles.retryButtonText}>{t('review.retry', 'Réessayer')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No reviews today
  if (!dailyReview || dailyReview.verses.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={styles.emptyIcon}>📚</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          {t('review.noReviewsTitle', 'Aucune révision aujourd\'hui')}
        </Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {t('review.noReviewsBody', 'Profitez de votre journée ou révisez des versets supplémentaires !')}
        </Text>
        <TouchableOpacity style={[styles.refreshButton, { backgroundColor: colors.surface }]} onPress={loadTodayReview}>
          <Text style={[styles.refreshButtonText, { color: colors.text }]}>
            {t('review.refresh', 'Actualiser')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // All reviews completed
  if (!currentVerse) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={styles.completeIcon}>🎉</Text>
        <Text style={[styles.completeTitle, { color: colors.primary }]}>
          {t('review.completeTitle', 'Félicitations !')}
        </Text>
        <Text style={[styles.completeText, { color: colors.textSecondary }]}>
          {t('review.completeBody', 'Vous avez terminé toutes les révisions du jour !')}
        </Text>
        <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statsNumber, { color: colors.primary }]}>
            {sessionTotal}
          </Text>
          <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>
            {t('review.versesReviewed', 'versets révisés')}
          </Text>
        </View>
        <TouchableOpacity style={[styles.refreshButton, { backgroundColor: colors.surface }]} onPress={loadTodayReview}>
          <Text style={[styles.refreshButtonText, { color: colors.text }]}>
            {t('review.viewProgram', 'Voir le programme')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show blocked message if any
  if (dailyReview.blocked && dailyReview.block_message) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={styles.blockedIcon}>ℹ️</Text>
        <Text style={styles.blockedTitle}>{t('review.adapted', 'Programme adapté')}</Text>
        <Text style={[styles.blockedText, { color: colors.textSecondary }]}>{dailyReview.block_message}</Text>
      </View>
    );
  }

  // Get translation based on current language
  const translation = currentVerse.text_translation_fr || currentVerse.text_translation_en;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={[styles.progress, { color: colors.primary }]}>
          {sessionCompleted + 1} / {sessionTotal}
        </Text>
        <View style={[styles.progressBar, { width: width - 80, backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(sessionCompleted / Math.max(sessionTotal, 1)) * 100}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* Verse - Tarteel Style: EMPTY by default */}
      <Animated.View
        style={[
          styles.verseContainer,
          { backgroundColor: colors.surface, opacity: fadeAnim },
        ]}
      >
        {/* Surah Title at top */}
        <View style={styles.surahTitleContainer}>
          <Text style={[styles.surahTitle, { color: colors.text }]}>
            Sourate {currentVerse.surah_number}
          </Text>
        </View>

        {/* EMPTY SPACE - User recites from memory */}
        {!textRevealed ? (
          <TouchableOpacity 
            style={styles.emptyVerseArea}
            onPress={() => setTextRevealed(true)}
            activeOpacity={0.9}
          >
            <Text style={[styles.revealHint, { color: colors.textSecondary }]}>
              Touchez pour révéler le texte
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            {/* Arabic text with tajweed colors (revealed) */}
            <TouchableOpacity onPress={toggleArabic} activeOpacity={0.9}>
              <View style={styles.arabicContainer}>
                <Text style={[styles.arabicText, { color: colors.text }]}>
                  {currentVerse.text_arabic}
                </Text>
              </View>
            </TouchableOpacity>

            <Text style={[styles.reference, { color: colors.textSecondary }]}>
              {currentVerse.surah_number}:{currentVerse.ayah_number}
            </Text>

            {/* Translation (optional) */}
            {translation && (
              <TouchableOpacity
                style={styles.translationButton}
                onPress={() => setShowTranslation(!showTranslation)}
              >
                {showTranslation ? (
                  <Text style={[styles.translationText, { color: colors.textSecondary }]}>
                    {translation}
                  </Text>
                ) : (
                  <Text style={[styles.revealText, { color: colors.primary }]}>
                    {t('review.revealTranslation', 'Révéler la traduction')}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </>
        )}
      </Animated.View>

      {/* Audio Player */}
      {currentVerse && (
        <AudioPlayer
          surahNumber={currentVerse.surah_number}
          ayahNumber={currentVerse.ayah_number}
          autoPlay={false}
        />
      )}

      {/* Quality buttons */}
      <View style={styles.qualityButtons}>
        <TouchableOpacity
          style={[styles.qualityButton, styles.hardButton]}
          onPress={() => handleSubmit(1)}
        >
          <Text style={styles.qualityButtonEmoji}>😓</Text>
          <Text style={styles.qualityButtonText}>{t('review.hard', 'Difficile')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.qualityButton, styles.mediumButton]}
          onPress={() => handleSubmit(3)}
        >
          <Text style={styles.qualityButtonEmoji}>🤔</Text>
          <Text style={styles.qualityButtonText}>{t('review.medium', 'Moyen')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.qualityButton, styles.easyButton]}
          onPress={() => handleSubmit(5)}
        >
          <Text style={styles.qualityButtonEmoji}>😊</Text>
          <Text style={styles.qualityButtonText}>{t('review.easy', 'Facile')}</Text>
        </TouchableOpacity>
      </View>

      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>
          {t('review.skip', 'Passer ce verset →')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  completeIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  completeText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  statsContainer: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  statsNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  statsLabel: {
    fontSize: 16,
  },
  refreshButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  blockedIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  blockedTitle: {
    color: '#F59E0B',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  blockedText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  progressContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  progress: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  verseContainer: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    marginBottom: 30,
  },
  surahTitleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  surahTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyVerseArea: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  revealHint: {
    fontSize: 16,
    textAlign: 'center',
  },
  arabicContainer: {
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arabicText: {
    fontSize: 32,
    textAlign: 'center',
    lineHeight: 56,
    writingDirection: 'rtl',
  },
  hiddenText: {
    alignItems: 'center',
  },
  hiddenPlaceholder: {
    fontSize: 28,
    letterSpacing: 8,
    marginBottom: 8,
  },
  tapToReveal: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  reference: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 12,
  },
  translationButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  translationText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  revealText: {
    fontSize: 14,
    textAlign: 'center',
  },
  qualityButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  qualityButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  hardButton: {
    backgroundColor: '#EF4444',
  },
  mediumButton: {
    backgroundColor: '#F59E0B',
  },
  easyButton: {
    backgroundColor: '#10B981',
  },
  qualityButtonEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  qualityButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
