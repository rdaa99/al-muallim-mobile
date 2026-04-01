/**
 * QA Tests — Screens Integration (SC-4, SC-5, SC-6 scenarios)
 */
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';

// ============ MOCKS ============
jest.mock('@/stores/appStore');
jest.mock('../../stores/userStore');
jest.mock('../../services/database', () => ({
  getWeeklyReviewCounts: jest.fn().mockResolvedValue([0, 3, 5, 0, 2, 0, 0]),
  getVerseBySurahAyah: jest.fn().mockResolvedValue({
    id: 1,
    surah_number: 67,
    ayah_number: 1,
    text_arabic: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ',
    text_translation_fr: 'Béni soit celui dans la main de qui est la royauté',
    juz_number: 29,
    status: 'new',
    ease_factor: 2.5,
    interval: 0,
    repetitions: 0,
  }),
}));

jest.mock('../../hooks/useAudioPlayer', () => ({
  useAudioPlayer: () => ({
    isPlaying: false,
    isLoading: false,
    isLooping: false,
    error: null,
    duration: 60,
    currentTime: 0,
    play: jest.fn(),
    pause: jest.fn(),
    stop: jest.fn(),
    replay: jest.fn(),
    toggleLoop: jest.fn(),
    seek: jest.fn(),
    setPlaybackSpeed: jest.fn(),
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

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

jest.mock('../../context/FontSizeContext', () => ({
  useFonts: () => ({
    fontSize: 'medium',
    fonts: { caption: 12, body: 14, subheading: 16, heading: 18, title: 24, hero: 28 },
    scale: (size: number) => size,
  }),
}));

jest.mock('@react-native-community/slider', () => {
  const { View } = require('react-native');
  return { __esModule: true, default: (props: Record<string, unknown>) => <View testID="slider" {...props} /> };
});

// ============ IMPORTS ============
import { DashboardScreen } from '../DashboardScreen';
import { AudioPlayerScreen } from '../AudioPlayerScreen';
import { SettingsScreen } from '../SettingsScreen';
import { useAppStore } from '@/stores/appStore';
import { useUserStore } from '../../stores/userStore';

const mockStats = {
  total_verses: 995,
  total_learned: 50,
  total_mastered: 20,
  total_consolidating: 15,
  total_learning: 15,
  mastered: 20,
  consolidating: 15,
  learning: 15,
  streak_days: 5,
  longest_streak: 12,
  retention_rate: 0.85,
  verses_by_juz: [
    { juz_number: 29, total: 564, mastered: 10, consolidating: 5, learning: 5 },
    { juz_number: 30, total: 431, mastered: 10, consolidating: 10, learning: 10 },
  ],
  verses_by_surah: [],
  surahs: [],
  calendar: [],
  this_month: 30,
};

const mockSettings = {
  language: 'fr',
  reciter: { id: '1', name: 'عبد الباسط', englishName: 'Abdul Basit', style: 'Murattal' },
  notificationsEnabled: true,
  dailyReminderTime: '08:00',
  darkMode: false,
  fontSize: 'medium' as const,
};

const mockAppSettings = {
  learning_mode: 'active' as const,
  focus_juz_start: 29,
  focus_juz_end: 30,
  evaluation_day: 1,
  learning_capacity: 10,
  daily_new_lines: 3,
  direction: 'desc' as const,
  session_duration: 15,
  preferred_reciter: 'abdul_basit',
};

// ============ SC-4: DASHBOARD & STATS ============
describe('QA: Dashboard — SC-4.x', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      stats: mockStats,
      dailyReview: { date: '2026-03-12', due_count: 10, completed_count: 3, verses: [] },
      loadStats: jest.fn(),
      loadTodayReview: jest.fn(),
    });
    (useUserStore as unknown as jest.Mock).mockReturnValue({
      settings: mockSettings,
      updateSettings: jest.fn(),
    });
  });

  // SC-4.2 — Longest streak
  it('SC-4.2: should display longest_streak separately from current streak', () => {
    const { getAllByText } = render(<DashboardScreen />);
    // Current streak = 5, longest = 12
    expect(getAllByText('5').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('12').length).toBeGreaterThanOrEqual(1);
  });

  // SC-4.3 — Weekly progress with real data
  it('SC-4.3: should pass weekly data to WeeklyProgress', () => {
    const { getByText } = render(<DashboardScreen />);
    // Component renders — getWeeklyReviewCounts is called
    expect(getByText('dashboard.weeklyProgress')).toBeTruthy();
  });

  // SC-4.7 — Quick actions navigation
  it('SC-4.7: should have all 4 quick action buttons', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('dashboard.continue')).toBeTruthy();
    expect(getByText('dashboard.reviewBtn')).toBeTruthy();
    expect(getByText('dashboard.listen')).toBeTruthy();
    expect(getByText('dashboard.stats')).toBeTruthy();
  });

  // SC-4.1 — Zero stats (first time user)
  it('SC-4.1: should handle null stats (first time user)', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      stats: null,
      dailyReview: null,
      loadStats: jest.fn(),
      loadTodayReview: jest.fn(),
    });

    const { getAllByText } = render(<DashboardScreen />);
    // Streak should be 0, longest streak should be 0
    expect(getAllByText('0').length).toBeGreaterThanOrEqual(2);
  });

  // SC-6.2 — RTL layout
  it('SC-6.2: should apply RTL styles when language is Arabic', () => {
    (useUserStore as unknown as jest.Mock).mockReturnValue({
      settings: { ...mockSettings, language: 'ar' },
      updateSettings: jest.fn(),
    });

    const { getByText } = render(<DashboardScreen />);
    // Greeting should have textAlign: 'right'
    const greeting = getByText('common.welcome');
    expect(greeting.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ textAlign: 'right' }),
      ])
    );
  });

  it('SC-6.2: should apply LTR styles when language is French', () => {
    const { getByText } = render(<DashboardScreen />);
    const greeting = getByText('common.welcome');
    expect(greeting.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ textAlign: 'left' }),
      ])
    );
  });
});

