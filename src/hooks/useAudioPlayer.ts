import { useState, useRef, useEffect, useCallback } from 'react';

interface UseAudioPlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  isLooping: boolean;
  error: string | null;
  duration: number;
  currentTime: number;
}

interface UseAudioPlayerActions {
  play: (url: string) => void;
  pause: () => void;
  stop: () => void;
  replay: () => void;
  toggleLoop: () => void;
  seek: (time: number) => void;
}

type UseAudioPlayerReturn = UseAudioPlayerState & UseAudioPlayerActions;

const LOAD_TIMEOUT = 10000; // 10 seconds timeout

export const useAudioPlayer = (): UseAudioPlayerReturn => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const urlRef = useRef<string | null>(null);

  const [state, setState] = useState<UseAudioPlayerState>({
    isPlaying: false,
    isLoading: false,
    isLooping: false,
    error: null,
    duration: 0,
    currentTime: 0,
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // Clear timeout
  const clearTimeoutIfExists = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Set loading timeout
  const setLoadingTimeout = useCallback(() => {
    clearTimeoutIfExists();
    timeoutRef.current = setTimeout(() => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Audio non disponible après 10 secondes',
      }));
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }, LOAD_TIMEOUT);
  }, [clearTimeoutIfExists]);

  // Initialize audio element
  const initAudio = useCallback((url: string) => {
    // Cleanup previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(url) as HTMLAudioElement;
    audioRef.current = audio;
    urlRef.current = url;

    // Event handlers
    audio.addEventListener('loadstart', () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      setLoadingTimeout();
    });

    audio.addEventListener('canplay', () => {
      clearTimeoutIfExists();
      setState(prev => ({
        ...prev,
        isLoading: false,
        duration: audio.duration || 0,
      }));
    });

    audio.addEventListener('play', () => {
      setState(prev => ({ ...prev, isPlaying: true }));
    });

    audio.addEventListener('pause', () => {
      setState(prev => ({ ...prev, isPlaying: false }));
    });

    audio.addEventListener('ended', () => {
      if (state.isLooping && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      } else {
        setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
      }
    });

    audio.addEventListener('timeupdate', () => {
      setState(prev => ({ ...prev, currentTime: audio.currentTime || 0 }));
    });

    audio.addEventListener('error', () => {
      clearTimeoutIfExists();
      setState(prev => ({
        ...prev,
        isLoading: false,
        isPlaying: false,
        error: 'Erreur lors du chargement de l\'audio',
      }));
    });

    return audio;
  }, [state.isLooping, clearTimeoutIfExists, setLoadingTimeout]);

  // Play
  const play = useCallback((url: string) => {
    if (!audioRef.current || urlRef.current !== url) {
      initAudio(url);
    }
    
    // Wait for next tick to ensure audio is initialized
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.loop = state.isLooping;
        audioRef.current.play().catch((err) => {
          setState(prev => ({
            ...prev,
            error: 'Impossible de lire l\'audio',
            isPlaying: false,
          }));
        });
      }
    }, 0);
  }, [initAudio, state.isLooping]);

  // Pause
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  // Stop
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    }
  }, []);

  // Replay
  const replay = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        setState(prev => ({
          ...prev,
          error: 'Impossible de rejouer l\'audio',
        }));
      });
    }
  }, []);

  // Toggle loop
  const toggleLoop = useCallback(() => {
    setState(prev => {
      const newLooping = !prev.isLooping;
      if (audioRef.current) {
        audioRef.current.loop = newLooping;
      }
      return { ...prev, isLooping: newLooping };
    });
  }, []);

  // Seek
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  return {
    ...state,
    play,
    pause,
    stop,
    replay,
    toggleLoop,
    seek,
  };
};
