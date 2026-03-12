# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Al-Muallim Mobile — React Native Quran memorization app using spaced repetition (SM-2 algorithm). MVP covers Juz 29-30 (995 verses) with local SQLite storage.

## Commands

```bash
npm test                    # Run all tests (Jest)
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
npx jest path/to/test.ts    # Run a single test file
npm run type-check          # TypeScript compilation check (tsc --noEmit)
npm run lint                # ESLint
npm run ios                 # Run on iOS simulator
npm run android             # Run on Android emulator
npm start                   # Start Metro bundler
cd ios && pod install       # Install iOS native deps
```

## Architecture

**State management**: Single Zustand store (`src/stores/appStore.ts`) holds all app state. Screens call store actions which delegate to the database service.

**Data flow**: Screen → `useAppStore` action → `src/services/database.ts` (SQLite) → state update → re-render

**Navigation**: Bottom tab navigator (React Navigation 7) with three screens: Review, Dashboard, Settings. Configured in `App.tsx`.

**Database**: `react-native-quick-sqlite` with three tables: `verses` (SRS metadata), `settings` (key-value), `review_history` (review log). Schema created in `initDatabase()`, seeded from `src/data/verses-juz-29-30.ts`.

**SM-2 Algorithm**: Implemented in `database.ts:calculateSM2()`. Quality scores 0-5, updates ease_factor/interval/repetitions. Status progression: new → learning → consolidating → mastered.

**Audio**: `react-native-sound` via `src/hooks/useAudioPlayer.ts`. Audio URLs from Islamic Network CDN: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/{surah}{ayah}.mp3`

**API**: Optional backend (`src/services/api.ts`) on `http://localhost:3000/api`. App works offline-first with local SQLite; API is for sync.

## Path Aliases

Configured in both `tsconfig.json` and `jest.config.js`:
- `@/*` → `src/*`
- `@components/*`, `@screens/*`, `@hooks/*`, `@services/*`, `@stores/*`, `@types/*`, `@utils/*`

## Testing

- Jest 29 + `@testing-library/react-native`
- Tests live in `__tests__/` directories adjacent to source files
- `jest.setup.js` mocks: `react-native-quick-sqlite`, `react-native-sound`, Audio class
- Store is mocked in screen tests via `jest.mock('@/stores/appStore')` or `jest.mock('@/hooks/useAudioPlayer')`
- Pattern: mock dependencies → render → `fireEvent` → assert with `waitFor`

## Styling

Dark theme with inline `StyleSheet.create()`. Key colors: background `#0F172A`, cards `#1E293B`, accent green `#10B981`, error red `#EF4444`, warning orange `#F59E0B`.

## Key Types

`Verse` (SRS fields: ease_factor, interval, repetitions, next_review_date, status), `DailyReview`, `ProgressStats`, `UserSettings`, `QualityScore` (0-5). Defined in `src/types/index.ts`.
