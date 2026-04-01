// Translation Service - Handles Quran verse translations
// Supports Arabic (original), French, and English translations

import type { Verse } from '@/types';

export type TranslationLanguage = 'ar' | 'fr' | 'en';

export interface TranslationOption {
  id: TranslationLanguage;
  name: string;
  nativeName: string;
  description: string;
}

// Available translations
export const AVAILABLE_TRANSLATIONS: TranslationOption[] = [
  {
    id: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    description: 'Original Arabic text',
  },
  {
    id: 'fr',
    name: 'French',
    nativeName: 'Français',
    description: 'Sahih International - French',
  },
  {
    id: 'en',
    name: 'English',
    nativeName: 'English',
    description: 'Sahih International - English',
  },
];

/**
 * Get translation text for a verse in the specified language
 * Falls back to Arabic if translation not available
 */
export function getVerseTranslation(
  verse: Verse,
  language: TranslationLanguage
): string {
  switch (language) {
    case 'ar':
      return verse.text_arabic;
    
    case 'fr':
      return verse.text_translation_fr || verse.text_arabic;
    
    case 'en':
      return verse.text_translation_en || verse.text_arabic;
    
    default:
      // Fallback to Arabic for unknown languages
      return verse.text_arabic;
  }
}

/**
 * Check if a translation is available for a verse
 */
export function hasTranslation(
  verse: Verse,
  language: TranslationLanguage
): boolean {
  if (language === 'ar') {
    return true; // Arabic is always available
  }
  
  if (language === 'fr') {
    return !!verse.text_translation_fr;
  }
  
  if (language === 'en') {
    return !!verse.text_translation_en;
  }
  
  return false;
}

/**
 * Get the display name for a translation language
 */
export function getTranslationDisplayName(
  language: TranslationLanguage
): string {
  const translation = AVAILABLE_TRANSLATIONS.find(t => t.id === language);
  return translation ? `${translation.name} (${translation.nativeName})` : language;
}

/**
 * Get translation option by ID
 */
export function getTranslationOption(
  language: TranslationLanguage
): TranslationOption | undefined {
  return AVAILABLE_TRANSLATIONS.find(t => t.id === language);
}
