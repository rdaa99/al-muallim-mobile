/**
 * Tests for Reciter Service
 */

import {
  getReciterById,
  getAllReciters,
  getAudioUrl,
  isValidReciter,
  getReciterDisplayName,
  DEFAULT_RECITER,
  AVAILABLE_RECITERS,
} from '../reciterService';

describe('Reciter Service', () => {
  describe('getReciterById', () => {
    it('should return reciter by valid ID', () => {
      const reciter = getReciterById('afasy');
      expect(reciter).toBeDefined();
      expect(reciter?.name).toBe('Mishary Al-Afasy');
    });

    it('should return undefined for invalid ID', () => {
      const reciter = getReciterById('invalid_reciter');
      expect(reciter).toBeUndefined();
    });

    it('should return reciter with all properties', () => {
      const reciter = getReciterById('husary');
      expect(reciter).toMatchObject({
        id: 'husary',
        name: 'Mahmoud Khalil Al-Husary',
        englishName: 'Mahmoud Khalil Al-Husary',
        style: expect.any(String),
      });
    });
  });

  describe('getAllReciters', () => {
    it('should return array of reciters', () => {
      const reciters = getAllReciters();
      expect(Array.isArray(reciters)).toBe(true);
      expect(reciters.length).toBeGreaterThan(0);
    });

    it('should include at least 3 popular reciters', () => {
      const reciters = getAllReciters();
      expect(reciters.length).toBeGreaterThanOrEqual(3);
    });

    it('should include required reciters', () => {
      const reciters = getAllReciters();
      const reciterIds = reciters.map((r) => r.id);
      
      expect(reciterIds).toContain('afasy');
      expect(reciterIds).toContain('abdul_basit');
      expect(reciterIds).toContain('husary');
    });
  });

  describe('getAudioUrl', () => {
    it('should generate correct URL for Al-Afasy', () => {
      const url = getAudioUrl(1, 1, 'afasy');
      expect(url).toContain('cdn.islamic.network');
      expect(url).toContain('ar.alafasy');
      expect(url).toContain('001001.mp3');
    });

    it('should generate correct URL for Abdul Basit', () => {
      const url = getAudioUrl(2, 255, 'abdul_basit');
      expect(url).toContain('ar.abdulbasitmurattal');
      expect(url).toContain('002255.mp3');
    });

    it('should pad surah and ayah numbers correctly', () => {
      const url = getAudioUrl(1, 1, 'afasy');
      expect(url).toMatch(/001001\.mp3$/);
    });

    it('should use default reciter when none specified', () => {
      const url = getAudioUrl(1, 1);
      expect(url).toContain('ar.alafasy');
    });

    it('should fallback to default for invalid reciter', () => {
      const url = getAudioUrl(1, 1, 'invalid');
      expect(url).toContain('ar.alafasy');
    });

    it('should generate different URLs for different reciters', () => {
      const urlAfasy = getAudioUrl(1, 1, 'afasy');
      const urlHusary = getAudioUrl(1, 1, 'husary');
      
      expect(urlAfasy).not.toBe(urlHusary);
      expect(urlAfasy).toContain('alafasy');
      expect(urlHusary).toContain('husary');
    });
  });

  describe('isValidReciter', () => {
    it('should return true for valid reciters', () => {
      expect(isValidReciter('afasy')).toBe(true);
      expect(isValidReciter('abdul_basit')).toBe(true);
      expect(isValidReciter('husary')).toBe(true);
      expect(isValidReciter('sudais')).toBe(true);
      expect(isValidReciter('minshawi')).toBe(true);
    });

    it('should return false for invalid reciters', () => {
      expect(isValidReciter('invalid')).toBe(false);
      expect(isValidReciter('unknown')).toBe(false);
      expect(isValidReciter('')).toBe(false);
    });
  });

  describe('getReciterDisplayName', () => {
    it('should return correct display name for valid reciter', () => {
      expect(getReciterDisplayName('afasy')).toBe('Mishary Al-Afasy');
      expect(getReciterDisplayName('abdul_basit')).toBe('Abdul Basit');
    });

    it('should return "Unknown Reciter" for invalid reciter', () => {
      expect(getReciterDisplayName('invalid')).toBe('Unknown Reciter');
    });
  });

  describe('Constants', () => {
    it('should have default reciter as afasy', () => {
      expect(DEFAULT_RECITER).toBe('afasy');
    });

    it('should have 5 available reciters', () => {
      expect(AVAILABLE_RECITERS.length).toBe(5);
    });
  });
});
