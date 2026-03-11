import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAudioStore } from '../store/audioStore';
import { useUserStore } from '../store/userStore';
import Slider from '@react-native-community/slider';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 360 || height < 600;

export const AudioPlayerScreen: React.FC = () => {
  const navigation = useNavigation();
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
  const [showText, setShowText] = useState(false);
  const [repeatMode, setRepeatMode] = useState(false);

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

  const handleRepeat = () => {
    setRepeatMode(!repeatMode);
    Alert.alert('Répétition', repeatMode ? 'Mode répétition désactivé' : 'Mode répétition activé');
  };

  const handleShowText = () => {
    setShowText(!showText);
  };

  const handlePlaylist = () => {
    Alert.alert('Playlist', 'Fonctionnalité à venir');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack} accessibilityLabel="Retour" accessibilityRole="button">
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle} accessibilityRole="header">Lecteur Audio</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Surah Info */}
          <View style={styles.surahInfo}>
            <Text style={styles.surahNumber} accessibilityLabel={currentSurah ? `Sourate ${currentSurah.number}` : 'Aucune sourate'}>
              {currentSurah ? `Sourate ${currentSurah.number}` : 'Aucune sourate'}
            </Text>
            <Text style={styles.surahName} accessibilityLabel={currentSurah?.englishName || 'Sélectionnez une sourate'}>
              {currentSurah?.name || '١'}
            </Text>
            <Text style={styles.surahEnglish}>
              {currentSurah?.englishName || 'Sélectionnez une sourate'}
            </Text>
            {currentSurah && (
              <Text style={styles.ayahInfo} accessibilityLabel={`Verset ${currentAyah} sur ${currentSurah.ayahsCount}`}>
                Verset {currentAyah} / {currentSurah.ayahsCount}
              </Text>
            )}
          </View>

          {/* Reciter Info */}
          <View style={styles.reciterInfo}>
            <Text style={styles.reciterLabel}>Récitateur</Text>
            <Text style={styles.reciterName}>{settings.reciter?.englishName || 'Abdul Basit'}</Text>
          </View>

          {/* Progress */}
          <View style={styles.progressContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={position}
              onValueChange={seek}
              minimumTrackTintColor="#2196F3"
              maximumTrackTintColor="#ccc"
              thumbTintColor="#2196F3"
            />
            <View style={styles.timeInfo}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={previousAyah}
              disabled={!currentSurah || currentAyah <= 1}
              accessibilityLabel="Verset précédent"
              accessibilityRole="button"
            >
              <Text style={[styles.controlIcon, (!currentSurah || currentAyah <= 1) && styles.disabledIcon]}>⏮</Text>
              <Text style={[styles.controlLabel, (!currentSurah || currentAyah <= 1) && styles.disabledIcon]}>Précédent</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.playButton, !currentSurah && styles.disabledButton]}
              onPress={handlePlayPause}
              accessibilityLabel={isPlaying ? 'Pause' : 'Lecture'}
              accessibilityRole="button"
            >
              <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={nextAyah}
              disabled={!currentSurah || (currentSurah && currentAyah >= currentSurah.ayahsCount)}
              accessibilityLabel="Verset suivant"
              accessibilityRole="button"
            >
              <Text style={[styles.controlIcon, (!currentSurah || (currentSurah && currentAyah >= currentSurah.ayahsCount)) && styles.disabledIcon]}>⏭</Text>
              <Text style={[styles.controlLabel, (!currentSurah || (currentSurah && currentAyah >= currentSurah.ayahsCount)) && styles.disabledIcon]}>Suivant</Text>
            </TouchableOpacity>
          </View>

          {/* Speed Control */}
          <View style={styles.speedContainer}>
            <TouchableOpacity
              style={styles.speedButton}
              onPress={() => setShowSpeedOptions(!showSpeedOptions)}
              accessibilityLabel={`Vitesse: ${playbackSpeed}x`}
              accessibilityRole="button"
            >
              <Text style={styles.speedLabel}>Vitesse: {playbackSpeed}x</Text>
            </TouchableOpacity>

            {showSpeedOptions && (
              <View style={styles.speedOptions} accessibilityRole="list">
                {SPEEDS.map((speed) => (
                  <TouchableOpacity
                    key={speed}
                    style={[
                      styles.speedOption,
                      playbackSpeed === speed && styles.speedOptionActive,
                    ]}
                    onPress={() => handleSpeedChange(speed)}
                    accessibilityLabel={`${speed}x`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: playbackSpeed === speed }}
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
            <TouchableOpacity
              style={[styles.additionalButton, repeatMode && styles.activeButton]}
              onPress={handleRepeat}
              accessibilityLabel="Mode répétition"
              accessibilityRole="button"
              accessibilityState={{ expanded: repeatMode }}
            >
              <Text style={styles.additionalIcon}>🔄</Text>
              <Text style={styles.additionalLabel}>Répéter</Text>
              {repeatMode && <Text style={styles.activeIndicator}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.additionalButton, showText && styles.activeButton]}
              onPress={handleShowText}
              accessibilityLabel="Afficher le texte"
              accessibilityRole="button"
              accessibilityState={{ expanded: showText }}
            >
              <Text style={styles.additionalIcon}>📜</Text>
              <Text style={styles.additionalLabel}>Texte</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.additionalButton}
              onPress={handlePlaylist}
              accessibilityLabel="Playlist"
              accessibilityRole="button"
            >
              <Text style={styles.additionalIcon}>📑</Text>
              <Text style={styles.additionalLabel}>Playlist</Text>
            </TouchableOpacity>
          </View>

          {/* Text Display */}
          {showText && currentSurah && (
            <View style={styles.textDisplay} accessibilityRole="text">
              <Text style={styles.arabicText}>
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </Text>
              <Text style={styles.translationText}>
                Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: isSmallScreen ? 100 : 20,
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
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#2196F3',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 44,
  },
  surahInfo: {
    alignItems: 'center',
    paddingVertical: isSmallScreen ? 20 : 40,
  },
  surahNumber: {
    fontSize: 14,
    color: '#757575',
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
    color: '#757575',
  },
  reciterInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  reciterLabel: {
    fontSize: 12,
    color: '#757575',
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
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    color: '#757575',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 32,
  },
  controlButton: {
    alignItems: 'center',
    padding: 12,
    minWidth: 44,
    minHeight: 44,
  },
  controlIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  disabledIcon: {
    opacity: 0.3,
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
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  playIcon: {
    fontSize: 32,
    color: '#fff',
  },
  speedContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  speedButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  speedLabel: {
    fontSize: 16,
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
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
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
    minWidth: 44,
    minHeight: 44,
    position: 'relative',
  },
  additionalIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  additionalLabel: {
    fontSize: 12,
    color: '#666',
  },
  activeButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  activeIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 12,
    color: '#2196F3',
  },
  textDisplay: {
    margin: 20,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    alignItems: 'center',
  },
  arabicText: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 12,
    writingDirection: 'rtl',
  },
  translationText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
