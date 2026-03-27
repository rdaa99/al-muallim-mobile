import { useCollectionsStore } from '../collectionsStore';
import * as database from '@/services/database';

// Mock the database module
jest.mock('@/services/database', () => ({
  addFavorite: jest.fn(),
  removeFavorite: jest.fn(),
  isFavorite: jest.fn(),
  getFavoritesWithDetails: jest.fn(),
  createCollection: jest.fn(),
  updateCollection: jest.fn(),
  deleteCollection: jest.fn(),
  getCollections: jest.fn(),
  getCollectionById: jest.fn(),
  addCollectionItem: jest.fn(),
  removeCollectionItem: jest.fn(),
  getCollectionItemsWithDetails: jest.fn(),
}));

describe('CollectionsStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useCollectionsStore.setState({
      favorites: [],
      favoritesWithDetails: [],
      collections: [],
      currentCollection: null,
      currentCollectionItems: [],
      isLoadingFavorites: false,
      isLoadingCollections: false,
      isLoadingItems: false,
      favoritesError: null,
      collectionsError: null,
    });
    jest.clearAllMocks();
  });

  describe('Favorites', () => {
    describe('loadFavorites', () => {
      it('should load favorites successfully', async () => {
        const mockFavorites = [
          {
            id: 'fav_1',
            surah_number: 1,
            created_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 'fav_2',
            verse_id: 123,
            created_at: '2024-01-02T00:00:00Z',
          },
        ];

        (database.getFavoritesWithDetails as jest.Mock).mockResolvedValue(mockFavorites);

        const { loadFavorites } = useCollectionsStore.getState();
        await loadFavorites();

        const state = useCollectionsStore.getState();
        expect(state.favoritesWithDetails).toEqual(mockFavorites);
        expect(state.favorites).toHaveLength(2);
        expect(state.isLoadingFavorites).toBe(false);
      });

      it('should handle load favorites error', async () => {
        const error = new Error('Database error');
        (database.getFavoritesWithDetails as jest.Mock).mockRejectedValue(error);

        const { loadFavorites } = useCollectionsStore.getState();
        await loadFavorites();

        const state = useCollectionsStore.getState();
        expect(state.favoritesError).toBe('Database error');
        expect(state.isLoadingFavorites).toBe(false);
      });
    });

    describe('toggleFavorite', () => {
      it('should add a favorite when not already favorited', async () => {
        (database.isFavorite as jest.Mock).mockResolvedValue(false);
        (database.addFavorite as jest.Mock).mockResolvedValue('fav_123');
        (database.getFavoritesWithDetails as jest.Mock).mockResolvedValue([]);

        const { toggleFavorite } = useCollectionsStore.getState();
        await toggleFavorite(123);

        expect(database.addFavorite).toHaveBeenCalledWith(123, undefined, undefined);
        expect(database.removeFavorite).not.toHaveBeenCalled();
      });

      it('should remove a favorite when already favorited', async () => {
        (database.isFavorite as jest.Mock).mockResolvedValue(true);
        (database.removeFavorite as jest.Mock).mockResolvedValue(undefined);
        (database.getFavoritesWithDetails as jest.Mock).mockResolvedValue([]);

        const { toggleFavorite } = useCollectionsStore.getState();
        await toggleFavorite(123);

        expect(database.removeFavorite).toHaveBeenCalledWith(123, undefined);
        expect(database.addFavorite).not.toHaveBeenCalled();
      });
    });

    describe('isFavorite', () => {
      it('should return true when verse is favorited', async () => {
        (database.isFavorite as jest.Mock).mockResolvedValue(true);

        const { isFavorite } = useCollectionsStore.getState();
        const result = await isFavorite(123);

        expect(result).toBe(true);
      });

      it('should return false when verse is not favorited', async () => {
        (database.isFavorite as jest.Mock).mockResolvedValue(false);

        const { isFavorite } = useCollectionsStore.getState();
        const result = await isFavorite(123);

        expect(result).toBe(false);
      });
    });
  });

  describe('Collections', () => {
    describe('loadCollections', () => {
      it('should load collections successfully', async () => {
        const mockCollections = [
          {
            id: 'col_1',
            name: 'Test Collection',
            description: 'Test Description',
            color: '#4F46E5',
            created_at: '2024-01-01T00:00:00Z',
            is_predefined: false,
          },
        ];

        (database.getCollections as jest.Mock).mockResolvedValue(mockCollections);

        const { loadCollections } = useCollectionsStore.getState();
        await loadCollections();

        const state = useCollectionsStore.getState();
        expect(state.collections).toEqual(mockCollections);
        expect(state.isLoadingCollections).toBe(false);
      });

      it('should handle load collections error', async () => {
        const error = new Error('Database error');
        (database.getCollections as jest.Mock).mockRejectedValue(error);

        const { loadCollections } = useCollectionsStore.getState();
        await loadCollections();

        const state = useCollectionsStore.getState();
        expect(state.collectionsError).toBe('Database error');
        expect(state.isLoadingCollections).toBe(false);
      });
    });

    describe('createCollection', () => {
      it('should create a collection successfully', async () => {
        const collectionId = 'col_123';
        (database.createCollection as jest.Mock).mockResolvedValue(collectionId);
        (database.getCollections as jest.Mock).mockResolvedValue([]);

        const { createCollection } = useCollectionsStore.getState();
        const result = await createCollection('New Collection', 'Description', '#FF0000');

        expect(result).toBe(collectionId);
        expect(database.createCollection).toHaveBeenCalledWith('New Collection', 'Description', '#FF0000');
      });

      it('should use default color when not provided', async () => {
        const collectionId = 'col_123';
        (database.createCollection as jest.Mock).mockResolvedValue(collectionId);
        (database.getCollections as jest.Mock).mockResolvedValue([]);

        const { createCollection } = useCollectionsStore.getState();
        await createCollection('New Collection');

        expect(database.createCollection).toHaveBeenCalledWith('New Collection', undefined, '#4F46E5');
      });
    });

    describe('updateCollection', () => {
      it('should update a collection successfully', async () => {
        (database.updateCollection as jest.Mock).mockResolvedValue(undefined);
        (database.getCollections as jest.Mock).mockResolvedValue([]);
        (database.getCollectionById as jest.Mock).mockResolvedValue({
          id: 'col_1',
          name: 'Updated Name',
          description: 'Updated Description',
          color: '#00FF00',
          created_at: '2024-01-01T00:00:00Z',
          is_predefined: false,
        });

        // Set current collection
        useCollectionsStore.setState({
          currentCollection: {
            id: 'col_1',
            name: 'Old Name',
            description: 'Old Description',
            color: '#FF0000',
            created_at: '2024-01-01T00:00:00Z',
            is_predefined: false,
          },
        });

        const { updateCollection } = useCollectionsStore.getState();
        await updateCollection('col_1', {
          name: 'Updated Name',
          description: 'Updated Description',
          color: '#00FF00',
        });

        expect(database.updateCollection).toHaveBeenCalled();
      });
    });

    describe('deleteCollection', () => {
      it('should delete a collection successfully', async () => {
        (database.deleteCollection as jest.Mock).mockResolvedValue(undefined);
        (database.getCollections as jest.Mock).mockResolvedValue([]);

        const { deleteCollection } = useCollectionsStore.getState();
        await deleteCollection('col_1');

        expect(database.deleteCollection).toHaveBeenCalledWith('col_1');
      });

      it('should clear current collection if it is the one being deleted', async () => {
        (database.deleteCollection as jest.Mock).mockResolvedValue(undefined);
        (database.getCollections as jest.Mock).mockResolvedValue([]);

        useCollectionsStore.setState({
          currentCollection: {
            id: 'col_1',
            name: 'Test',
            description: '',
            color: '#4F46E5',
            created_at: '2024-01-01T00:00:00Z',
            is_predefined: false,
          },
        });

        const { deleteCollection } = useCollectionsStore.getState();
        await deleteCollection('col_1');

        const state = useCollectionsStore.getState();
        expect(state.currentCollection).toBeNull();
        expect(state.currentCollectionItems).toEqual([]);
      });
    });

    describe('loadCollectionDetails', () => {
      it('should load collection details successfully', async () => {
        const mockCollection = {
          id: 'col_1',
          name: 'Test Collection',
          description: 'Test',
          color: '#4F46E5',
          created_at: '2024-01-01T00:00:00Z',
          is_predefined: false,
        };

        const mockItems = [
          {
            id: 'item_1',
            collection_id: 'col_1',
            verse_id: 123,
            added_at: '2024-01-01T00:00:00Z',
          },
        ];

        (database.getCollectionById as jest.Mock).mockResolvedValue(mockCollection);
        (database.getCollectionItemsWithDetails as jest.Mock).mockResolvedValue(mockItems);

        const { loadCollectionDetails } = useCollectionsStore.getState();
        await loadCollectionDetails('col_1');

        const state = useCollectionsStore.getState();
        expect(state.currentCollection).toEqual(mockCollection);
        expect(state.currentCollectionItems).toEqual(mockItems);
        expect(state.isLoadingItems).toBe(false);
      });
    });
  });

  describe('Collection Items', () => {
    describe('addToCollection', () => {
      it('should add item to collection successfully', async () => {
        (database.addCollectionItem as jest.Mock).mockResolvedValue('item_123');
        (database.getCollectionItemsWithDetails as jest.Mock).mockResolvedValue([]);

        const { addToCollection } = useCollectionsStore.getState();
        await addToCollection('col_1', 123);

        expect(database.addCollectionItem).toHaveBeenCalledWith('col_1', 123, undefined, undefined);
      });

      it('should reload items if adding to current collection', async () => {
        useCollectionsStore.setState({
          currentCollection: {
            id: 'col_1',
            name: 'Test',
            description: '',
            color: '#4F46E5',
            created_at: '2024-01-01T00:00:00Z',
            is_predefined: false,
          },
        });

        (database.addCollectionItem as jest.Mock).mockResolvedValue('item_123');
        (database.getCollectionItemsWithDetails as jest.Mock).mockResolvedValue([]);

        const { addToCollection } = useCollectionsStore.getState();
        await addToCollection('col_1', 123);

        expect(database.getCollectionItemsWithDetails).toHaveBeenCalledWith('col_1');
      });
    });

    describe('removeFromCollection', () => {
      it('should remove item from collection successfully', async () => {
        (database.removeCollectionItem as jest.Mock).mockResolvedValue(undefined);
        (database.getCollectionItemsWithDetails as jest.Mock).mockResolvedValue([]);

        const { removeFromCollection } = useCollectionsStore.getState();
        await removeFromCollection('col_1', 123);

        expect(database.removeCollectionItem).toHaveBeenCalledWith('col_1', 123, undefined);
      });
    });
  });

  describe('Utility', () => {
    describe('clearErrors', () => {
      it('should clear all errors', () => {
        useCollectionsStore.setState({
          favoritesError: 'Some error',
          collectionsError: 'Another error',
        });

        const { clearErrors } = useCollectionsStore.getState();
        clearErrors();

        const state = useCollectionsStore.getState();
        expect(state.favoritesError).toBeNull();
        expect(state.collectionsError).toBeNull();
      });
    });
  });
});
