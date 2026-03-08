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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.release();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const play = useCallback((url: string) => {
    // Cleanup previous sound
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.release();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

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
        if (success) {
          setIsPlaying(false);
          if (isLooping && soundRef.current) {
            soundRef.current.setCurrentTime(0);
            soundRef.current.play();
          }
        } else {
          setError('Erreur de lecture');
        }
      });

      setIsPlaying(true);

      // Track current time
      intervalRef.current = setInterval(() => {
        if (soundRef.current) {
          soundRef.current.getCurrentTime((seconds) => {
            setCurrentTime(seconds);
          });
        }
      }, 100);
    });

    soundRef.current = sound;
  }, [isLooping]);

  const pause = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.setCurrentTime(0);
      setIsPlaying(false);
      setCurrentTime(0);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const replay = useCallback(() => {
    if (soundRef.current && urlRef.current) {
      stop();
      play(urlRef.current);
    }
  }, [play, stop]);

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
