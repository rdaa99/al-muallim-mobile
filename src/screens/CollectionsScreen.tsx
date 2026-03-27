import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useFonts } from '../context/FontSizeContext';
import { useCollectionsStore } from '@/stores/collectionsStore';
import type { Collection } from '@/types';

export const CollectionsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { fonts } = useFonts();
  
  const {
    collections,
    isLoadingCollections,
    loadCollections,
    createCollection,
    deleteCollection,
    collectionsError,
    clearErrors,
  } = useCollectionsStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('#4F46E5');

  const availableColors = [
    '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  ];

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    if (collectionsError) {
      Alert.alert(t('common.error', 'Error'), collectionsError);
      clearErrors();
    }
  }, [collectionsError]);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      Alert.alert(t('collections.nameRequired', 'Name required'), t('collections.nameRequiredMsg', 'Please enter a name for the collection'));
      return;
    }

    try {
      await createCollection(newCollectionName.trim(), newCollectionDescription.trim(), selectedColor);
      setShowCreateModal(false);
      setNewCollectionName('');
      setNewCollectionDescription('');
      setSelectedColor('#4F46E5');
    } catch (error) {
      Alert.alert(t('common.error', 'Error'), t('collections.createError', 'Failed to create collection'));
    }
  };

  const handleDeleteCollection = (collection: Collection) => {
    if (collection.is_predefined) {
      Alert.alert(
        t('collections.cannotDelete', 'Cannot Delete'),
        t('collections.cannotDeleteMsg', 'Predefined collections cannot be deleted')
      );
      return;
    }

    Alert.alert(
      t('collections.deleteConfirm', 'Delete Collection'),
      t('collections.deleteConfirmMsg', `Are you sure you want to delete "${collection.name}"? This action cannot be undone.`, { name: collection.name }),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.delete', 'Delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCollection(collection.id);
            } catch (error) {
              Alert.alert(t('common.error', 'Error'), t('collections.deleteError', 'Failed to delete collection'));
            }
          },
        },
      ]
    );
  };

  const renderCollection = ({ item }: { item: Collection & { itemCount?: number } }) => (
    <TouchableOpacity
      style={[styles.collectionCard, { backgroundColor: colors.surface }]}
      onPress={() => navigation.navigate('CollectionDetail' as never, { collectionId: item.id } as never)}
      onLongPress={() => handleDeleteCollection(item)}
    >
      <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
      
      <View style={styles.collectionInfo}>
        <Text style={[styles.collectionName, { color: colors.text }]}>
          {item.name}
        </Text>
        {item.description && (
          <Text style={[styles.collectionDescription, { color: colors.textSecondary }]}>
            {item.description}
          </Text>
        )}
        {item.is_predefined && (
          <View style={[styles.predefinedBadge, { backgroundColor: `${item.color}20` }]}>
            <Text style={[styles.predefinedText, { color: item.color }]}>
              {t('collections.predefined', 'Predefined')}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.arrowIcon}>→</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text, fontSize: fonts.hero }]}>
          {t('collections.title', 'Collections')}
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Collections list */}
      <FlatList
        data={collections}
        renderItem={renderCollection}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoadingCollections ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📁</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t('collections.empty', 'No collections yet')}
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                {t('collections.emptyMsg', 'Create your first collection to organize verses')}
              </Text>
            </View>
          ) : null
        }
      />

      {/* Create Collection Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('collections.createNew', 'Create New Collection')}
            </Text>

            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
              placeholder={t('collections.namePlaceholder', 'Collection name')}
              placeholderTextColor={colors.textSecondary}
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              maxLength={50}
            />

            <TextInput
              style={[styles.input, styles.inputMultiline, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
              placeholder={t('collections.descriptionPlaceholder', 'Description (optional)')}
              placeholderTextColor={colors.textSecondary}
              value={newCollectionDescription}
              onChangeText={setNewCollectionDescription}
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
                    selectedColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && <Text style={styles.colorCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  {t('common.cancel', 'Cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleCreateCollection}
              >
                <Text style={styles.modalButtonText}>
                  {t('common.create', 'Create')}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  collectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  colorIndicator: {
    width: 6,
    height: '100%',
    borderRadius: 3,
    marginRight: 16,
    minHeight: 50,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  collectionDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  predefinedBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  predefinedText: {
    fontSize: 12,
    fontWeight: '500',
  },
  arrowIcon: {
    fontSize: 24,
    color: '#999',
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
