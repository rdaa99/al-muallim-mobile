import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Goal {
  id: string;
  type: 'daily_verses' | 'weekly_surahs' | 'monthly_juz' | 'streak_days';
  target: number;
  current: number;
  deadline: string;
  achieved: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  requirement: {
    type: 'verses_memorized' | 'streak_days' | 'surahs_completed';
    count: number;
  };
}

interface GoalsState {
  goals: Goal[];
  achievements: Achievement[];
  totalVersesMemorized: number;
  streakDays: number;
  totalSurahsCompleted: number;
  points: number;

  addGoal: (goal: Goal) => void;
  updateGoalProgress: (goalId: string, progress: number) => void;
  checkAchievements: () => Achievement[];
  addPoints: (points: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_verse',
    title: 'First Step',
    description: 'Memorize your first verse',
    icon: '🌟',
    requirement: { type: 'verses_memorized', count: 1 },
  },
  {
    id: 'ten_verses',
    title: 'Getting Started',
    description: 'Memorize 10 verses',
    icon: '📚',
    requirement: { type: 'verses_memorized', count: 10 },
  },
  {
    id: 'fifty_verses',
    title: 'Dedicated Student',
    description: 'Memorize 50 verses',
    icon: '🎯',
    requirement: { type: 'verses_memorized', count: 50 },
  },
  {
    id: 'hundred_verses',
    title: 'Hafiz in Training',
    description: 'Memorize 100 verses',
    icon: '🏅',
    requirement: { type: 'verses_memorized', count: 100 },
  },
  {
    id: 'streak_week',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    requirement: { type: 'streak_days', count: 7 },
  },
  {
    id: 'streak_month',
    title: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: '👑',
    requirement: { type: 'streak_days', count: 30 },
  },
  {
    id: 'first_surah',
    title: 'Surah Complete',
    description: 'Complete your first surah',
    icon: '📖',
    requirement: { type: 'surahs_completed', count: 1 },
  },
  {
    id: 'five_surahs',
    title: 'Building Momentum',
    description: 'Complete 5 surahs',
    icon: '🌠',
    requirement: { type: 'surahs_completed', count: 5 },
  },
];

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set, get) => ({
      goals: [],
      achievements: DEFAULT_ACHIEVEMENTS,
      totalVersesMemorized: 0,
      streakDays: 0,
      totalSurahsCompleted: 0,
      points: 0,

      addGoal: (goal) =>
        set((state) => ({
          goals: [...state.goals, goal],
        })),

      updateGoalProgress: (goalId, progress) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === goalId
              ? {
                  ...goal,
                  current: progress,
                  achieved: progress >= goal.target,
                }
              : goal
          ),
        })),

      checkAchievements: () => {
        const state = get();
        const newAchievements: Achievement[] = [];

        state.achievements.forEach((achievement) => {
          if (!achievement.unlockedAt) {
            const { type, count } = achievement.requirement;
            let shouldUnlock = false;

            if (type === 'verses_memorized' && state.totalVersesMemorized >= count) {
              shouldUnlock = true;
            } else if (type === 'streak_days' && state.streakDays >= count) {
              shouldUnlock = true;
            } else if (type === 'surahs_completed' && state.totalSurahsCompleted >= count) {
              shouldUnlock = true;
            }

            if (shouldUnlock) {
              newAchievements.push({
                ...achievement,
                unlockedAt: new Date().toISOString(),
              });
            }
          }
        });

        if (newAchievements.length > 0) {
          set((state) => ({
            achievements: state.achievements.map((a) => {
              const unlocked = newAchievements.find((na) => na.id === a.id);
              return unlocked || a;
            }),
            points: state.points + newAchievements.length * 100,
          }));
        }

        return newAchievements;
      },

      addPoints: (points) =>
        set((state) => ({
          points: state.points + points,
        })),

      incrementStreak: () =>
        set((state) => ({
          streakDays: state.streakDays + 1,
          totalVersesMemorized: state.totalVersesMemorized + 1,
        })),

      resetStreak: () => set({ streakDays: 0 }),
    }),
    {
      name: 'al-muallim-goals-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
