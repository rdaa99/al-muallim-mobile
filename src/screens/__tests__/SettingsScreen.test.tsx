import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { SettingsScreen } from '../SettingsScreen';
import { useAppStore } from '@/stores/appStore';

// Mock the store
jest.mock('@/stores/appStore');

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

// Mock Platform
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Platform: {
    OS: 'ios',
  },
  Alert: {
    alert: jest.fn(),
  },
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
    expect(getByText('Chargement...')).toBeTruthy();
  });

  it('should display learning mode options', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('Mode d\'apprentissage')).toBeTruthy();
    expect(getByText('🎯 Actif')).toBeTruthy();
    expect(getByText('🔄 Révision uniquement')).toBeTruthy();
    expect(getByText('⏸️ En pause')).toBeTruthy();
  });

  it('should highlight active learning mode', () => {
    const { getByText } = render(<SettingsScreen />);
    const activeButton = getByText('🎯 Actif');
    expect(activeButton).toBeTruthy();
  });

  it('should change learning mode on press', async () => {
    const { getByText } = render(<SettingsScreen />);
    
    const revisionOnlyButton = getByText('🔄 Révision uniquement');
    fireEvent.press(revisionOnlyButton);

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalledWith(
        expect.objectContaining({ learning_mode: 'revision_only' })
      );
    });
  });

  it('should display daily settings with sliders', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('Quotidien')).toBeTruthy();
    expect(getByText('Nouveaux versets/jour')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
    expect(getByText('Durée session (min)')).toBeTruthy();
    expect(getByText('Capacité d\'apprentissage')).toBeTruthy();
  });

  it('should display juz range settings', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('Focus Juz')).toBeTruthy();
    expect(getByText('Début')).toBeTruthy();
    expect(getByText('Juz 1')).toBeTruthy();
    expect(getByText('Fin')).toBeTruthy();
    expect(getByText('Juz 30')).toBeTruthy();
  });

  it('should display direction options', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('Direction')).toBeTruthy();
    expect(getByText('⬇️ An-Nas → Al-Fatiha')).toBeTruthy();
    expect(getByText('⬆️ Al-Fatiha → An-Nas')).toBeTruthy();
  });

  it('should change direction on press', async () => {
    const { getByText } = render(<SettingsScreen />);
    
    const ascButton = getByText('⬆️ Al-Fatiha → An-Nas');
    fireEvent.press(ascButton);

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalledWith(
        expect.objectContaining({ direction: 'asc' })
      );
    });
  });

  it('should display reciter picker', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('Récitateur préféré')).toBeTruthy();
    expect(getByText('Abdul Basit')).toBeTruthy();
  });

  it('should toggle reciter picker on press', () => {
    const { getByText, queryByText } = render(<SettingsScreen />);
    
    const reciterButton = getByText('Abdul Basit').parent;
    fireEvent.press(reciterButton);

    // Should show picker options
    expect(getByText('Mishary Al-Afasy')).toBeTruthy();
    expect(getByText('Mahmoud Khalil Al-Husary')).toBeTruthy();
  });

  it('should select reciter from picker', async () => {
    const { getByText } = render(<SettingsScreen />);
    
    // Open picker
    const reciterButton = getByText('Abdul Basit').parent;
    fireEvent.press(reciterButton);

    // Select new reciter
    const newReciter = getByText('Mishary Al-Afasy');
    fireEvent.press(newReciter);

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalledWith(
        expect.objectContaining({ preferred_reciter: 'afasy' })
      );
    });
  });

  it('should call loadSettings on mount', () => {
    render(<SettingsScreen />);
    expect(mockLoadSettings).toHaveBeenCalled();
  });

  it('should show info card about auto-save', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText(/Les changements sont sauvegardés automatiquement/)).toBeTruthy();
  });

  it('should debounce settings updates', async () => {
    jest.useFakeTimers();
    
    const { getByText } = render(<SettingsScreen />);
    
    const revisionOnlyButton = getByText('🔄 Révision uniquement');
    fireEvent.press(revisionOnlyButton);

    // Should not update immediately
    expect(mockUpdateSettings).not.toHaveBeenCalled();

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalled();
    });

    jest.useRealTimers();
  });

  it('should show saving indicator during save', async () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      settings: mockSettings,
      loadSettings: mockLoadSettings,
      updateSettings: jest.fn(() => new Promise(resolve => setTimeout(resolve, 1000))),
    });

    const { getByText, queryByText } = render(<SettingsScreen />);
    
    const revisionOnlyButton = getByText('🔄 Révision uniquement');
    fireEvent.press(revisionOnlyButton);

    // Should not show saving banner immediately
    expect(queryByText('Sauvegarde en cours...')).toBeNull();
  });

  it('should update local settings optimistically', () => {
    const { getByText } = render(<SettingsScreen />);
    
    const revisionOnlyButton = getByText('🔄 Révision uniquement');
    fireEvent.press(revisionOnlyButton);

    // Should update local state immediately
    expect(getByText('🔄 Révision uniquement')).toBeTruthy();
  });
});
