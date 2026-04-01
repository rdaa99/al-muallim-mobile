import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useAppStore } from '@/stores/appStore';
import { useUserStore } from '../stores/userStore';
import { useTheme } from '../context/ThemeContext';
import type { UserSettings } from '@/types';
import { AVAILABLE_TRANSLATIONS, type TranslationLanguage } from '@/services/translationService';

const RECITERS = [
  { id: 'abdul_basit', name: 'Abdul Basit' },
  { id: 'sudais', name: 'Abdurrahman As-Sudais' },
  { id: 'afasy', name: 'Mishary Al-Afasy' },
  { id: 'husary', name: 'Mahmoud Khalil Al-Husary' },
  { id: 'minshawi', name: 'Mohamed Siddiq Al-Minshawi' },
];

const LANGUAGES = [
  { id: 'fr', label: 'Français' },
  { id: 'en', label: 'English' },
  { id: 'ar', label: 'العربية' },
];

export const SettingsScreen: React.FC = () => {
  const { settings, loadSettings, updateSettings } = useAppStore();
  const { settings: displaySettings, updateSettings: updateDisplaySettings } = useUserStore();
  const { colors, toggleTheme, isDark } = useTheme();
  const { t } = useTranslation();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showReciterPicker, setShowReciterPicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [showTranslationPicker, setShowTranslationPicker] = useState(false);

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const debouncedSave = useCallback(
    async (newSettings: Partial<UserSettings>) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        setSaving(true);
        try {
          await updateSettings(newSettings);
          showToast(t('settings.saved', 'Paramètres sauvegardés ✓'));
        } catch {
          showToast(t('settings.saveError', 'Erreur lors de la sauvegarde'));
        } finally {
          setSaving(false);
        }
      }, 1000);
    },
    [updateSettings, t]
  );

  const showToast = (message: string) => {
    if (Platform.OS === 'web') {
      return;
    }
    Alert.alert('', message, [{ text: 'OK' }], { cancelable: true });
  };

  const updateSetting = async <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    if (!localSettings) {return;}
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    await debouncedSave({ [key]: value } as Partial<UserSettings>);
  };

  const handleLanguageChange = (langId: string) => {
    i18n.changeLanguage(langId);
    updateDisplaySettings({ language: langId });
    setShowLanguagePicker(false);
  };

  const handleTranslationChange = (translationId: TranslationLanguage) => {
    updateDisplaySettings({ selectedTranslation: translationId });
    setShowTranslationPicker(false);
  };

  if (!localSettings) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          {t('common.loading', 'Chargement...')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Saving indicator */}
      {saving && (
        <View style={[styles.savingBanner, { backgroundColor: colors.primary }]}>
          <Text style={styles.savingText}>{t('settings.saving', 'Sauvegarde en cours...')}</Text>
        </View>
      )}

      {/* Language */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('settings.language')}</Text>

        <TouchableOpacity
          style={[styles.reciterButton, { backgroundColor: colors.border }]}
          onPress={() => setShowLanguagePicker(!showLanguagePicker)}
        >
          <Text style={[styles.reciterText, { color: colors.primary }]}>
            {LANGUAGES.find(l => l.id === (displaySettings?.language || 'fr'))?.label || 'Français'}
          </Text>
          <Text style={[styles.reciterArrow, { color: colors.textSecondary }]}>
            {showLanguagePicker ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {showLanguagePicker && (
          <View style={[styles.pickerContainer, { backgroundColor: colors.border }]}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.id}
                style={[
                  styles.pickerOption,
                  { borderBottomColor: colors.background },
                  displaySettings?.language === lang.id && { backgroundColor: colors.primary },
                ]}
                onPress={() => handleLanguageChange(lang.id)}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    { color: colors.textSecondary },
                    displaySettings?.language === lang.id && styles.pickerOptionTextActive,
                  ]}
                >
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Quran Translation */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('settings.translation', 'Traduction du Coran')}
        </Text>

        <TouchableOpacity
          style={[styles.reciterButton, { backgroundColor: colors.border }]}
          onPress={() => setShowTranslationPicker(!showTranslationPicker)}
        >
          <Text style={[styles.reciterText, { color: colors.primary }]}>
            {AVAILABLE_TRANSLATIONS.find(t => t.id === (displaySettings?.selectedTranslation || 'fr'))?.nativeName || 'Français'}
          </Text>
          <Text style={[styles.reciterArrow, { color: colors.textSecondary }]}>
            {showTranslationPicker ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {showTranslationPicker && (
          <View style={[styles.pickerContainer, { backgroundColor: colors.border }]}>
            {AVAILABLE_TRANSLATIONS.map((translation) => (
              <TouchableOpacity
                key={translation.id}
                style={[
                  styles.pickerOption,
                  { borderBottomColor: colors.background },
                  displaySettings?.selectedTranslation === translation.id && { backgroundColor: colors.primary },
                ]}
                onPress={() => handleTranslationChange(translation.id)}
              >
                <View style={styles.translationOption}>
                  <Text
                    style={[
                      styles.pickerOptionText,
                      { color: colors.textSecondary },
                      displaySettings?.selectedTranslation === translation.id && styles.pickerOptionTextActive,
                    ]}
                  >
                    {translation.nativeName}
                  </Text>
                  <Text
                    style={[
                      styles.translationDescription,
                      { color: colors.textSecondary },
                      displaySettings?.selectedTranslation === translation.id && styles.pickerOptionTextActive,
                    ]}
                  >
                    {translation.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Dark Mode Toggle */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('settings.display')}</Text>
        <TouchableOpacity
          style={[styles.optionButton, isDark && { backgroundColor: colors.primary }]}
          onPress={toggleTheme}
        >
          <Text style={[styles.optionText, { color: isDark ? '#FFFFFF' : colors.textSecondary }]}>
            {isDark ? '🌙 ' : '☀️ '}{t('settings.darkMode')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Learning Mode */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('settings.learningMode', "Mode d'apprentissage")}
        </Text>
        {(['active', 'revision_only', 'paused'] as const).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.optionButton,
              { backgroundColor: colors.border },
              localSettings.learning_mode === mode && { backgroundColor: colors.primary },
            ]}
            onPress={() => updateSetting('learning_mode', mode)}
          >
            <Text
              style={[
                styles.optionText,
                { color: colors.textSecondary },
                localSettings.learning_mode === mode && styles.optionTextActive,
              ]}
            >
              {mode === 'active' ? `\uD83C\uDFAF ${t('settings.modeActive')}` : mode === 'revision_only' ? `\uD83D\uDD04 ${t('settings.modeRevision')}` : `\u23F8\uFE0F ${t('settings.modePaused')}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Daily Settings with Sliders */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('settings.daily', 'Quotidien')}
        </Text>

        <View style={styles.sliderContainer}>
          <View style={styles.sliderHeader}>
            <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>
              {t('settings.newVersesDay', 'Nouveaux versets/jour')}
            </Text>
            <Text style={[styles.sliderValue, { color: colors.primary }]}>
              {localSettings.daily_new_lines ?? 3}
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={localSettings.daily_new_lines ?? 3}
            onValueChange={(value) => {
              setLocalSettings({ ...localSettings, daily_new_lines: value });
            }}
            onSlidingComplete={(value) => updateSetting('daily_new_lines', value)}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
        </View>

        <View style={styles.sliderContainer}>
          <View style={styles.sliderHeader}>
            <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>
              {t('settings.sessionDuration', 'Durée session (min)')}
            </Text>
            <Text style={[styles.sliderValue, { color: colors.primary }]}>
              {localSettings.session_duration}
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={5}
            maximumValue={60}
            step={5}
            value={localSettings.session_duration ?? 15}
            onValueChange={(value) => {
              setLocalSettings({ ...localSettings, session_duration: value });
            }}
            onSlidingComplete={(value) => updateSetting('session_duration', value)}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
        </View>

        <View style={styles.sliderContainer}>
          <View style={styles.sliderHeader}>
            <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>
              {t('settings.learningCapacity', "Capacité d'apprentissage")}
            </Text>
            <Text style={[styles.sliderValue, { color: colors.primary }]}>
              {localSettings.learning_capacity}
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={20}
            step={1}
            value={localSettings.learning_capacity ?? 10}
            onValueChange={(value) => {
              setLocalSettings({ ...localSettings, learning_capacity: value });
            }}
            onSlidingComplete={(value) => updateSetting('learning_capacity', value)}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
        </View>
      </View>

      {/* Juz Range */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('settings.focusJuz', 'Focus Juz')}
        </Text>

        <View style={styles.sliderContainer}>
          <View style={styles.sliderHeader}>
            <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>
              {t('settings.start', 'Début')}
            </Text>
            <Text style={[styles.sliderValue, { color: colors.primary }]}>
              Juz {localSettings.focus_juz_start ?? 1}
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={30}
            step={1}
            value={localSettings.focus_juz_start ?? 1}
            onValueChange={(value) => {
              setLocalSettings({ ...localSettings, focus_juz_start: value });
            }}
            onSlidingComplete={(value) => updateSetting('focus_juz_start', value)}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
        </View>

        <View style={styles.sliderContainer}>
          <View style={styles.sliderHeader}>
            <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>
              {t('settings.end', 'Fin')}
            </Text>
            <Text style={[styles.sliderValue, { color: colors.primary }]}>
              Juz {localSettings.focus_juz_end ?? 30}
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={localSettings.focus_juz_start ?? 1}
            maximumValue={30}
            step={1}
            value={localSettings.focus_juz_end ?? 30}
            onValueChange={(value) => {
              setLocalSettings({ ...localSettings, focus_juz_end: value });
            }}
            onSlidingComplete={(value) => updateSetting('focus_juz_end', value)}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
        </View>
      </View>

      {/* Direction */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('settings.direction', 'Direction')}
        </Text>
        {(['desc', 'asc'] as const).map((dir) => (
          <TouchableOpacity
            key={dir}
            style={[
              styles.optionButton,
              { backgroundColor: colors.border },
              localSettings.direction === dir && { backgroundColor: colors.primary },
            ]}
            onPress={() => updateSetting('direction', dir)}
          >
            <Text
              style={[
                styles.optionText,
                { color: colors.textSecondary },
                localSettings.direction === dir && styles.optionTextActive,
              ]}
            >
              {dir === 'desc' ? `\u2B07\uFE0F ${t('settings.dirDesc')}` : `\u2B06\uFE0F ${t('settings.dirAsc')}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reciter Picker */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('settings.reciter')}
        </Text>

        <TouchableOpacity
          style={[styles.reciterButton, { backgroundColor: colors.border }]}
          onPress={() => setShowReciterPicker(!showReciterPicker)}
        >
          <Text style={[styles.reciterText, { color: colors.primary }]}>
            {RECITERS.find(r => r.id === localSettings.preferred_reciter)?.name || 'Sélectionner'}
          </Text>
          <Text style={[styles.reciterArrow, { color: colors.textSecondary }]}>
            {showReciterPicker ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {showReciterPicker && (
          <View style={[styles.pickerContainer, { backgroundColor: colors.border }]}>
            {RECITERS.map((reciter) => (
              <TouchableOpacity
                key={reciter.id}
                style={[
                  styles.pickerOption,
                  { borderBottomColor: colors.background },
                  localSettings.preferred_reciter === reciter.id && { backgroundColor: colors.primary },
                ]}
                onPress={() => {
                  updateSetting('preferred_reciter', reciter.id);
                  setShowReciterPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    { color: colors.textSecondary },
                    localSettings.preferred_reciter === reciter.id && styles.pickerOptionTextActive,
                  ]}
                >
                  {reciter.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Info */}
      <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
        <Text style={styles.infoIcon}>💡</Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          {t('settings.autoSaveInfo', 'Les changements sont sauvegardés automatiquement après 1 seconde.')}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  savingBanner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  savingText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sliderContainer: {
    marginBottom: 16,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 16,
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  reciterButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  reciterText: {
    fontSize: 16,
  },
  reciterArrow: {
    fontSize: 12,
  },
  pickerContainer: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  pickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  pickerOptionText: {
    fontSize: 16,
  },
  pickerOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  translationOption: {
    flex: 1,
  },
  translationDescription: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});
