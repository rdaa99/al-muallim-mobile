import axios from 'axios';
import type { Verse, DailyReview, ProgressStats, UserSettings, SRSStats, ReviewResult, QualityScore } from '@/types';

// API base URL - will be configurable
const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Verses
export const getVerse = async (id: number): Promise<Verse> => {
  const { data } = await api.get(`/verses/${id}`);
  return data;
};

export const getVersesBySurah = async (surah: number): Promise<Verse[]> => {
  const { data } = await api.get(`/verses/surah/${surah}`);
  return data;
};

export const getVersesByJuz = async (juz: number): Promise<Verse[]> => {
  const { data } = await api.get(`/verses/juz/${juz}`);
  return data;
};

export const updateVerseStatus = async (id: number, status: Verse['status']): Promise<Verse> => {
  const { data } = await api.put(`/verses/${id}/status`, { status });
  return data;
};

// Review
export const getTodayReview = async (): Promise<DailyReview> => {
  const { data } = await api.get('/today');
  // Transform backend format to app format
  const allVerses = data.sections?.flatMap((section: any) => section.verses) || [];
  const completedVerses = data.sections?.filter((s: any) => s.completed).flatMap((section: any) => section.verses) || [];

  return {
    date: data.date,
    due_count: allVerses.length,
    completed_count: completedVerses.length,
    verses: allVerses,
    sections: data.sections,
    blocked: data.blocked,
    block_message: data.block_message,
  };
};

export const submitReview = async (verseId: number, quality: QualityScore): Promise<ReviewResult> => {
  const { data } = await api.post('/review', {
    verse_id: verseId,
    quality,
    session_type: 'review', // Default session type
  });
  return data;
};

// Stats
export const getProgressStats = async (): Promise<ProgressStats> => {
  const { data } = await api.get('/progress');
  // Transform backend format to app format
  return {
    total_verses: data.total_verses || 6236,
    total_learned: data.total_learned || 0,
    total_mastered: data.total_mastered || 0,
    total_consolidating: data.total_consolidating || 0,
    total_learning: data.total_learning || 0,
    mastered: data.total_mastered || 0,
    consolidating: data.total_consolidating || 0,
    learning: data.total_learning || 0,
    streak_days: data.streak || 0,
    streak: data.streak || 0,
    retention_rate: 0.85, // Default, could be calculated from data
    verses_by_juz: [], // Backend doesn't provide this yet
    verses_by_surah: data.surahs || [],
    surahs: data.surahs || [],
    calendar: data.calendar || [],
    this_month: data.this_month || 0,
  };
};

export const getSRSStats = async (): Promise<SRSStats> => {
  const { data } = await api.get('/stats/srs');
  return data;
};

// Settings
export const getSettings = async (): Promise<UserSettings> => {
  const { data } = await api.get('/settings');
  return data;
};

export const updateSettings = async (settings: Partial<UserSettings>): Promise<UserSettings> => {
  const { data } = await api.put('/settings', settings);
  return data;
};

export default api;
