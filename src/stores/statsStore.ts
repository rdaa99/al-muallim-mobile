import { create } from 'zustand';
import type { ProgressStats, JuzProgress, SurahProgress } from '@/types';
import * as db from '@/services/database';

interface DailyStats {
  date: string;
  versesReviewed: number;
  sessionsCompleted: number;
  totalTimeMinutes: number;
  averageQuality: number;
}

interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  totalVerses: number;
  totalSessions: number;
  totalTimeMinutes: number;
  dailyAverage: number;
}

interface DetailedStats extends ProgressStats {
  // Additional detailed metrics
  total_review_sessions: number;
  average_session_duration: number; // in minutes
  verses_per_session: number;
  weekly_stats: WeeklyStats[];
  daily_stats: DailyStats[];
  retention_by_juz: { juz_number: number; retention_rate: number }[];
  retention_by_surah: { surah_number: number; retention_rate: number }[];
}

interface StatsState {
  // State
  stats: DetailedStats | null;
  weeklyData: number[];
  loading: boolean;
  error: string | null;
  lastRefresh: string | null;

  // Actions
  loadStats: () => Promise<void>;
  loadWeeklyData: () => Promise<void>;
  refreshAll: () => Promise<void>;
  clearError: () => void;
}

export const useStatsStore = create<StatsState>((set, get) => ({
  // Initial state
  stats: null,
  weeklyData: [0, 0, 0, 0, 0, 0, 0],
  loading: false,
  error: null,
  lastRefresh: null,

  // Actions
  loadStats: async () => {
    set({ loading: true, error: null });
    try {
      const baseStats = await db.getProgressStats();

      // Get weekly review counts for last 4 weeks
      const weeklyStats = await getWeeklyStats();

      // Get daily stats for last 30 days
      const dailyStats = await getDailyStats();

      // Calculate retention by juz
      const retentionByJuz = await calculateRetentionByJuz();

      // Calculate retention by surah
      const retentionBySurah = await calculateRetentionBySurah();

      // Calculate additional metrics
      const totalSessions = dailyStats.reduce((sum, d) => sum + d.sessionsCompleted, 0);
      const totalTime = dailyStats.reduce((sum, d) => sum + d.totalTimeMinutes, 0);
      const averageSessionDuration = totalSessions > 0 ? totalTime / totalSessions : 0;
      const versesPerSession = totalSessions > 0 ? baseStats.total_learned / totalSessions : 0;

      const detailedStats: DetailedStats = {
        ...baseStats,
        total_review_sessions: totalSessions,
        average_session_duration: Math.round(averageSessionDuration * 10) / 10,
        verses_per_session: Math.round(versesPerSession * 10) / 10,
        weekly_stats: weeklyStats,
        daily_stats: dailyStats,
        retention_by_juz: retentionByJuz,
        retention_by_surah: retentionBySurah,
      };

      set({
        stats: detailedStats,
        loading: false,
        lastRefresh: new Date().toISOString(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load stats';
      set({ error: message, loading: false });
    }
  },

  loadWeeklyData: async () => {
    try {
      const data = await db.getWeeklyReviewCounts();
      set({ weeklyData: data });
    } catch {
      // Keep previous data on error
    }
  },

  refreshAll: async () => {
    const { loadStats, loadWeeklyData } = get();
    await Promise.all([loadStats(), loadWeeklyData()]);
  },

  clearError: () => set({ error: null }),
}));

// Helper functions for detailed stats

async function getWeeklyStats(): Promise<WeeklyStats[]> {
  const weeks: WeeklyStats[] = [];

  for (let week = 0; week < 4; week++) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() - (week * 7)); // Sunday of the week
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // Saturday

    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    // Query review history for this week
    const result = await db.db.execute(
      `SELECT
        COUNT(DISTINCT verse_id) as total_verses,
        COUNT(*) as total_reviews,
        AVG(quality) as avg_quality
       FROM review_history
       WHERE date(reviewed_at) >= ? AND date(reviewed_at) <= ?`,
      [weekStartStr, weekEndStr]
    );

    const row = result.rows && (result.rows as { _array?: Record<string, unknown>[] })._array?.[0];
    const totalVerses = (row?.total_verses as number) || 0;
    const totalReviews = (row?.total_reviews as number) || 0;

    weeks.push({
      weekStart: weekStartStr,
      weekEnd: weekEndStr,
      totalVerses,
      totalSessions: Math.ceil(totalReviews / 20), // Estimate sessions (20 verses per session)
      totalTimeMinutes: totalReviews * 2, // Estimate 2 min per verse
      dailyAverage: Math.round(totalVerses / 7 * 10) / 10,
    });
  }

  return weeks;
}

async function getDailyStats(): Promise<DailyStats[]> {
  const dailyStats: DailyStats[] = [];

  for (let day = 0; day < 30; day++) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    const dateStr = date.toISOString().split('T')[0];

    const result = await db.db.execute(
      `SELECT
        COUNT(DISTINCT verse_id) as verses_reviewed,
        COUNT(*) as total_reviews,
        AVG(quality) as avg_quality
       FROM review_history
       WHERE date(reviewed_at) = ?`,
      [dateStr]
    );

    const row = result.rows && (result.rows as { _array?: Record<string, unknown>[] })._array?.[0];
    const versesReviewed = (row?.verses_reviewed as number) || 0;
    const totalReviews = (row?.total_reviews as number) || 0;
    const avgQuality = (row?.avg_quality as number) || 0;

    dailyStats.push({
      date: dateStr,
      versesReviewed,
      sessionsCompleted: versesReviewed > 0 ? 1 : 0,
      totalTimeMinutes: versesReviewed * 2, // Estimate 2 min per verse
      averageQuality: Math.round(avgQuality * 10) / 10,
    });
  }

  return dailyStats;
}

async function calculateRetentionByJuz(): Promise<{ juz_number: number; retention_rate: number }[]> {
  const result = await db.db.execute(
    `SELECT
      v.juz_number,
      COUNT(*) as total_reviews,
      SUM(CASE WHEN rh.quality >= 3 THEN 1 ELSE 0 END) as successful_reviews
     FROM verses v
     LEFT JOIN review_history rh ON v.id = rh.verse_id
     WHERE rh.id IS NOT NULL
     GROUP BY v.juz_number
     ORDER BY v.juz_number`
  );

  const rows = result.rows && (result.rows as { _array?: Record<string, unknown>[] })._array || [];

  return rows.map((row) => ({
    juz_number: row.juz_number as number,
    retention_rate: (row.total_reviews as number) > 0
      ? Math.round(((row.successful_reviews as number) / (row.total_reviews as number)) * 100)
      : 0,
  }));
}

async function calculateRetentionBySurah(): Promise<{ surah_number: number; retention_rate: number }[]> {
  const result = await db.db.execute(
    `SELECT
      v.surah_number,
      COUNT(*) as total_reviews,
      SUM(CASE WHEN rh.quality >= 3 THEN 1 ELSE 0 END) as successful_reviews
     FROM verses v
     LEFT JOIN review_history rh ON v.id = rh.verse_id
     WHERE rh.id IS NOT NULL
     GROUP BY v.surah_number
     ORDER BY v.surah_number`
  );

  const rows = result.rows && (result.rows as { _array?: Record<string, unknown>[] })._array || [];

  return rows.map((row) => ({
    surah_number: row.surah_number as number,
    retention_rate: (row.total_reviews as number) > 0
      ? Math.round(((row.successful_reviews as number) / (row.total_reviews as number)) * 100)
      : 0,
  }));
}
