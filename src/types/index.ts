// Types for Al-Muallim app

export interface Verse {
  id: number;
  surah_number: number;
  ayah_number: number;
  text_arabic: string;
  text_translation?: string;
  juz_number: number;
  page_number: number;
  status: VerseStatus;
  // SRS fields
  ease_factor?: number;
  interval?: number;
  repetitions?: number;
  next_review_date?: string;
  last_reviewed_at?: string;
}

export type VerseStatus = 'learning' | 'consolidating' | 'mastered' | 'new';

export interface ReviewResult {
  verse_id: number;
  quality: QualityScore;
  reviewed_at: string;
  next_review_date: string;
  new_interval: number;
  new_ease_factor: number;
}

export type QualityScore = 0 | 1 | 2 | 3 | 4 | 5;

export interface DailyReview {
  date: string;
  due_count: number;
  completed_count: number;
  verses: Verse[];
}

export interface ProgressStats {
  total_verses: number;
  mastered: number;
  consolidating: number;
  learning: number;
  streak_days: number;
  retention_rate: number;
  verses_by_juz: JuzProgress[];
  verses_by_surah: SurahProgress[];
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

export interface SRSStats {
  status_distribution: {
    learning: number;
    consolidating: number;
    mastered: number;
  };
  average_ease_factor: number;
  average_interval: number;
  retention_rate: number;
  quality_distribution: Record<QualityScore, number>;
  forecast_7days: number[];
}
