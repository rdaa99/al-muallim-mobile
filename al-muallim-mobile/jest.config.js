module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.basic.test.ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/DashboardScreen.test.tsx',
    '/__tests__/AudioPlayerScreen.test.tsx',
    '/__tests__/SettingsScreen.test.tsx',
    '/__tests__/basic.test.ts',
  ],
  passWithNoTests: true,
};
