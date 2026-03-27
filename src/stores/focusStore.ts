import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Verse, QualityScore } from '@/types';

// Timer configuration
export type FocusDuration = 15 | 25 | 30 | 45 | 60;
export type BreakDuration = 5 | 10 | 15;

export interface FocusConfig {
  focusDuration: FocusDuration; // in minutes
  breakDuration: BreakDuration; // in minutes
  autoStartBreak: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  zenMode: boolean; // Hide distractions
}

export type FocusPhase = 'idle' | 'focus' | 'break' | 'paused' | 'completed';

export interface FocusSession {
  id: string;
  startedAt: string;
  endedAt?: string;
  duration: number; // actual duration in seconds
  versesReviewed: number;
  qualityScores: QualityScore[];
  avgQuality: number;
  focusDuration: FocusDuration;
  breakDuration: BreakDuration;
  completedPomodoros: number;
}

interface FocusState {
  // Timer state
  phase: FocusPhase;
  timeRemaining: number; // in seconds
  totalTime: number; // total time for current phase in seconds

  // Configuration
  config: FocusConfig;

  // Session tracking
  currentSession: FocusSession | null;
  sessionHistory: FocusSession[];
  completedPomodoros: number;

  // Current verse for review during focus
  currentVerse: Verse | null;
  versesReviewed: number;
  qualityScores: QualityScore[];

  // Timer reference (for cleanup)
  timerInterval: NodeJS.Timeout | null;

  // Actions
  setConfig: (config: Partial<FocusConfig>) => void;
  startFocus: (verse?: Verse) => void;
  startBreak: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
  tick: () => void;

  // Verse tracking during focus
  setCurrentVerse: (verse: Verse | null) => void;
  recordQuality: (quality: QualityScore) => void;

  // Session management
  endSession: () => FocusSession | null;
  getStats: () => {
    totalFocusTime: number;
    totalVerses: number;
    avgQuality: number;
    totalPomodoros: number;
  };
}

const DEFAULT_CONFIG: FocusConfig = {
  focusDuration: 25,
  breakDuration: 5,
  autoStartBreak: false,
  soundEnabled: true,
  vibrationEnabled: true,
  zenMode: false,
};

