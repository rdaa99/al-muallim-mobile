import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useFonts } from '../context/FontSizeContext';
import { getSurahs } from '../services/database';
import type { Surah } from '../types';

interface SurahWithProgress extends Surah {
  total_verses: number;
  learned_verses: number;
  progress: number;
  is_favorite?: boolean;
}

export const SurahListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { fonts } = useFonts();

  const [surahs, setSurahs] = useState<SurahWithProgress[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<'all' | 'Meccan' | 'Medinan'>('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSurahs();
  }, []);

  const loadSurahs = async () => {
    try {
      setLoading(true);
      const data = await getSurahs();
      const surahsWithProgress = data.map(surah => ({
        ...surah,
        total_verses: surah.numberOfAyahs,
        learned_verses: 0, // TODO: Calculate from database
        progress: 0, // TODO: Calculate from database
        is_favorite: false, // TODO: Load from AsyncStorage
      }));
      setSurahs(surahsWithProgress);
    } catch (error) {
      console.error('Error loading surahs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter surahs based on search and filters
  const filteredSurahs = useMemo(() => {
    let filtered = surahs;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(surah =>
        surah.name.includes(query) ||
        surah.englishName.toLowerCase().includes(query) ||
        surah.number.toString().includes(query)
      );
    }

    // Juz filter
    if (selectedJuz !== null) {
      filtered = filtered.filter(surah => {
        // TODO: Add juz_number to surah data
        return true;
      });
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(surah => surah.revelationType === selectedType);
    }

    // Favorites filter
    if (showFavorites) {
      filtered = filtered.filter(surah => surah.is_favorite);
    }

    return filtered;
  }, [surahs, searchQuery, selectedJuz, selectedType, showFavorites]);

  const renderSurahCard = ({ item }: { item: SurahWithProgress }) => (
    <TouchableOpacity
      style={[styles.surahCard, { backgroundColor: colors.surface }]}
      onPress={() => navigation.navigate('Quran' as never, { surahNumber: item.number } as never)}
    >
      <View style={styles.surahHeader}>
        <View style={[styles.surahNumber, { backgroundColor: colors.primary }]}>
          <Text style={styles.surahNumberText}>{item.number}</Text>
        </View>
        <View style={styles.surahInfo}>
          <Text style={[styles.surahName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.surahEnglish, { color: colors.textSecondary }]}>
            {item.englishName} • {item.total_verses} verses
          </Text>
        </View>
        <View style={styles.surahMeta}>
          <Text style={[styles.surahType, { color: colors.textSecondary }]}>
            {item.revelationType === 'Meccan' ? '🇲🇦' : '🇲🇦'}
          </Text>
          <TouchableOpacity
            onPress={() => toggleFavorite(item.number)}
            style={styles.favoriteButton}
          >
            <Text style={styles.favoriteIcon}>
              {item.is_favorite ? '⭐' : '☆'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress bar */}
      {item.progress > 0 && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${item.progress}%`, backgroundColor: colors.primary },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {item.progress.toFixed(0)}%
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const toggleFavorite = (surahNumber: number) => {
    setSurahs(prev =>
      prev.map(s =>
        s.number === surahNumber ? { ...s, is_favorite: !s.is_favorite } : s
      )
    );
    // TODO: Save to AsyncStorage
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedJuz(null);
    setSelectedType('all');
    setShowFavorites(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <Text style={{ color: colors.text }}>Loading surahs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.text, backgroundColor: colors.background }]}
          placeholder={t('surahList.search', 'Search surah...')}
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            { backgroundColor: showFavorites ? colors.primary : colors.surface },
          ]}
          onPress={() => setShowFavorites(!showFavorites)}
        >
          <Text style={{ color: showFavorites ? '#fff' : colors.text }}>
            ⭐ Favorites
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            { backgroundColor: selectedType !== 'all' ? colors.primary : colors.surface },
          ]}
          onPress={() => {
            if (selectedType === 'all') setSelectedType('Meccan');
            else if (selectedType === 'Meccan') setSelectedType('Medinan');
            else setSelectedType('all');
          }}
        >
          <Text style={{ color: selectedType !== 'all' ? '#fff' : colors.text }}>
            {selectedType === 'all' ? 'All Types' : selectedType}
          </Text>
        </TouchableOpacity>

        {(searchQuery || selectedJuz || selectedType !== 'all' || showFavorites) && (
          <TouchableOpacity
            style={[styles.filterChip, { backgroundColor: colors.border }]}
            onPress={clearFilters}
          >
            <Text style={{ color: colors.text }}>✕ Clear</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Results count */}
      <View style={styles.resultsContainer}>
        <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
          {filteredSurahs.length} surahs
        </Text>
      </View>

      {/* Surah list */}
      <FlatList
        data={filteredSurahs}
        renderItem={renderSurahCard}
        keyExtractor={item => item.number.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  surahCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  surahHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  surahNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  surahNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  surahInfo: {
    flex: 1,
    marginLeft: 12,
  },
  surahName: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'left',
  },
  surahEnglish: {
    fontSize: 14,
    marginTop: 2,
  },
  surahMeta: {
    alignItems: 'center',
  },
  surahType: {
    fontSize: 12,
  },
  favoriteButton: {
    marginTop: 4,
  },
  favoriteIcon: {
    fontSize: 24,
  },
  progressContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '600',
  },
});
