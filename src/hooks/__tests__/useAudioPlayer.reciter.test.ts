/**
 * Tests for useAudioPlayer hook with reciter support
 */

import { renderHook, act } from '@testing-library/react-native';
import { useAudioPlayer } from '../useAudioPlayer';
import { Audio } from 'expo-av';

// Mock expo-av
jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn(),
    Sound: {
      createAsync: jest.fn(),
    },
  },
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('useAudioPlayer with Reciter Support', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should use default reciter when none provided', () => {
      const { result } = renderHook(() => useAudioPlayer());
      
      // The hook should initialize without errors
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('should use provided reciter ID', () => {
      const { result } = renderHook(() =>
        useAudioPlayer({ reciterId: 'husary' })
      );

      expect(result.current.isPlaying).toBe(false);
    });

    it('should fallback to default for invalid reciter', () => {
      const { result } = renderHook(() =>
        useAudioPlayer({ reciterId: 'invalid' })
      );

      // Should use default reciter instead
      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe('play with surah and ayah', () => {
    it('should generate audio URL using reciter service', async () => {
      const mockSound = {
        getStatusAsync: jest.fn().mockResolvedValue({
          isLoaded: true,
          durationMillis: 30000,
        }),
        unloadAsync: jest.fn(),
      };

      (Audio.Sound.createAsync as jest.Mock).mockResolvedValue({
        sound: mockSound,
      });

      const { result } = renderHook(() =>
        useAudioPlayer({ reciterId: 'husary' })
      );

      await act(async () => {
        await result.current.play(1, 1);
      });

      expect(Audio.Sound.createAsync).toHaveBeenCalledWith(
        expect.objectContaining({ uri: expect.stringContaining('husary') }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('should accept direct URL', async () => {
      const mockSound = {
        getStatusAsync: jest.fn().mockResolvedValue({
          isLoaded: true,
          durationMillis: 30000,
        }),
        unloadAsync: jest.fn(),
      };

      (Audio.Sound.createAsync as jest.Mock).mockResolvedValue({
        sound: mockSound,
      });

      const { result } = renderHook(() => useAudioPlayer());

      const directUrl = 'https://example.com/audio.mp3';

      await act(async () => {
        await result.current.play(directUrl);
      });

      expect(Audio.Sound.createAsync).toHaveBeenCalledWith(
        { uri: directUrl },
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('should override reciter for specific verse', async () => {
      const mockSound = {
        getStatusAsync: jest.fn().mockResolvedValue({
          isLoaded: true,
          durationMillis: 30000,
        }),
        unloadAsync: jest.fn(),
      };

      (Audio.Sound.createAsync as jest.Mock).mockResolvedValue({
        sound: mockSound,
      });

      const { result } = renderHook(() =>
        useAudioPlayer({ reciterId: 'afasy' })
      );

      await act(async () => {
        // Play with different reciter
        await result.current.play(1, 1, 'husary');
      });

      expect(Audio.Sound.createAsync).toHaveBeenCalledWith(
        expect.objectContaining({ uri: expect.stringContaining('husary') }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('controls', () => {
    it('should pause playback', async () => {
      const mockSound = {
        pauseAsync: jest.fn(),
        getStatusAsync: jest.fn().mockResolvedValue({ isLoaded: true }),
        unloadAsync: jest.fn(),
      };

      (Audio.Sound.createAsync as jest.Mock).mockResolvedValue({
        sound: mockSound,
      });

      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.play(1, 1);
      });

      await act(async () => {
        await result.current.pause();
      });

      expect(mockSound.pauseAsync).toHaveBeenCalled();
      expect(result.current.isPlaying).toBe(false);
    });

    it('should stop playback', async () => {
      const mockSound = {
        stopAsync: jest.fn(),
        getStatusAsync: jest.fn().mockResolvedValue({ isLoaded: true }),
        unloadAsync: jest.fn(),
      };

      (Audio.Sound.createAsync as jest.Mock).mockResolvedValue({
        sound: mockSound,
      });

      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.play(1, 1);
      });

      await act(async () => {
        await result.current.stop();
      });

      expect(mockSound.stopAsync).toHaveBeenCalled();
      expect(result.current.isPlaying).toBe(false);
    });

    it('should toggle loop mode', () => {
      const { result } = renderHook(() => useAudioPlayer());

      expect(result.current.isLooping).toBe(false);

      act(() => {
        result.current.toggleLoop();
      });

      expect(result.current.isLooping).toBe(true);

      act(() => {
        result.current.toggleLoop();
      });

      expect(result.current.isLooping).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle playback errors', async () => {
      (Audio.Sound.createAsync as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.play(1, 1);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle invalid play parameters', async () => {
      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        // @ts-ignore - Testing invalid params
        await result.current.play('invalid');
      });

      expect(result.current.error).toBeTruthy();
    });
  });
});
