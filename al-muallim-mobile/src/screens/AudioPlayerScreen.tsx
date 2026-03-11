import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAudioStore } from '../store/audioStore';
import { useUserStore } from '../store/userStore';
import { useTheme } from '../context/ThemeContext';
import { useFonts } from '../context/FontSizeContext';
import Slider from '@react-native-community/slider';
import { Surah } from '../types';

const SAMPLE_SURAHS: Surah[] = [
  { number: 1, name: 'الفاتحة', englishName: 'Al-Fatiha', ayahsCount: 7, revelationType: 'Meccan' },
  { number: 78, name: 'النبأ', englishName: 'An-Naba', ayahsCount: 40, revelationType: 'Meccan' },
  { number: 79, name: 'النازعات', englishName: 'An-Naziat', ayahsCount: 46, revelationType: 'Meccan' },
  { number: 80, name: 'عبس', englishName: 'Abasa', ayahsCount: 42, revelationType: 'Meccan' },
  { number: 81, name: 'التكوير', englishName: 'At-Takwir', ayahsCount: 29, revelationType: 'Meccan' },
  { number: 82, name: 'الانفطار', englishName: 'Al-Infitar', ayahsCount: 19, revelationType: 'Meccan' },
  { number: 83, name: 'المطففين', englishName: 'Al-Mutaffifin', ayahsCount: 36, revelationType: 'Meccan' },
  { number: 84, name: 'الانشقاق', englishName: 'Al-Inshiqaq', ayahsCount: 25, revelationType: 'Meccan' },
  { number: 85, name: 'البروج', englishName: 'Al-Buruj', ayahsCount: 22, revelationType: 'Meccan' },
  { number: 86, name: 'الطارق', englishName: 'At-Tariq', ayahsCount: 17, revelationType: 'Meccan' },
  { number: 87, name: 'الأعلى', englishName: 'Al-Ala', ayahsCount: 19, revelationType: 'Meccan' },
  { number: 88, name: 'الغاشية', englishName: 'Al-Ghashiyah', ayahsCount: 26, revelationType: 'Meccan' },
  { number: 112, name: 'الإخلاص', englishName: 'Al-Ikhlas', ayahsCount: 4, revelationType: 'Meccan' },
  { number: 113, name: 'الفلق', englishName: 'Al-Falaq', ayahsCount: 5, revelationType: 'Meccan' },
  { number: 114, name: 'الناس', englishName: 'An-Nas', ayahsCount: 6, revelationType: 'Meccan' },
];

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
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { fonts } = useFonts();
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);
  const [isRepeatOn, setIsRepeatOn] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

  // Simulate audio progress
  useEffect(() => {
    if (isPlaying && currentSurah) {
      const simulatedDuration = 30; // 30 seconds per ayah
      if (duration === 0) {
        useAudioStore.setState({ duration: simulatedDuration });
      }
      timerRef.current = setInterval(() => {
        useAudioStore.setState((state) => {
          const newPosition = state.position + 0.5 * state.playbackSpeed;
          if (newPosition >= state.duration) {
            if (isRepeatOn) {
              return { position: 0 };
            }
            return { position: state.duration, isPlaying: false };
          }
          return { position: newPosition };
        });
      }, 500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentSurah, isRepeatOn]);

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
        play(SAMPLE_SURAHS[0]);
        useAudioStore.setState({ duration: 30, position: 0 });
      }
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedOptions(false);
  };

  const handleSurahSelect = (surah: Surah) => {
    play(surah);
    useAudioStore.setState({ duration: 30, position: 0 });
    setShowPlaylist(false);
  };

  const handleSeek = (value: number) => {
    seek(value);
  };

  if (showPlaylist) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => setShowPlaylist(false)}>
              <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text, fontSize: fonts.heading }]}>
              {t('audio.selectFromList')}
            </Text>
            <View style={styles.placeholder} />
          </View>
          <FlatList
            data={SAMPLE_SURAHS}
            keyExtractor={(item) => item.number.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.surahItem,
                  { borderBottomColor: colors.border },
                  currentSurah?.number === item.number && { backgroundColor: colors.primary + '20' },
                ]}
                onPress={() => handleSurahSelect(item)}
              >
                <View style={[styles.surahNumberBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.surahNumberText, { color: colors.primary, fontSize: fonts.body }]}>
                    {item.number}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[{ color: colors.text, fontSize: fonts.subheading, fontWeight: '600' }]}>
                    {item.name}
                  </Text>
                  <Text style={[{ color: colors.textSecondary, fontSize: fonts.caption }]}>
                    {item.englishName} - {item.ayahsCount} {t('dashboard.verses')}
                  </Text>
                </View>
                {currentSurah?.number === item.number && (
                  <Text style={{ color: colors.primary, fontSize: 18 }}>▶</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text, fontSize: fonts.heading }]}>
            {t('audio.title')}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Surah Info */}
        <View style={styles.surahInfo}>
          <Text style={[styles.surahNumber, { color: colors.textSecondary, fontSize: fonts.body }]}>
            {currentSurah ? `${t('audio.surah')} ${currentSurah.number}` : t('audio.noSurah')}
          </Text>
          <Text style={[styles.surahName, { color: colors.text }]}>
            {currentSurah?.name || '١'}
          </Text>
          <Text style={[styles.surahEnglish, { color: colors.textSecondary, fontSize: fonts.subheading }]}>
            {currentSurah?.englishName || t('audio.selectSurah')}
          </Text>
          {currentSurah && (
            <Text style={[styles.ayahInfo, { color: colors.textSecondary, fontSize: fonts.body }]}>
              {t('audio.verse')} {currentAyah} / {currentSurah.ayahsCount}
            </Text>
          )}
        </View>

        {/* Verse Text Display */}
        {showText && currentSurah && (
          <View style={[styles.verseTextBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.verseText, { color: colors.text }]}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </Text>
          </View>
        )}

        {/* Reciter Info */}
        <View style={styles.reciterInfo}>
          <Text style={[styles.reciterLabel, { color: colors.textSecondary, fontSize: fonts.caption }]}>
            {t('audio.reciter')}
          </Text>
          <Text style={[styles.reciterName, { color: colors.textSecondary, fontSize: fonts.subheading }]}>
            {settings.reciter.name}
          </Text>
        </View>

        {/* Progress Slider */}
        <View style={styles.progressContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration || 1}
            value={position}
            onValueChange={handleSeek}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
          <View style={styles.timeLabels}>
            <Text style={[styles.timeLabel, { color: colors.textSecondary, fontSize: fonts.caption }]}>
              {formatTime(position)}
            </Text>
            <Text style={[styles.timeLabel, { color: colors.textSecondary, fontSize: fonts.caption }]}>
              {formatTime(duration)}
            </Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={previousAyah}
            disabled={!currentSurah}
          >
            <Text style={[styles.controlIcon, { opacity: currentSurah ? 1 : 0.3 }]}>⏮</Text>
            <Text style={[styles.controlLabel, { color: colors.textSecondary, fontSize: fonts.caption }]}>
              {t('audio.previous')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: colors.primary }]}
            onPress={handlePlayPause}
          >
            <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={nextAyah}
            disabled={!currentSurah || (currentSurah && currentAyah >= currentSurah.ayahsCount)}
          >
            <Text style={[styles.controlIcon, { opacity: currentSurah ? 1 : 0.3 }]}>⏭</Text>
            <Text style={[styles.controlLabel, { color: colors.textSecondary, fontSize: fonts.caption }]}>
              {t('audio.next')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Speed Control */}
        <View style={styles.speedContainer}>
          <TouchableOpacity
            style={[styles.speedButton, { backgroundColor: colors.surface }]}
            onPress={() => setShowSpeedOptions(!showSpeedOptions)}
          >
            <Text style={[styles.speedLabel, { color: colors.textSecondary, fontSize: fonts.body }]}>
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
                >
                  <Text
                    style={[
                      styles.speedOptionText,
                      { color: colors.textSecondary },
                      playbackSpeed === speed && { color: '#fff', fontWeight: '600' },
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
            style={[styles.additionalButton, isRepeatOn && { backgroundColor: colors.primary + '20', borderRadius: 12 }]}
            onPress={() => setIsRepeatOn(!isRepeatOn)}
          >
            <Text style={styles.additionalIcon}>🔄</Text>
            <Text style={[
              styles.additionalLabel,
              { color: isRepeatOn ? colors.primary : colors.textSecondary, fontSize: fonts.caption },
              isRepeatOn && { fontWeight: '600' },
            ]}>
              {t('audio.repeat')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.additionalButton, showText && { backgroundColor: colors.primary + '20', borderRadius: 12 }]}
            onPress={() => setShowText(!showText)}
          >
            <Text style={styles.additionalIcon}>📜</Text>
            <Text style={[
              styles.additionalLabel,
              { color: showText ? colors.primary : colors.textSecondary, fontSize: fonts.caption },
              showText && { fontWeight: '600' },
            ]}>
              {t('audio.text')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.additionalButton}
            onPress={() => setShowPlaylist(true)}
          >
            <Text style={styles.additionalIcon}>📑</Text>
            <Text style={[styles.additionalLabel, { color: colors.textSecondary, fontSize: fonts.caption }]}>
              {t('audio.playlist')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  headerTitle: {
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  surahInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  surahNumber: {},
  surahName: {
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 8,
    textAlign: 'center',
  },
  surahEnglish: {
    marginBottom: 4,
  },
  ayahInfo: {},
  verseTextBox: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  verseText: {
    fontSize: 28,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 48,
  },
  reciterInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  reciterLabel: {},
  reciterName: {
    marginTop: 4,
  },
  progressContainer: {
    marginBottom: 24,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeLabel: {},
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  controlButton: {
    alignItems: 'center',
    padding: 12,
  },
  controlIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  controlLabel: {},
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    boxShadow: '0px 4px 8px rgba(16, 185, 129, 0.3)',
    elevation: 6,
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
  },
  speedLabel: {},
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
  },
  speedOptionText: {
    fontSize: 14,
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
  additionalLabel: {},
  surahItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  surahNumberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surahNumberText: {
    fontWeight: '600',
  },
});
