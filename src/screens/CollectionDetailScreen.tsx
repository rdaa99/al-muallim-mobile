import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useFonts } from '../context/FontSizeContext';
import { useUserStore } from '../stores/userStore';
import { useCollectionsStore } from '@/stores/collectionsStore';
import { getVerseTranslation, type TranslationLanguage } from '@/services/translationService';
import type { CollectionItem, Verse } from '@/types';

export const CollectionDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { collectionId } = route.params as { collectionId: string };
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { fonts } = useFonts();
  const { settings } = useUserStore();

  const {
    currentCollection,
    currentCollectionItems,
    isLoadingItems,
    loadCollectionDetails,
    updateCollection,
    removeFromCollection,
    clearCurrentCollection,
    collectionsError,
    clearErrors,
  } = useCollectionsStore();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColor, setEditColor] = useState('');

  const availableColors = [
    '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  ];

  useEffect(() => {
    loadCollectionDetails(collectionId);
    return () => clearCurrentCollection();
  }, [collectionId]);

  useEffect(() => {
    if (currentCollection) {
      setEditName(currentCollection.name);
      setEditDescription(currentCollection.description || '');
      setEditColor(currentCollection.color);
    }
  }, [currentCollection]);

  useEffect(() => {
    if (collectionsError) {
      Alert.alert(t('common.error', 'Error'), collectionsError);
      clearErrors();
    }
  }, [collectionsError]);

  const handleEditCollection = async () => {
    if (!editName.trim()) {
      Alert.alert(t('collections.nameRequired', 'Name required'), t('collections.nameRequiredMsg', 'Please enter a name for the collection'));
      return;
    }

    try {
      await updateCollection(collectionId, {
        name: editName.trim(),
        description: editDescription.trim(),
        color: editColor,
      });
      setShowEditModal(false);
    } catch (error) {
      Alert.alert(t('common.error', 'Error'), t('collections.updateError', 'Failed to update collection'));
    }
  };

  const handleRemoveItem = (item: CollectionItem & { verse?: Verse }) => {
    const itemName = item.verse
      ? `${item.verse.surah_number}:${item.verse.ayah_number}`
      : item.surah_number
      ? `Surah ${item.surah_number}`
      : 'Item';

    Alert.alert(
      t('collections.removeItem', 'Remove Item'),
      t('collections.removeItemMsg', `Remove "${itemName}" from this collection?`, { name: itemName }),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.remove', 'Remove'),
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromCollection(collectionId, item.verse_id, item.surah_number);
            } catch (error) {
              Alert.alert(t('common.error', 'Error'), t('collections.removeItemError', 'Failed to remove item'));
            }
          },
        },
      ]
    );
  };

  const renderCollectionItem = ({ item }: { item: CollectionItem & { verse?: Verse } }) => {
    const verse = item.verse;
    const displayText = verse
      ? `${verse.surah_number}:${verse.ayah_number} - ${verse.text_arabic.substring(0, 50)}...`
      : item.surah_number
      ? `Surah ${item.surah_number}${item.ayah_number ? `:${item.ayah_number}` : ''}`
      : 'Unknown item';

    return (
      <TouchableOpacity
        style={[styles.itemCard, { backgroundColor: colors.surface }]}
        onLongPress={() => handleRemoveItem(item)}
      >
        <View style={[styles.itemColorBar, { backgroundColor: currentCollection?.color || '#4F46E5' }]} />
        
        <View style={styles.itemContent}>
          <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
            {verse?.surah_number && verse?.ayah_number 
              ? `${verse.surah_number}:${verse.ayah_number}`
              : `Surah ${item.surah_number}`
            }
          </Text>
          
          {verse && (
            <Text style={[styles.itemArabic, { color: colors.text }]} numberOfLines={2}>
              {verse.text_arabic}
            </Text>
          )}
          
          {verse && settings?.selectedTranslation && settings.selectedTranslation !== 'ar' && (
            <Text style={[styles.itemTranslation, { color: colors.textSecondary }]} numberOfLines={2}>
              {getVerseTranslation(verse, settings.selectedTranslation as TranslationLanguage)}
            </Text>
          )}
        </View>

        <Text style={styles.itemHint}>Hold to remove</Text>
      </TouchableOpacity>
    );
  };

  if (!currentCollection) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <Text style={{ color: colors.textSecondary }}>
            {isLoadingItems ? t('common.loading', 'Loading...') : t('collections.notFound', 'Collection not found')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <View style={[styles.colorDot, { backgroundColor: currentCollection.color }]} />
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {currentCollection.name}
          </Text>
        </View>

        {!currentCollection.is_predefined && (
          <TouchableOpacity
            onPress={() => setShowEditModal(true)}
            style={styles.editButton}
          >
            <Text style={{ color: colors.primary, fontSize: 16 }}>
              {t('common.edit', 'Edit')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Description */}
      {currentCollection.description && (
        <View style={[styles.descriptionContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {currentCollection.description}
          </Text>
        </View>
      )}

      {/* Stats */}
      <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {currentCollectionItems.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            {t('collections.items', 'items')}
          </Text>
        </View>
      </View>

      {/* Items list */}
      <FlatList
        data={currentCollectionItems}
        renderItem={renderCollectionItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoadingItems ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t('collections.emptyItems', 'No items in this collection')}
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                {t('collections.emptyItemsMsg', 'Add verses from the Quran screen')}
              </Text>
            </View>
          ) : null
        }
      />

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('collections.editCollection', 'Edit Collection')}
            </Text>

            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
              placeholder={t('collections.namePlaceholder', 'Collection name')}
              placeholderTextColor={colors.textSecondary}
              value={editName}
              onChangeText={setEditName}
              maxLength={50}
            />

            <TextInput
              style={[styles.input, styles.inputMultiline, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
              placeholder={t('collections.descriptionPlaceholder', 'Description (optional)')}
              placeholderTextColor={colors.textSecondary}
              value={editDescription}
              onChangeText={setEditDescription}
              multiline
              numberOfLines={3}
              maxLength={200}
            />

            <Text style={[styles.colorLabel, { color: colors.text }]}>
              {t('collections.selectColor', 'Select Color')}
            </Text>
            <View style={styles.colorPicker}>
              {availableColors.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    editColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setEditColor(color)}
                >
                  {editColor === color && <Text style={styles.colorCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  {t('common.cancel', 'Cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleEditCollection}
              >
                <Text style={styles.modalButtonText}>
                  {t('common.save', 'Save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#007AFF',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  editButton: {
    padding: 8,
  },
  descriptionContainer: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  itemCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemColorBar: {
    width: 6,
  },
  itemContent: {
    flex: 1,
    padding: 16,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  itemArabic: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
    textAlign: 'right',
  },
  itemTranslation: {
    fontSize: 14,
    lineHeight: 20,
  },
  itemHint: {
    fontSize: 10,
    color: '#999',
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  colorCheck: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
