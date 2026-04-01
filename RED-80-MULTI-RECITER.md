# Multi-Reciter Feature Implementation

## Overview

This document describes the implementation of RED-80: Multi-récitateur feature for Al-Muallim mobile app.

## Feature Description

The app now supports multiple Quran reciters for audio playback. Users can select their preferred reciter from the Settings screen, and all audio playback will use the selected reciter.

## Available Reciters

The following reciters are available:

1. **Mishary Al-Afasy** (Default) - Clear and melodious
2. **Abdul Basit** - Mujawwad (slow, melodious)
3. **Mahmoud Khalil Al-Husary** - Tajweed-focused
4. **Abdurrahman As-Sudais** - Traditional
5. **Mohamed Siddiq Al-Minshawi** - Mujawwad (emotional)

## Architecture

### 1. Reciter Service (`src/services/reciterService.ts`)

Manages reciter data and audio URL generation.

**Key functions:**
- `getReciterById(id)` - Get reciter information
- `getAllReciters()` - List all available reciters
- `getAudioUrl(surah, ayah, reciterId)` - Generate audio URL for specific verse
- `isValidReciter(id)` - Validate reciter ID
- `getReciterDisplayName(id)` - Get human-readable name

**Audio Source:**
- Primary: islamic.network CDN (free, reliable)
- Format: `https://cdn.islamic.network/quran/audio/128/{reciter_code}/{surah}{ayah}.mp3`

### 2. Updated Audio Player Hook (`src/hooks/useAudioPlayer.ts`)

**New signature:**
```typescript
const useAudioPlayer = (options?: { 
  reciterId?: string;
  autoFallback?: boolean;
})
```

**Enhanced play method:**
```typescript
// Play with surah and ayah (uses reciter service)
play(surahNumber, ayahNumber, optionalReciterId?)

// Or play with direct URL (backward compatible)
play(url: string)
```

### 3. Audio Player Component (`src/components/AudioPlayer.tsx`)

- Integrates with app settings to get selected reciter
- Displays current reciter name
- Automatically updates when user changes reciter in settings

### 4. Settings Integration (`src/screens/SettingsScreen.tsx`)

- Reciter selection UI already existed
- Now connected to actual audio playback
- Stores preference in `preferred_reciter` field

## Data Flow

```
User selects reciter in Settings
        ↓
Stored in UserSettings (appStore)
        ↓
AudioPlayer reads selected reciter
        ↓
useAudioPlayer initialized with reciterId
        ↓
play() calls reciterService.getAudioUrl()
        ↓
Audio streams from CDN
```

## Usage Examples

### In Components

```tsx
import { AudioPlayer } from '@/components/AudioPlayer';

// Automatic reciter selection from settings
<AudioPlayer 
  surahNumber={1} 
  ayahNumber={1} 
  autoPlay={false}
/>
```

### Using Hook Directly

```tsx
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useAppStore } from '@/stores/appStore';

function MyComponent() {
  const { settings } = useAppStore();
  const { play, isPlaying } = useAudioPlayer({ 
    reciterId: settings?.preferred_reciter 
  });

  const handlePlay = () => {
    play(1, 1); // Plays with selected reciter
  };
}
```

### Override Reciter for Specific Verse

```tsx
const { play } = useAudioPlayer({ reciterId: 'afasy' });

// Override with different reciter
play(1, 1, 'husary');
```

## Testing

### Test Files

1. **Reciter Service Tests** (`src/services/__tests__/reciterService.test.ts`)
   - URL generation for different reciters
   - Reciter validation
   - Fallback behavior

2. **Audio Player Hook Tests** (`src/hooks/__tests__/useAudioPlayer.reciter.test.ts`)
   - Reciter initialization
   - Play with surah/ayah
   - Reciter override

3. **Audio Player Component Tests** (`src/components/__tests__/AudioPlayer.reciter.test.tsx`)
   - Reciter selection from settings
   - UI updates
   - Playback controls

### Running Tests

