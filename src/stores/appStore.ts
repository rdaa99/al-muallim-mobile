import { create } from 'zustand';
import type { Verse, DailyReview, ProgressStats, UserSettings } from '@/types';
import * as api from '@/services/api';

interface AppState {
  // Verses
  currentVerse: Verse | null;
  verses: Verse[];
  loading: boolean;
  error: string | null;

  // Review
  dailyReview: DailyReview | null;
  reviewIndex: number;

  // Stats
  stats: ProgressStats | null;

  // Settings
  settings: UserSettings | null;

  // Actions
  loadTodayReview: () => Promise<void>;
  submitReview: (quality: 0 | 1 | 2 | 3 | 4 | 5) => Promise<void>;
  nextVerse: () => void;
  loadStats: () => Promise<void>;
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  clearError: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  currentVerse: null,
  verses: [],
  loading: false,
  error: null,
  dailyReview: null,
  reviewIndex: 0,
  stats: null,
  settings: null,

  // Actions
  loadTodayReview: async () => {
    set({ loading: true, error: null });
    try {
      const review = await api.getTodayReview();
      set({
        dailyReview: review,
        verses: review.verses,
        currentVerse: review.verses[0] || null,
        reviewIndex: 0,
        loading: false,
      });
    } catch (error) {
      set({ error: 'Failed to load review', loading: false });
    }
  },

  submitReview: async (quality) => {
    const { currentVerse, reviewIndex, verses } = get();
    if (!currentVerse) return;

    try {
      await api.submitReview(currentVerse.id, quality);

      // Move to next verse
      const nextIndex = reviewIndex + 1;
      if (nextIndex < verses.length) {
        set({
          currentVerse: verses[nextIndex],
          reviewIndex: nextIndex,
        });
      } else {
        // Review complete
        set({ currentVerse: null });
      }
    } catch (error) {
      set({ error: 'Failed to submit review' });
    }
  },

  nextVerse: () => {
    const { reviewIndex, verses } = get();
    const nextIndex = reviewIndex + 1;
    if (nextIndex < verses.length) {
      set({
        currentVerse: verses[nextIndex],
        reviewIndex: nextIndex,
      });
    }
  },

  loadStats: async () => {
    try {
      const stats = await api.getProgressStats();
      set({ stats });
    } catch (error) {
      set({ error: 'Failed to load stats' });
    }
  },

  loadSettings: async () => {
    try {
      const settings = await api.getSettings();
      set({ settings });
    } catch (error) {
      set({ error: 'Failed to load settings' });
    }
  },

  updateSettings: async (newSettings) => {
    try {
      const settings = await api.updateSettings(newSettings);
      set({ settings });
    } catch (error) {
      set({ error: 'Failed to update settings' });
    }
  },

  clearError: () => set({ error: null }),
}));
