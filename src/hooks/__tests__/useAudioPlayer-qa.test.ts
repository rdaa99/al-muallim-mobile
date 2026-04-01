/**
 * QA Tests — Audio Player Hook (SC-3.x scenarios)
 * Basic playback and core functionality
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAudioPlayer } from '../useAudioPlayer';
import { Audio } from 'expo-av';

// Mock expo-av
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(),
    },
    setAudioModeAsync: jest.fn(),
  },
}));

describe('QA: Audio Player — SC-3.x', () => {
  const testUrl = 'https://example.com/audio.mp3';
  let mockSound: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSound = {
      playAsync: jest.fn(() => Promise.resolve({ isLoaded: true, isPlaying: true })),
      pauseAsync: jest.fn(() => Promise.resolve({ isLoaded: true, isPlaying: false })),
      stopAsync: jest.fn(() => Promise.resolve({ isLoaded: true, isPlaying: false, positionMillis: 0 })),
      unloadAsync: jest.fn(() => Promise.resolve()),
      setPositionAsync: jest.fn(() => Promise.resolve()),
      setVolumeAsync: jest.fn(() => Promise.resolve()),
      setRateAsync: jest.fn(() => Promise.resolve()),
      getStatusAsync: jest.fn(() =>
        Promise.resolve({
          isLoaded: true,
          isPlaying: false,
          durationMillis: 60000,
          positionMillis: 0,
        })
      ),
    };

    (Audio.Sound.createAsync as jest.Mock).mockResolvedValue({
      sound: mockSound,
      status: { isLoaded: true, durationMillis: 60000 },
    });
  });

  describe('Basic playback', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useAudioPlayer());
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.duration).toBe(0);
      expect(result.current.currentTime).toBe(0);
      expect(result.current.error).toBeNull();
    });

    it('should load and play audio', async () => {
      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.play(testUrl);
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.duration).toBe(60);
      expect(Audio.Sound.createAsync).toHaveBeenCalledWith(
        { uri: testUrl },
        { shouldPlay: true },
        expect.any(Function)
      );
    });

    it('should pause audio', async () => {
      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.play(testUrl);
      });

      await act(async () => {
        await result.current.pause();
      });

      expect(result.current.isPlaying).toBe(false);
      expect(mockSound.pauseAsync).toHaveBeenCalled();
    });

    it('should stop audio and reset state', async () => {
      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.play(testUrl);
      });

      await act(async () => {
        await result.current.stop();
      });

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.currentTime).toBe(0);
    });
  });

  describe('Loop mode', () => {
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

  describe('Seek functionality', () => {
    it('should seek to position', async () => {
      const { result } = renderHook(() => useAudioPlayer());
      await act(async () => {
        await result.current.play(testUrl);
      });

      await act(async () => {
        await result.current.seek(30);
      });

      expect(result.current.currentTime).toBe(30);
      expect(mockSound.setPositionAsync).toHaveBeenCalledWith(30000);
    });
  });
});
