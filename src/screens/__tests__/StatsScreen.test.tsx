import React from 'react';
import { render } from '@testing-library/react-native';
import { StatsScreen } from '../StatsScreen';
import { useStatsStore } from '@/stores/statsStore';
import { useUserStore } from '@/stores/userStore';

// Mock stores
jest.mock('@/stores/statsStore');
jest.mock('@/stores/userStore');

// Mock the navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock ThemeContext
jest.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      background: '#F8FAFC',
      surface: '#FFFFFF',
      primary: '#10B981',
      text: '#1E293B',
      textSecondary: '#64748B',
      border: '#E2E8F0',
      card: '#FFFFFF',
      tabBar: '#FFFFFF',
      header: '#FFFFFF',
    },
  }),
}));

// Mock FontSizeContext
jest.mock('@/context/FontSizeContext', () => ({
  useFonts: () => ({
    fonts: {
      hero: 24,
      heading: 18,
      body: 14,
    },
  }),
}));

describe('StatsScreen', () => {
  const mockStats = {
    total_verses: 995,
    total_learned: 100,
    total_mastered: 50,
    total_consolidating: 30,
    total_learning: 20,
    mastered: 50,
    consolidating: 30,
    learning: 20,
    streak_days: 5,
    longest_streak: 10,
    retention_rate: 0.85,
    verses_by_juz: [
      { juz_number: 29, total: 568, mastered: 30, consolidating: 20, learning: 10 },
    ],
    verses_by_surah: [],
    surahs: [],
    calendar: [],
    this_month: 50,
    total_review_sessions: 25,
    average_session_duration: 15,
    verses_per_session: 4,
    weekly_stats: [],
    daily_stats: [],
    retention_by_juz: [],
    retention_by_surah: [],
  };

  const mockSettings = {
    language: 'en',
    dailyNewLines: 10,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useStatsStore as unknown as jest.Mock).mockReturnValue({
      stats: mockStats,
      weeklyData: [5, 10, 8, 12, 7, 0, 0],
      loading: false,
      error: null,
      lastRefresh: '2024-03-27T00:00:00Z000Z',
      loadStats: jest.fn().mockResolvedValue(undefined),
      loadWeeklyData: jest.fn().mockResolvedValue(undefined),
      refreshAll: jest.fn().mockResolvedValue(undefined),
      clearError: jest.fn(),
    });

    (useUserStore as unknown as jest.Mock).mockReturnValue({
      settings: mockSettings,
      updateSettings: jest.fn(),
    });
  });

  it('renders correctly with stats', () => {
    const { getByText } = render(<StatsScreen />);

    // Check main elements are rendered
    expect(getByText('stats.title')).toBeTruthy();
    expect(getByText('stats.subtitle')).toBeTruthy();
  });

  it('shows loading state correctly', () => {
    (useStatsStore as unknown as jest.Mock).mockReturnValue({
      stats: null,
      weeklyData: [0, 0, 0, 0, 0, 0, 0],
      loading: true,
      error: null,
      lastRefresh: null,
      loadStats: jest.fn(),
      loadWeeklyData: jest.fn(),
      refreshAll: jest.fn(),
      clearError: jest.fn(),
    });

    const { getByText } = render(<StatsScreen />);

    // Component renders even when loading (with refresh control)
    expect(getByText('stats.title')).toBeTruthy();
  });

  it('displays error state correctly', () => {
    (useStatsStore as unknown as jest.Mock).mockReturnValue({
      stats: null,
      weeklyData: [0, 0, 0, 0, 0, 0, 0],
      loading: false,
      error: 'Failed to load stats',
      lastRefresh: null,
      loadStats: jest.fn(),
      loadWeeklyData: jest.fn(),
      refreshAll: jest.fn(),
      clearError: jest.fn(),
    });

    const { getByText } = render(<StatsScreen />);

    // Component should still render even with error
    expect(getByText('stats.title')).toBeTruthy();
  });

  it('renders juz progress section', () => {
    const { getByText } = render(<StatsScreen />);

    // Check Juz section
    expect(getByText('stats.juzProgress')).toBeTruthy();
  });

  it('renders session stats section', () => {
    const { getByText } = render(<StatsScreen />);

    // Check session stats section
    expect(getByText('stats.sessionStats')).toBeTruthy();
  });
});
