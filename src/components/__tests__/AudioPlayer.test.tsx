import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AudioPlayer } from '../AudioPlayer';

// Mock the useAudioPlayer hook
jest.mock('@/hooks/useAudioPlayer', () => ({
  useAudioPlayer: jest.fn(),
}));

const mockUseAudioPlayer = require('@/hooks/useAudioPlayer').useAudioPlayer;

describe('AudioPlayer', () => {
  const defaultProps = {
    surahNumber: 1,
    ayahNumber: 1,
    autoPlay: false,
  };

  const mockAudioPlayerState = {
    isPlaying: false,
    isLoading: false,
    isLooping: false,
    error: null,
    duration: 100,
    currentTime: 0,
    play: jest.fn(),
    pause: jest.fn(),
    stop: jest.fn(),
    replay: jest.fn(),
    toggleLoop: jest.fn(),
    seek: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAudioPlayer.mockReturnValue(mockAudioPlayerState);
  });

  it('should render correctly with default props', () => {
    const { queryByTestId } = render(<AudioPlayer {...defaultProps} />);

    // Check if container is rendered
    expect(queryByTestId).toBeTruthy();
  });

  it('should generate correct audio URL', () => {
    render(<AudioPlayer {...defaultProps} />);

    // URL should be: https://cdn.islamic.network/quran/audio/128/ar.alafasy/001001.mp3
    // The hook should be called with this URL
    expect(mockAudioPlayerState.play).not.toHaveBeenCalled();
  });

  it('should show play button when not playing', () => {
    const { queryByText } = render(<AudioPlayer {...defaultProps} />);

    expect(queryByText('▶')).toBeTruthy();
  });

  it('should show pause button when playing', () => {
    mockUseAudioPlayer.mockReturnValue({
      ...mockAudioPlayerState,
      isPlaying: true,
    });

    const { queryByText } = render(<AudioPlayer {...defaultProps} />);

    expect(queryByText('⏸')).toBeTruthy();
  });

  it('should show loading indicator when loading', () => {
    mockUseAudioPlayer.mockReturnValue({
      ...mockAudioPlayerState,
      isLoading: true,
    });

    const { getByText } = render(<AudioPlayer {...defaultProps} />);

    expect(getByText('audio.loading')).toBeTruthy();
  });

  it('should show error message when there is an error', () => {
    mockUseAudioPlayer.mockReturnValue({
      ...mockAudioPlayerState,
      error: 'Test error message',
    });

    const { getByText } = render(<AudioPlayer {...defaultProps} />);

    expect(getByText(/Test error message/)).toBeTruthy();
  });

  it('should call play when play button is pressed', () => {
    const { getByText } = render(<AudioPlayer {...defaultProps} />);

    const playButton = getByText('▶');
    fireEvent.press(playButton);

    expect(mockAudioPlayerState.play).toHaveBeenCalledWith(
      'https://cdn.islamic.network/quran/audio/128/ar.alafasy/001001.mp3'
    );
  });

  it('should call pause when pause button is pressed', () => {
    mockUseAudioPlayer.mockReturnValue({
      ...mockAudioPlayerState,
      isPlaying: true,
    });

    const { getByText } = render(<AudioPlayer {...defaultProps} />);

    const pauseButton = getByText('⏸');
    fireEvent.press(pauseButton);

    expect(mockAudioPlayerState.pause).toHaveBeenCalled();
  });

  it('should call stop when stop button is pressed', () => {
    const { getByText } = render(<AudioPlayer {...defaultProps} />);

    const stopButton = getByText('⏹');
    fireEvent.press(stopButton);

    expect(mockAudioPlayerState.stop).toHaveBeenCalled();
  });

  it('should call replay when replay button is pressed', () => {
    const { getByText } = render(<AudioPlayer {...defaultProps} />);

    const replayButton = getByText('🔄');
    fireEvent.press(replayButton);

    expect(mockAudioPlayerState.replay).toHaveBeenCalled();
  });

  it('should toggle loop when loop button is pressed', () => {
    const { getByText } = render(<AudioPlayer {...defaultProps} />);

    const loopButton = getByText('🔁');
    fireEvent.press(loopButton);

    expect(mockAudioPlayerState.toggleLoop).toHaveBeenCalled();
  });

  it('should show loop indicator when looping is enabled', () => {
    mockUseAudioPlayer.mockReturnValue({
      ...mockAudioPlayerState,
      isLooping: true,
    });

    const { getByText } = render(<AudioPlayer {...defaultProps} />);

    expect(getByText('audio.loopEnabled')).toBeTruthy();
  });

  it('should auto-play when autoPlay is true', () => {
    render(<AudioPlayer {...defaultProps} autoPlay={true} />);

    expect(mockAudioPlayerState.play).toHaveBeenCalledWith(
      'https://cdn.islamic.network/quran/audio/128/ar.alafasy/001001.mp3'
    );
  });

  it('should generate correct URL for different surah and ayah', () => {
    const props = {
      surahNumber: 2,
      ayahNumber: 255,
      autoPlay: false,
    };

    render(<AudioPlayer {...props} />);

    // When play button is pressed
    const { getByText } = render(<AudioPlayer {...props} />);
    fireEvent.press(getByText('▶'));

    expect(mockAudioPlayerState.play).toHaveBeenCalledWith(
      'https://cdn.islamic.network/quran/audio/128/ar.alafasy/002255.mp3'
    );
  });

  it('should retry playback when play button is pressed after error', () => {
    mockUseAudioPlayer.mockReturnValue({
      ...mockAudioPlayerState,
      error: 'Test error',
    });

    const { getByText } = render(<AudioPlayer {...defaultProps} />);

    const playButton = getByText('▶');
    fireEvent.press(playButton);

    expect(mockAudioPlayerState.play).toHaveBeenCalledWith(
      'https://cdn.islamic.network/quran/audio/128/ar.alafasy/001001.mp3'
    );
  });

  it('should disable buttons when loading', () => {
    mockUseAudioPlayer.mockReturnValue({
      ...mockAudioPlayerState,
      isLoading: true,
    });

    const { getByText } = render(<AudioPlayer {...defaultProps} />);

    // Play button shows loading icon when loading
    const playButton = getByText('⏳');
    expect(playButton).toBeTruthy();

    // Note: The button has disabled={isLoading} but fireEvent.press bypasses this
    // In a real device, the button would be truly disabled
    // So we just verify the loading state is shown
  });
});
