import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Collection, CollectionItem, Favorite, Verse } from '@/types';
import {
  addFavorite,
  removeFavorite,
  isFavorite as checkIsFavorite,
  getFavoritesWithDetails,
  createCollection,
  updateCollection,
  deleteCollection,
  getCollections,
  getCollectionById,
  addCollectionItem,
  removeCollectionItem,
  getCollectionItemsWithDetails,
} from '@/services/database';

interface CollectionsState {
  // Favorites
  favorites: Favorite[];
  favoritesWithDetails: (Favorite & { verse?: Verse })[];
  
  // Collections
  collections: Collection[];
  currentCollection: Collection | null;
  currentCollectionItems: (CollectionItem & { verse?: Verse })[];
  
  // Loading states
  isLoadingFavorites: boolean;
  isLoadingCollections: boolean;
  isLoadingItems: boolean;
  
  // Error states
  favoritesError: string | null;
  collectionsError: string | null;
  
  // Favorites actions
  loadFavorites: () => Promise<void>;
  toggleFavorite: (verseId?: number, surahNumber?: number, ayahNumber?: number) => Promise<void>;
  isFavorite: (verseId?: number, surahNumber?: number) => Promise<boolean>;
  
  // Collections actions
  loadCollections: () => Promise<void>;
  createCollection: (name: string, description?: string, color?: string) => Promise<string>;
  updateCollection: (id: string, updates: { name?: string; description?: string; color?: string }) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  loadCollectionDetails: (id: string) => Promise<void>;
  clearCurrentCollection: () => void;
  
  // Collection items actions
  addToCollection: (collectionId: string, verseId?: number, surahNumber?: number, ayahNumber?: number) => Promise<void>;
  removeFromCollection: (collectionId: string, verseId?: number, surahNumber?: number) => Promise<void>;
  loadCollectionItems: (collectionId: string) => Promise<void>;
  
  // Utility
  clearErrors: () => void;
}

