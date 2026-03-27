import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { FocusModeScreen } from '../FocusModeScreen';
import * as FocusStore from '@/stores/focusStore';

// Mock the store
jest.mock('@/stores/focusStore', () => ({
  useFocusStore: jest.fn(),
  selectFormattedTime: jest.fn((state) => {
    const minutes = Math.floor(state.timeRemaining / 60);
    const seconds = state.timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }),
  selectProgress: jest.fn((state) => {
    if (state.totalTime === 0) return 0;
    return ((state.totalTime - state.timeRemaining) / state.totalTime) * 100;
  }),
}));

// Mock other dependencies
jest.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      background: '#fff',
      text: '#000',
      primary: '#007AFF',
      border: '#ccc',
      card: '#f5f5f5',
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
      white: '#fff',
      textSecondary: '#666',
    },
  }),
}));

jest.mock('@/context/FontSizeContext', () => ({
  useFonts: () => ({
    fonts: {
      tiny: { fontSize: 12 },
      small: { fontSize: 14 },
      medium: { fontSize: 16 },
      large: { fontSize: 18 },
      title: { fontSize: 48 },
    },
  }),
}));

jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    settings: { language: 'en' },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      const translations: Record<string, string> = {
        'focus.ready': 'Ready',
        'focus.focusPhase': 'Focus',
        'focus.breakPhase': 'Break',
        'focus.paused': 'Paused',
        'focus.completed': 'Completed!',
        'focus.startFocus': 'Start Focus',
        'focus.pause': 'Pause',
        'focus.resume': 'Resume',
        'focus.reset': 'Reset',
        'focus.skip': 'Skip',
        'focus.pomodoros': 'pomodoros',
        'focus.versesReviewed': 'verses reviewed',
        'focus.focusDuration': 'Focus Duration (min)',
        'focus.breakDuration': 'Break Duration (min)',
        'common.cancel': 'Cancel',
        'common.confirm': 'Confirm',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock Alert
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Alert: {
    alert: jest.fn(),
  },
  Dimensions: {
    get: () => ({ width: 375, height: 812 }),
  },
}));

describe('FocusModeScreen', () => {
  const mockStore = {
    phase: 'idle',
    timeRemaining: 25 * 60,
    totalTime: 25 * 60,
    config: {
      focusDuration: 25,
      breakDuration: 5,
      autoStartBreak: false,
      soundEnabled: true,
      vibrationEnabled: true,
      zenMode: false,
    },
    currentVerse: null,
    versesReviewed: 0,
    completedPomodoros: 0,
    setConfig: jest.fn(),
    startFocus: jest.fn(),
    startBreak: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    reset: jest.fn(),
    skip: jest.fn(),
    tick: jest.fn(),
    endSession: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (FocusStore.useFocusStore as jest.Mock).mockImplementation((selector) => {
      if (selector) {
        return selector(mockStore);
      }
      return mockStore;
    });
  });

  it('should render idle state correctly', () => {
    const { getByText } = render(<FocusModeScreen />);
    
    expect(getByText('Ready')).toBeTruthy();
    expect(getByText('Start Focus')).toBeTruthy();
    expect(getByText('25:00')).toBeTruthy();
  });

  it('should render focus phase correctly', () => {
    mockStore.phase = 'focus';
    mockStore.timeRemaining = 20 * 60;
    
    const { getByText } = render(<FocusModeScreen />);
    
    expect(getByText('Focus')).toBeTruthy();
    expect(getByText('20:00')).toBeTruthy();
  });

  it('should render break phase correctly', () => {
    mockStore.phase = 'break';
    mockStore.timeRemaining = 3 * 60;
    
    const { getByText } = render(<FocusModeScreen />);
    
    expect(getByText('Break')).toBeTruthy();
    expect(getByText('03:00')).toBeTruthy();
  });

  it('should render paused state correctly', () => {
    mockStore.phase = 'paused';
    
    const { getByText } = render(<FocusModeScreen />);
    
    expect(getByText('Paused')).toBeTruthy();
    expect(getByText('Resume')).toBeTruthy();
  });

  it('should call startFocus when Start Focus button is pressed', () => {
    mockStore.phase = 'idle';
    
    const { getByText } = render(<FocusModeScreen />);
    fireEvent.press(getByText('Start Focus'));
    
    expect(mockStore.startFocus).toHaveBeenCalled();
  });

  it('should call pause when Pause button is pressed', () => {
    mockStore.phase = 'focus';
    
    const { getByText } = render(<FocusModeScreen />);
    fireEvent.press(getByText('Pause'));
    
    expect(mockStore.pause).toHaveBeenCalled();
  });

  it('should call resume when Resume button is pressed', () => {
    mockStore.phase = 'paused';
    
    const { getByText } = render(<FocusModeScreen />);
    fireEvent.press(getByText('Resume'));
    
    expect(mockStore.resume).toHaveBeenCalled();
  });

  it('should show pomodoro count when > 0', () => {
    mockStore.phase = 'focus';
    mockStore.completedPomodoros = 3;
    
    const { getByText } = render(<FocusModeScreen />);
    
    expect(getByText(/3 pomodoros/)).toBeTruthy();
  });

  it('should show verses reviewed count when > 0', () => {
    mockStore.phase = 'focus';
    mockStore.versesReviewed = 10;
    
    const { getByText } = render(<FocusModeScreen />);
    
    expect(getByText('10 verses reviewed')).toBeTruthy();
  });

  it('should allow changing focus duration in idle state', () => {
    mockStore.phase = 'idle';
    
    const { getByText } = render(<FocusModeScreen />);
    fireEvent.press(getByText('30'));
    
    expect(mockStore.setConfig).toHaveBeenCalledWith({ focusDuration: 30 });
  });

  it('should allow changing break duration in idle state', () => {
    mockStore.phase = 'idle';
    
    const { getByText } = render(<FocusModeScreen />);
    fireEvent.press(getByText('10'));
    
    expect(mockStore.setConfig).toHaveBeenCalledWith({ breakDuration: 10 });
  });

  it('should call tick every second during focus phase', () => {
    jest.useFakeTimers();
    
    mockStore.phase = 'focus';
    
    render(<FocusModeScreen />);
    
    jest.advanceTimersByTime(3000);
    
    expect(mockStore.tick).toHaveBeenCalledTimes(3);
    
    jest.useRealTimers();
  });

  it('should display current verse during focus phase', () => {
    mockStore.phase = 'focus';
    mockStore.currentVerse = {
      id: 1,
      surah_number: 1,
      verse_number: 1,
      text_arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      text_translation: 'In the name of Allah',
      juz_number: 1,
      page_number: 1,
    };
    
    const { getByText } = render(<FocusModeScreen />);
    
    expect(getByText(/بِسْمِ اللَّهِ/)).toBeTruthy();
    expect(getByText('1:1')).toBeTruthy();
  });
});
