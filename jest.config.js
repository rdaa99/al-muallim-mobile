module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@react-native-community/slider$': '<rootDir>/src/__mocks__/sliderMock.js',
  },
  testMatch: ['**/__tests__/**/*.test.{ts,tsx,js}'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-navigation|zustand|@react-native|react-native-quick-sqlite|@react-native-async-storage|@react-native-community|i18next|react-i18next|expo-av|expo|expo-modules-core)/)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
};
