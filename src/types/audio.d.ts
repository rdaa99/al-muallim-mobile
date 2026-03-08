// Type declarations for Web Audio API (used in development/testing)
// In production, this would be replaced with react-native-sound or expo-av

interface HTMLAudioElement {
  src: string;
  duration: number;
  currentTime: number;
  loop: boolean;
  play(): Promise<void>;
  pause(): void;
  addEventListener(event: string, callback: () => void): void;
  removeEventListener(event: string, callback: () => void): void;
}

declare class Audio {
  constructor(src?: string);
  src: string;
  duration: number;
  currentTime: number;
  loop: boolean;
  play(): Promise<void>;
  pause(): void;
  addEventListener(event: string, callback: () => void): void;
  removeEventListener(event: string, callback: () => void): void;
}
