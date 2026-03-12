import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserDisplaySettings, Reciter } from '../types';

interface UserState {
  settings: UserDisplaySettings;
  updateSettings: (settings: Partial<UserDisplaySettings>) => void;
}

const DEFAULT_RECITER: Reciter = {
  id: '1',
  name: '\u0639\u0628\u062f \u0627\u0644\u0628\u0627\u0633\u0637 \u0639\u0628\u062f \u0627\u0644\u0635\u0645\u062f',
  englishName: 'Abdul Basit Abdul Samad',
  style: 'Murattal',
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      settings: {
        language: 'fr',
        reciter: DEFAULT_RECITER,
        notificationsEnabled: true,
        dailyReminderTime: '08:00',
        darkMode: false,
        fontSize: 'medium',
      },
      updateSettings: (settings) =>
        set((state) => ({ settings: { ...state.settings, ...settings } })),
    }),
    {
      name: 'al-muallim-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