// ============ SC-3: AUDIO PLAYER SCREEN ============
describe('QA: AudioPlayerScreen — SC-3.x', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useUserStore as unknown as jest.Mock).mockReturnValue({
      settings: mockSettings,
      updateSettings: jest.fn(),
    });
  });

  // SC-3.1 — Default state
  it('SC-3.1: should show Al-Fatiha by default', () => {
    const { getByText } = render(<AudioPlayerScreen />);
    expect(getByText('الفاتحة')).toBeTruthy();
    expect(getByText('Al-Fatiha')).toBeTruthy();
  });

  // SC-3.2 — Speed control UI
  it('SC-3.2: should show speed button with current speed', () => {
    const { getByText } = render(<AudioPlayerScreen />);
    expect(getByText('audio.speed: 1x')).toBeTruthy();
  });

  it('SC-3.2: should show speed options when speed button pressed', () => {
    const { getByText } = render(<AudioPlayerScreen />);
    fireEvent.press(getByText('audio.speed: 1x'));

    // All speed options visible
    expect(getByText('0.5x')).toBeTruthy();
    expect(getByText('0.75x')).toBeTruthy();
    expect(getByText('1x')).toBeTruthy();
    expect(getByText('1.25x')).toBeTruthy();
    expect(getByText('1.5x')).toBeTruthy();
    expect(getByText('2x')).toBeTruthy();
  });

  it('SC-3.2: should update speed label when option selected', () => {
    const { getByText, queryByText } = render(<AudioPlayerScreen />);
    fireEvent.press(getByText('audio.speed: 1x'));
    fireEvent.press(getByText('2x'));

    expect(getByText('audio.speed: 2x')).toBeTruthy();
    // Speed options should be hidden
    expect(queryByText('0.5x')).toBeNull();
  });

  // SC-3.4 — Navigation between ayahs
  it('SC-3.4: should show verse counter', () => {
    const { getByText } = render(<AudioPlayerScreen />);
    expect(getByText(/audio.verse/)).toBeTruthy();
  });

  // SC-3.6 — Text display
  it('SC-3.6: should show text panel when Text button pressed', async () => {
    const { getByText } = render(<AudioPlayerScreen />);
    fireEvent.press(getByText('audio.text'));

    await waitFor(() => {
      // Should show loading or actual verse text
      expect(getByText('common.loading')).toBeTruthy();
    });
  });

  // SC-8 — Back button removed
  it('SC-8: should NOT have a back button (tab screen)', () => {
    const { queryByLabelText } = render(<AudioPlayerScreen />);
    expect(queryByLabelText('audio.back')).toBeNull();
  });

  // SC-3.3 — Loop controls
  it('SC-3.3: should show repeat button', () => {
    const { getByText } = render(<AudioPlayerScreen />);
    expect(getByText('audio.repeat')).toBeTruthy();
  });

  // Reciter display
  it('should show reciter name based on language', () => {
    const { getByText } = render(<AudioPlayerScreen />);
    expect(getByText('Abdul Basit')).toBeTruthy();
  });

  it('should show Arabic reciter name when language is AR', () => {
    (useUserStore as unknown as jest.Mock).mockReturnValue({
      settings: { ...mockSettings, language: 'ar' },
      updateSettings: jest.fn(),
    });

    const { getByText } = render(<AudioPlayerScreen />);
    expect(getByText('عبد الباسط')).toBeTruthy();
  });
});