export const useCollectionsStore = create<CollectionsState>()(
  persist(
    (set, get) => ({
      // Initial state
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

      // Load all favorites
      loadFavorites: async () => {
        set({ isLoadingFavorites: true, favoritesError: null });
        try {
          const favorites = await getFavoritesWithDetails();
          set({ 
            favoritesWithDetails: favorites,
            favorites: favorites.map(f => ({
              id: f.id,
              verse_id: f.verse_id,
              surah_number: f.surah_number,
              ayah_number: f.ayah_number,
              created_at: f.created_at,
            })),
            isLoadingFavorites: false,
          });
        } catch (error) {
          set({ 
            favoritesError: error instanceof Error ? error.message : 'Failed to load favorites',
            isLoadingFavorites: false,
          });
        }
      },

      // Toggle favorite status
      toggleFavorite: async (verseId, surahNumber, ayahNumber) => {
        try {
          const isFav = await checkIsFavorite(verseId, surahNumber);
          
          if (isFav) {
            await removeFavorite(verseId, surahNumber);
          } else {
            await addFavorite(verseId, surahNumber, ayahNumber);
          }
          
          // Reload favorites
          await get().loadFavorites();
        } catch (error) {
          set({ 
            favoritesError: error instanceof Error ? error.message : 'Failed to toggle favorite',
          });
        }
      },

      // Check if verse/surah is favorite
      isFavorite: async (verseId, surahNumber) => {
        try {
          return await checkIsFavorite(verseId, surahNumber);
        } catch (error) {
          console.error('Error checking favorite status:', error);
          return false;
        }
      },

      // Load all collections
      loadCollections: async () => {
        set({ isLoadingCollections: true, collectionsError: null });
        try {
          const collections = await getCollections();
          set({ collections, isLoadingCollections: false });
        } catch (error) {
          set({ 
            collectionsError: error instanceof Error ? error.message : 'Failed to load collections',
            isLoadingCollections: false,
          });
        }
      },

      // Create new collection
      createCollection: async (name, description, color = '#4F46E5') => {
        try {
          const id = await createCollection(name, description, color);
          await get().loadCollections();
          return id;
        } catch (error) {
          set({ 
            collectionsError: error instanceof Error ? error.message : 'Failed to create collection',
          });
          throw error;
        }
      },

      // Update collection
      updateCollection: async (id, updates) => {
        try {
          await updateCollection(id, updates);
          await get().loadCollections();
          
          // Update current collection if it's the one being edited
          if (get().currentCollection?.id === id) {
            const updated = await getCollectionById(id);
            set({ currentCollection: updated });
          }
        } catch (error) {
          set({ 
            collectionsError: error instanceof Error ? error.message : 'Failed to update collection',
          });
          throw error;
        }
      },

      // Delete collection
      deleteCollection: async (id) => {
        try {
          await deleteCollection(id);
          await get().loadCollections();
          
          // Clear current collection if it's the one being deleted
          if (get().currentCollection?.id === id) {
            set({ currentCollection: null, currentCollectionItems: [] });
          }
        } catch (error) {
          set({ 
            collectionsError: error instanceof Error ? error.message : 'Failed to delete collection',
          });
          throw error;
        }
      },

      // Load collection details
      loadCollectionDetails: async (id) => {
        set({ isLoadingItems: true, collectionsError: null });
        try {
          const collection = await getCollectionById(id);
          const items = await getCollectionItemsWithDetails(id);
          set({ 
            currentCollection: collection,
            currentCollectionItems: items,
            isLoadingItems: false,
          });
        } catch (error) {
          set({ 
            collectionsError: error instanceof Error ? error.message : 'Failed to load collection details',
            isLoadingItems: false,
          });
        }
      },

      // Clear current collection
      clearCurrentCollection: () => {
        set({ currentCollection: null, currentCollectionItems: [] });
      },

      // Add item to collection
      addToCollection: async (collectionId, verseId, surahNumber, ayahNumber) => {
        try {
          await addCollectionItem(collectionId, verseId, surahNumber, ayahNumber);
          
          // Reload items if this is the current collection
          if (get().currentCollection?.id === collectionId) {
            await get().loadCollectionItems(collectionId);
          }
        } catch (error) {
          set({ 
            collectionsError: error instanceof Error ? error.message : 'Failed to add item to collection',
          });
          throw error;
        }
      },

      // Remove item from collection
      removeFromCollection: async (collectionId, verseId, surahNumber) => {
        try {
          await removeCollectionItem(collectionId, verseId, surahNumber);
          
          // Reload items if this is the current collection
          if (get().currentCollection?.id === collectionId) {
            await get().loadCollectionItems(collectionId);
          }
        } catch (error) {
          set({ 
            collectionsError: error instanceof Error ? error.message : 'Failed to remove item from collection',
          });
          throw error;
        }
      },

      // Load collection items
      loadCollectionItems: async (collectionId) => {
        set({ isLoadingItems: true });
        try {
          const items = await getCollectionItemsWithDetails(collectionId);
          set({ currentCollectionItems: items, isLoadingItems: false });
        } catch (error) {
          set({ 
            collectionsError: error instanceof Error ? error.message : 'Failed to load collection items',
            isLoadingItems: false,
          });
        }
      },

      // Clear errors
      clearErrors: () => {
        set({ favoritesError: null, collectionsError: null });
      },
    }),
    {
      name: 'collections-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist non-dynamic data
        favorites: state.favorites,
      }),
    }
  )
);

// Selectors
export const selectFavoritesCount = (state: CollectionsState): number => state.favorites.length;

export const selectCollectionsCount = (state: CollectionsState): number => state.collections.length;

export const selectIsLoading = (state: CollectionsState): boolean => 
  state.isLoadingFavorites || state.isLoadingCollections || state.isLoadingItems;
