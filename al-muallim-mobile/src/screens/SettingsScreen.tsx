import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../store/userStore';
import { useTheme } from '../context/ThemeContext';
import { useFonts } from '../context/FontSizeContext';

const LANGUAGES = [
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

const FONT_SIZES = [
  { key: 'small', label: 'Petite' },
  { key: 'medium', label: 'Moyenne' },
  { key: 'large', label: 'Grande' },
];

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings } = useUserStore();
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);

  const handleLanguageChange = (langCode: 'ar' | 'en' | 'fr') => {
    updateSettings({ language: langCode });
    setShowLanguagePicker(false);
    Alert.alert('Succès', `Langue changée en ${LANGUAGES.find(l => l.code === langCode)?.name}`);
  };

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    updateSettings({ fontSize: size });
    setShowFontSizePicker(false);
  };

  const handleNotificationsToggle = (value: boolean) => {
    updateSettings({ notificationsEnabled: value });
    if (value) {
      Alert.alert('Notifications activées', 'Vous recevrez des rappels quotidiens');
    }
  };

  const handleDarkModeToggle = (value: boolean) => {
    updateSettings({ darkMode: value });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Paramètres</Text>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Langue</Text>
          <TouchableOpacity
            style={styles.option}
            onPress={() => setShowLanguagePicker(!showLanguagePicker)}
          >
            <View style={styles.optionLeft}>
              <Text style={styles.optionIcon}>🌐</Text>
              <Text style={styles.optionLabel}>Langue de l'application</Text>
            </View>
            <Text style={styles.optionValue}>
              {LANGUAGES.find(l => l.code === settings.language)?.flag}{' '}
              {LANGUAGES.find(l => l.code === settings.language)?.name}
            </Text>
          </TouchableOpacity>

          {showLanguagePicker && (
            <View style={styles.picker}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.pickerOption,
                    settings.language === lang.code && styles.pickerOptionActive,
                  ]}
                  onPress={() => handleLanguageChange(lang.code as 'ar' | 'en' | 'fr')}
                >
                  <Text style={styles.pickerFlag}>{lang.flag}</Text>
                  <Text style={styles.pickerLabel}>{lang.name}</Text>
                  {settings.language === lang.code && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Reciter Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Récitation</Text>
          <View style={styles.option}>
            <View style={styles.optionLeft}>
              <Text style={styles.optionIcon}>🎙️</Text>
              <Text style={styles.optionLabel}>Récitateur</Text>
            </View>
            <Text style={styles.optionValue}>{settings.reciter.englishName}</Text>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.option}>
            <View style={styles.optionLeft}>
              <Text style={styles.optionIcon}>🔔</Text>
              <Text style={styles.optionLabel}>Rappels quotidiens</Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: '#ccc', true: '#4CAF50' }}
              thumbColor="#fff"
            />
          </View>

          {settings.notificationsEnabled && (
            <View style={styles.option}>
              <View style={styles.optionLeft}>
                <Text style={styles.optionIcon}>⏰</Text>
                <Text style={styles.optionLabel}>Heure du rappel</Text>
              </View>
              <Text style={styles.optionValue}>{settings.dailyReminderTime}</Text>
            </View>
          )}
        </View>

        {/* Display Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Affichage</Text>
          
          <View style={styles.option}>
            <View style={styles.optionLeft}>
              <Text style={styles.optionIcon}>🌙</Text>
              <Text style={styles.optionLabel}>Mode sombre</Text>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: '#ccc', true: '#4CAF50' }}
              thumbColor="#fff"
            />
          </View>

          <TouchableOpacity
            style={styles.option}
            onPress={() => setShowFontSizePicker(!showFontSizePicker)}
          >
            <View style={styles.optionLeft}>
              <Text style={styles.optionIcon}>🔤</Text>
              <Text style={styles.optionLabel}>Taille du texte</Text>
            </View>
            <Text style={styles.optionValue}>
              {FONT_SIZES.find(f => f.key === settings.fontSize)?.label}
            </Text>
          </TouchableOpacity>

          {showFontSizePicker && (
            <View style={styles.picker}>
              {FONT_SIZES.map((size) => (
                <TouchableOpacity
                  key={size.key}
                  style={[
                    styles.pickerOption,
                    settings.fontSize === size.key && styles.pickerOptionActive,
                  ]}
                  onPress={() => handleFontSizeChange(size.key as 'small' | 'medium' | 'large')}
                >
                  <Text style={styles.pickerLabel}>{size.label}</Text>
                  {settings.fontSize === size.key && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <View style={styles.option}>
            <View style={styles.optionLeft}>
              <Text style={styles.optionIcon}>ℹ️</Text>
              <Text style={styles.optionLabel}>Version</Text>
            </View>
            <Text style={styles.optionValue}>1.0.0</Text>
          </View>
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 16,
    color: '#333',
  },
  optionValue: {
    fontSize: 14,
    color: '#666',
  },
  picker: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fafafa',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 2,
  },
  pickerOptionActive: {
    backgroundColor: '#e3f2fd',
  },
  pickerFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  pickerLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  checkmark: {
    fontSize: 18,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  footer: {
    height: 20,
  },
});
