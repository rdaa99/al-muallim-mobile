import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
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

const RECITERS = [
  { id: '1', name: 'عبد الباسط عبد الصمد', englishName: 'Abdul Basit Abdul Samad', style: 'Murattal' },
  { id: '2', name: 'مشاري العفاسي', englishName: 'Mishary Alafasy', style: 'Murattal' },
  { id: '3', name: 'سعد الغامدي', englishName: 'Saad Al-Ghamdi', style: 'Murattal' },
  { id: '4', name: 'ماهر المعيقلي', englishName: 'Maher Al-Muaiqly', style: 'Murattal' },
];

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings } = useUserStore();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { fonts } = useFonts();
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const [showReciterPicker, setShowReciterPicker] = useState(false);

  const FONT_SIZES = [
    { key: 'small', label: t('settings.fontSmall') },
    { key: 'medium', label: t('settings.fontMedium') },
    { key: 'large', label: t('settings.fontLarge') },
  ];

  const handleLanguageChange = (langCode: 'ar' | 'en' | 'fr') => {
    updateSettings({ language: langCode });
    setShowLanguagePicker(false);
  };

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    updateSettings({ fontSize: size });
    setShowFontSizePicker(false);
  };

  const handleReciterChange = (reciter: typeof RECITERS[0]) => {
    updateSettings({ reciter });
    setShowReciterPicker(false);
  };

  const handleNotificationsToggle = (value: boolean) => {
    updateSettings({ notificationsEnabled: value });
  };

  const handleDarkModeToggle = (value: boolean) => {
    updateSettings({ darkMode: value });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text, fontSize: fonts.hero }]}>
            {t('settings.title')}
          </Text>
        </View>

        {/* Language Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontSize: fonts.caption }]}>
            {t('settings.language').toUpperCase()}
          </Text>
          <TouchableOpacity
            style={[styles.option, { borderBottomColor: colors.border }]}
            onPress={() => setShowLanguagePicker(!showLanguagePicker)}
          >
            <View style={styles.optionLeft}>
              <Text style={styles.optionIcon}>🌐</Text>
              <Text style={[styles.optionLabel, { color: colors.text, fontSize: fonts.subheading }]}>
                {t('settings.languageLabel')}
              </Text>
            </View>
            <Text style={[styles.optionValue, { color: colors.textSecondary, fontSize: fonts.body }]}>
              {LANGUAGES.find(l => l.code === settings.language)?.flag}{' '}
              {LANGUAGES.find(l => l.code === settings.language)?.name}
            </Text>
          </TouchableOpacity>

          {showLanguagePicker && (
            <View style={[styles.picker, { backgroundColor: colors.surface }]}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.pickerOption,
                    settings.language === lang.code && { backgroundColor: colors.primary + '20' },
                  ]}
                  onPress={() => handleLanguageChange(lang.code as 'ar' | 'en' | 'fr')}
                >
                  <Text style={[styles.pickerFlag, { fontSize: fonts.subheading }]}>{lang.flag}</Text>
                  <Text style={[styles.pickerLabel, { color: colors.text, fontSize: fonts.subheading }]}>{lang.name}</Text>
                  {settings.language === lang.code && (
                    <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Reciter Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontSize: fonts.caption }]}>
            {t('settings.recitation').toUpperCase()}
          </Text>
          <TouchableOpacity
            style={[styles.option, { borderBottomColor: colors.border }]}
            onPress={() => setShowReciterPicker(!showReciterPicker)}
          >
            <View style={styles.optionLeft}>
              <Text style={styles.optionIcon}>🎙️</Text>
              <Text style={[styles.optionLabel, { color: colors.text, fontSize: fonts.subheading }]}>
                {t('settings.reciter')}
              </Text>
            </View>
            <Text style={[styles.optionValue, { color: colors.textSecondary, fontSize: fonts.body }]}>
              {settings.reciter.englishName}
            </Text>
          </TouchableOpacity>

          {showReciterPicker && (
            <View style={[styles.picker, { backgroundColor: colors.surface }]}>
              {RECITERS.map((reciter) => (
                <TouchableOpacity
                  key={reciter.id}
                  style={[
                    styles.pickerOption,
                    settings.reciter.id === reciter.id && { backgroundColor: colors.primary + '20' },
                  ]}
                  onPress={() => handleReciterChange(reciter)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pickerLabel, { color: colors.text, fontSize: fonts.subheading }]}>
                      {reciter.name}
                    </Text>
                    <Text style={[{ color: colors.textSecondary, fontSize: fonts.caption }]}>
                      {reciter.englishName}
                    </Text>
                  </View>
                  {settings.reciter.id === reciter.id && (
                    <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Notifications Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontSize: fonts.caption }]}>
            {t('settings.notifications').toUpperCase()}
          </Text>
          <View style={[styles.option, { borderBottomColor: colors.border }]}>
            <View style={styles.optionLeft}>
              <Text style={styles.optionIcon}>🔔</Text>
              <Text style={[styles.optionLabel, { color: colors.text, fontSize: fonts.subheading }]}>
                {t('settings.dailyReminders')}
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          {settings.notificationsEnabled && (
            <View style={[styles.option, { borderBottomColor: colors.border }]}>
              <View style={styles.optionLeft}>
                <Text style={styles.optionIcon}>⏰</Text>
                <Text style={[styles.optionLabel, { color: colors.text, fontSize: fonts.subheading }]}>
                  {t('settings.reminderTime')}
                </Text>
              </View>
              <Text style={[styles.optionValue, { color: colors.textSecondary, fontSize: fonts.body }]}>
                {settings.dailyReminderTime}
              </Text>
            </View>
          )}
        </View>

        {/* Display Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontSize: fonts.caption }]}>
            {t('settings.display').toUpperCase()}
          </Text>

          <View style={[styles.option, { borderBottomColor: colors.border }]}>
            <View style={styles.optionLeft}>
              <Text style={styles.optionIcon}>🌙</Text>
              <Text style={[styles.optionLabel, { color: colors.text, fontSize: fonts.subheading }]}>
                {t('settings.darkMode')}
              </Text>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          <TouchableOpacity
            style={[styles.option, { borderBottomColor: colors.border }]}
            onPress={() => setShowFontSizePicker(!showFontSizePicker)}
          >
            <View style={styles.optionLeft}>
              <Text style={styles.optionIcon}>🔤</Text>
              <Text style={[styles.optionLabel, { color: colors.text, fontSize: fonts.subheading }]}>
                {t('settings.fontSize')}
              </Text>
            </View>
            <Text style={[styles.optionValue, { color: colors.textSecondary, fontSize: fonts.body }]}>
              {FONT_SIZES.find(f => f.key === settings.fontSize)?.label}
            </Text>
          </TouchableOpacity>

          {showFontSizePicker && (
            <View style={[styles.picker, { backgroundColor: colors.surface }]}>
              {FONT_SIZES.map((size) => (
                <TouchableOpacity
                  key={size.key}
                  style={[
                    styles.pickerOption,
                    settings.fontSize === size.key && { backgroundColor: colors.primary + '20' },
                  ]}
                  onPress={() => handleFontSizeChange(size.key as 'small' | 'medium' | 'large')}
                >
                  <Text style={[styles.pickerLabel, { color: colors.text, fontSize: fonts.subheading }]}>
                    {size.label}
                  </Text>
                  {settings.fontSize === size.key && (
                    <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* About Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontSize: fonts.caption }]}>
            {t('settings.about').toUpperCase()}
          </Text>
          <View style={[styles.option, { borderBottomColor: colors.border }]}>
            <View style={styles.optionLeft}>
              <Text style={styles.optionIcon}>ℹ️</Text>
              <Text style={[styles.optionLabel, { color: colors.text, fontSize: fonts.subheading }]}>
                {t('settings.version')}
              </Text>
            </View>
            <Text style={[styles.optionValue, { color: colors.textSecondary, fontSize: fonts.body }]}>1.0.0</Text>
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
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontWeight: 'bold',
  },
  section: {
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontWeight: '600',
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
  optionLabel: {},
  optionValue: {},
  picker: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 2,
  },
  pickerFlag: {
    marginRight: 12,
  },
  pickerLabel: {
    flex: 1,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    height: 20,
  },
});
