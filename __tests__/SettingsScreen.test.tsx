import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SettingsScreen } from '../src/screens/SettingsScreen';
import { useUserStore } from '../src/store/userStore';

// Mock the store
jest.mock('../src/store/userStore');

// Note: Alert is mocked globally in jest.setup.js

describe('SettingsScreen', () => {
  const mockUpdateSettings = jest.fn();

  beforeEach(() => {
    (useUserStore as unknown as jest.Mock).mockReturnValue({
      settings: {
        language: 'fr',
        reciter: {
          id: '1',
          name: 'عبد الباسط عبد الصمد',
          englishName: 'Abdul Basit Abdul Samad',
          style: 'Murattal',
        },
        notificationsEnabled: true,
        dailyReminderTime: '08:00',
        darkMode: false,
        fontSize: 'medium',
      },
      updateSettings: mockUpdateSettings,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders settings title', () => {
    const { getByText } = render(<SettingsScreen />);
    
    expect(getByText('Paramètres')).toBeTruthy();
  });

  it('displays language section', () => {
    const { getByText } = render(<SettingsScreen />);
    
    expect(getByText('Langue')).toBeTruthy();
    expect(getByText('Langue de l\'application')).toBeTruthy();
    expect(getByText('🇫🇷 Français')).toBeTruthy();
  });

  it('displays reciter section', () => {
    const { getByText } = render(<SettingsScreen />);
    
    expect(getByText('Récitation')).toBeTruthy();
    expect(getByText('Récitateur')).toBeTruthy();
    expect(getByText('Abdul Basit Abdul Samad')).toBeTruthy();
  });

  it('displays notifications section', () => {
    const { getByText } = render(<SettingsScreen />);
    
    expect(getByText('Notifications')).toBeTruthy();
    expect(getByText('Rappels quotidiens')).toBeTruthy();
    expect(getByText('Heure du rappel')).toBeTruthy();
  });

  it('displays display section', () => {
    const { getByText } = render(<SettingsScreen />);
    
    expect(getByText('Affichage')).toBeTruthy();
    expect(getByText('Mode sombre')).toBeTruthy();
    expect(getByText('Taille du texte')).toBeTruthy();
  });

  it('displays about section', () => {
    const { getByText } = render(<SettingsScreen />);
    
    expect(getByText('À propos')).toBeTruthy();
    expect(getByText('Version')).toBeTruthy();
    expect(getByText('1.0.0')).toBeTruthy();
  });

  it('toggles language picker', () => {
    const { getByText, queryByText } = render(<SettingsScreen />);
    
    // Language picker should not be visible initially
    expect(queryByText('العربية')).toBeNull();
    
    // Tap language option
    fireEvent.press(getByText('Langue de l\'application'));
    
    // Language picker should now be visible
    expect(getByText('العربية')).toBeTruthy();
    expect(getByText('English')).toBeTruthy();
    expect(getByText('Français')).toBeTruthy();
  });

  it('toggles font size picker', () => {
    const { getByText, queryByText } = render(<SettingsScreen />);
    
    // Font size picker should not be visible initially
    expect(queryByText('Petite')).toBeNull();
    
    // Tap font size option
    fireEvent.press(getByText('Taille du texte'));
    
    // Font size picker should now be visible
    expect(getByText('Petite')).toBeTruthy();
    expect(getByText('Moyenne')).toBeTruthy();
    expect(getByText('Grande')).toBeTruthy();
  });
});
