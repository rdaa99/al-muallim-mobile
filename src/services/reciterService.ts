/**
 * Reciter Service
 * Manages Quran reciter audio URLs and provides reciter selection functionality
 */

import type { Reciter } from '@/types';

// Popular Quran reciters with their audio API identifiers
export const AVAILABLE_RECITERS: Reciter[] = [
  {
    id: 'abdul_basit',
    name: 'Abdul Basit',
    englishName: 'Abdul Basit Abdel Samad',
    style: 'Mujawwad (slow, melodious)',
  },
  {
    id: 'sudais',
    name: 'Abdurrahman As-Sudais',
    englishName: 'Abdurrahman As-Sudais',
    style: 'Traditional',
  },
  {
    id: 'afasy',
    name: 'Mishary Al-Afasy',
    englishName: 'Mishary Rashid Al-Afasy',
    style: 'Clear and melodious',
  },
  {
    id: 'husary',
    name: 'Mahmoud Khalil Al-Husary',
    englishName: 'Mahmoud Khalil Al-Husary',
    style: 'Tajweed-focused',
  },
  {
    id: 'minshawi',
    name: 'Mohamed Siddiq Al-Minshawi',
    englishName: 'Mohamed Siddiq Al-Minshawi',
    style: 'Mujawwad (emotional)',
  },
];

// Default reciter
export const DEFAULT_RECITER = 'afasy';

// Audio API configurations
const AUDIO_SOURCES = {
  // islamic.network CDN - Free, reliable, multiple reciters
  islamic_network: {
    baseUrl: 'https://cdn.islamic.network/quran/audio/128',
    reciterMap: {
      abdul_basit: 'ar.abdulbasitmurattal',
      sudais: 'ar.abdurrahmaansudais',
      afasy: 'ar.alafasy',
      husary: 'ar.husary',
      minshawi: 'ar.minshawi',
    },
  },
  // alquran.cloud API - Alternative source
  alquran_cloud: {
    baseUrl: 'https://cdn.alquran.cloud/media/audio/ayah',
    reciterMap: {
      abdul_basit: 'ar.abdulbasitmurattal',
      sudais: 'ar.abdurrahmaansudais',
      afasy: 'ar.alafasy',
      husary: 'ar.husary',
      minshawi: 'ar.minshawi',
    },
  },
};

/**
 * Get reciter information by ID
 */
export const getReciterById = (reciterId: string): Reciter | undefined => {
  return AVAILABLE_RECITERS.find((r) => r.id === reciterId);
};

/**
 * Get all available reciters
 */
export const getAllReciters = (): Reciter[] => {
  return AVAILABLE_RECITERS;
};

/**
 * Generate audio URL for a specific verse and reciter
 * Falls back to default reciter if the requested one is not available
 */
export const getAudioUrl = (
  surahNumber: number,
  ayahNumber: number,
  reciterId?: string
): string => {
  const reciter = reciterId || DEFAULT_RECITER;
  const paddedSurah = String(surahNumber).padStart(3, '0');
  const paddedAyah = String(ayahNumber).padStart(3, '0');

  // Get the reciter identifier for islamic.network
  const reciterCode = AUDIO_SOURCES.islamic_network.reciterMap[reciter];

  if (!reciterCode) {
    // Fallback to default reciter if reciter not found
    const defaultCode = AUDIO_SOURCES.islamic_network.reciterMap[DEFAULT_RECITER];
    return `${AUDIO_SOURCES.islamic_network.baseUrl}/${defaultCode}/${paddedSurah}${paddedAyah}.mp3`;
  }

  return `${AUDIO_SOURCES.islamic_network.baseUrl}/${reciterCode}/${paddedSurah}${paddedAyah}.mp3`;
};

/**
 * Generate audio URL with fallback to alternative sources
 * Returns the primary URL; on error, consumer should try fallback
 */
export const getAudioUrlWithFallback = (
  surahNumber: number,
  ayahNumber: number,
  reciterId?: string
): { primary: string; fallback: string } => {
  const reciter = reciterId || DEFAULT_RECITER;

  // Primary source: islamic.network
  const primary = getAudioUrl(surahNumber, ayahNumber, reciter);

  // Fallback: Try with default reciter if different from requested
  const fallbackReciter = reciter !== DEFAULT_RECITER ? DEFAULT_RECITER : 'husary';
  const fallback = getAudioUrl(surahNumber, ayahNumber, fallbackReciter);

  return { primary, fallback };
};

/**
 * Validate if a reciter ID is supported
 */
export const isValidReciter = (reciterId: string): boolean => {
  return AVAILABLE_RECITERS.some((r) => r.id === reciterId);
};

/**
 * Get reciter display name
 */
export const getReciterDisplayName = (reciterId: string): string => {
  const reciter = getReciterById(reciterId);
  return reciter?.name || 'Unknown Reciter';
};
