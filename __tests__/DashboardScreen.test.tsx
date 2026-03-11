import React from 'react';
import { render } from '@testing-library/react-native';
import { DashboardScreen } from '../src/screens/DashboardScreen';
import { useUserStore } from '../src/store/userStore';

// Mock the store
jest.mock('../src/store/userStore');

describe('DashboardScreen', () => {
  beforeEach(() => {
    (useUserStore as unknown as jest.Mock).mockReturnValue({
      progress: {
        surahsMemorized: 10,
        totalAyahs: 6236,
        ayahsMemorized: 500,
        currentStreak: 5,
        longestStreak: 15,
        dailyGoal: 10,
        weeklyProgress: [5, 10, 8, 12, 10, 0, 0],
      },
    });
  });

  it('renders greeting correctly', () => {
    const { getByText } = render(<DashboardScreen />);
    
    expect(getByText('السلام عليكم')).toBeTruthy();
    expect(getByText('Bienvenue dans Al-Muallim')).toBeTruthy();
  });

  it('displays streak information', () => {
    const { getByText } = render(<DashboardScreen />);
    
    expect(getByText('5')).toBeTruthy();
    expect(getByText('15')).toBeTruthy();
    expect(getByText('Jours consécutifs')).toBeTruthy();
    expect(getByText('Record')).toBeTruthy();
  });

  it('displays progress cards', () => {
    const { getByText } = render(<DashboardScreen />);
    
    expect(getByText('Sourates mémorisées')).toBeTruthy();
    expect(getByText('Versets mémorisés')).toBeTruthy();
    expect(getByText('Objectif journalier')).toBeTruthy();
  });

  it('displays quick action buttons', () => {
    const { getByText } = render(<DashboardScreen />);
    
    expect(getByText('Continuer')).toBeTruthy();
    expect(getByText('Réviser')).toBeTruthy();
    expect(getByText('Écouter')).toBeTruthy();
    expect(getByText('Stats')).toBeTruthy();
  });

  it('displays weekly progress chart', () => {
    const { getByText } = render(<DashboardScreen />);
    
    expect(getByText('Progression cette semaine')).toBeTruthy();
  });
});
