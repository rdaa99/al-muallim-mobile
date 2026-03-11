# Al-Muallim Mobile

App mobile de mémorisation du Quran avec Système de Révision Espacée (SRS).

## Stack

- **React Native** 0.76
- **TypeScript** 5.6
- **React Navigation** 7
- **Zustand** (state management)
- **Axios** (API client)

## Architecture

```
src/
├── components/     # UI components
├── screens/        # Screen components
├── hooks/          # Custom hooks
├── services/       # API services
├── stores/         # Zustand stores
├── types/          # TypeScript types
├── utils/          # Utility functions
└── assets/         # Images, fonts, etc.
```

## Prérequis

- Node.js 18+
- React Native CLI
- Android Studio (pour Android)
- Xcode (pour iOS)

## Installation

```bash
# Install dependencies
npm install

# iOS pods
cd ios && pod install && cd ..

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## API

L'app consomme l'API du repo `al-muallim` (backend Express).

Configurer l'URL de l'API dans `src/services/api.ts`:
```typescript
const API_BASE_URL = 'http://YOUR_LOCAL_IP:3000/api';
```

## Fonctionnalités Sprint 1

- ✅ Révision quotidienne avec SRS (SM-2)
- ✅ Dashboard avec stats et streak
- ✅ Paramètres utilisateur

## Tests

```bash
npm test
npm run type-check
```

## Liens

- **Backend API:** https://github.com/rdaa99/al-muallim
- **Prototype Web:** Voir repo al-muallim (client/)