```bash
# Test reciter service
npm test src/services/__tests__/reciterService.test.ts

# Test audio player hook
npm test src/hooks/__tests__/useAudioPlayer.reciter.test.ts

# Test audio player component
npm test src/components/__tests__/AudioPlayer.reciter.test.tsx

# Run all tests
npm test
```

## Configuration

### Default Reciter

Default reciter is configured in `reciterService.ts`:

```typescript
export const DEFAULT_RECITER = 'afasy';
```

### Adding New Reciters

To add a new reciter:

1. Add reciter info to `AVAILABLE_RECITERS` array in `reciterService.ts`
2. Add reciter code mapping in `AUDIO_SOURCES.islamic_network.reciterMap`
3. Verify audio URLs work with islamic.network CDN

Example:
```typescript
{
  id: 'new_reciter',
  name: 'New Reciter Name',
  englishName: 'New Reciter Full Name',
  style: 'Description of style'
}
```

## Fallback Behavior

If a selected reciter is not available or invalid:

1. **Invalid reciter ID** → Falls back to default (Al-Afasy)
2. **Audio load error** → Shows error message, user can retry
3. **Missing settings** → Uses default reciter

## Performance Considerations

- Reciter preference loaded once from settings
- No additional API calls for reciter data (static list)
- Audio URLs generated client-side (no backend lookup needed)
- CDN handles audio caching

## Future Enhancements

Potential improvements for future sprints:

1. **Offline Support** - Download reciter audio for offline use
2. **More Reciters** - Add more reciter options
3. **Reciter Samples** - Preview audio before selecting
4. **Per-Surah Reciter** - Different reciter for different surahs
5. **Playback Speed** - Adjustable speed per reciter
6. **Audio Quality** - Option for higher/lower quality streams

## Troubleshooting

### Audio Not Playing

1. Check internet connection
2. Verify reciter ID is valid
3. Check console for CDN errors
4. Try default reciter (Al-Afasy)

### Wrong Reciter Playing

1. Check `preferred_reciter` in settings
2. Verify useAudioPlayer initialized with correct reciterId
3. Check if reciter override is being used

### Reciter Selection Not Saving

1. Check appStore.updateSettings is called
2. Verify database persistence
3. Check for console errors on save

## API Reference

### reciterService

```typescript
// Get reciter by ID
getReciterById(id: string): Reciter | undefined

// Get all reciters
getAllReciters(): Reciter[]

// Get audio URL
getAudioUrl(surahNumber: number, ayahNumber: number, reciterId?: string): string

// Validate reciter
isValidReciter(reciterId: string): boolean

// Get display name
getReciterDisplayName(reciterId: string): string
```

### useAudioPlayer

```typescript
interface UseAudioPlayerOptions {
  reciterId?: string;
  autoFallback?: boolean;
}

const {
  isPlaying,
  isLoading,
  isLooping,
  error,
  duration,
  currentTime,
  play: (urlOrSurah: string | number, ayahNumber?: number, reciterId?: string) => Promise<void>,
  pause: () => Promise<void>,
  stop: () => Promise<void>,
  replay: () => void,
  toggleLoop: () => void,
  seek: (time: number) => Promise<void>,
  setPlaybackSpeed: (speed: number) => Promise<void>,
} = useAudioPlayer(options?)
```

## Success Criteria Met

✅ Reciter selection UI in Settings screen
✅ Store selected reciter in Zustand (appStore.settings.preferred_reciter)
✅ Update audio player to use selected reciter
✅ At least 3 popular reciters (5 included)
✅ Fallback to default if reciter audio not available
✅ Tests for reciter switching
✅ Documentation updated

## Related Files

- `src/services/reciterService.ts` - Reciter management
- `src/hooks/useAudioPlayer.ts` - Audio playback with reciter support
- `src/components/AudioPlayer.tsx` - UI component
- `src/screens/SettingsScreen.tsx` - Reciter selection UI
- `src/stores/appStore.ts` - Settings storage
- `src/types/index.ts` - Reciter type definitions

## Credits

Audio provided by:
- islamic.network CDN
- alquran.cloud API (backup)
