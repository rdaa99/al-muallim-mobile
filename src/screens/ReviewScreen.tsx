import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAppStore } from '@/stores/appStore';

export const ReviewScreen: React.FC = () => {
  const {
    currentVerse,
    dailyReview,
    loading,
    error,
    loadTodayReview,
    submitReview,
  } = useAppStore();

  const [showTranslation, setShowTranslation] = React.useState(false);

  useEffect(() => {
    loadTodayReview();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={loadTodayReview}>
          <Text style={styles.buttonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentVerse) {
    return (
      <View style={styles.container}>
        <Text style={styles.completeText}>🎉 Révisions terminées !</Text>
        <Text style={styles.statsText}>
          {dailyReview?.completed_count || 0} versets révisés aujourd'hui
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress */}
      <Text style={styles.progress}>
        {(dailyReview?.completed_count || 0) + 1} / {dailyReview?.due_count || 0}
      </Text>

      {/* Verse */}
      <View style={styles.verseContainer}>
        <Text style={styles.arabicText}>{currentVerse.text_arabic}</Text>
        <Text style={styles.reference}>
          {currentVerse.surah_number}:{currentVerse.ayah_number}
        </Text>

        {showTranslation && currentVerse.text_translation && (
          <Text style={styles.translationText}>
            {currentVerse.text_translation}
          </Text>
        )}

        <TouchableOpacity
          style={styles.revealButton}
          onPress={() => setShowTranslation(!showTranslation)}
        >
          <Text style={styles.revealButtonText}>
            {showTranslation ? 'Masquer' : 'Révéler traduction'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quality buttons */}
      <View style={styles.qualityButtons}>
        <TouchableOpacity
          style={[styles.qualityButton, styles.hardButton]}
          onPress={() => submitReview(1)}
        >
          <Text style={styles.qualityButtonText}>Difficile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.qualityButton, styles.mediumButton]}
          onPress={() => submitReview(3)}
        >
          <Text style={styles.qualityButtonText}>Moyen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.qualityButton, styles.easyButton]}
          onPress={() => submitReview(5)}
        >
          <Text style={styles.qualityButtonText}>Facile</Text>
        </TouchableOpacity>
      </View>
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
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  completeText: {
    color: '#10B981',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  statsText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  progress: {
    color: '#10B981',
    fontSize: 18,
    marginBottom: 30,
  },
  verseContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    marginBottom: 30,
  },
  arabicText: {
    color: '#FFFFFF',
    fontSize: 28,
    textAlign: 'right',
    lineHeight: 48,
    writingDirection: 'rtl',
    marginBottom: 16,
  },
  reference: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  translationText: {
    color: '#CBD5E1',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  revealButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  revealButtonText: {
    color: '#10B981',
    fontSize: 14,
    textAlign: 'center',
  },
  qualityButtons: {
    flexDirection: 'row',
    gap: 12,
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
  qualityButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
