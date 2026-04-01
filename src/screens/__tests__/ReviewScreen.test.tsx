import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ReviewScreen } from '../ReviewScreen';
import { useAppStore } from '@/stores/appStore';

// Mock the store
jest.mock('@/stores/appStore');

// Mock the AudioPlayer component
jest.mock('@/components/AudioPlayer', () => ({
  AudioPlayer: () => null,
}));

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

describe('ReviewScreen', () => {
  const mockLoadTodayReview = jest.fn();
  const mockSubmitReview = jest.fn();
  const mockNextVerse = jest.fn();

  const mockVerse = {
    id: 1,
    surah_number: 1,
    ayah_number: 1,
    text_arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    text_translation_fr: 'Au nom d\'Allah, le Tout Miséricordieux, le Très Miséricordieux',
    text_translation_en: 'In the name of Allah, the Beneficent, the Merciful',
    juz_number: 1,
    page_number: 1,
    status: 'learning' as const,
    ease_factor: 2.5,
    interval: 0,
    repetitions: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      currentVerse: mockVerse,
      dailyReview: {
        date: '2026-03-12',
        due_count: 5,
        completed_count: 0,
        verses: [mockVerse],
      },
      loading: false,
      error: null,
      reviewIndex: 0,
      verses: [mockVerse],
      loadTodayReview: mockLoadTodayReview,
      submitReview: mockSubmitReview,
      nextVerse: mockNextVerse,
    });
  });

  it('should render loading state', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      currentVerse: null,
      dailyReview: null,
      loading: true,
      error: null,
      reviewIndex: 0,
      verses: [],
      loadTodayReview: mockLoadTodayReview,
      submitReview: mockSubmitReview,
      nextVerse: mockNextVerse,
    });

    const { getByText } = render(<ReviewScreen />);
    expect(getByText('review.loading')).toBeTruthy();
  });

  it('should render error state', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      currentVerse: null,
      dailyReview: null,
      loading: false,
      error: 'Network error',
      reviewIndex: 0,
      verses: [],
      loadTodayReview: mockLoadTodayReview,
      submitReview: mockSubmitReview,
      nextVerse: mockNextVerse,
    });

    const { getByText } = render(<ReviewScreen />);
    expect(getByText('Network error')).toBeTruthy();
    expect(getByText('review.retry')).toBeTruthy();
  });

  it('should render empty state when no reviews', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      currentVerse: null,
      dailyReview: {
        date: '2026-03-12',
        due_count: 0,
        completed_count: 0,
        verses: [],
      },
      loading: false,
      error: null,
      reviewIndex: 0,
      verses: [],
      loadTodayReview: mockLoadTodayReview,
      submitReview: mockSubmitReview,
      nextVerse: mockNextVerse,
    });

    const { getByText } = render(<ReviewScreen />);
    expect(getByText('review.noReviewsTitle')).toBeTruthy();
  });

  it('should render verse with progress', () => {
    const { getByText } = render(<ReviewScreen />);
    expect(getByText('1 / 5')).toBeTruthy();
    // Sprint 7: Surah title shown at top, reference shown after reveal
    expect(getByText('Sourate 1')).toBeTruthy();
  });

  it('should reveal arabic text on tap', () => {
    const { getByText, queryByText } = render(<ReviewScreen />);

    // Sprint 7: French text for reveal hint
    expect(queryByText('Touchez pour révéler le texte')).toBeTruthy();

    fireEvent.press(getByText('Touchez pour révéler le texte'));

    expect(getByText(mockVerse.text_arabic)).toBeTruthy();
  });

  it('should reveal translation on button press', () => {
    const { getByText } = render(<ReviewScreen />);

    // Sprint 7: First reveal the Arabic text
    fireEvent.press(getByText('Touchez pour révéler le texte'));

    // Then reveal translation
    const revealButton = getByText('review.revealTranslation');
    fireEvent.press(revealButton);

    expect(getByText(mockVerse.text_translation_fr)).toBeTruthy();
  });

  it('should submit review with quality score', async () => {
    const { getByText } = render(<ReviewScreen />);

    // Sprint 7: First reveal the Arabic text
    fireEvent.press(getByText('Touchez pour révéler le texte'));

    const easyButton = getByText('review.easy');
    fireEvent.press(easyButton);

    await waitFor(() => {
      expect(mockSubmitReview).toHaveBeenCalledWith(5);
    });
  });

  it('should skip verse', async () => {
    const { getByText } = render(<ReviewScreen />);

    const skipButton = getByText('review.skip');
    fireEvent.press(skipButton);

    await waitFor(() => {
      expect(mockNextVerse).toHaveBeenCalled();
    });
  });

  it('should show completion message when all reviews done', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      currentVerse: null,
      dailyReview: {
        date: '2026-03-12',
        due_count: 5,
        completed_count: 5,
        verses: [mockVerse],
      },
      loading: false,
      error: null,
      reviewIndex: 5,
      verses: [mockVerse],
      loadTodayReview: mockLoadTodayReview,
      submitReview: mockSubmitReview,
      nextVerse: mockNextVerse,
    });

    const { getByText } = render(<ReviewScreen />);
    expect(getByText('review.completeTitle')).toBeTruthy();
    expect(getByText('review.versesReviewed')).toBeTruthy();
  });

  it('should call loadTodayReview on mount', () => {
    render(<ReviewScreen />);
    expect(mockLoadTodayReview).toHaveBeenCalled();
  });

  it('should retry loading on error button press', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      currentVerse: null,
      dailyReview: null,
      loading: false,
      error: 'Network error',
      reviewIndex: 0,
      verses: [],
      loadTodayReview: mockLoadTodayReview,
      submitReview: mockSubmitReview,
      nextVerse: mockNextVerse,
    });

    const { getByText } = render(<ReviewScreen />);
    fireEvent.press(getByText('review.retry'));
    expect(mockLoadTodayReview).toHaveBeenCalled();
  });
});
