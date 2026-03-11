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

describe('ReviewScreen', () => {
  const mockLoadTodayReview = jest.fn();
  const mockSubmitReview = jest.fn();
  const mockNextVerse = jest.fn();

  const mockVerse = {
    id: 1,
    surah_number: 1,
    ayah_number: 1,
    text_arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    text_translation: 'In the name of Allah, the Beneficent, the Merciful',
    juz_number: 1,
    page_number: 1,
    status: 'learning' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      currentVerse: mockVerse,
      dailyReview: {
        date: '2026-03-08',
        due_count: 5,
        completed_count: 0,
        verses: [mockVerse],
      },
      loading: false,
      error: null,
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
      loadTodayReview: mockLoadTodayReview,
      submitReview: mockSubmitReview,
      nextVerse: mockNextVerse,
    });

    const { getByText } = render(<ReviewScreen />);
    expect(getByText('Chargement des révisions...')).toBeTruthy();
  });

  it('should render error state', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      currentVerse: null,
      dailyReview: null,
      loading: false,
      error: 'Network error',
      loadTodayReview: mockLoadTodayReview,
      submitReview: mockSubmitReview,
      nextVerse: mockNextVerse,
    });

    const { getByText } = render(<ReviewScreen />);
    expect(getByText('Network error')).toBeTruthy();
    expect(getByText('Réessayer')).toBeTruthy();
  });

  it('should render empty state when no reviews', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      currentVerse: null,
      dailyReview: {
        date: '2026-03-08',
        due_count: 0,
        completed_count: 0,
        verses: [],
      },
      loading: false,
      error: null,
      loadTodayReview: mockLoadTodayReview,
      submitReview: mockSubmitReview,
      nextVerse: mockNextVerse,
    });

    const { getByText } = render(<ReviewScreen />);
    expect(getByText('Aucune révision aujourd\'hui')).toBeTruthy();
  });

  it('should render verse with progress', () => {
    const { getByText } = render(<ReviewScreen />);
    expect(getByText('1 / 5')).toBeTruthy();
    expect(getByText('1:1')).toBeTruthy();
  });

  it('should reveal arabic text on tap', () => {
    const { getByText, queryByText } = render(<ReviewScreen />);
    
    // Initially should show placeholder
    expect(queryByText('Touchez pour révéler')).toBeTruthy();
    
    // Tap to reveal
    fireEvent.press(getByText('Touchez pour révéler'));
    
    // Should show arabic text
    expect(getByText(mockVerse.text_arabic)).toBeTruthy();
  });

  it('should reveal translation on button press', () => {
    const { getByText } = render(<ReviewScreen />);
    
    const revealButton = getByText('Révéler la traduction');
    fireEvent.press(revealButton);
    
    expect(getByText(mockVerse.text_translation)).toBeTruthy();
  });

  it('should submit review with quality score', async () => {
    const { getByText } = render(<ReviewScreen />);
    
    // First reveal the arabic
    fireEvent.press(getByText('Touchez pour révéler'));
    
    const easyButton = getByText('Facile');
    fireEvent.press(easyButton);

    await waitFor(() => {
      expect(mockSubmitReview).toHaveBeenCalledWith(5);
    });
  });

  it('should skip verse', async () => {
    const { getByText } = render(<ReviewScreen />);
    
    const skipButton = getByText('Passer ce verset →');
    fireEvent.press(skipButton);

    await waitFor(() => {
      expect(mockNextVerse).toHaveBeenCalled();
    });
  });

  it('should show completion message when all reviews done', () => {
    // When all verses are done but verses array still exists (completed state)
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      currentVerse: null,
      dailyReview: {
        date: '2026-03-08',
        due_count: 5,
        completed_count: 5,
        verses: [mockVerse, mockVerse, mockVerse, mockVerse, mockVerse],
      },
      loading: false,
      error: null,
      loadTodayReview: mockLoadTodayReview,
      submitReview: mockSubmitReview,
      nextVerse: mockNextVerse,
    });

    const { getByText } = render(<ReviewScreen />);
    expect(getByText('Félicitations !')).toBeTruthy();
    expect(getByText('versets révisés')).toBeTruthy();
  });

  it('should show blocked message when review is blocked', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      currentVerse: mockVerse,
      dailyReview: {
        date: '2026-03-08',
        due_count: 5,
        completed_count: 0,
        verses: [mockVerse],
        blocked: true,
        block_message: 'You missed several days. Let\'s review first.',
      },
      loading: false,
      error: null,
      loadTodayReview: mockLoadTodayReview,
      submitReview: mockSubmitReview,
      nextVerse: mockNextVerse,
    });

    const { getByText } = render(<ReviewScreen />);
    expect(getByText('Programme adapté')).toBeTruthy();
    expect(getByText(/missed several days/)).toBeTruthy();
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
      loadTodayReview: mockLoadTodayReview,
      submitReview: mockSubmitReview,
      nextVerse: mockNextVerse,
    });

    const { getByText } = render(<ReviewScreen />);
    fireEvent.press(getByText('Réessayer'));
    expect(mockLoadTodayReview).toHaveBeenCalled();
  });
});
