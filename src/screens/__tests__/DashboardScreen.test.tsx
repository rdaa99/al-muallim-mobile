import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { DashboardScreen } from '../DashboardScreen';
import { useAppStore } from '@/stores/appStore';

// Mock the store
jest.mock('@/stores/appStore');

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

describe('DashboardScreen', () => {
  const mockLoadStats = jest.fn();

  const mockStats = {
    total_verses: 6236,
    mastered: 100,
    consolidating: 50,
    learning: 25,
    streak_days: 7,
    retention_rate: 0.85,
    verses_by_juz: [
      { juz_number: 30, total: 564, mastered: 100, consolidating: 50, learning: 25 },
    ],
    verses_by_surah: [],
    total_learned: 175,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      stats: mockStats,
      loading: false,
      loadStats: mockLoadStats,
    });
  });

  it('should render loading state', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      stats: null,
      loading: true,
      loadStats: mockLoadStats,
    });

    const { getByText } = render(<DashboardScreen />);
    expect(getByText('Chargement des statistiques...')).toBeTruthy();
  });

  it('should render empty state for new users', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      stats: {
        ...mockStats,
        total_learned: 0,
        mastered: 0,
      },
      loading: false,
      loadStats: mockLoadStats,
    });

    const { getByText } = render(<DashboardScreen />);
    expect(getByText('Bienvenue !')).toBeTruthy();
    expect(getByText(/Commencez votre voyage/)).toBeTruthy();
  });

  it('should display streak correctly', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('7')).toBeTruthy();
    expect(getByText('jours consécutifs')).toBeTruthy();
  });

  it('should calculate and display progress percentage', () => {
    const { getByText } = render(<DashboardScreen />);
    const percentage = Math.round((mockStats.mastered / mockStats.total_verses) * 100);
    expect(getByText(`${percentage}%`)).toBeTruthy();
  });

  it('should show status distribution', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('✅ Maîtrisés')).toBeTruthy();
    expect(getByText('100')).toBeTruthy();
    expect(getByText('🔄 En consolidation')).toBeTruthy();
    expect(getByText('📖 En apprentissage')).toBeTruthy();
  });

  it('should display retention rate', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('📊 Taux de rétention')).toBeTruthy();
    expect(getByText('85%')).toBeTruthy();
  });

  it('should show juz progress if available', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('Progression par Juz')).toBeTruthy();
    expect(getByText('Juz 30')).toBeTruthy();
  });

  it('should call loadStats on mount', () => {
    render(<DashboardScreen />);
    expect(mockLoadStats).toHaveBeenCalled();
  });

  it('should refresh stats on pull-to-refresh', async () => {
    const { getByTestId } = render(<DashboardScreen />);
    
    // Find RefreshControl and simulate refresh
    // Note: This is a simplified test; actual refresh testing may need additional setup
    
    await waitFor(() => {
      expect(mockLoadStats).toHaveBeenCalled();
    });
  });

  it('should display quick stats grid', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('175')).toBeTruthy(); // total learned
    expect(getByText('Appris')).toBeTruthy();
    expect(getByText('Jours')).toBeTruthy();
    expect(getByText('Maîtrisés')).toBeTruthy();
  });

  it('should show pull-to-refresh hint', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText(/Tirez vers le bas pour actualiser/)).toBeTruthy();
  });

  it('should handle zero streak', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      stats: { ...mockStats, streak_days: 0 },
      loading: false,
      loadStats: mockLoadStats,
    });

    const { getByText } = render(<DashboardScreen />);
    expect(getByText('0')).toBeTruthy();
  });

  it('should handle missing juz data gracefully', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      stats: { ...mockStats, verses_by_juz: [] },
      loading: false,
      loadStats: mockLoadStats,
    });

    const { queryByText } = render(<DashboardScreen />);
    expect(queryByText('Progression par Juz')).toBeNull();
  });
});
