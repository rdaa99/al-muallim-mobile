import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useAppStore } from '@/stores/appStore';
import { getReciterDisplayName } from '@/services/reciterService';
import type { ThemeColors } from '../context/ThemeContext';

interface AudioPlayerProps {
  surahNumber: number;
  ayahNumber: number;
  autoPlay?: boolean;
  colors?: ThemeColors;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  surahNumber,
  ayahNumber,
  autoPlay = false,
  colors,
}) => {
  const { t } = useTranslation();
  const { settings } = useAppStore();

  const bg = colors?.surface || '#1E293B';
  const accent = colors?.primary || '#10B981';
  const textSecondary = colors?.textSecondary || '#94A3B8';
  const buttonBg = colors?.border || '#334155';

  // Get selected reciter from settings
  const selectedReciter = settings?.preferred_reciter || 'afasy';

  const {
    isPlaying,
    isLoading,
    isLooping,
    error,
    play,
    pause,
    stop,
    toggleLoop,
  } = useAudioPlayer({ reciterId: selectedReciter });

  // Auto-play on mount if enabled
  React.useEffect(() => {
    if (autoPlay) {
      play(surahNumber, ayahNumber);
    }
  }, [surahNumber, ayahNumber, autoPlay, play]);

  const handlePlayPause = () => {
    if (error) {
      play(surahNumber, ayahNumber);
    } else if (isPlaying) {
      pause();
    } else {
      play(surahNumber, ayahNumber);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={accent} />
          <Text style={[styles.loadingText, { color: textSecondary }]}>
            {t('audio.loading', 'Chargement...')}
          </Text>
        </View>
      )}

      {error && !isLoading && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: accent }]}
          onPress={handlePlayPause}
          disabled={isLoading}
        >
          <Text style={styles.buttonIcon}>
            {isLoading ? '\u23F3' : isPlaying ? '\u23F8' : '\u25B6'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonBg }]}
          onPress={() => stop()}
          disabled={isLoading}
        >
          <Text style={styles.buttonIcon}>{'\u23F9'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonBg }]}
          onPress={() => play(surahNumber, ayahNumber)}
          disabled={isLoading}
        >
          <Text style={styles.buttonIcon}>{'\uD83D\uDD04'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isLooping && { backgroundColor: accent }]}
          onPress={() => toggleLoop()}
          disabled={isLoading}
        >
          <Text style={styles.buttonIcon}>{'\uD83D\uDD01'}</Text>
        </TouchableOpacity>
      </View>

      {isLooping && (
        <Text style={[styles.loopIndicator, { color: accent }]}>
          {t('audio.loopEnabled', 'Répétition activée')}
        </Text>
      )}

      <Text style={[styles.reciterIndicator, { color: textSecondary }]}>
        🎤 {getReciterDisplayName(selectedReciter)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 12,
    marginLeft: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    fontSize: 20,
  },
  loopIndicator: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
  reciterIndicator: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
