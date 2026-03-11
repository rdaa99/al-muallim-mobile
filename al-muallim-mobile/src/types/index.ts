// Types for Al-Muallim Mobile App

export interface UserProgress {
  surahsMemorized: number;
  totalAyahs: number;
  ayahsMemorized: number;
  currentStreak: number;
  longestStreak: number;
  dailyGoal: number;
  weeklyProgress: number[];
}

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
  style: string;
}

export interface UserSettings {
  language: 'ar' | 'en' | 'fr';
  reciter: Reciter;
  notificationsEnabled: boolean;
  dailyReminderTime: string;
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

export interface AudioState {
  isPlaying: boolean;
  currentSurah: Surah | null;
  currentAyah: number;
  duration: number;
  position: number;
  playbackSpeed: number;
}
