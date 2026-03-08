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
  const { data } = await api.get('/review/today');
  return data;
};

export const submitReview = async (verseId: number, quality: QualityScore): Promise<ReviewResult> => {
  const { data } = await api.post('/review', { verse_id: verseId, quality });
  return data;
};

// Stats
export const getProgressStats = async (): Promise<ProgressStats> => {
  const { data } = await api.get('/stats/progress');
  return data;
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
