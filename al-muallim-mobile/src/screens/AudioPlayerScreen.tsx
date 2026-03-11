import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useAudioStore } from '../store/audioStore';
import { useUserStore } from '../store/userStore';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');

export const AudioPlayerScreen: React.FC = () => {
  const {
    isPlaying,
    currentSurah,
    currentAyah,
    duration,
    position,
    playbackSpeed,
    play,
    pause,
    resume,
    seek,
    setPlaybackSpeed,
    nextAyah,
    previousAyah,
  } = useAudioStore();

  const { settings } = useUserStore();
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);

  const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      if (currentSurah) {
        resume();
      } else {
        // Demo: Play a sample surah
        play({
          number: 1,
          name: 'الفاتحة',
          englishName: 'Al-Fatiha',
          ayahsCount: 7,
          revelationType: 'Meccan',
        });
      }
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedOptions(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lecteur Audio</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Surah Info */}
        <View style={styles.surahInfo}>
          <Text style={styles.surahNumber}>
            {currentSurah ? `Sourate ${currentSurah.number}` : 'Aucune sourate'}
          </Text>
          <Text style={styles.surahName}>
            {currentSurah?.name || '١'}
          </Text>
          <Text style={styles.surahEnglish}>
            {currentSurah?.englishName || 'Sélectionnez une sourate'}
          </Text>
          {currentSurah && (
            <Text style={styles.ayahInfo}>
              Verset {currentAyah} / {currentSurah.ayahsCount}
            </Text>
          )}
        </View>

        {/* Reciter Info */}
        <View style={styles.reciterInfo}>
          <Text style={styles.reciterLabel}>Récitateur</Text>
          <Text style={styles.reciterName}>{settings.reciter.name}</Text>
        </View>

        {/* Progress Slider */}
        <View style={styles.progressContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration || 1}
            value={position}
            onValueChange={seek}
            minimumTrackTintColor="#2196F3"
            maximumTrackTintColor="#e0e0e0"
            thumbTintColor="#2196F3"
          />
          <View style={styles.timeLabels}>
            <Text style={styles.timeLabel}>{formatTime(position)}</Text>
            <Text style={styles.timeLabel}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={previousAyah}
            disabled={!currentSurah}
          >
            <Text style={styles.controlIcon}>⏮</Text>
            <Text style={styles.controlLabel}>Précédent</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.playButton, !currentSurah && styles.disabledButton]}
            onPress={handlePlayPause}
          >
            <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={nextAyah}
            disabled={!currentSurah || (currentSurah && currentAyah >= currentSurah.ayahsCount)}
          >
            <Text style={styles.controlIcon}>⏭</Text>
            <Text style={styles.controlLabel}>Suivant</Text>
          </TouchableOpacity>
        </View>

        {/* Speed Control */}
        <View style={styles.speedContainer}>
          <TouchableOpacity
            style={styles.speedButton}
            onPress={() => setShowSpeedOptions(!showSpeedOptions)}
          >
            <Text style={styles.speedLabel}>Vitesse: {playbackSpeed}x</Text>
          </TouchableOpacity>

          {showSpeedOptions && (
            <View style={styles.speedOptions}>
              {SPEEDS.map((speed) => (
                <TouchableOpacity
                  key={speed}
                  style={[
                    styles.speedOption,
                    playbackSpeed === speed && styles.speedOptionActive,
                  ]}
                  onPress={() => handleSpeedChange(speed)}
                >
                  <Text
                    style={[
                      styles.speedOptionText,
                      playbackSpeed === speed && styles.speedOptionTextActive,
                    ]}
                  >
                    {speed}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Additional Controls */}
        <View style={styles.additionalControls}>
          <TouchableOpacity style={styles.additionalButton}>
            <Text style={styles.additionalIcon}>🔄</Text>
            <Text style={styles.additionalLabel}>Répéter</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.additionalButton}>
            <Text style={styles.additionalIcon}>📜</Text>
            <Text style={styles.additionalLabel}>Texte</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.additionalButton}>
            <Text style={styles.additionalIcon}>📑</Text>
            <Text style={styles.additionalLabel}>Playlist</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  surahInfo: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  surahNumber: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  surahName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  surahEnglish: {
    fontSize: 20,
    color: '#666',
    marginBottom: 8,
  },
  ayahInfo: {
    fontSize: 14,
    color: '#999',
  },
  reciterInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  reciterLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  reciterName: {
    fontSize: 16,
    color: '#666',
  },
  progressContainer: {
    marginBottom: 32,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeLabel: {
    fontSize: 12,
    color: '#999',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  controlButton: {
    alignItems: 'center',
    padding: 12,
  },
  controlIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  controlLabel: {
    fontSize: 12,
    color: '#666',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    shadowColor: '#ccc',
  },
  playIcon: {
    fontSize: 36,
    color: '#fff',
    marginLeft: 4,
  },
  speedContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  speedButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  speedLabel: {
    fontSize: 14,
    color: '#666',
  },
  speedOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  speedOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  speedOptionActive: {
    backgroundColor: '#2196F3',
  },
  speedOptionText: {
    fontSize: 14,
    color: '#666',
  },
  speedOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  additionalControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  additionalButton: {
    alignItems: 'center',
    padding: 12,
  },
  additionalIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  additionalLabel: {
    fontSize: 12,
    color: '#666',
  },
});
