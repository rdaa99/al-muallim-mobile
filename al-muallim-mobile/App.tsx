import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/context/ThemeContext';
import { FontSizeProvider } from './src/context/FontSizeContext';
import { useUserStore } from './src/store/userStore';
import './src/i18n'; // Import i18n configuration
import i18n from 'i18next';

export default function App() {
  const { settings } = useUserStore();

  // Sync i18n language with store
  useEffect(() => {
    if (settings.language) {
      i18n.changeLanguage(settings.language);
    }
  }, [settings.language]);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <FontSizeProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </FontSizeProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
