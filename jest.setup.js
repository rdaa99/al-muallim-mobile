// Jest setup file
require('@testing-library/jest-native/extend-expect');

// Create a mock sound instance that can be controlled
const createMockSound = () => {
  let _positionMillis = 0;
  let _isPlaying = false;
  let _durationMillis = 60000;
  let _rate = 1;

  const mockSound = {
    playAsync: jest.fn(() => {
      _isPlaying = true;
      return Promise.resolve({ isLoaded: true, isPlaying: true });
    }),
    pauseAsync: jest.fn(() => {
      _isPlaying = false;
      return Promise.resolve({ isLoaded: true, isPlaying: false });
    }),
    stopAsync: jest.fn(() => {
      _isPlaying = false;
      _positionMillis = 0;
      return Promise.resolve({ isLoaded: true, isPlaying: false });
    }),
    unloadAsync: jest.fn(() => Promise.resolve()),
    setPositionAsync: jest.fn((position) => {
      _positionMillis = position;
      return Promise.resolve();
    }),
    setVolumeAsync: jest.fn(() => Promise.resolve()),
    setRateAsync: jest.fn((rate, shouldCorrectPitch) => {
      _rate = rate;
      return Promise.resolve();
    }),
    getStatusAsync: jest.fn(() =>
      Promise.resolve({
        isLoaded: true,
        isPlaying: _isPlaying,
        durationMillis: _durationMillis,
        positionMillis: _positionMillis,
        rate: _rate,
      })
    ),
  };

  return mockSound;
};

// Mock expo-av to avoid ES module issues
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(() => {
        const mockSound = createMockSound();
        return Promise.resolve({
          sound: mockSound,
          status: { isLoaded: true, durationMillis: 60000 },
        });
      }),
    },
    setAudioModeAsync: jest.fn(),
  },
  Video: {
    useVideoPlayer: jest.fn(() => ({
      play: jest.fn(),
      pause: jest.fn(),
      replace: jest.fn(),
    })),
  },
}));

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  mergeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
  multiMerge: jest.fn(() => Promise.resolve()),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'fr', changeLanguage: jest.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: jest.fn() },
}));

// Mock i18next
jest.mock('i18next', () => ({
  use: jest.fn().mockReturnThis(),
  init: jest.fn(),
  t: (key) => key,
  changeLanguage: jest.fn(),
}));

// Mock react-native-quick-sqlite
jest.mock('react-native-quick-sqlite', () => ({
  open: jest.fn(() => ({
    execute: jest.fn(() => ({ rows: [], insertId: 1 })),
    close: jest.fn(),
  })),
}));

// Mock react-native-sound
jest.mock('react-native-sound', () => {
  const mockSoundInstance = {
    play: jest.fn((cb) => cb && cb(true)),
    pause: jest.fn(),
    stop: jest.fn(),
    release: jest.fn(),
    getDuration: jest.fn(() => 60),
    getCurrentTime: jest.fn((cb) => cb(0, false)),
    setCurrentTime: jest.fn(),
    setVolume: jest.fn(),
  };

  const mockSound = jest.fn().mockImplementation((_url, _basePath, callback) => {
    // Invoke callback asynchronously to simulate loading
    if (callback) {
      setTimeout(() => callback(null), 0);
    }
    return mockSoundInstance;
  });

  mockSound.setCategory = jest.fn();

  return {
    __esModule: true,
    default: mockSound,
  };
});
