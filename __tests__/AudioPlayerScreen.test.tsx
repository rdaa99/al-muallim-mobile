import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AudioPlayerScreen } from '../src/screens/AudioPlayerScreen';
import { useAudioStore } from '../src/store/audioStore';
import { useUserStore } from '../src/store/userStore';

// Mock stores
jest.mock('../src/store/audioStore');
jest.mock('../src/store/userStore');

describe('AudioPlayerScreen', () => {
  const mockPlay = jest.fn();
  const mockPause = jest.fn();
  const mockResume = jest.fn();
  const mockSeek = jest.fn();
  const mockSetPlaybackSpeed = jest.fn();
  const mockNextAyah = jest.fn();
  const mockPreviousAyah = jest.fn();

  beforeEach(() => {
    (useAudioStore as unknown as jest.Mock).mockReturnValue({
      isPlaying: false,
      currentSurah: null,
      currentAyah: 1,
      duration: 0,
      position: 0,
      playbackSpeed: 1,
      play: mockPlay,
      pause: mockPause,
      resume: mockResume,
      seek: mockSeek,
      setPlaybackSpeed: mockSetPlaybackSpeed,
      nextAyah: mockNextAyah,
      previousAyah: mockPreviousAyah,
    });

    (useUserStore as unknown as jest.Mock).mockReturnValue({
      settings: {
        reciter: {
          id: '1',
          name: 'عبد الباسط عبد الصمد',
          englishName: 'Abdul Basit Abdul Samad',
        },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders audio player screen', () => {
    const { getByText } = render(<AudioPlayerScreen />);
    
    expect(getByText('Lecteur Audio')).toBeTruthy();
    expect(getByText('Aucune sourate')).toBeTruthy();
    expect(getByText('Sélectionnez une sourate')).toBeTruthy();
  });

  it('displays reciter information', () => {
    const { getByText } = render(<AudioPlayerScreen />);
    
    expect(getByText('Récitateur')).toBeTruthy();
    expect(getByText('عبد الباسط عبد الصمد')).toBeTruthy();
  });

  it('displays play button', () => {
    const { getByText } = render(<AudioPlayerScreen />);
    
    expect(getByText('▶')).toBeTruthy();
  });

  it('displays control buttons', () => {
    const { getByText } = render(<AudioPlayerScreen />);
    
    expect(getByText('⏮')).toBeTruthy();
    expect(getByText('Précédent')).toBeTruthy();
    expect(getByText('⏭')).toBeTruthy();
    expect(getByText('Suivant')).toBeTruthy();
  });

  it('displays speed control', () => {
    const { getByText } = render(<AudioPlayerScreen />);
    
    expect(getByText('Vitesse: 1x')).toBeTruthy();
  });

  it('displays additional controls', () => {
    const { getByText } = render(<AudioPlayerScreen />);
    
    expect(getByText('Répéter')).toBeTruthy();
    expect(getByText('Texte')).toBeTruthy();
    expect(getByText('Playlist')).toBeTruthy();
  });

  it('calls play when play button is pressed', () => {
    const { getByText } = render(<AudioPlayerScreen />);
    
    fireEvent.press(getByText('▶'));
    
    expect(mockPlay).toHaveBeenCalled();
  });

  it('toggles speed options', () => {
    const { getByText, queryByText } = render(<AudioPlayerScreen />);
    
    // Speed options should not be visible initially
    expect(queryByText('0.5x')).toBeNull();
    
    // Tap speed button
    fireEvent.press(getByText('Vitesse: 1x'));
    
    // Speed options should now be visible
    expect(getByText('0.5x')).toBeTruthy();
    expect(getByText('0.75x')).toBeTruthy();
    expect(getByText('1x')).toBeTruthy();
    expect(getByText('1.25x')).toBeTruthy();
    expect(getByText('1.5x')).toBeTruthy();
    expect(getByText('2x')).toBeTruthy();
  });

  it('displays surah information when playing', () => {
    (useAudioStore as unknown as jest.Mock).mockReturnValue({
      isPlaying: true,
      currentSurah: {
        number: 1,
        name: 'الفاتحة',
        englishName: 'Al-Fatiha',
        ayahsCount: 7,
        revelationType: 'Meccan',
      },
      currentAyah: 3,
      duration: 180,
      position: 60,
      playbackSpeed: 1,
      play: mockPlay,
      pause: mockPause,
      resume: mockResume,
      seek: mockSeek,
      setPlaybackSpeed: mockSetPlaybackSpeed,
      nextAyah: mockNextAyah,
      previousAyah: mockPreviousAyah,
    });

    const { getByText } = render(<AudioPlayerScreen />);
    
    expect(getByText('Sourate 1')).toBeTruthy();
    expect(getByText('الفاتحة')).toBeTruthy();
    expect(getByText('Al-Fatiha')).toBeTruthy();
    expect(getByText('Verset 3 / 7')).toBeTruthy();
    expect(getByText('⏸')).toBeTruthy();
  });
});
