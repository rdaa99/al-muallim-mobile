# RED-81: Multiple Translations Feature

## Overview
This feature adds support for multiple Quran translations in the Al-Muallim mobile app. Users can now select their preferred translation language for verse display.

## Implementation Date
April 1, 2026

## Features Implemented

### 1. Translation Selection UI (Settings Screen)
- Added "Traduction du Coran" section in Settings
- Dropdown picker showing available translations:
  - Arabic (العربية) - Original text
  - French (Français) - Sahih International
  - English - Sahih International
- Selected translation persists in user settings

### 2. Translation Storage
- Added `selectedTranslation` field to `UserDisplaySettings` type
- Default translation: French (fr)
- Stored in userStore with AsyncStorage persistence
- Supported values: 'ar', 'fr', 'en'

### 3. Verse Display Updates
Updated the following screens to use selected translation:
- **ReviewScreen**: Shows Arabic text + selected translation (if not Arabic)
- **AudioPlayerScreen**: Shows Arabic + translation in text display
- **CollectionDetailScreen**: Shows Arabic + translation for verses in collections

### 4. Translation Service (`translationService.ts`)
Created new service with the following functions:
- `getVerseTranslation(verse, language)`: Get translation text for verse
- `hasTranslation(verse, language)`: Check if translation exists
- `getTranslationDisplayName(language)`: Get display name
- `AVAILABLE_TRANSLATIONS`: List of available translations

### 5. Fallback Logic
- If selected translation is not available, falls back to Arabic
- Arabic text is always shown regardless of translation selection
- Translation button only appears when non-Arabic translation is selected

## Technical Details

### Type Updates
```typescript
// types/index.ts
export interface UserDisplaySettings {
  // ... existing fields
  selectedTranslation: 'ar' | 'fr' | 'en';
}
```

### Store Updates
```typescript
// stores/userStore.ts
settings: {
  // ... existing settings
  selectedTranslation: 'fr', // Default to French
}
```

### Usage Example
```typescript
import { getVerseTranslation, type TranslationLanguage } from '@/services/translationService';
import { useUserStore } from '@/stores/userStore';

const { settings } = useUserStore();
const selectedTranslation = settings?.selectedTranslation || 'fr';
const translation = getVerseTranslation(verse, selectedTranslation as TranslationLanguage);
```

## Testing

### Test Files Created
1. `src/services/__tests__/translationService.test.ts`
   - Tests for translation retrieval
   - Tests for fallback logic
   - Tests for display names

2. `src/screens/__tests__/SettingsScreen.translation.test.tsx`
   - Tests for translation picker UI
   - Tests for translation selection
   - Tests for persistence

3. `src/screens/__tests__/ReviewScreen.translation.test.tsx`
   - Tests for verse display with different translations
   - Tests for Arabic-only display
   - Tests for fallback behavior

### Running Tests
```bash
npm test -- --testPathPattern="translation"
```

All tests passing: ✅

## User Experience

### Workflow
1. User opens Settings screen
2. Scrolls to "Traduction du Coran" section
3. Taps on current translation to open picker
4. Selects desired translation (Arabic, French, or English)
5. Change is automatically saved
6. Verse display updates immediately in all screens

### Display Behavior
- **Arabic selected**: Only Arabic text is shown
- **French/English selected**: Arabic text shown + "Révéler la traduction" button
- User taps button to reveal translation
- If translation not available, falls back to Arabic

## Future Enhancements
- Add more translation languages (Spanish, German, Urdu, etc.)
- Add translation sources from different scholars
- Allow side-by-side comparison of multiple translations
- Add transliteration option
- Download translations for offline use

## Files Modified/Created

### Created
- `src/services/translationService.ts`
- `src/services/__tests__/translationService.test.ts`
- `src/screens/__tests__/SettingsScreen.translation.test.tsx`
- `src/screens/__tests__/ReviewScreen.translation.test.tsx`

### Modified
- `src/types/index.ts` - Added selectedTranslation field
- `src/stores/userStore.ts` - Added default translation setting
- `src/screens/SettingsScreen.tsx` - Added translation picker UI
- `src/screens/ReviewScreen.tsx` - Updated to use selected translation
- `src/screens/AudioPlayerScreen.tsx` - Updated verse display
- `src/screens/CollectionDetailScreen.tsx` - Updated verse display
- `src/i18n/translations/fr.json` - Added translation key
- `src/i18n/translations/en.json` - Added translation key
- `src/i18n/translations/ar.json` - Added translation key

## Success Criteria Met ✅
- [x] Translation selection UI in Settings
- [x] Store selected translation in Zustand (appStore/userStore)
- [x] Update verse display to show selected translation
- [x] At least 3 translations (Arabic, French, English)
- [x] Fallback to Arabic if translation not available
- [x] Tests for translation switching
- [x] Documentation updated

## Notes
- All existing verse data includes Arabic, French, and English translations
- Translation data sourced from alquran.cloud API (already in database)
- Feature is fully backward compatible - defaults to French for existing users
- Performance impact is minimal - translations are retrieved from local database
