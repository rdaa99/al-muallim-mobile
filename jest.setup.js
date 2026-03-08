// Jest setup file
require('@testing-library/jest-native/extend-expect');

// Mock Audio for React Native
global.Audio = class Audio {
  constructor(src) {
    this.src = src;
    this.loop = false;
    this.currentTime = 0;
    this.duration = 0;
    this.paused = true;
    this._eventListeners = {};
  }

  addEventListener(type, listener) {
    if (!this._eventListeners[type]) {
      this._eventListeners[type] = [];
    }
    this._eventListeners[type].push(listener);
  }

  removeEventListener(type, listener) {
    if (this._eventListeners[type]) {
      const index = this._eventListeners[type].indexOf(listener);
      if (index > -1) {
        this._eventListeners[type].splice(index, 1);
      }
    }
  }

  play() {
    this.paused = false;
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
  }
};

// Mock react-native-quick-sqlite
jest.mock('react-native-quick-sqlite', () => ({
  open: jest.fn(() => ({
    execute: jest.fn(() => ({ rows: [], insertId: 1 })),
    close: jest.fn(),
  })),
}));

// Mock react-native-sound
jest.mock('react-native-sound', () => {
  const mockSound = jest.fn().mockImplementation(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    stop: jest.fn(),
    release: jest.fn(),
    getDuration: jest.fn(() => 60),
    getCurrentTime: jest.fn((cb) => cb(0, false)),
    setCurrentTime: jest.fn(),
    setVolume: jest.fn(),
  }));

  mockSound.setCategory = jest.fn();

  return {
    __esModule: true,
    default: mockSound,
  };
});
