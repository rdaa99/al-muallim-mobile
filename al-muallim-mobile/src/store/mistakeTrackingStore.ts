import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Mistake {
  id: string;
  surahNumber: number;
  verseNumber: number;
  type: 'pronunciation' | 'tajweed' | 'memory' | 'fluency';
  timestamp: string;
  notes?: string;
  resolved: boolean;
}

interface MistakeAnalysis {
  totalMistakes: number;
  byType: {
    pronunciation: number;
    tajweed: number;
    memory: number;
    fluency: number;
  };
  bySurah: Record<number, number>;
  frequentVerses: Array<{
    surahNumber: number;
    verseNumber: number;
    count: number;
  }>;
}

interface MistakeTrackingState {
  mistakes: Mistake[];
  analysis: MistakeAnalysis;

  addMistake: (mistake: Omit<Mistake, 'id' | 'timestamp'>) => void;
  resolveMistake: (mistakeId: string) => void;
  getMistakesBySurah: (surahNumber: number) => Mistake[];
  getMistakesByVerse: (surahNumber: number, verseNumber: number) => Mistake[];
  analyzeMistakes: () => MistakeAnalysis;
  clearResolvedMistakes: () => void;
}

export const useMistakeTrackingStore = create<MistakeTrackingState>()(
  persist(
    (set, get) => ({
      mistakes: [],
      analysis: {
        totalMistakes: 0,
        byType: {
          pronunciation: 0,
          tajweed: 0,
          memory: 0,
          fluency: 0,
        },
        bySurah: {},
        frequentVerses: [],
      },

      addMistake: (mistakeData) =>
        set((state) => {
          const mistake: Mistake = {
            ...mistakeData,
            id: `${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            resolved: false,
          };

          const updatedMistakes = [...state.mistakes, mistake];
          const analysis = analyzeMistakesHelper(updatedMistakes);

          return {
            mistakes: updatedMistakes,
            analysis,
          };
        }),

      resolveMistake: (mistakeId) =>
        set((state) => {
          const updatedMistakes = state.mistakes.map((m) =>
            m.id === mistakeId ? { ...m, resolved: true } : m
          );
          const analysis = analyzeMistakesHelper(updatedMistakes);

          return {
            mistakes: updatedMistakes,
            analysis,
          };
        }),

      getMistakesBySurah: (surahNumber) => {
        return get().mistakes.filter((m) => m.surahNumber === surahNumber);
      },

      getMistakesByVerse: (surahNumber, verseNumber) => {
        return get().mistakes.filter(
          (m) => m.surahNumber === surahNumber && m.verseNumber === verseNumber
        );
      },

      analyzeMistakes: () => {
        return analyzeMistakesHelper(get().mistakes);
      },

      clearResolvedMistakes: () =>
        set((state) => {
          const filteredMistakes = state.mistakes.filter((m) => !m.resolved);
          const analysis = analyzeMistakesHelper(filteredMistakes);

          return {
            mistakes: filteredMistakes,
            analysis,
          };
        }),
    }),
    {
      name: 'al-muallim-mistakes-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Helper function to analyze mistakes
function analyzeMistakesHelper(mistakes: Mistake[]): MistakeAnalysis {
  const analysis: MistakeAnalysis = {
    totalMistakes: mistakes.filter((m) => !m.resolved).length,
    byType: {
      pronunciation: 0,
      tajweed: 0,
      memory: 0,
      fluency: 0,
    },
    bySurah: {},
    frequentVerses: [],
  };

  const verseCount: Record<string, number> = {};

  mistakes.forEach((mistake) => {
    if (!mistake.resolved) {
      // By type
      analysis.byType[mistake.type]++;

      // By surah
      if (!analysis.bySurah[mistake.surahNumber]) {
        analysis.bySurah[mistake.surahNumber] = 0;
      }
      analysis.bySurah[mistake.surahNumber]++;

      // Verse frequency
      const key = `${mistake.surahNumber}-${mistake.verseNumber}`;
      verseCount[key] = (verseCount[key] || 0) + 1;
    }
  });

  // Find most frequent verses
  analysis.frequentVerses = Object.entries(verseCount)
    .map(([key, count]) => {
      const [surahNumber, verseNumber] = key.split('-').map(Number);
      return { surahNumber, verseNumber, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return analysis;
}
