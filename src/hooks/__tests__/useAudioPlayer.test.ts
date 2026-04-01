import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAudioPlayer } from '../useAudioPlayer';

describe('useAudioPlayer', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAudioPlayer());

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isLooping).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.duration).toBe(0);
    expect(result.current.currentTime).toBe(0);
  });

  it('should load and play audio', async () => {
    const { result } = renderHook(() => useAudioPlayer());

    await act(async () => {
      await result.current.play('https://example.com/audio.mp3');
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.duration).toBe(60);
  });

  it('should toggle loop mode', () => {
    const { result } = renderHook(() => useAudioPlayer());

    expect(result.current.isLooping).toBe(false);

    act(() => {
      result.current.toggleLoop();
    });
    expect(result.current.isLooping).toBe(true);
    act(() => {
      result.current.toggleLoop();
    });
    expect(result.current.isLooping).toBe(false);
  });
});
