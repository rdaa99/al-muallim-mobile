import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, UserSettings } from '../types';

interface UserState {
  progress: UserProgress;
  settings: UserSettings;
  updateProgress: (progress: Partial<UserProgress>) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
}

const DEFAULT_RECITER = {
  id: '1',
  name: 'عبد الباسط عبد الصمد',
  englishName: 'Abdul Basit Abdul Samad',
  style: 'Murattal',
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      progress: {
        surahsMemorized: 0,
        totalAyahs: 6236,
        ayahsMemorized: 0,
        currentStreak: 0,
        longestStreak: 0,
        dailyGoal: 10,
        weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
      },
      settings: {
        language: 'ar',
        reciter: DEFAULT_RECITER,
        notificationsEnabled: true,
        dailyReminderTime: '08:00',
        darkMode: false,
        fontSize: 'medium',
      },
      updateProgress: (progress) =>
        set((state) => ({ progress: { ...state.progress, ...progress } })),
      updateSettings: (settings) =>
        set((state) => ({ settings: { ...state.settings, ...settings } })),
    }),
    {
      name: 'al-muallim-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
