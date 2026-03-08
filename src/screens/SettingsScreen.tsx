import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { useAppStore } from '@/stores/appStore';

// Simple Slider component fallback
// Note: For production, install @react-native-community/slider
const Slider = (props: any) => {
  const { value, minimumValue, maximumValue, step, onSlidingComplete, style } = props;
  
  const handleDecrease = () => {
    const newValue = Math.max(minimumValue, value - (step || 1));
    onSlidingComplete?.(newValue);
  };
  
  const handleIncrease = () => {
    const newValue = Math.min(maximumValue, value + (step || 1));
    onSlidingComplete?.(newValue);
  };

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, style]}>
      <TouchableOpacity onPress={handleDecrease} style={styles.sliderButton}>
        <Text style={styles.sliderButtonText}>−</Text>
      </TouchableOpacity>
      <Text style={styles.sliderDisplayValue}>{value}</Text>
      <TouchableOpacity onPress={handleIncrease} style={styles.sliderButton}>
        <Text style={styles.sliderButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const RECITERS = [
  { id: 'abdul_basit', name: 'Abdul Basit' },
  { id: 'sudais', name: 'Abdurrahman As-Sudais' },
  { id: 'afasy', name: 'Mishary Al-Afasy' },
  { id: 'husary', name: 'Mahmoud Khalil Al-Husary' },
  { id: 'minshawi', name: 'Mohamed Siddiq Al-Minshawi' },
];

export const SettingsScreen: React.FC = () => {
  const { settings, loadSettings, updateSettings } = useAppStore();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [showReciterPicker, setShowReciterPicker] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  // Debounced save function
  const debouncedSave = useCallback(
    async (newSettings: Partial<typeof localSettings>) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const timer = setTimeout(async () => {
        setSaving(true);
        try {
          await updateSettings(newSettings);
          showToast('Paramètres sauvegardés ✓');
        } catch (error) {
          showToast('Erreur lors de la sauvegarde');
        } finally {
          setSaving(false);
        }
      }, 1000);

      setDebounceTimer(timer);
    },
    [updateSettings, debounceTimer]
  );

  const showToast = (message: string) => {
    if (Platform.OS === 'web') {
      // Simple web notification
      console.log(message);
    } else {
      Alert.alert('', message, [{ text: 'OK' }], {
        cancelable: true,
      });
    }
  };

  const updateSetting = async <K extends keyof typeof localSettings>(
    key: K,
    value: (typeof localSettings)[K]
  ) => {
    const newSettings = { ...localSettings, [key]: value } as typeof localSettings;
    setLocalSettings(newSettings);
    await debouncedSave({ [key]: value });
  };

  if (!localSettings) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Saving indicator */}
      {saving && (
        <View style={styles.savingBanner}>
          <Text style={styles.savingText}>Sauvegarde en cours...</Text>
        </View>
      )}

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
              {mode === 'active' ? '🎯 Actif' : mode === 'revision_only' ? '🔄 Révision uniquement' : '⏸️ En pause'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Daily Settings with Sliders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quotidien</Text>

        <View style={styles.sliderContainer}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>Nouveaux versets/jour</Text>
            <Text style={styles.sliderValue}>{localSettings.daily_new_lines}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={localSettings.daily_new_lines}
            onValueChange={(value) => {
              setLocalSettings({ ...localSettings, daily_new_lines: value });
            }}
            onSlidingComplete={(value) => updateSetting('daily_new_lines', value)}
            minimumTrackTintColor="#10B981"
            maximumTrackTintColor="#334155"
            thumbTintColor="#10B981"
          />
        </View>

        <View style={styles.sliderContainer}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>Durée session (min)</Text>
            <Text style={styles.sliderValue}>{localSettings.session_duration}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={5}
            maximumValue={60}
            step={5}
            value={localSettings.session_duration}
            onValueChange={(value) => {
              setLocalSettings({ ...localSettings, session_duration: value });
            }}
            onSlidingComplete={(value) => updateSetting('session_duration', value)}
            minimumTrackTintColor="#10B981"
            maximumTrackTintColor="#334155"
            thumbTintColor="#10B981"
          />
        </View>

        <View style={styles.sliderContainer}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>Capacité d'apprentissage</Text>
            <Text style={styles.sliderValue}>{localSettings.learning_capacity}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={20}
            step={1}
            value={localSettings.learning_capacity}
            onValueChange={(value) => {
              setLocalSettings({ ...localSettings, learning_capacity: value });
            }}
            onSlidingComplete={(value) => updateSetting('learning_capacity', value)}
            minimumTrackTintColor="#10B981"
            maximumTrackTintColor="#334155"
            thumbTintColor="#10B981"
          />
        </View>
      </View>

      {/* Juz Range */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Focus Juz</Text>

        <View style={styles.sliderContainer}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>Début</Text>
            <Text style={styles.sliderValue}>Juz {localSettings.focus_juz_start}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={30}
            step={1}
            value={localSettings.focus_juz_start}
            onValueChange={(value) => {
              setLocalSettings({ ...localSettings, focus_juz_start: value });
            }}
            onSlidingComplete={(value) => updateSetting('focus_juz_start', value)}
            minimumTrackTintColor="#10B981"
            maximumTrackTintColor="#334155"
            thumbTintColor="#10B981"
          />
        </View>

        <View style={styles.sliderContainer}>
          <View style={styles.sliderHeader}>
            <Text style={styles.sliderLabel}>Fin</Text>
            <Text style={styles.sliderValue}>Juz {localSettings.focus_juz_end}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={localSettings.focus_juz_start}
            maximumValue={30}
            step={1}
            value={localSettings.focus_juz_end}
            onValueChange={(value) => {
              setLocalSettings({ ...localSettings, focus_juz_end: value });
            }}
            onSlidingComplete={(value) => updateSetting('focus_juz_end', value)}
            minimumTrackTintColor="#10B981"
            maximumTrackTintColor="#334155"
            thumbTintColor="#10B981"
          />
        </View>
      </View>

      {/* Direction */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Direction</Text>
        {(['desc', 'asc'] as const).map((dir) => (
          <TouchableOpacity
            key={dir}
            style={[
              styles.optionButton,
              localSettings.direction === dir && styles.optionActive,
            ]}
            onPress={() => updateSetting('direction', dir)}
          >
            <Text
              style={[
                styles.optionText,
                localSettings.direction === dir && styles.optionTextActive,
              ]}
            >
              {dir === 'desc' ? '⬇️ An-Nas → Al-Fatiha' : '⬆️ Al-Fatiha → An-Nas'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reciter Picker */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Récitateur préféré</Text>
        
        <TouchableOpacity
          style={styles.reciterButton}
          onPress={() => setShowReciterPicker(!showReciterPicker)}
        >
          <Text style={styles.reciterText}>
            {RECITERS.find(r => r.id === localSettings.preferred_reciter)?.name || 'Sélectionner'}
          </Text>
          <Text style={styles.reciterArrow}>{showReciterPicker ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showReciterPicker && (
          <View style={styles.pickerContainer}>
            {RECITERS.map((reciter) => (
              <TouchableOpacity
                key={reciter.id}
                style={[
                  styles.pickerOption,
                  localSettings.preferred_reciter === reciter.id && styles.pickerOptionActive,
                ]}
                onPress={() => {
                  updateSetting('preferred_reciter', reciter.id);
                  setShowReciterPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
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
      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>💡</Text>
        <Text style={styles.infoText}>
          Les changements sont sauvegardés automatiquement après 1 seconde.
        </Text>
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
  loadingText: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  savingBanner: {
    backgroundColor: '#10B981',
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
    color: '#CBD5E1',
    fontSize: 16,
  },
  sliderValue: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderButton: {
    backgroundColor: '#334155',
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  sliderDisplayValue: {
    color: '#10B981',
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
  reciterButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#334155',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  reciterText: {
    color: '#10B981',
    fontSize: 16,
  },
  reciterArrow: {
    color: '#94A3B8',
    fontSize: 12,
  },
  pickerContainer: {
    marginTop: 8,
    backgroundColor: '#334155',
    borderRadius: 8,
    overflow: 'hidden',
  },
  pickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#475569',
  },
  pickerOptionActive: {
    backgroundColor: '#10B981',
  },
  pickerOptionText: {
    color: '#CBD5E1',
    fontSize: 16,
  },
  pickerOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#1E293B',
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
    color: '#94A3B8',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});
