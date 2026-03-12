import { useState, useCallback, useRef, useEffect } from 'react';
import Sound from 'react-native-sound';

export const useAudioPlayer = () => {
  // Enable playback in silence mode (only once)
  useEffect(() => {
    Sound.setCategory('Playback');
  }, []);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const soundRef = useRef<Sound | null>(null);
  const urlRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isLoopingRef = useRef(false);

  // Keep ref in sync with state to avoid stale closure
  useEffect(() => {
    isLoopingRef.current = isLooping;
  }, [isLooping]);

  const clearTrackingInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.release();
      }
      clearTrackingInterval();
    };
  }, [clearTrackingInterval]);

  const startTracking = useCallback(() => {
    clearTrackingInterval();
    intervalRef.current = setInterval(() => {
      if (soundRef.current) {
        soundRef.current.getCurrentTime((seconds) => {
          setCurrentTime(seconds);
        });
      }
    }, 500);
  }, [clearTrackingInterval]);

  const play = useCallback((url: string) => {
    // Cleanup previous sound
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.release();
    }
    clearTrackingInterval();

    setIsLoading(true);
    setError(null);
    urlRef.current = url;

    const sound = new Sound(url, '', (loadError) => {
      if (loadError) {
        setError('Audio non disponible');
        setIsLoading(false);
        return;
      }

      setDuration(sound.getDuration());
      setIsLoading(false);

      sound.play((success) => {
        setIsPlaying(false);
        clearTrackingInterval();

        if (success && isLoopingRef.current && soundRef.current) {
          soundRef.current.setCurrentTime(0);
          soundRef.current.play();
          setIsPlaying(true);
          startTracking();
        } else if (!success) {
          setError('Erreur de lecture');
        }
      });

      setIsPlaying(true);
      startTracking();
    });

    soundRef.current = sound;
  }, [clearTrackingInterval, startTracking]);

  const pause = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.pause();
      setIsPlaying(false);
      clearTrackingInterval();
    }
  }, [clearTrackingInterval]);

  const stop = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.setCurrentTime(0);
      setIsPlaying(false);
      setCurrentTime(0);
    }
    clearTrackingInterval();
  }, [clearTrackingInterval]);

  const replay = useCallback(() => {
    if (urlRef.current) {
      play(urlRef.current);
    }
  }, [play]);

  const toggleLoop = useCallback(() => {
    setIsLooping(prev => !prev);
  }, []);

  const seek = useCallback((time: number) => {
    if (soundRef.current) {
      soundRef.current.setCurrentTime(time);
      setCurrentTime(time);
    }
  }, []);

  return {
    isPlaying,
    isLoading,
    isLooping,
    error,
    duration,
    currentTime,
    play,
    pause,
    stop,
    replay,
    toggleLoop,
    seek,
  };
};
