/**
 * Tests for AudioPlayer component with reciter support
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AudioPlayer } from '../AudioPlayer';
import { useAppStore } from '@/stores/appStore';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

// Mock dependencies
jest.mock('@/stores/appStore', () => ({
  useAppStore: jest.fn(),
}));

jest.mock('@/hooks/useAudioPlayer', () => ({
  useAudioPlayer: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('AudioPlayer with Reciter Support', () => {
  const mockPlay = jest.fn();
  const mockPause = jest.fn();
  const mockStop = jest.fn();
  const mockToggleLoop = jest.fn();

  const defaultAudioPlayerReturn = {
    isPlaying: false,
    isLoading: false,
    isLooping: false,
    error: null,
    duration: 0,
    currentTime: 0,
    play: mockPlay,
    pause: mockPause,
    stop: mockStop,
    toggleLoop: mockToggleLoop,
    seek: jest.fn(),
    setPlaybackSpeed: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAudioPlayer as jest.Mock).mockReturnValue(defaultAudioPlayerReturn);
  });

  describe('reciter selection', () => {
    it('should use default reciter when settings not loaded', () => {
      (useAppStore as jest.Mock).mockReturnValue({
        settings: null,
      });

      render(<AudioPlayer surahNumber={1} ayahNumber={1} />);

      // Should initialize hook with default reciter
      expect(useAudioPlayer).toHaveBeenCalledWith(
        expect.objectContaining({ reciterId: 'afasy' })
      );
    });

    it('should use reciter from settings', () => {
      (useAppStore as jest.Mock).mockReturnValue({
        settings: {
          preferred_reciter: 'husary',
        },
      });

      render(<AudioPlayer surahNumber={1} ayahNumber={1} />);

      expect(useAudioPlayer).toHaveBeenCalledWith(
        expect.objectContaining({ reciterId: 'husary' })
      );
    });

    it('should display current reciter name', () => {
      (useAppStore as jest.Mock).mockReturnValue({
        settings: {
          preferred_reciter: 'abdul_basit',
        },
      });

      const { getByText } = render(
        <AudioPlayer surahNumber={1} ayahNumber={1} />
      );

      expect(getByText(/Abdul Basit/)).toBeTruthy();
    });

    it('should update when settings change', () => {
      const { rerender } = render(
        <AudioPlayer surahNumber={1} ayahNumber={1} />
      );

      (useAppStore as jest.Mock).mockReturnValue({
        settings: {
          preferred_reciter: 'afasy',
        },
      });

      rerender(<AudioPlayer surahNumber={1} ayahNumber={1} />);

      expect(useAudioPlayer).toHaveBeenCalledWith(
        expect.objectContaining({ reciterId: 'afasy' })
      );

      (useAppStore as jest.Mock).mockReturnValue({
        settings: {
          preferred_reciter: 'sudais',
        },
      });

      rerender(<AudioPlayer surahNumber={1} ayahNumber={1} />);

      expect(useAudioPlayer).toHaveBeenCalledWith(
        expect.objectContaining({ reciterId: 'sudais' })
      );
    });
  });

  describe('playback controls', () => {
    it('should call play with surah and ayah numbers', () => {
      (useAppStore as jest.Mock).mockReturnValue({
        settings: { preferred_reciter: 'afasy' },
      });

      const { getByText } = render(
        <AudioPlayer surahNumber={2} ayahNumber={255} />
      );

      const playButton = getByText('▶');
      fireEvent.press(playButton);

      expect(mockPlay).toHaveBeenCalledWith(2, 255);
    });

    it('should call pause when playing', () => {
      (useAppStore as jest.Mock).mockReturnValue({
        settings: { preferred_reciter: 'afasy' },
      });

      (useAudioPlayer as jest.Mock).mockReturnValue({
        ...defaultAudioPlayerReturn,
        isPlaying: true,
      });

      const { getByText } = render(
        <AudioPlayer surahNumber={1} ayahNumber={1} />
      );

      const pauseButton = getByText('⏸');
      fireEvent.press(pauseButton);

      expect(mockPause).toHaveBeenCalled();
    });

    it('should call stop', () => {
      (useAppStore as jest.Mock).mockReturnValue({
        settings: { preferred_reciter: 'afasy' },
      });

      const { getByText } = render(
        <AudioPlayer surahNumber={1} ayahNumber={1} />
      );

      const stopButton = getByText('⏹');
      fireEvent.press(stopButton);

      expect(mockStop).toHaveBeenCalled();
    });

    it('should call toggleLoop', () => {
      (useAppStore as jest.Mock).mockReturnValue({
        settings: { preferred_reciter: 'afasy' },
      });

      const { getByText } = render(
        <AudioPlayer surahNumber={1} ayahNumber={1} />
      );

      const loopButton = getByText('🔁');
      fireEvent.press(loopButton);

      expect(mockToggleLoop).toHaveBeenCalled();
    });
  });

  describe('auto-play', () => {
    it('should auto-play when enabled', () => {
      (useAppStore as jest.Mock).mockReturnValue({
        settings: { preferred_reciter: 'husary' },
      });

      render(<AudioPlayer surahNumber={1} ayahNumber={1} autoPlay />);

      expect(mockPlay).toHaveBeenCalledWith(1, 1);
    });

    it('should not auto-play by default', () => {
      (useAppStore as jest.Mock).mockReturnValue({
        settings: { preferred_reciter: 'husary' },
      });

      render(<AudioPlayer surahNumber={1} ayahNumber={1} />);

      expect(mockPlay).not.toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('should show loading indicator', () => {
      (useAppStore as jest.Mock).mockReturnValue({
        settings: { preferred_reciter: 'afasy' },
      });

      (useAudioPlayer as jest.Mock).mockReturnValue({
        ...defaultAudioPlayerReturn,
        isLoading: true,
      });

      const { queryAllByText } = render(
        <AudioPlayer surahNumber={1} ayahNumber={1} />
      );

      // Check for loading text (could be translation key or French text)
      const loadingTexts = queryAllByText(/audio\.loading|Chargement/);
      expect(loadingTexts.length).toBeGreaterThan(0);
    });
  });

  describe('error state', () => {
    it('should display error message', () => {
      (useAppStore as jest.Mock).mockReturnValue({
        settings: { preferred_reciter: 'afasy' },
      });

      (useAudioPlayer as jest.Mock).mockReturnValue({
        ...defaultAudioPlayerReturn,
        error: 'Audio non disponible',
      });

      const { getByText } = render(
        <AudioPlayer surahNumber={1} ayahNumber={1} />
      );

      expect(getByText('Audio non disponible')).toBeTruthy();
    });

    it('should retry on error when play pressed', () => {
      (useAppStore as jest.Mock).mockReturnValue({
        settings: { preferred_reciter: 'afasy' },
      });

      (useAudioPlayer as jest.Mock).mockReturnValue({
        ...defaultAudioPlayerReturn,
        error: 'Audio non disponible',
      });

      const { getByText } = render(
        <AudioPlayer surahNumber={1} ayahNumber={1} />
      );

      const playButton = getByText('▶');
      fireEvent.press(playButton);

      expect(mockPlay).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('loop indicator', () => {
    it('should show loop indicator when looping', () => {
      (useAppStore as jest.Mock).mockReturnValue({
        settings: { preferred_reciter: 'afasy' },
      });

      (useAudioPlayer as jest.Mock).mockReturnValue({
        ...defaultAudioPlayerReturn,
        isLooping: true,
      });

      const { queryAllByText } = render(
        <AudioPlayer surahNumber={1} ayahNumber={1} />
      );

      // Check that loop indicator is present (audio.loopEnabled key)
      const loopTexts = queryAllByText(/audio\.loopEnabled|Répétition/);
      expect(loopTexts.length).toBeGreaterThan(0);
    });
  });
});
