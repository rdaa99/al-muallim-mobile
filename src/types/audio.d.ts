// Type declarations for react-native-sound
declare module 'react-native-sound' {
  export default class Sound {
    constructor(filename: string, basePath: string, callback?: (error?: Error | null) => void);
    play(callback?: (success: boolean) => void): void;
    pause(): void;
    stop(): void;
    release(): void;
    getDuration(): number;
    getCurrentTime(callback: (seconds: number, isPlaying: boolean) => void): void;
    setCurrentTime(seconds: number): void;
    setVolume(value: number): void;
    setSpeed(value: number): Sound;
    static setCategory(category: string): void;
  }
}
