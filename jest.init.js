// ============================================
// JEST INIT - Al-Muallim Mobile
// This file runs BEFORE the preset is loaded
// ============================================

// Mock expo/src/winter/runtime.native to avoid import errors
jest.mock('expo/src/winter/runtime.native', () => ({}), { virtual: true });
