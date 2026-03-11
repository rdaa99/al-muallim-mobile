import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useAppStore } from '@/stores/appStore';
import { AudioPlayer } from '@/components/AudioPlayer';

const { width } = Dimensions.get('window');

export const ReviewScreen: React.FC = () => {
  const {
    currentVerse,
    dailyReview,
    loading,
    error,
    loadTodayReview,
    submitReview,
    nextVerse,
  } = useAppStore();

  const [showTranslation, setShowTranslation] = useState(false);
  const [showArabic, setShowArabic] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));
  const isAnimating = useRef(false);

  useEffect(() => {
    loadTodayReview();
  }, []);

  // Reset reveal state when verse changes
  useEffect(() => {
    setShowTranslation(false);
    setShowArabic(false);
  }, [currentVerse?.id]);

  const animateTransition = (callback: () => void) => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      callback();
      // Fade in
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

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Chargement des révisions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadTodayReview}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No reviews today
  if (!dailyReview || dailyReview.verses.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyIcon}>📚</Text>
        <Text style={styles.emptyTitle}>Aucune révision aujourd'hui</Text>
        <Text style={styles.emptyText}>
          Profitez de votre journée ou révisez des versets supplémentaires !
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadTodayReview}>
          <Text style={styles.refreshButtonText}>Actualiser</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // All reviews completed
  if (!currentVerse) {
    return (
      <View style={styles.container}>
        <Text style={styles.completeIcon}>🎉</Text>
        <Text style={styles.completeTitle}>Félicitations !</Text>
        <Text style={styles.completeText}>
          Vous avez terminé toutes les révisions du jour !
        </Text>
        <View style={styles.statsContainer}>
          <Text style={styles.statsNumber}>
            {dailyReview?.completed_count || 0}
          </Text>
          <Text style={styles.statsLabel}>versets révisés</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={loadTodayReview}>
          <Text style={styles.refreshButtonText}>Voir le programme</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show blocked message if any
  if (dailyReview.blocked && dailyReview.block_message) {
    return (
      <View style={styles.container}>
        <Text style={styles.blockedIcon}>ℹ️</Text>
        <Text style={styles.blockedTitle}>Programme adapté</Text>
        <Text style={styles.blockedText}>{dailyReview.block_message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progress}>
          {(dailyReview?.completed_count || 0) + 1} / {dailyReview?.due_count || 0}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((dailyReview?.completed_count || 0) / (dailyReview?.due_count || 1)) * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Verse */}
      <Animated.View
        style={[
          styles.verseContainer,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, width],
                }),
              },
            ],
          },
        ]}
      >
        {/* Arabic text with reveal */}
        <TouchableOpacity onPress={toggleArabic} activeOpacity={0.9}>
          <View style={styles.arabicContainer}>
            {showArabic ? (
              <Text style={styles.arabicText}>{currentVerse.text_arabic}</Text>
            ) : (
              <View style={styles.hiddenText}>
                <Text style={styles.hiddenPlaceholder}>● ● ● ● ● ● ●</Text>
                <Text style={styles.tapToReveal}>Touchez pour révéler</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <Text style={styles.reference}>
          {currentVerse.surah_number}:{currentVerse.ayah_number}
        </Text>

        {/* Translation with reveal */}
        {currentVerse.text_translation && (
          <TouchableOpacity
            style={styles.translationButton}
            onPress={() => setShowTranslation(!showTranslation)}
          >
            {showTranslation ? (
              <Text style={styles.translationText}>
                {currentVerse.text_translation}
              </Text>
            ) : (
              <Text style={styles.revealText}>Révéler la traduction</Text>
            )}
          </TouchableOpacity>
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
          <Text style={styles.qualityButtonText}>Difficile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.qualityButton, styles.mediumButton]}
          onPress={() => handleSubmit(3)}
        >
          <Text style={styles.qualityButtonEmoji}>🤔</Text>
          <Text style={styles.qualityButtonText}>Moyen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.qualityButton, styles.easyButton]}
          onPress={() => handleSubmit(5)}
        >
          <Text style={styles.qualityButtonEmoji}>😊</Text>
          <Text style={styles.qualityButtonText}>Facile</Text>
        </TouchableOpacity>
      </View>

      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipButtonText}>Passer ce verset →</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
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
    backgroundColor: '#10B981',
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
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  completeIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  completeTitle: {
    color: '#10B981',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  completeText: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  statsContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  statsNumber: {
    color: '#10B981',
    fontSize: 48,
    fontWeight: 'bold',
  },
  statsLabel: {
    color: '#94A3B8',
    fontSize: 16,
  },
  refreshButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
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
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  progressContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  progress: {
    color: '#10B981',
    fontSize: 18,
    marginBottom: 12,
    fontWeight: '600',
  },
  progressBar: {
    width: width - 80,
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  verseContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    marginBottom: 30,
  },
  arabicContainer: {
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arabicText: {
    color: '#FFFFFF',
    fontSize: 32,
    textAlign: 'center',
    lineHeight: 56,
    writingDirection: 'rtl',
  },
  hiddenText: {
    alignItems: 'center',
  },
  hiddenPlaceholder: {
    color: '#64748B',
    fontSize: 28,
    letterSpacing: 8,
    marginBottom: 8,
  },
  tapToReveal: {
    color: '#64748B',
    fontSize: 12,
    fontStyle: 'italic',
  },
  reference: {
    color: '#64748B',
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
    color: '#CBD5E1',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  revealText: {
    color: '#10B981',
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
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
  },
});
