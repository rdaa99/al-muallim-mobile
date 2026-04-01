// Tests for translation service
import { getVerseTranslation, hasTranslation, getTranslationDisplayName, AVAILABLE_TRANSLATIONS } from '../translationService';
import type { Verse } from '@/types';

describe('Translation Service', () => {
  const mockVerse: Verse = {
    id: 1,
    surah_number: 1,
    ayah_number: 1,
    text_arabic: 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ',
    text_translation_fr: 'Au nom d\'Allah, le Tout Miséricordieux, le Très Miséricordieux.',
    text_translation_en: 'In the name of Allah, the Most Gracious, the Most Merciful.',
    juz_number: 1,
    page_number: 1,
    status: 'new',
    ease_factor: 2.5,
    interval: 0,
    repetitions: 0,
  };

  const mockVerseWithoutTranslations: Verse = {
    id: 2,
    surah_number: 1,
    ayah_number: 2,
    text_arabic: 'ٱلۡحَمۡدُ لِلَّهِ رَبِّ ٱلۡعَـٰلَمِینَ',
    juz_number: 1,
    page_number: 1,
    status: 'new',
    ease_factor: 2.5,
    interval: 0,
    repetitions: 0,
  };

  describe('getVerseTranslation', () => {
    it('should return Arabic text when Arabic is selected', () => {
      const result = getVerseTranslation(mockVerse, 'ar');
      expect(result).toBe(mockVerse.text_arabic);
    });

    it('should return French translation when French is selected', () => {
      const result = getVerseTranslation(mockVerse, 'fr');
      expect(result).toBe(mockVerse.text_translation_fr);
    });

    it('should return English translation when English is selected', () => {
      const result = getVerseTranslation(mockVerse, 'en');
      expect(result).toBe(mockVerse.text_translation_en);
    });

    it('should fallback to Arabic when French translation is not available', () => {
      const result = getVerseTranslation(mockVerseWithoutTranslations, 'fr');
      expect(result).toBe(mockVerseWithoutTranslations.text_arabic);
    });

    it('should fallback to Arabic when English translation is not available', () => {
      const result = getVerseTranslation(mockVerseWithoutTranslations, 'en');
      expect(result).toBe(mockVerseWithoutTranslations.text_arabic);
    });

    it('should always return Arabic text when Arabic is selected', () => {
      const result = getVerseTranslation(mockVerseWithoutTranslations, 'ar');
      expect(result).toBe(mockVerseWithoutTranslations.text_arabic);
    });
  });

  describe('hasTranslation', () => {
    it('should always return true for Arabic', () => {
      expect(hasTranslation(mockVerse, 'ar')).toBe(true);
      expect(hasTranslation(mockVerseWithoutTranslations, 'ar')).toBe(true);
    });

    it('should return true when French translation is available', () => {
      expect(hasTranslation(mockVerse, 'fr')).toBe(true);
    });

    it('should return false when French translation is not available', () => {
      expect(hasTranslation(mockVerseWithoutTranslations, 'fr')).toBe(false);
    });

    it('should return true when English translation is available', () => {
      expect(hasTranslation(mockVerse, 'en')).toBe(true);
    });

    it('should return false when English translation is not available', () => {
      expect(hasTranslation(mockVerseWithoutTranslations, 'en')).toBe(false);
    });
  });

  describe('getTranslationDisplayName', () => {
    it('should return display name for Arabic', () => {
      const result = getTranslationDisplayName('ar');
      expect(result).toContain('Arabic');
      expect(result).toContain('العربية');
    });

    it('should return display name for French', () => {
      const result = getTranslationDisplayName('fr');
      expect(result).toContain('French');
      expect(result).toContain('Français');
    });

    it('should return display name for English', () => {
      const result = getTranslationDisplayName('en');
      expect(result).toContain('English');
    });
  });

  describe('AVAILABLE_TRANSLATIONS', () => {
    it('should have Arabic translation', () => {
      const arabic = AVAILABLE_TRANSLATIONS.find(t => t.id === 'ar');
      expect(arabic).toBeDefined();
      expect(arabic?.name).toBe('Arabic');
      expect(arabic?.nativeName).toBe('العربية');
    });

    it('should have French translation', () => {
      const french = AVAILABLE_TRANSLATIONS.find(t => t.id === 'fr');
      expect(french).toBeDefined();
      expect(french?.name).toBe('French');
      expect(french?.nativeName).toBe('Français');
    });

    it('should have English translation', () => {
      const english = AVAILABLE_TRANSLATIONS.find(t => t.id === 'en');
      expect(english).toBeDefined();
      expect(english?.name).toBe('English');
    });

    it('should have exactly 3 translations', () => {
      expect(AVAILABLE_TRANSLATIONS).toHaveLength(3);
    });
  });
});
