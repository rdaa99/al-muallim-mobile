import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusStore, selectFormattedTime, selectProgress, FocusDuration, BreakDuration } from '@/stores/focusStore';
import { useTheme } from '../context/ThemeContext';
import { useFonts } from '../context/FontSizeContext';
import { useUserStore } from '../stores/userStore';
import { CircularProgressBar } from '../components/CircularProgressBar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const FocusModeScreen: React.FC = () => {
  const {
    phase,
    timeRemaining,
    totalTime,
    config,
    currentVerse,
    versesReviewed,
    completedPomodoros,
    setConfig,
    startFocus,
    startBreak,
    pause,
    resume,
    reset,
    skip,
    tick,
    endSession,
  } = useFocusStore();

  const formattedTime = useFocusStore(selectFormattedTime);
  const progress = useFocusStore(selectProgress);
  const { settings } = useUserStore();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { fonts } = useFonts();
  const isRTL = settings?.language === 'ar';

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (phase === 'focus' || phase === 'break') {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [phase, tick]);

  // Handle session completion
  useEffect(() => {
    if (phase === 'completed') {
      if (config.soundEnabled) {
        // TODO: Play notification sound
      }
      if (config.vibrationEnabled) {
        // TODO: Vibrate device
      }
      
      Alert.alert(
        t('focus.completed'),
        t('focus.completedMessage'),
        [
          { text: t('focus.startBreak'), onPress: startBreak },
          { text: t('common.cancel'), style: 'cancel' },
        ]
      );
    }
  }, [phase, config.soundEnabled, config.vibrationEnabled, t, startBreak]);

  const handleStartFocus = useCallback(() => {
    startFocus();
  }, [startFocus]);

  const handlePauseResume = useCallback(() => {
    if (phase === 'paused') {
      resume();
    } else {
      pause();
    }
  }, [phase, pause, resume]);

  const handleReset = useCallback(() => {
    Alert.alert(
      t('focus.resetTitle'),
      t('focus.resetMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.confirm'), 
          style: 'destructive',
          onPress: reset 
        },
      ]
    );
  }, [reset, t]);

  const handleEndSession = useCallback(() => {
    Alert.alert(
      t('focus.endSessionTitle'),
      t('focus.endSessionMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.confirm'), 
          onPress: () => {
            const session = endSession();
            if (session) {
              Alert.alert(
                t('focus.sessionEnded'),
                t('focus.sessionSummary', {
                  duration: Math.round(session.duration / 60),
                  verses: session.versesReviewed,
                  pomodoros: session.completedPomodoros,
                })
              );
            }
          },
        },
      ]
    );
  }, [endSession, t]);

  const handleDurationChange = useCallback((duration: FocusDuration) => {
    setConfig({ focusDuration: duration });
  }, [setConfig]);

  const handleBreakDurationChange = useCallback((duration: BreakDuration) => {
    setConfig({ breakDuration: duration });
  }, [setConfig]);

  const getPhaseColor = () => {
    switch (phase) {
      case 'focus':
        return colors.primary;
      case 'break':
        return colors.success;
      case 'paused':
        return colors.warning;
      default:
        return colors.border;
    }
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'focus':
        return t('focus.focusPhase');
      case 'break':
        return t('focus.breakPhase');
      case 'paused':
        return t('focus.paused');
      case 'completed':
        return t('focus.completed');
      default:
        return t('focus.ready');
    }
  };

  const durationOptions: FocusDuration[] = [15, 25, 30, 45, 60];
  const breakOptions: BreakDuration[] = [5, 10, 15];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Phase indicator */}
        <View style={styles.header}>
          <Text style={[styles.phaseText, { color: getPhaseColor(), ...fonts.large }]}>
            {getPhaseText()}
          </Text>
          {completedPomodoros > 0 && (
            <Text style={[styles.pomodoroCount, { color: colors.textSecondary, ...fonts.small }]}>
              🍅 {completedPomodoros} {t('focus.pomodoros')}
            </Text>
          )}
        </View>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <CircularProgressBar
            percentage={progress}
            size={SCREEN_WIDTH * 0.6}
            strokeWidth={15}
            color={getPhaseColor()}
            backgroundColor={colors.border}
          />
          <View style={styles.timeTextContainer}>
            <Text style={[styles.timeText, { color: colors.text, ...fonts.title }]}>
              {formattedTime}
            </Text>
            {versesReviewed > 0 && (
              <Text style={[styles.versesText, { color: colors.textSecondary, ...fonts.small }]}>
                {versesReviewed} {t('focus.versesReviewed')}
              </Text>
            )}
          </View>
        </View>

        {/* Current verse (if any) */}
        {currentVerse && phase === 'focus' && (
          <View style={[styles.verseCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.verseArabic, { color: colors.text, ...fonts.large }]}>
              {currentVerse.text_arabic}
            </Text>
            <Text style={[styles.verseReference, { color: colors.textSecondary, ...fonts.tiny }]}>
              {currentVerse.surah_number}:{currentVerse.verse_number}
            </Text>
          </View>
        )}

        {/* Control buttons */}
        <View style={styles.controls}>
          {phase === 'idle' ? (
            <>
              <TouchableOpacity
                style={[styles.mainButton, { backgroundColor: colors.primary }]}
                onPress={handleStartFocus}
              >
                <Text style={[styles.buttonText, { color: colors.white }]}>
                  {t('focus.startFocus')}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.activeControls}>
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: colors.card }]}
                onPress={handleReset}
              >
                <Text style={[styles.controlButtonText, { color: colors.text }]}>
                  {t('focus.reset')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.mainButton, { backgroundColor: getPhaseColor() }]}
                onPress={handlePauseResume}
              >
                <Text style={[styles.buttonText, { color: colors.white }]}>
                  {phase === 'paused' ? t('focus.resume') : t('focus.pause')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: colors.card }]}
                onPress={skip}
              >
                <Text style={[styles.controlButtonText, { color: colors.text }]}>
                  {t('focus.skip')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Duration configuration (only in idle) */}
        {phase === 'idle' && (
          <>
            <View style={styles.configSection}>
              <Text style={[styles.configLabel, { color: colors.text, ...fonts.medium }]}>
                {t('focus.focusDuration')}
              </Text>
              <View style={styles.optionsRow}>
                {durationOptions.map((duration) => (
                  <TouchableOpacity
                    key={duration}
                    style={[
                      styles.optionButton,
                      config.focusDuration === duration && { backgroundColor: colors.primary },
                      { borderColor: colors.border },
                    ]}
                    onPress={() => handleDurationChange(duration)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: config.focusDuration === duration ? colors.white : colors.text },
                      ]}
                    >
                      {duration}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.configSection}>
              <Text style={[styles.configLabel, { color: colors.text, ...fonts.medium }]}>
                {t('focus.breakDuration')}
              </Text>
              <View style={styles.optionsRow}>
                {breakOptions.map((duration) => (
                  <TouchableOpacity
                    key={duration}
                    style={[
                      styles.optionButton,
                      config.breakDuration === duration && { backgroundColor: colors.primary },
                      { borderColor: colors.border },
                    ]}
                    onPress={() => handleBreakDurationChange(duration)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: config.breakDuration === duration ? colors.white : colors.text },
                      ]}
                    >
                      {duration}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {/* End session button (only when active) */}
        {phase !== 'idle' && (
          <TouchableOpacity
            style={[styles.endSessionButton, { borderColor: colors.error }]}
            onPress={handleEndSession}
          >
            <Text style={[styles.endSessionText, { color: colors.error }]}>
              {t('focus.endSession')}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  phaseText: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  pomodoroCount: {
    opacity: 0.7,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  timeTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  timeText: {
    fontWeight: 'bold',
    fontSize: 48,
  },
  versesText: {
    marginTop: 5,
  },
  verseCard: {
    padding: 20,
    borderRadius: 12,
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  verseArabic: {
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 10,
  },
  verseReference: {
    opacity: 0.7,
  },
  controls: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  activeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 10,
  },
  mainButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    minWidth: 150,
    alignItems: 'center',
  },
  controlButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  controlButtonText: {
    fontSize: 14,
  },
  configSection: {
    width: '100%',
    marginBottom: 20,
  },
  configLabel: {
    marginBottom: 10,
    textAlign: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 50,
    alignItems: 'center',
  },
  optionText: {
    fontWeight: '600',
    fontSize: 14,
  },
  endSessionButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 2,
    marginTop: 10,
  },
  endSessionText: {
    fontWeight: '600',
    fontSize: 14,
  },
});
