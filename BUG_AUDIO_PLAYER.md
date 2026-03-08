# Critical Bug Report - Audio Player

**Bug ID:** BUG-001
**Date:** 2026-03-08
**Severity:** P0 (Critical)
**Status:** Open
**Assigned:** Claire (dev-frontend-agent)

---

## Description

**useAudioPlayer hook uses HTMLAudioElement which is NOT available in React Native**

The current implementation assumes a web environment with DOM APIs, but React Native does not have access to HTMLAudioElement.

---

## Evidence

### Code Analysis

**File:** `src/hooks/useAudioPlayer.ts`
**Line:** 23

```typescript
const audioRef = useRef<HTMLAudioElement | null>(null);
```

**Line:** 50
```typescript
const audio = new Audio(url) as HTMLAudioElement;
```

### Problem

1. **HTMLAudioElement** is a Web API, not available in React Native
2. **new Audio()** constructor doesn't exist in React Native
3. **audio.addEventListener** doesn't exist in React Native

### Impact

- ❌ Audio features completely non-functional
- ❌ All audio tests failing
- ❌ AudioPlayer component broken
- ❌ Cannot play verse recitations

---

## Root Cause

The hook was written for React Web, not React Native.

---

## Solution

### Option 1: react-native-sound (Recommended)

```typescript
import Sound from 'react-native-sound';

// Enable playback in silence mode
Sound.setCategory('Playback');

export const useAudioPlayer = () => {
  const [sound, setSound] = useState<Sound | null>(null);

  const play = useCallback((url: string) => {
    // Stop previous sound
    if (sound) {
      sound.stop();
      sound.release();
    }

    const newSound = new Sound(url, '', (error) => {
      if (error) {
        setState({ error: 'Failed to load audio' });
        return;
      }
      newSound.play((success) => {
        if (success) {
          setState({ isPlaying: false });
        }
      });
    });

    setSound(newSound);
  }, [sound]);

  // ... rest of implementation
};
```

### Option 2: expo-av (if using Expo)

```typescript
import { Audio } from 'expo-av';
import { useState, useEffect } from 'react';

export const useAudioPlayer = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const play = async (url: string) => {
    const { sound } = await Audio.Sound.createAsync({ uri: url });
    setSound(sound);
    await sound.playAsync();
  };

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return { play, /* ... */ };
};
```

---

## Action Items

- [ ] Install react-native-sound or expo-av
- [ ] Rewrite useAudioPlayer for React Native
- [ ] Update all event handlers for RN audio API
- [ ] Update tests with proper mocks
- [ ] Test on iOS device
- [ ] Test on Android device

---

## Timeline

**Estimated:** 1 day
**Priority:** P0 (Block release)
**Dependencies:** None

---

## Related Files

- `src/hooks/useAudioPlayer.ts` (rewrite)
- `src/hooks/__tests__/useAudioPlayer.test.ts` (update mocks)
- `src/components/AudioPlayer.tsx` (may need updates)
- `src/components/__tests__/AudioPlayer.test.tsx` (update mocks)

---

## Test Plan

1. Unit test with mocked audio library
2. Integration test with real audio file
3. Device test iOS
4. Device test Android
5. Offline audio test (local files)

---

## Notes

This is a fundamental architecture issue. The entire audio layer needs to be rewritten for React Native.

---

**Created:** 2026-03-08 21:20
**Last Updated:** 2026-03-08 21:20
