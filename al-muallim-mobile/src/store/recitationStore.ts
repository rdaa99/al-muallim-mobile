import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RecitationProgress {
  surahNumber: number;
  verseNumber: number;
  memorized: boolean;
  lastReviewed: string;
  easeFactor: number;
  interval: number;
  nextReviewDate: string;
}

interface RecitationState {
  progress: RecitationProgress[];
  currentMode: 'learning' | 'test' | 'flow' | 'hifz';
  streakDays: number;
  totalMemorized: number;

  updateProgress: (progress: RecitationProgress) => void;
  markVerseMemorized: (surahNumber: number, verseNumber: number) => void;
  setCurrentMode: (mode: 'learning' | 'test' | 'flow' | 'hifz') => void;
  getProgress: (surahNumber: number) => RecitationProgress[];
}

export const useRecitationStore = create<RecitationState>()(
  persist(
    (set, get) => ({
      progress: [],
      currentMode: 'learning',
      streakDays: 0,
      totalMemorized: 0,

      updateProgress: (newProgress) =>
        set((state) => {
          const existing = state.progress.findIndex(
            (p) =>
              p.surahNumber === newProgress.surahNumber &&
              p.verseNumber === newProgress.verseNumber
          );

          if (existing >= 0) {
            const updated = [...state.progress];
            updated[existing] = newProgress;
            return { progress: updated };
          }

          return { progress: [...state.progress, newProgress] };
        }),

      markVerseMemorized: (surahNumber, verseNumber) =>
        set((state) => {
          const today = new Date().toISOString();
          const existing = state.progress.findIndex(
            (p) => p.surahNumber === surahNumber && p.verseNumber === verseNumber
          );

          if (existing >= 0) {
            const updated = [...state.progress];
            updated[existing] = {
              ...updated[existing],
              memorized: true,
              lastReviewed: today,
            };
            return {
              progress: updated,
              totalMemorized: state.totalMemorized + 1,
            };
          }

          return {
            progress: [
              ...state.progress,
              {
                surahNumber,
                verseNumber,
                memorized: true,
                lastReviewed: today,
                easeFactor: 2.5,
                interval: 1,
                nextReviewDate: today,
              },
            ],
            totalMemorized: state.totalMemorized + 1,
          };
        }),

      setCurrentMode: (mode) => set({ currentMode: mode }),

      getProgress: (surahNumber) => {
        return get().progress.filter((p) => p.surahNumber === surahNumber);
      },
    }),
    {
      name: 'al-muallim-recitation-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
