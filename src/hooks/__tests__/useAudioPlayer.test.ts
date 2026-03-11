import { renderHook, act } from '@testing-library/react-native';
import { useAudioPlayer } from '../useAudioPlayer';

// Mock react-native-sound at the top level
jest.mock('react-native-sound', () => {
  const mockSoundConstructor = jest.fn().mockImplementation((url, basePath, callback) => {
    const mockSoundInstance = {
      play: jest.fn((playCallback) => {
        if (playCallback) {
          playCallback(true);
        }
      }),
      pause: jest.fn(),
      stop: jest.fn(),
      release: jest.fn(),
      getDuration: jest.fn(() => 60),
      getCurrentTime: jest.fn((cb) => cb(0, false)),
      setCurrentTime: jest.fn(),
      setVolume: jest.fn(),
    };

    // Call callback asynchronously to ensure sound instance is fully constructed
    if (callback) {
      process.nextTick(() => callback(null));
    }

    return mockSoundInstance;
  });

  // Add static method to the mock constructor
  mockSoundConstructor.setCategory = jest.fn();

  return {
    __esModule: true,
    default: mockSoundConstructor,
  };
});

describe('useAudioPlayer', () => {
  const testUrl = 'https://example.com/audio.mp3';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAudioPlayer());

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isLooping).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.duration).toBe(0);
    expect(result.current.currentTime).toBe(0);
  });

  it('should start loading and finish loading when play is called', async () => {
    const { result } = renderHook(() => useAudioPlayer());

    act(() => {
      result.current.play(testUrl);
    });

    // Wait for next tick
    await act(async () => {
      await new Promise(resolve => process.nextTick(resolve));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.duration).toBe(60);
  });

  it('should set isPlaying to true when audio starts playing', async () => {
    const { result } = renderHook(() => useAudioPlayer());

    act(() => {
      result.current.play(testUrl);
    });

    // Wait for next tick
    await act(async () => {
      await new Promise(resolve => process.nextTick(resolve));
    });

    // Should be playing after play() is called
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.isLoading).toBe(false);
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

  it('should stop audio and reset state', async () => {
    const { result } = renderHook(() => useAudioPlayer());

    act(() => {
      result.current.play(testUrl);
    });

    // Wait for next tick
    await act(async () => {
      await new Promise(resolve => process.nextTick(resolve));
    });

    act(() => {
      result.current.stop();
    });

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentTime).toBe(0);
  });

  it('should handle errors during loading', async () => {
    // Get the mock and override it for this test only
    const Sound = require('react-native-sound').default;
    Sound.mockImplementationOnce((url, basePath, callback) => {
      const mockSoundInstance = {
        play: jest.fn(),
        pause: jest.fn(),
        stop: jest.fn(),
        release: jest.fn(),
        getDuration: jest.fn(() => 0),
        getCurrentTime: jest.fn((cb) => cb(0, false)),
        setCurrentTime: jest.fn(),
        setVolume: jest.fn(),
      };

      if (callback) {
        process.nextTick(() => callback(new Error('Load failed')));
      }

      return mockSoundInstance;
    });

    const { result } = renderHook(() => useAudioPlayer());

    act(() => {
      result.current.play(testUrl);
    });

    // Wait for next tick
    await act(async () => {
      await new Promise(resolve => process.nextTick(resolve));
    });

    expect(result.current.error).toBe('Audio non disponible');
    expect(result.current.isLoading).toBe(false);
  });

  it('should seek to a specific time', async () => {
    const { result } = renderHook(() => useAudioPlayer());

    // First play audio to create the sound instance
    act(() => {
      result.current.play(testUrl);
    });

    // Wait for next tick
    await act(async () => {
      await new Promise(resolve => process.nextTick(resolve));
    });

    const seekTime = 50;
    act(() => {
      result.current.seek(seekTime);
    });

    expect(result.current.currentTime).toBe(seekTime);
  });

  it('should pause audio', async () => {
    const { result } = renderHook(() => useAudioPlayer());

    act(() => {
      result.current.play(testUrl);
    });

    // Wait for next tick
    await act(async () => {
      await new Promise(resolve => process.nextTick(resolve));
    });

    act(() => {
      result.current.pause();
    });

    expect(result.current.isPlaying).toBe(false);
  });

  it('should call Sound.setCategory when hook is initialized', () => {
    const Sound = require('react-native-sound').default;
    
    renderHook(() => useAudioPlayer());

    expect(Sound.setCategory).toHaveBeenCalledWith('Playback');
  });
});
