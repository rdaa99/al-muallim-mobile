import { useState, useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import { useTranslation } from 'react-i18next';

export const useAudioPlayer = () => {
  const { t } = useTranslation();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const soundRef = useRef<Audio.Sound | null>(null);
  const urlRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isLoopingRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    isLoopingRef.current = isLooping;
  }, [isLooping]);

  // Configure audio mode
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });
  }, []);

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
        soundRef.current.unloadAsync();
      }
      clearTrackingInterval();
    };
  }, [clearTrackingInterval]);

  const startTracking = useCallback(() => {
    clearTrackingInterval();
    intervalRef.current = setInterval(async () => {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          setCurrentTime(status.positionMillis / 1000);
        }
      }
    }, 500);
  }, [clearTrackingInterval]);

  const play = useCallback(async (url: string) => {
    // Cleanup previous sound
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
    }
    clearTrackingInterval();

    setIsLoading(true);
    setError(null);
    urlRef.current = url;

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true },
        async (status) => {
          if (status.isLoaded) {
            if (status.didJustFinish) {
              setIsPlaying(false);
              clearTrackingInterval();
              
              if (isLoopingRef.current && soundRef.current) {
                await soundRef.current.replayAsync();
                setIsPlaying(true);
                startTracking();
              }
            }
          } else if (status.error) {
            setError(t('audio.error') || 'Audio non disponible');
            setIsLoading(false);
          }
        }
      );

      soundRef.current = sound;
      
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
        setIsLoading(false);
        setIsPlaying(true);
        startTracking();
      }
    } catch (err) {
      setError(t('audio.error') || 'Audio non disponible');
      setIsLoading(false);
      console.error('Audio playback error:', err);
    }
  }, [clearTrackingInterval, startTracking, t]);

  const pause = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
      clearTrackingInterval();
    }
  }, [clearTrackingInterval]);

  const stop = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
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

  const seek = useCallback(async (time: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(time * 1000);
      setCurrentTime(time);
    }
  }, []);

  const setPlaybackSpeed = useCallback(async (speed: number) => {
    if (soundRef.current) {
      await soundRef.current.setRateAsync(speed, true);
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
    setPlaybackSpeed,
  };
};
