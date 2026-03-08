import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useAppStore } from '@/stores/appStore';

export const SettingsScreen: React.FC = () => {
  const { settings, loadSettings, updateSettings } = useAppStore();
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const updateSetting = async <K extends keyof typeof localSettings>(
    key: K,
    value: (typeof localSettings)[K]
  ) => {
    const newSettings = { ...localSettings, [key]: value } as typeof localSettings;
    setLocalSettings(newSettings);
    await updateSettings({ [key]: value });
  };

  if (!localSettings) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Learning Mode */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mode d'apprentissage</Text>
        {(['active', 'revision_only', 'paused'] as const).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.optionButton,
              localSettings.learning_mode === mode && styles.optionActive,
            ]}
            onPress={() => updateSetting('learning_mode', mode)}
          >
            <Text
              style={[
                styles.optionText,
                localSettings.learning_mode === mode && styles.optionTextActive,
              ]}
            >
              {mode === 'active' ? 'Actif' : mode === 'revision_only' ? 'Révision uniquement' : 'En pause'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Juz Range */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Focus Juz</Text>
        <Text style={styles.rangeText}>
          Juz {localSettings.focus_juz_start} à {localSettings.focus_juz_end}
        </Text>
      </View>

      {/* Daily Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quotidien</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Nouveaux versets/jour</Text>
          <Text style={styles.settingValue}>{localSettings.daily_new_lines}</Text>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Durée session (min)</Text>
          <Text style={styles.settingValue}>{localSettings.session_duration}</Text>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Capacité d'apprentissage</Text>
          <Text style={styles.settingValue}>{localSettings.learning_capacity}</Text>
        </View>
      </View>

      {/* Direction */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Direction</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Ordre de récitation</Text>
          <Text style={styles.settingValue}>
            {localSettings.direction === 'desc' ? 'Décroissant' : 'Croissant'}
          </Text>
        </View>
      </View>

      {/* Reciter */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Récitateur</Text>
        <Text style={styles.reciterText}>{localSettings.preferred_reciter}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 20,
  },
  section: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: '#334155',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionActive: {
    backgroundColor: '#10B981',
  },
  optionText: {
    color: '#CBD5E1',
    fontSize: 16,
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  settingLabel: {
    color: '#CBD5E1',
    fontSize: 16,
  },
  settingValue: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  rangeText: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
  },
  reciterText: {
    color: '#10B981',
    fontSize: 16,
    textAlign: 'center',
  },
});
