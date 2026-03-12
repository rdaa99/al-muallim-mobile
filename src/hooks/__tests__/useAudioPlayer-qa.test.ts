/**
 * QA Tests — Audio Player Hook (SC-3.x scenarios)
 */
import { renderHook, act } from '@testing-library/react-native';
import { useAudioPlayer } from '../useAudioPlayer';

// Mock react-native-sound with setSpeed support
const mockSoundInstance = {
  play: jest.fn((cb) => cb && cb(true)),
  pause: jest.fn(),
  stop: jest.fn(),
  release: jest.fn(),
  getDuration: jest.fn(() => 60),
  getCurrentTime: jest.fn((cb) => cb(0, false)),
  setCurrentTime: jest.fn(),
  setVolume: jest.fn(),
  setSpeed: jest.fn(),
};

jest.mock('react-native-sound', () => {
  const mockConstructor = jest.fn().mockImplementation((_url, _basePath, callback) => {
    if (callback) {
      process.nextTick(() => callback(null));
    }
    return mockSoundInstance;
  });
  mockConstructor.setCategory = jest.fn();
  return { __esModule: true, default: mockConstructor };
});

describe('QA: Audio Player — SC-3.x', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset default implementations
    mockSoundInstance.play.mockImplementation((cb) => cb && cb(true));
    mockSoundInstance.getDuration.mockReturnValue(60);
    mockSoundInstance.getCurrentTime.mockImplementation((cb) => cb(0, false));
  });

  // SC-3.1 — Lecture basique
  describe('SC-3.1: Basic playback', () => {
    it('should go through loading → playing states', async () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => { result.current.play('https://cdn.islamic.network/quran/audio/128/ar.alafasy/001001.mp3'); });
      expect(result.current.isLoading).toBe(true);

      await act(async () => { await new Promise(r => process.nextTick(r)); });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isPlaying).toBe(true);
      expect(result.current.duration).toBe(60);
    });

    it('should pause and resume', async () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => { result.current.play('test.mp3'); });
      await act(async () => { await new Promise(r => process.nextTick(r)); });
      expect(result.current.isPlaying).toBe(true);

      act(() => { result.current.pause(); });
      expect(result.current.isPlaying).toBe(false);
      expect(mockSoundInstance.pause).toHaveBeenCalled();
    });

    it('should stop and reset position', async () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => { result.current.play('test.mp3'); });
      await act(async () => { await new Promise(r => process.nextTick(r)); });

      act(() => { result.current.seek(30); });
      expect(result.current.currentTime).toBe(30);

      act(() => { result.current.stop(); });
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.currentTime).toBe(0);
      expect(mockSoundInstance.stop).toHaveBeenCalled();
    });
  });

  // SC-3.2 — Changement de vitesse
  describe('SC-3.2: Speed control', () => {
    it('should call setSpeed on the sound instance', async () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => { result.current.play('test.mp3'); });
      await act(async () => { await new Promise(r => process.nextTick(r)); });

      act(() => { result.current.setPlaybackSpeed(0.5); });
      expect(mockSoundInstance.setSpeed).toHaveBeenCalledWith(0.5);
    });

    it('should handle all speed values: 0.5, 0.75, 1, 1.25, 1.5, 2', async () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => { result.current.play('test.mp3'); });
      await act(async () => { await new Promise(r => process.nextTick(r)); });

      for (const speed of [0.5, 0.75, 1, 1.25, 1.5, 2]) {
        act(() => { result.current.setPlaybackSpeed(speed); });
        expect(mockSoundInstance.setSpeed).toHaveBeenCalledWith(speed);
      }
      expect(mockSoundInstance.setSpeed).toHaveBeenCalledTimes(6);
    });

    it('should not crash if called before play', () => {
      const { result } = renderHook(() => useAudioPlayer());
      // No sound instance yet — should not throw
      act(() => { result.current.setPlaybackSpeed(2); });
      expect(mockSoundInstance.setSpeed).not.toHaveBeenCalled();
    });
  });

  // SC-3.3 — Boucle / Repetition
  describe('SC-3.3: Loop mode', () => {
    it('should toggle loop on and off', () => {
      const { result } = renderHook(() => useAudioPlayer());

      expect(result.current.isLooping).toBe(false);
      act(() => { result.current.toggleLoop(); });
      expect(result.current.isLooping).toBe(true);
      act(() => { result.current.toggleLoop(); });
      expect(result.current.isLooping).toBe(false);
    });

    it('should replay when track ends in loop mode', async () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => { result.current.toggleLoop(); });
      expect(result.current.isLooping).toBe(true);

      // Play completes with success=true and isLooping=true → should restart
      mockSoundInstance.play.mockImplementation((cb) => {
        if (cb) cb(true); // Track finishes successfully
      });

      act(() => { result.current.play('test.mp3'); });
      await act(async () => { await new Promise(r => process.nextTick(r)); });

      // The play callback calls setCurrentTime(0) + play() when looping
      // Verify the track was set to beginning
      expect(mockSoundInstance.setCurrentTime).toHaveBeenCalledWith(0);
    });
  });

  // SC-3.7 — Erreur reseau audio
  describe('SC-3.7: Network error handling', () => {
    it('should set error state on load failure', async () => {
      const Sound = require('react-native-sound').default;
      Sound.mockImplementationOnce((_url: string, _bp: string, cb: (err: Error) => void) => {
        if (cb) process.nextTick(() => cb(new Error('Network error')));
        return mockSoundInstance;
      });

      const { result } = renderHook(() => useAudioPlayer());
      act(() => { result.current.play('bad-url.mp3'); });
      await act(async () => { await new Promise(r => process.nextTick(r)); });

      expect(result.current.error).toBe('Audio non disponible');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isPlaying).toBe(false);
    });

    it('should set error on playback failure', async () => {
      mockSoundInstance.play.mockImplementation((cb) => {
        if (cb) cb(false); // success=false
      });

      const { result } = renderHook(() => useAudioPlayer());
      act(() => { result.current.play('test.mp3'); });
      await act(async () => { await new Promise(r => process.nextTick(r)); });

      expect(result.current.error).toBe('Erreur de lecture');
    });
  });

  // SC-3.8 — Changement rapide pendant le chargement
  describe('SC-3.8: Rapid track switching', () => {
    it('should cleanup previous sound when playing a new one', async () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => { result.current.play('track1.mp3'); });
      await act(async () => { await new Promise(r => process.nextTick(r)); });

      // Play another track immediately
      act(() => { result.current.play('track2.mp3'); });

      // Previous sound should be stopped and released
      expect(mockSoundInstance.stop).toHaveBeenCalled();
      expect(mockSoundInstance.release).toHaveBeenCalled();
    });
  });

  // SC-7.3 — Cleanup on unmount
  describe('SC-7.3: Cleanup on unmount', () => {
    it('should stop and release sound on unmount', async () => {
      const { result, unmount } = renderHook(() => useAudioPlayer());

      act(() => { result.current.play('test.mp3'); });
      await act(async () => { await new Promise(r => process.nextTick(r)); });

      unmount();
      expect(mockSoundInstance.stop).toHaveBeenCalled();
      expect(mockSoundInstance.release).toHaveBeenCalled();
    });
  });

  // SC-3.4 — Seek
  describe('Seek functionality', () => {
    it('should update currentTime and call setCurrentTime', async () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => { result.current.play('test.mp3'); });
      await act(async () => { await new Promise(r => process.nextTick(r)); });

      act(() => { result.current.seek(45.5); });
      expect(result.current.currentTime).toBe(45.5);
      expect(mockSoundInstance.setCurrentTime).toHaveBeenCalledWith(45.5);
    });

    it('should handle seek to 0', async () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => { result.current.play('test.mp3'); });
      await act(async () => { await new Promise(r => process.nextTick(r)); });

      act(() => { result.current.seek(0); });
      expect(result.current.currentTime).toBe(0);
    });
  });

  // Replay
  describe('Replay', () => {
    it('should replay the current URL', async () => {
      const Sound = require('react-native-sound').default;
      const { result } = renderHook(() => useAudioPlayer());

      act(() => { result.current.play('test.mp3'); });
      await act(async () => { await new Promise(r => process.nextTick(r)); });

      const callsBefore = Sound.mock.calls.length;
      act(() => { result.current.replay(); });

      // Should create a new Sound with the same URL
      expect(Sound.mock.calls.length).toBe(callsBefore + 1);
      expect(Sound.mock.calls[Sound.mock.calls.length - 1][0]).toBe('test.mp3');
    });

    it('should do nothing if no URL was played', () => {
      const Sound = require('react-native-sound').default;
      const { result } = renderHook(() => useAudioPlayer());

      const callsBefore = Sound.mock.calls.length;
      act(() => { result.current.replay(); });
      expect(Sound.mock.calls.length).toBe(callsBefore);
    });
  });
});
