// ============================================
// JEST SETUP - Al-Muallim Mobile
// Expo SDK 55 + React Native 0.83.2 Compatible
// ============================================

// MUST be before any expo imports
// Mock expo's winter runtime to prevent import errors
jest.mock('expo/src/winter/installGlobal', () => ({
  __ExpoImportMetaRegistry: {},
}));

jest.mock('expo/src/winter/runtime.native', () => ({}));

// Mock expo module
jest.mock('expo', () => ({
  ...jest.requireActual('expo'),
  // Add any expo modules that need mocking
}));

// Mock expo-av
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(() =>
        Promise.resolve({
          sound: {
            playAsync: jest.fn(),
            pauseAsync: jest.fn(),
            stopAsync: jest.fn(),
            unloadAsync: jest.fn(),
            setPositionAsync: jest.fn(),
            setRateAsync: jest.fn(),
            getStatusAsync: jest.fn(() =>
              Promise.resolve({
                isLoaded: true,
                isPlaying: false,
                positionMillis: 0,
                durationMillis: 0,
              })
            ),
          },
          status: {
            isLoaded: true,
            isPlaying: false,
          },
        })
      ),
    },
    STATUS: {
      LOADED: 'LOADED',
      PLAYING: 'PLAYING',
      PAUSED: 'PAUSED',
    },
  },
  Video: jest.fn(),
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Mock expo-status-bar
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock @react-navigation/bottom-tabs
jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock @react-navigation/native-stack
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock react-native-screens
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

// Mock @react-native-community/slider
jest.mock('@react-native-community/slider', () => 'Slider');

// Mock Zustand store (simplified)
jest.mock('zustand', () => ({
  create: jest.fn(() => jest.fn()),
}));

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
