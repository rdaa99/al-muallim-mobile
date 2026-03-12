import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { SettingsScreen } from '../SettingsScreen';
import { useAppStore } from '@/stores/appStore';

// Mock the stores
jest.mock('@/stores/appStore');
jest.mock('../../stores/userStore', () => ({
  useUserStore: () => ({
    settings: {
      language: 'fr',
      reciter: null,
      notificationsEnabled: true,
      dailyReminderTime: '08:00',
      darkMode: false,
      fontSize: 'medium',
    },
    updateSettings: jest.fn(),
  }),
}));

// Mock contexts
jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'dark',
    isDark: true,
    colors: {
      background: '#0F172A',
      surface: '#1E293B',
      primary: '#10B981',
      text: '#F8FAFC',
      textSecondary: '#94A3B8',
      border: '#334155',
      card: '#1E293B',
      tabBar: '#1E293B',
      header: '#0F172A',
    },
    toggleTheme: jest.fn(),
  }),
}));

// Mock i18n
jest.mock('../../i18n', () => ({
  changeLanguage: jest.fn(),
}));

// Mock slider
jest.mock('@react-native-community/slider', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (_props: Record<string, unknown>) => <View testID="slider" />,
  };
});

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

describe('SettingsScreen', () => {
  const mockLoadSettings = jest.fn();
  const mockUpdateSettings = jest.fn();

  const mockSettings = {
    learning_mode: 'active' as const,
    focus_juz_start: 1,
    focus_juz_end: 30,
    evaluation_day: 1,
    learning_capacity: 10,
    daily_new_lines: 3,
    direction: 'desc' as const,
    session_duration: 15,
    preferred_reciter: 'abdul_basit',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      settings: mockSettings,
      loadSettings: mockLoadSettings,
      updateSettings: mockUpdateSettings,
    });
  });

  it('should render loading state when settings is null', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      settings: null,
      loadSettings: mockLoadSettings,
      updateSettings: mockUpdateSettings,
    });

    const { getByText } = render(<SettingsScreen />);
    expect(getByText('common.loading')).toBeTruthy();
  });

  it('should display learning mode options', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('settings.learningMode')).toBeTruthy();
    expect(getByText('\uD83C\uDFAF settings.modeActive')).toBeTruthy();
    expect(getByText('\uD83D\uDD04 settings.modeRevision')).toBeTruthy();
    expect(getByText('\u23F8\uFE0F settings.modePaused')).toBeTruthy();
  });

  it('should change learning mode on press', async () => {
    jest.useFakeTimers();

    const { getByText } = render(<SettingsScreen />);

    const revisionOnlyButton = getByText('\uD83D\uDD04 settings.modeRevision');
    fireEvent.press(revisionOnlyButton);

    act(() => {
      jest.advanceTimersByTime(1100);
    });

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalledWith(
        expect.objectContaining({ learning_mode: 'revision_only' })
      );
    });

    jest.useRealTimers();
  });

  it('should display daily settings', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('settings.daily')).toBeTruthy();
    expect(getByText('settings.newVersesDay')).toBeTruthy();
    expect(getByText('settings.sessionDuration')).toBeTruthy();
    expect(getByText('settings.learningCapacity')).toBeTruthy();
  });

  it('should display juz range settings', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('settings.focusJuz')).toBeTruthy();
    expect(getByText('settings.start')).toBeTruthy();
    expect(getByText('Juz 1')).toBeTruthy();
    expect(getByText('settings.end')).toBeTruthy();
    expect(getByText('Juz 30')).toBeTruthy();
  });

  it('should display direction options', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('settings.direction')).toBeTruthy();
    expect(getByText('\u2B07\uFE0F settings.dirDesc')).toBeTruthy();
    expect(getByText('\u2B06\uFE0F settings.dirAsc')).toBeTruthy();
  });

  it('should display reciter picker', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('settings.reciter')).toBeTruthy();
    expect(getByText('Abdul Basit')).toBeTruthy();
  });

  it('should call loadSettings on mount', () => {
    render(<SettingsScreen />);
    expect(mockLoadSettings).toHaveBeenCalled();
  });

  it('should show info card about auto-save', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('settings.autoSaveInfo')).toBeTruthy();
  });

  it('should debounce settings updates', async () => {
    jest.useFakeTimers();

    const { getByText } = render(<SettingsScreen />);

    const revisionOnlyButton = getByText('\uD83D\uDD04 settings.modeRevision');
    fireEvent.press(revisionOnlyButton);

    // Should not update immediately
    expect(mockUpdateSettings).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalled();
    });

    jest.useRealTimers();
  });
});
