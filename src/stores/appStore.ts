import { create } from 'zustand';
import type { Verse, DailyReview, ProgressStats, UserSettings } from '@/types';
import * as db from '@/services/database';

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
      const review = await db.getTodayReview();
      set({
        dailyReview: review,
        verses: review.verses,
        currentVerse: review.verses[0] || null,
        reviewIndex: 0,
        loading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load review';
      set({ error: message, loading: false });
    }
  },

  submitReview: async (quality) => {
    const { currentVerse, reviewIndex, verses, dailyReview } = get();
    if (!currentVerse) {return;}

    try {
      await db.submitReview(currentVerse.id, quality);

      // Update completed count in dailyReview
      const updatedReview = dailyReview
        ? { ...dailyReview, completed_count: dailyReview.completed_count + 1 }
        : null;

      // Move to next verse
      const nextIndex = reviewIndex + 1;
      if (nextIndex < verses.length) {
        set({
          currentVerse: verses[nextIndex],
          reviewIndex: nextIndex,
          dailyReview: updatedReview,
        });
      } else {
        // Review complete
        set({
          currentVerse: null,
          dailyReview: updatedReview,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit review';
      set({ error: message });
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
      const stats = await db.getProgressStats();
      set({ stats });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load stats';
      set({ error: message });
    }
  },

  loadSettings: async () => {
    try {
      const settings = await db.getSettings();
      set({ settings });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load settings';
      set({ error: message });
    }
  },

  updateSettings: async (newSettings) => {
    try {
      const settings = await db.updateSettings(newSettings);
      set({ settings });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update settings';
      set({ error: message });
    }
  },

  clearError: () => set({ error: null }),
}));
