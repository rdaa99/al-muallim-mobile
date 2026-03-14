import create from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DailyPlan {
  date: string; // YYYY-MM-DD
  newVersesGoal: number;
  reviewVersesGoal: number;
  newVersesDone: number;
  reviewVersesDone: number;
  completedAt?: string;
}

interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakFreezeUsed: number; // 0-1 per week
}

interface PlanningState {
  // Settings
  dailyNewVersesGoal: number;
  dailyReviewVersesGoal: number;
  dailyMinutesGoal: number;
  reminderTime: string; // HH:MM
  remindersEnabled: boolean;

  // Data
  todayPlan: DailyPlan | null;
  streak: Streak;

  // Actions
  setDailyGoals: (newVerses: number, reviewVerses: number, minutes: number) => void;
  setReminderTime: (time: string) => void;
  toggleReminders: () => void;

  updateTodayProgress: (newVerses: number, reviewVerses: number) => void;
  completeTodaySession: () => void;

  incrementStreak: () => void;
  resetStreak: () => void;
  useStreakFreeze: () => void;

  loadTodayPlan: () => void;
}

const getTodayDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD
};

export const usePlanningStore = create<PlanningState>()(
  persist(
    (set, get) => ({
      // Default settings
      dailyNewVersesGoal: 10,
      dailyReviewVersesGoal: 20,
      dailyMinutesGoal: 30,
      reminderTime: '09:00',
      remindersEnabled: true,

      // Initial data
      todayPlan: null,
      streak: {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        streakFreezeUsed: 0,
      },

      // Settings actions
      setDailyGoals: (newVerses, reviewVerses, minutes) =>
        set({
          dailyNewVersesGoal: newVerses,
          dailyReviewVersesGoal: reviewVerses,
          dailyMinutesGoal: minutes,
        }),

      setReminderTime: (time) => set({ reminderTime: time }),

      toggleReminders: () => set((state) => ({ remindersEnabled: !state.remindersEnabled })),

      // Progress actions
      updateTodayProgress: (newVerses, reviewVerses) => {
        const today = getTodayDate();
        set((state) => ({
          todayPlan: {
            date: today,
            newVersesGoal: state.dailyNewVersesGoal,
            reviewVersesGoal: state.dailyReviewVersesGoal,
            newVersesDone: newVerses,
            reviewVersesDone: reviewVerses,
          },
        }));
      },

      completeTodaySession: () => {
        const today = getTodayDate();
        set((state) => ({
          todayPlan: state.todayPlan
            ? { ...state.todayPlan, completedAt: new Date().toISOString() }
            : null,
        }));
        get().incrementStreak();
      },

      // Streak actions
      incrementStreak: () => {
        const today = getTodayDate();
        set((state) => {
          const { streak } = state;
          const lastDate = streak.lastActivityDate;

          // Check if already incremented today
          if (lastDate === today) {
            return state;
          }

          // Check if streak should continue (yesterday)
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          const shouldContinue = lastDate === yesterdayStr;
          const newStreak = shouldContinue ? streak.currentStreak + 1 : 1;

          return {
            streak: {
              ...streak,
              currentStreak: newStreak,
              longestStreak: Math.max(newStreak, streak.longestStreak),
              lastActivityDate: today,
            },
          };
        });
      },

      resetStreak: () =>
        set((state) => ({
          streak: {
            ...state.streak,
            currentStreak: 0,
          },
        })),

      useStreakFreeze: () =>
        set((state) => ({
          streak: {
            ...state.streak,
            streakFreezeUsed: state.streak.streakFreezeUsed + 1,
          },
        })),

      loadTodayPlan: () => {
        const today = getTodayDate();
        set((state) => {
          // Create new plan for today if doesn't exist
          if (!state.todayPlan || state.todayPlan.date !== today) {
            return {
              todayPlan: {
                date: today,
                newVersesGoal: state.dailyNewVersesGoal,
                reviewVersesGoal: state.dailyReviewVersesGoal,
                newVersesDone: 0,
                reviewVersesDone: 0,
              },
            };
          }
          return state;
        });
      },
    }),
    {
      name: 'planning-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