// Helper to generate unique session ID
const generateSessionId = (): string => {
  return `focus_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Helper to calculate average quality
const calculateAvgQuality = (scores: QualityScore[]): number => {
  if (scores.length === 0) {return 0;}
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return Math.round((sum / scores.length) * 10) / 10;
};

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      // Initial state
      phase: 'idle',
      timeRemaining: DEFAULT_CONFIG.focusDuration * 60,
      totalTime: DEFAULT_CONFIG.focusDuration * 60,
      config: DEFAULT_CONFIG,
      currentSession: null,
      sessionHistory: [],
      completedPomodoros: 0,
      currentVerse: null,
      versesReviewed: 0,
      qualityScores: [],
      timerInterval: null,

      // Configuration
      setConfig: (newConfig) => {
        const config = { ...get().config, ...newConfig };
        set({ config });

        // Update timer if duration changed and timer is idle
        if (get().phase === 'idle' && newConfig.focusDuration) {
          set({
            timeRemaining: newConfig.focusDuration * 60,
            totalTime: newConfig.focusDuration * 60,
          });
        }
      },

      // Start focus phase
      startFocus: (verse) => {
        const { config, timerInterval } = get();

        // Clear existing timer
        if (timerInterval) {
          clearInterval(timerInterval);
        }

        const totalTime = config.focusDuration * 60;
        const session: FocusSession = {
          id: generateSessionId(),
          startedAt: new Date().toISOString(),
          duration: 0,
          versesReviewed: 0,
          qualityScores: [],
          avgQuality: 0,
          focusDuration: config.focusDuration,
          breakDuration: config.breakDuration,
          completedPomodoros: 0,
        };

        set({
          phase: 'focus',
          timeRemaining: totalTime,
          totalTime,
          currentSession: session,
          currentVerse: verse || null,
          versesReviewed: 0,
          qualityScores: [],
          timerInterval: null,
        });
      },

      // Start break phase
      startBreak: () => {
        const { config, timerInterval, completedPomodoros, currentSession } = get();

        // Clear existing timer
        if (timerInterval) {
          clearInterval(timerInterval);
        }

        const totalTime = config.breakDuration * 60;
        const updatedSession = currentSession ? {
          ...currentSession,
          completedPomodoros: completedPomodoros + 1,
        } : null;

        set({
          phase: 'break',
          timeRemaining: totalTime,
          totalTime,
          completedPomodoros: completedPomodoros + 1,
          currentSession: updatedSession,
          timerInterval: null,
        });
      },

      // Pause timer
      pause: () => {
        const { phase, timerInterval } = get();
        if (phase === 'focus' || phase === 'break') {
          if (timerInterval) {
            clearInterval(timerInterval);
          }
          set({ phase: 'paused', timerInterval: null });
        }
      },

      // Resume timer
      resume: () => {
        const { phase } = get();
        if (phase === 'paused') {
          // The previous phase (focus or break) is stored in totalTime
          const prevPhase = get().totalTime === get().config.focusDuration * 60 ? 'focus' : 'break';
          set({ phase: prevPhase === 'focus' && get().timeRemaining < get().totalTime ? 'focus' : 'break' });

          // Determine the correct phase based on remaining time
          const wasFocus = get().totalTime === get().config.focusDuration * 60;
          set({ phase: wasFocus ? 'focus' : 'break' });
        }
      },

      // Reset timer to initial state
      reset: () => {
        const { config, timerInterval, currentSession } = get();

        if (timerInterval) {
          clearInterval(timerInterval);
        }

        // Save session if it was started
        if (currentSession && get().versesReviewed > 0) {
          const completedSession: FocusSession = {
            ...currentSession,
            endedAt: new Date().toISOString(),
            duration: currentSession.duration,
            versesReviewed: get().versesReviewed,
            qualityScores: get().qualityScores,
            avgQuality: calculateAvgQuality(get().qualityScores),
          };

          set((state) => ({
            sessionHistory: [completedSession, ...state.sessionHistory].slice(0, 100), // Keep last 100 sessions
          }));
        }

        set({
          phase: 'idle',
          timeRemaining: config.focusDuration * 60,
          totalTime: config.focusDuration * 60,
          currentSession: null,
          currentVerse: null,
          versesReviewed: 0,
          qualityScores: [],
          timerInterval: null,
        });
      },

      // Skip current phase
      skip: () => {
        const { phase, config } = get();

        if (phase === 'focus') {
          // Skip to break
          get().startBreak();
        } else if (phase === 'break') {
          // Skip break, go to idle or start next focus
          set({
            phase: 'idle',
            timeRemaining: config.focusDuration * 60,
            totalTime: config.focusDuration * 60,
          });
        }
      },

      // Timer tick - called every second
      tick: () => {
        const { timeRemaining, phase, currentSession, config } = get();

        if (timeRemaining <= 1) {
          // Timer completed
          if (phase === 'focus') {
            // Focus phase complete - play sound, vibrate, then start break
            if (config.soundEnabled) {
              // Sound will be handled by the component
            }
            if (config.vibrationEnabled) {
              // Vibration will be handled by the component
            }

            // Update session duration
            const updatedSession = currentSession ? {
              ...currentSession,
              duration: currentSession.duration + (config.focusDuration * 60 - timeRemaining),
            } : null;

            set({
              phase: 'completed',
              currentSession: updatedSession,
            });

            // Auto-start break if configured
            if (config.autoStartBreak) {
              setTimeout(() => get().startBreak(), 1000);
            }
          } else if (phase === 'break') {
            // Break complete
            set({
              phase: 'idle',
              timeRemaining: config.focusDuration * 60,
              totalTime: config.focusDuration * 60,
            });
          }
        } else {
          // Decrement timer
          const newTimeRemaining = timeRemaining - 1;

          // Update session duration
          const updatedSession = currentSession ? {
            ...currentSession,
            duration: currentSession.duration + 1,
          } : null;

          set({
            timeRemaining: newTimeRemaining,
            currentSession: updatedSession,
          });
        }
      },

      // Set current verse for review
      setCurrentVerse: (verse) => {
        set({ currentVerse: verse });
      },

      // Record quality score for current verse
      recordQuality: (quality) => {
        set((state) => ({
          qualityScores: [...state.qualityScores, quality],
          versesReviewed: state.versesReviewed + 1,
        }));
      },

      // End current session
      endSession: () => {
        const { currentSession, versesReviewed, qualityScores, timerInterval, config } = get();

        if (timerInterval) {
          clearInterval(timerInterval);
        }

        if (!currentSession) {return null;}

        const completedSession: FocusSession = {
          ...currentSession,
          endedAt: new Date().toISOString(),
          duration: currentSession.duration,
          versesReviewed,
          qualityScores,
          avgQuality: calculateAvgQuality(qualityScores),
          completedPomodoros: get().completedPomodoros,
        };

        set((state) => ({
          sessionHistory: [completedSession, ...state.sessionHistory].slice(0, 100),
          phase: 'idle',
          timeRemaining: config.focusDuration * 60,
          totalTime: config.focusDuration * 60,
          currentSession: null,
          currentVerse: null,
          versesReviewed: 0,
          qualityScores: [],
          timerInterval: null,
        }));

        return completedSession;
      },

      // Get session statistics
      getStats: () => {
        const { sessionHistory } = get();

        if (sessionHistory.length === 0) {
          return {
            totalFocusTime: 0,
            totalVerses: 0,
            avgQuality: 0,
            totalPomodoros: 0,
          };
        }

        const totalFocusTime = sessionHistory.reduce((acc, s) => acc + s.duration, 0);
        const totalVerses = sessionHistory.reduce((acc, s) => acc + s.versesReviewed, 0);
        const totalPomodoros = sessionHistory.reduce((acc, s) => acc + s.completedPomodoros, 0);
        const allScores = sessionHistory.flatMap((s) => s.qualityScores);
        const avgQuality = calculateAvgQuality(allScores);

        return {
          totalFocusTime,
          totalVerses,
          avgQuality,
          totalPomodoros,
        };
      },
    }),
    {
      name: 'focus-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        config: state.config,
        sessionHistory: state.sessionHistory,
        completedPomodoros: state.completedPomodoros,
      }),
    }
  )
);

// Selectors for common queries
export const selectIsTimerRunning = (state: FocusState): boolean =>
  state.phase === 'focus' || state.phase === 'break';

export const selectIsPaused = (state: FocusState): boolean =>
  state.phase === 'paused';

export const selectProgress = (state: FocusState): number => {
  if (state.totalTime === 0) {return 0;}
  return ((state.totalTime - state.timeRemaining) / state.totalTime) * 100;
};

export const selectFormattedTime = (state: FocusState): string => {
  const minutes = Math.floor(state.timeRemaining / 60);
  const seconds = state.timeRemaining % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
