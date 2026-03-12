import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useUserStore } from '../stores/userStore';

type Theme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  text: string;
  textSecondary: string;
  border: string;
  card: string;
  tabBar: string;
  header: string;
}

const themeColors: Record<Theme, ThemeColors> = {
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    primary: '#10B981',
    text: '#1E293B',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    card: '#FFFFFF',
    tabBar: '#FFFFFF',
    header: '#FFFFFF',
  },
  dark: {
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
};

interface ThemeContextValue {
  theme: Theme;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings, updateSettings } = useUserStore();
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(() => {
    if (settings.darkMode) {return 'dark';}
    return systemColorScheme === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    if (settings.darkMode !== undefined) {
      setTheme(settings.darkMode ? 'dark' : 'light');
    } else if (systemColorScheme) {
      setTheme(systemColorScheme === 'dark' ? 'dark' : 'light');
    }
  }, [settings.darkMode, systemColorScheme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    updateSettings({ darkMode: newTheme === 'dark' });
  };

  const value: ThemeContextValue = {
    theme,
    colors: themeColors[theme],
    isDark: theme === 'dark',
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
