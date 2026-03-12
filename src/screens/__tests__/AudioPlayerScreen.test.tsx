import React from 'react';
import { render } from '@testing-library/react-native';
import { AudioPlayerScreen } from '../AudioPlayerScreen';

// Mock hooks and stores
jest.mock('../../hooks/useAudioPlayer', () => ({
  useAudioPlayer: () => ({
    isPlaying: false,
    isLoading: false,
    isLooping: false,
    error: null,
    duration: 0,
    currentTime: 0,
    play: jest.fn(),
    pause: jest.fn(),
    stop: jest.fn(),
    replay: jest.fn(),
    toggleLoop: jest.fn(),
    seek: jest.fn(),
    setPlaybackSpeed: jest.fn(),
  }),
}));

jest.mock('../../stores/userStore', () => ({
  useUserStore: () => ({
    settings: {
      language: 'fr',
      reciter: { id: '1', name: 'عبد الباسط', englishName: 'Abdul Basit' },
      notificationsEnabled: true,
      dailyReminderTime: '08:00',
      darkMode: false,
      fontSize: 'medium',
    },
    updateSettings: jest.fn(),
  }),
}));

jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'dark',
    isDark: true,
    colors: {
      background: '#0F172A',
      surface: '#1E293B',
      primary: '#10B981',
      text: '#F8FAFC',
      textSecondary: '#94A3B8',
      border: '#334155',
      card: '#1E293B',
      tabBar: '#1E293B',
      header: '#0F172A',
    },
    toggleTheme: jest.fn(),
  }),
}));

jest.mock('../../services/database', () => ({
  getVerseBySurahAyah: jest.fn().mockResolvedValue(null),
}));

jest.mock('@react-native-community/slider', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) => <View testID="slider" {...props} />,
  };
});

describe('AudioPlayerScreen', () => {
  it('should render the screen title', () => {
    const { getByText } = render(<AudioPlayerScreen />);
    expect(getByText('audio.title')).toBeTruthy();
  });

  it('should display surah info', () => {
    const { getByText } = render(<AudioPlayerScreen />);
    expect(getByText('الفاتحة')).toBeTruthy();
    expect(getByText('Al-Fatiha')).toBeTruthy();
  });

  it('should display reciter name', () => {
    const { getByText } = render(<AudioPlayerScreen />);
    expect(getByText('Abdul Basit')).toBeTruthy();
  });

  it('should display speed control', () => {
    const { getByText } = render(<AudioPlayerScreen />);
    expect(getByText('audio.speed: 1x')).toBeTruthy();
  });

  it('should display additional controls', () => {
    const { getByText } = render(<AudioPlayerScreen />);
    expect(getByText('audio.repeat')).toBeTruthy();
    expect(getByText('audio.text')).toBeTruthy();
    expect(getByText('audio.playlist')).toBeTruthy();
  });
});
