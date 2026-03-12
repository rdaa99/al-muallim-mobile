import React from 'react';
import { render } from '@testing-library/react-native';
import { DashboardScreen } from '../DashboardScreen';
import { useAppStore } from '@/stores/appStore';
import { useUserStore } from '../../stores/userStore';

// Mock the stores
jest.mock('@/stores/appStore');
jest.mock('../../stores/userStore');

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

const mockStats = {
  total_verses: 995,
  total_learned: 50,
  total_mastered: 20,
  total_consolidating: 15,
  total_learning: 15,
  mastered: 20,
  consolidating: 15,
  learning: 15,
  streak_days: 5,
  retention_rate: 0.85,
  verses_by_juz: [],
  verses_by_surah: [],
  surahs: [],
  calendar: [],
  this_month: 30,
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
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      stats: mockStats,
      dailyReview: { date: '2026-03-12', due_count: 10, completed_count: 3, verses: [] },
      loadStats: jest.fn(),
      loadTodayReview: jest.fn(),
    });
    (useUserStore as unknown as jest.Mock).mockReturnValue({
      settings: mockSettings,
      updateSettings: jest.fn(),
    });
  });

  it('should render greeting', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('common.welcome')).toBeTruthy();
  });

  it('should render dashboard title', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('dashboard.title')).toBeTruthy();
  });

  it('should display streak card', () => {
    const { getAllByText } = render(<DashboardScreen />);
    expect(getAllByText('5').length).toBeGreaterThanOrEqual(1);
  });

  it('should display progress cards', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('dashboard.ayahsMemorized')).toBeTruthy();
    expect(getByText('dashboard.dailyGoal')).toBeTruthy();
  });

  it('should display quick action buttons', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('dashboard.continue')).toBeTruthy();
    expect(getByText('dashboard.reviewBtn')).toBeTruthy();
    expect(getByText('dashboard.stats')).toBeTruthy();
  });

  it('should handle zero stats', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      stats: null,
      dailyReview: null,
      loadStats: jest.fn(),
      loadTodayReview: jest.fn(),
    });

    const { getAllByText } = render(<DashboardScreen />);
    expect(getAllByText('0').length).toBeGreaterThanOrEqual(2);
  });
});
