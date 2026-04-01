import { useState, useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import { useTranslation } from 'react-i18next';
import { getAudioUrl, isValidReciter, DEFAULT_RECITER } from '@/services/reciterService';

interface UseAudioPlayerOptions {
  reciterId?: string;
  autoFallback?: boolean;
}

export const useAudioPlayer = (options?: UseAudioPlayerOptions) => {
  const { t } = useTranslation();
  const reciterId = options?.reciterId && isValidReciter(options.reciterId)
    ? options.reciterId
    : DEFAULT_RECITER;
  
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

  /**
   * Play audio for a specific verse
   * Can accept either a direct URL or verse coordinates with optional reciter override
   */
  const play = useCallback(async (urlOrSurah: string | number, ayahNumber?: number, verseReciterId?: string) => {
    // Cleanup previous sound
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
    }
    clearTrackingInterval();

    setIsLoading(true);
    setError(null);

    // Determine if first argument is URL or surah number
    let audioUrl: string;
    if (typeof urlOrSurah === 'string') {
      // Direct URL provided
      audioUrl = urlOrSurah;
    } else if (typeof urlOrSurah === 'number' && typeof ayahNumber === 'number') {
      // Surah and ayah provided - use reciter service
      const effectiveReciterId = verseReciterId || reciterId;
      audioUrl = getAudioUrl(urlOrSurah, ayahNumber, effectiveReciterId);
    } else {
      setError('Invalid play parameters');
      setIsLoading(false);
      return;
    }

    urlRef.current = audioUrl;

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
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
  }, [clearTrackingInterval, startTracking, t, reciterId]);

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
