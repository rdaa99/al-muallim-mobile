import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useUserStore } from '../stores/userStore';
import { useTheme } from '../context/ThemeContext';
import Slider from '@react-native-community/slider';
import type { Surah } from '../types';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

// Default surah for initial load
const DEFAULT_SURAH: Surah = {
  number: 1,
  name: 'الفاتحة',
  englishName: 'Al-Fatiha',
  ayahsCount: 7,
  revelationType: 'Meccan',
};

export const AudioPlayerScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { settings } = useUserStore();

  const {
    isPlaying,
    isLoading,
    isLooping,
    error: audioError,
    duration,
    currentTime,
    play,
    pause,
    stop,
    replay,
    toggleLoop,
    seek,
  } = useAudioPlayer();

  const [currentSurah] = useState<Surah>(DEFAULT_SURAH);
  const [currentAyah, setCurrentAyah] = useState(1);
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);
  const [showText, setShowText] = useState(false);
  const [playbackSpeed, setPlaybackSpeedLocal] = useState(1);

  // Build audio URL
  const getAudioUrl = useCallback((surahNum: number, ayahNum: number) => {
    const paddedSurah = String(surahNum).padStart(3, '0');
    const paddedAyah = String(ayahNum).padStart(3, '0');
    return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${paddedSurah}${paddedAyah}.mp3`;
  }, []);

  // Auto-advance when track finishes
  const hasAdvancedRef = useRef(false);
  useEffect(() => {
    if (isPlaying && duration > 0 && currentTime >= duration - 0.5) {
      if (hasAdvancedRef.current) {return;}
      hasAdvancedRef.current = true;

      if (isLooping) {
        replay();
      } else if (currentAyah < currentSurah.ayahsCount) {
        handleNextAyah();
      } else {
        stop();
      }
    } else if (currentTime < duration - 1) {
      hasAdvancedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime, duration, isPlaying, isLooping, currentSurah, currentAyah]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      const url = getAudioUrl(currentSurah.number, currentAyah);
      play(url);
    }
  };

  const handleNextAyah = () => {
    if (currentAyah < currentSurah.ayahsCount) {
      const nextAyah = currentAyah + 1;
      setCurrentAyah(nextAyah);
      const url = getAudioUrl(currentSurah.number, nextAyah);
      play(url);
    }
  };

  const handlePreviousAyah = () => {
    if (currentAyah > 1) {
      const prevAyah = currentAyah - 1;
      setCurrentAyah(prevAyah);
      const url = getAudioUrl(currentSurah.number, prevAyah);
      play(url);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeedLocal(speed);
    setShowSpeedOptions(false);
  };

  const handleRepeat = () => {
    toggleLoop();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.scrollContent, isSmallScreen && { paddingBottom: 100 }]}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack} accessibilityLabel={t('audio.back')} accessibilityRole="button">
              <Text style={[styles.backIcon, { color: colors.primary }]}>←</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]} accessibilityRole="header">
              {t('audio.title')}
            </Text>
            <View style={styles.placeholder} />
          </View>

          {/* Surah Info */}
          <View style={[styles.surahInfo, isSmallScreen && { paddingVertical: 20 }]}>
            <Text style={[styles.surahNumber, { color: colors.textSecondary }]}>
              {`${t('audio.surah', 'Sourate')} ${currentSurah.number}`}
            </Text>
            <Text style={[styles.surahName, { color: colors.text }]}>
              {currentSurah.name}
            </Text>
            <Text style={[styles.surahEnglish, { color: colors.textSecondary }]}>
              {currentSurah.englishName}
            </Text>
            <Text style={[styles.ayahInfo, { color: colors.textSecondary }]}>
              {t('audio.verse')} {currentAyah} / {currentSurah.ayahsCount}
            </Text>
          </View>

          {/* Reciter Info */}
          <View style={styles.reciterInfo}>
            <Text style={[styles.reciterLabel, { color: colors.textSecondary }]}>{t('audio.reciter')}</Text>
            <Text style={[styles.reciterName, { color: colors.textSecondary }]}>
              {settings?.language === 'ar' ? (settings?.reciter?.name || 'عبد الباسط') : (settings?.reciter?.englishName || 'Abdul Basit')}
            </Text>
          </View>

          {/* Error */}
          {audioError && (
            <Text style={styles.errorText}>⚠️ {audioError}</Text>
          )}

          {/* Progress */}
          <View style={styles.progressContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration || 1}
              value={currentTime}
              onValueChange={seek}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <View style={styles.timeInfo}>
              <Text style={[styles.timeText, { color: colors.textSecondary }]}>{formatTime(currentTime)}</Text>
              <Text style={[styles.timeText, { color: colors.textSecondary }]}>{formatTime(duration)}</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handlePreviousAyah}
              disabled={currentAyah <= 1}
              accessibilityLabel={t('audio.previous')}
              accessibilityRole="button"
            >
              <Text style={[styles.controlIcon, currentAyah <= 1 && styles.disabledIcon]}>⏮</Text>
              <Text style={[styles.controlLabel, { color: colors.textSecondary }, currentAyah <= 1 && styles.disabledIcon]}>{t('audio.previous')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.playButton, { backgroundColor: colors.primary }]}
              onPress={handlePlayPause}
              accessibilityLabel={isPlaying ? t('audio.pause') : t('audio.play')}
              accessibilityRole="button"
            >
              <Text style={styles.playIcon}>{isLoading ? '⏳' : isPlaying ? '⏸' : '▶'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleNextAyah}
              disabled={currentAyah >= currentSurah.ayahsCount}
              accessibilityLabel={t('audio.next')}
              accessibilityRole="button"
            >
              <Text style={[styles.controlIcon, currentAyah >= currentSurah.ayahsCount && styles.disabledIcon]}>⏭</Text>
              <Text style={[styles.controlLabel, { color: colors.textSecondary }, currentAyah >= currentSurah.ayahsCount && styles.disabledIcon]}>{t('audio.next')}</Text>
            </TouchableOpacity>
          </View>

          {/* Speed Control */}
          <View style={styles.speedContainer}>
            <TouchableOpacity
              style={[styles.speedButton, { backgroundColor: colors.surface }]}
              onPress={() => setShowSpeedOptions(!showSpeedOptions)}
              accessibilityLabel={`${t('audio.speed')}: ${playbackSpeed}x`}
              accessibilityRole="button"
            >
              <Text style={[styles.speedLabel, { color: colors.textSecondary }]}>
                {t('audio.speed')}: {playbackSpeed}x
              </Text>
            </TouchableOpacity>

            {showSpeedOptions && (
              <View style={styles.speedOptions}>
                {SPEEDS.map((speed) => (
                  <TouchableOpacity
                    key={speed}
                    style={[
                      styles.speedOption,
                      { backgroundColor: colors.surface },
                      playbackSpeed === speed && { backgroundColor: colors.primary },
                    ]}
                    onPress={() => handleSpeedChange(speed)}
                    accessibilityLabel={`${speed}x`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: playbackSpeed === speed }}
                  >
                    <Text
                      style={[
                        styles.speedOptionText,
                        { color: colors.textSecondary },
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
              style={[styles.additionalButton, isLooping && { backgroundColor: colors.primary + '20', borderColor: colors.primary, borderWidth: 2, borderRadius: 8 }]}
              onPress={handleRepeat}
              accessibilityLabel={t('audio.repeat')}
              accessibilityRole="button"
            >
              <Text style={styles.additionalIcon}>🔄</Text>
              <Text style={[styles.additionalLabel, { color: colors.textSecondary }]}>{t('audio.repeat')}</Text>
              {isLooping && <Text style={[styles.activeIndicator, { color: colors.primary }]}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.additionalButton, showText && { backgroundColor: colors.primary + '20', borderColor: colors.primary, borderWidth: 2, borderRadius: 8 }]}
              onPress={() => setShowText(!showText)}
              accessibilityLabel={t('audio.text')}
              accessibilityRole="button"
            >
              <Text style={styles.additionalIcon}>📜</Text>
              <Text style={[styles.additionalLabel, { color: colors.textSecondary }]}>{t('audio.text')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.additionalButton}
              onPress={() => Alert.alert(t('audio.playlist'), t('audio.playlistSoon', 'Fonctionnalité à venir'))}
              accessibilityLabel={t('audio.playlist')}
              accessibilityRole="button"
            >
              <Text style={styles.additionalIcon}>📑</Text>
              <Text style={[styles.additionalLabel, { color: colors.textSecondary }]}>{t('audio.playlist')}</Text>
            </TouchableOpacity>
          </View>

          {/* Text Display */}
          {showText && (
            <View style={[styles.textDisplay, { backgroundColor: colors.surface }]} accessibilityRole="text">
              <Text style={[styles.arabicText, { color: colors.text }]}>
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </Text>
              <Text style={[styles.translationText, { color: colors.textSecondary }]}>
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  placeholder: {
    width: 44,
  },
  surahInfo: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  surahNumber: {
    fontSize: 14,
    marginBottom: 8,
  },
  surahName: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  surahEnglish: {
    fontSize: 20,
    marginBottom: 8,
  },
  ayahInfo: {
    fontSize: 14,
  },
  reciterInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  reciterLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  reciterName: {
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
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
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    borderRadius: 20,
  },
  speedLabel: {
    fontSize: 16,
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
    borderRadius: 16,
  },
  speedOptionText: {
    fontSize: 14,
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
  },
  activeIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 12,
  },
  textDisplay: {
    margin: 20,
    padding: 16,
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
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