// ============ SC-5: SETTINGS SCREEN ============
describe('QA: SettingsScreen — SC-5.x', () => {
  const mockLoadSettings = jest.fn();
  const mockUpdateSettings = jest.fn().mockResolvedValue({});

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      settings: mockAppSettings,
      loadSettings: mockLoadSettings,
      updateSettings: mockUpdateSettings,
    });
    (useUserStore as unknown as jest.Mock).mockReturnValue({
      settings: mockSettings,
      updateSettings: jest.fn(),
    });
  });

  // SC-5.1 — Language selection
  it('SC-5.1: should show language picker', () => {
    const { getByText, getAllByText } = render(<SettingsScreen />);
    expect(getByText('settings.language')).toBeTruthy();
    // There are now multiple Français texts (language + translation)
    const francaisElements = getAllByText('Français');
    expect(francaisElements.length).toBeGreaterThan(0);
  });

  it('SC-5.1: should show all language options when picker opened', () => {
    const { getByText, getAllByText } = render(<SettingsScreen />);
    // Use the first Français (likely the language picker)
    const francaisButtons = getAllByText('Français');
    fireEvent.press(francaisButtons[0]);

    expect(getByText('English')).toBeTruthy();
    expect(getByText('العربية')).toBeTruthy();
  });

  // SC-5.2 — Dark mode toggle
  it('SC-5.2: should show dark mode toggle', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText(/settings.darkMode/)).toBeTruthy();
  });

  // SC-5.6 — Learning mode options (i18n)
  it('SC-5.6: should show learning modes with i18n keys', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText(/settings.modeActive/)).toBeTruthy();
    expect(getByText(/settings.modeRevision/)).toBeTruthy();
    expect(getByText(/settings.modePaused/)).toBeTruthy();
  });

  // SC-5.6 — Direction options (i18n)
  it('SC-5.6: should show direction with i18n keys', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText(/settings.dirDesc/)).toBeTruthy();
    expect(getByText(/settings.dirAsc/)).toBeTruthy();
  });

  // SC-5.4 — Debounce behavior
  it('SC-5.4: should debounce settings save', async () => {
    jest.useFakeTimers();

    const { getByText } = render(<SettingsScreen />);

    // Change learning mode
    fireEvent.press(getByText(/settings.modeRevision/));

    // Should NOT save immediately
    expect(mockUpdateSettings).not.toHaveBeenCalled();

    // Advance timer past debounce (1000ms)
    act(() => { jest.advanceTimersByTime(1100); });

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalledWith(
        expect.objectContaining({ learning_mode: 'revision_only' })
      );
    });

    jest.useRealTimers();
  });

  // SC-5.4 — Rapid changes only save final value
  it('SC-5.4: should only save final value on rapid changes', async () => {
    jest.useFakeTimers();

    const { getByText } = render(<SettingsScreen />);

    // Rapid mode changes
    fireEvent.press(getByText(/settings.modeRevision/));
    act(() => { jest.advanceTimersByTime(500); }); // 500ms — not yet saved
    fireEvent.press(getByText(/settings.modePaused/));

    // Advance past debounce
    act(() => { jest.advanceTimersByTime(1100); });

    await waitFor(() => {
      // Should have been called with the LAST value (paused), not revision_only
      const calls = mockUpdateSettings.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0]).toEqual(expect.objectContaining({ learning_mode: 'paused' }));
    });

    jest.useRealTimers();
  });

  // Slider settings
  it('should display slider values correctly', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('3')).toBeTruthy(); // daily_new_lines default
    expect(getByText('15')).toBeTruthy(); // session_duration default
    expect(getByText('10')).toBeTruthy(); // learning_capacity default
  });

  // Juz range
  it('should display juz range settings', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('settings.focusJuz')).toBeTruthy();
    expect(getByText('settings.start')).toBeTruthy();
    expect(getByText('settings.end')).toBeTruthy();
  });

  // Reciter picker
  it('should show reciter options', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('Abdul Basit')).toBeTruthy();

    // Open picker
    fireEvent.press(getByText('Abdul Basit'));
    expect(getByText('Mishary Al-Afasy')).toBeTruthy();
    expect(getByText('Abdurrahman As-Sudais')).toBeTruthy();
  });

  // Loading state
  it('should show loading text when settings is null', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      settings: null,
      loadSettings: mockLoadSettings,
      updateSettings: mockUpdateSettings,
    });

    const { getByText } = render(<SettingsScreen />);
    expect(getByText('common.loading')).toBeTruthy();
  });
});

// ============ SC-6: i18n ============
describe('QA: i18n Coverage — SC-6.1', () => {
  it('SC-6.1: all translation keys should be accessed via t()', () => {
    // The mock t() returns the key itself, so we can verify all text is i18n'd
    // If any raw French/English text appears, it means t() wasn't used

    (useAppStore as unknown as jest.Mock).mockReturnValue({
      stats: mockStats,
      dailyReview: { date: '2026-03-12', due_count: 10, completed_count: 3, verses: [] },
      loadStats: jest.fn(),
      loadTodayReview: jest.fn(),
    });
    (useUserStore as unknown as jest.Mock).mockReturnValue({
      settings: mockSettings,
      updateSettings: jest.fn(),
    });

    const { queryByText } = render(<DashboardScreen />);

    // These hardcoded French strings should NOT appear (they would mean i18n is missing)
    expect(queryByText('Bienvenue')).toBeNull();
    expect(queryByText('Tableau de bord')).toBeNull();
    expect(queryByText('Actions rapides')).toBeNull();
  });
});
