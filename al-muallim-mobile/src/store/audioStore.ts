import { create } from 'zustand';
import { AudioState, Surah } from '../types';

interface AudioStore extends AudioState {
  play: (surah: Surah, ayah?: number) => void;
  pause: () => void;
  resume: () => void;
  seek: (position: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  nextAyah: () => void;
  previousAyah: () => void;
}

export const useAudioStore = create<AudioStore>((set) => ({
  isPlaying: false,
  currentSurah: null,
  currentAyah: 1,
  duration: 0,
  position: 0,
  playbackSpeed: 1,
  
  play: (surah, ayah = 1) =>
    set({
      isPlaying: true,
      currentSurah: surah,
      currentAyah: ayah,
    }),
  
  pause: () => set({ isPlaying: false }),
  
  resume: () => set({ isPlaying: true }),
  
  seek: (position) => set({ position }),
  
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  
  nextAyah: () =>
    set((state) => ({
      currentAyah: state.currentAyah + 1,
    })),
  
  previousAyah: () =>
    set((state) => ({
      currentAyah: Math.max(1, state.currentAyah - 1),
    })),
}));
