// Types for Al-Muallim app

export interface Verse {
  id: number;
  surah_number: number;
  ayah_number: number;
  text_arabic: string;
  text_translation_fr?: string;
  text_translation_en?: string;
  juz_number: number;
  page_number: number;
  status: VerseStatus;
  // SRS fields
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review_date?: string;
  last_reviewed_at?: string;
}

export type VerseStatus = 'learning' | 'consolidating' | 'mastered' | 'new';

export interface ReviewResult {
  verse_id: number;
  quality: QualityScore;
  reviewed_at?: string;
  next_review_date: string;
  status: VerseStatus;
  interval: number;
  ease_factor: number;
  repetitions: number;
}

export type QualityScore = 0 | 1 | 2 | 3 | 4 | 5;

export interface DailyReview {
  date: string;
  due_count: number;
  completed_count: number;
  verses: Verse[];
  sections?: { verses: Verse[]; completed?: boolean }[];
  blocked?: boolean;
  block_message?: string | null;
}

export interface ProgressStats {
  total_verses: number;
  total_learned: number;
  total_mastered: number;
  total_consolidating: number;
  total_learning: number;
  mastered: number;
  consolidating: number;
  learning: number;
  streak_days: number;
  longest_streak: number;
  retention_rate: number;
  verses_by_juz: JuzProgress[];
  verses_by_surah: SurahProgress[];
  surahs: SurahProgress[];
  calendar: { date: string; has_activity: boolean }[];
  this_month: number;
}

export interface JuzProgress {
  juz_number: number;
  total: number;
  mastered: number;
  consolidating: number;
  learning: number;
}

export interface SurahProgress {
  surah_number: number;
  surah_name: string;
  total: number;
  mastered: number;
  consolidating: number;
  learning: number;
}

export interface UserSettings {
  learning_mode: 'active' | 'revision_only' | 'paused';
  focus_juz_start: number;
  focus_juz_end: number;
  evaluation_day: number;
  learning_capacity: number;
  daily_new_lines: number;
  direction: 'desc' | 'asc';
  session_duration: number;
  preferred_reciter: string;
}

export interface UserDisplaySettings {
  language: string;
  reciter: Reciter | null;
  notificationsEnabled: boolean;
  dailyReminderTime: string;
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

// Audio types
export interface Surah {
  number: number;
  name: string;
  englishName: string;
  ayahsCount: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Reciter {
  id: string;
  name: string;
  englishName: string;
  style?: string;
}

// Navigation types
export type RootTabParamList = {
  Review: undefined;
  Dashboard: undefined;
  AudioPlayer: undefined;
  Settings: undefined;
};
