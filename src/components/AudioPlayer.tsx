import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

interface AudioPlayerProps {
  surahNumber: number;
  ayahNumber: number;
  autoPlay?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  surahNumber,
  ayahNumber,
  autoPlay = false,
}) => {
  // Generate audio URL
  // Format: https://cdn.islamic.network/quran/audio/128/ar.alafasy/{surah}{ayah}.mp3
  // Example: Sourate 1, verset 1 → 1001
  const paddedSurah = String(surahNumber).padStart(3, '0');
  const paddedAyah = String(ayahNumber).padStart(3, '0');
  const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${paddedSurah}${paddedAyah}.mp3`;

  const {
    isPlaying,
    isLoading,
    isLooping,
    error,
    play,
    pause,
    stop,
    replay,
    toggleLoop,
  } = useAudioPlayer();

  // Auto-play on mount if enabled
  React.useEffect(() => {
    if (autoPlay) {
      play(audioUrl);
    }
  }, [audioUrl, autoPlay, play]);

  const handlePlayPause = () => {
    if (error) {
      // Retry on error
      play(audioUrl);
    } else if (isPlaying) {
      pause();
    } else {
      play(audioUrl);
    }
  };

  const handleStop = () => {
    stop();
  };

  const handleReplay = () => {
    replay();
  };

  const handleToggleLoop = () => {
    toggleLoop();
  };

  return (
    <View style={styles.container}>
      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#10B981" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      )}

      {/* Error message */}
      {error && !isLoading && (
        <Text style={styles.errorText}>⚠️ {error}</Text>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {/* Play/Pause button */}
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handlePlayPause}
          disabled={isLoading}
        >
          <Text style={styles.buttonIcon}>
            {isLoading ? '⏳' : isPlaying ? '⏸' : '▶'}
          </Text>
        </TouchableOpacity>

        {/* Stop button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleStop}
          disabled={isLoading}
        >
          <Text style={styles.buttonIcon}>⏹</Text>
        </TouchableOpacity>

        {/* Replay button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleReplay}
          disabled={isLoading}
        >
          <Text style={styles.buttonIcon}>🔄</Text>
        </TouchableOpacity>

        {/* Loop toggle button */}
        <TouchableOpacity
          style={[styles.button, isLooping && styles.activeButton]}
          onPress={handleToggleLoop}
          disabled={isLoading}
        >
          <Text style={styles.buttonIcon}>🔁</Text>
        </TouchableOpacity>
      </View>

      {/* Loop indicator */}
      {isLooping && (
        <Text style={styles.loopIndicator}>Répétition activée</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
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
    color: '#94A3B8',
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
  primaryButton: {
    backgroundColor: '#10B981',
  },
  activeButton: {
    backgroundColor: '#10B981',
  },
  buttonIcon: {
    fontSize: 20,
  },
  loopIndicator: {
    color: '#10B981',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
});
