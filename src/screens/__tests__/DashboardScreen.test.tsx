import React from 'react';
import { render } from '@testing-library/react-native';
import { DashboardScreen } from '../DashboardScreen';
import { useUserStore } from '../../store/userStore';

// Mock the stores
jest.mock('../../store/userStore');

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

// Mock contexts
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

jest.mock('../../context/FontSizeContext', () => ({
  useFonts: () => ({
    fontSize: 'medium',
    fonts: {
      caption: 12,
      body: 14,
      subheading: 16,
      heading: 18,
      title: 24,
      hero: 28,
    },
    scale: (size: number) => size,
  }),
}));

const mockProgress = {
  surahsMemorized: 10,
  totalAyahs: 6236,
  ayahsMemorized: 500,
  currentStreak: 5,
  longestStreak: 15,
  dailyGoal: 10,
  weeklyProgress: [5, 10, 8, 12, 10, 0, 0],
};

const mockSettings = {
  language: 'fr',
  reciter: null,
  notificationsEnabled: true,
  dailyReminderTime: '08:00',
  darkMode: false,
  fontSize: 'medium' as const,
};

describe('DashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useUserStore as unknown as jest.Mock).mockReturnValue({
      progress: mockProgress,
      settings: mockSettings,
      updateProgress: jest.fn(),
      updateSettings: jest.fn(),
    });
  });

  it('should render greeting', () => {
    const { getByText } = render(<DashboardScreen />);
    // useTranslation returns the key as-is
    expect(getByText('common.welcome')).toBeTruthy();
  });

  it('should render dashboard title', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('dashboard.title')).toBeTruthy();
  });

  it('should display streak card', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('5')).toBeTruthy();
    expect(getByText('15')).toBeTruthy();
  });

  it('should display progress cards', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('dashboard.surahsMemorized')).toBeTruthy();
    expect(getByText('dashboard.ayahsMemorized')).toBeTruthy();
    expect(getByText('dashboard.dailyGoal')).toBeTruthy();
  });

  it('should display quick action buttons', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('Continuer')).toBeTruthy();
    expect(getByText('Réviser')).toBeTruthy();
    expect(getByText('Stats')).toBeTruthy();
  });

  it('should handle zero streak', () => {
    (useUserStore as unknown as jest.Mock).mockReturnValue({
      progress: { ...mockProgress, currentStreak: 0, longestStreak: 0 },
      settings: mockSettings,
      updateProgress: jest.fn(),
      updateSettings: jest.fn(),
    });

    const { getAllByText } = render(<DashboardScreen />);
    expect(getAllByText('0').length).toBeGreaterThanOrEqual(2);
  });
});
