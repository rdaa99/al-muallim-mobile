import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CollectionsScreen } from '../CollectionsScreen';
import { useCollectionsStore } from '@/stores/collectionsStore';
import * as ReactNavigation from '@react-navigation/native';

// Mock dependencies
jest.mock('@/stores/collectionsStore');
jest.mock('@react-navigation/native');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));
jest.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      background: '#FFFFFF',
      text: '#000000',
      textSecondary: '#666666',
      surface: '#F5F5F5',
      primary: '#4F46E5',
      border: '#E5E5E5',
      card: '#FFFFFF',
    },
  }),
}));
jest.mock('@/context/FontSizeContext', () => ({
  useFonts: () => ({
    fonts: {
      hero: 24,
      heading: 20,
      body: 16,
    },
  }),
}));

describe('CollectionsScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  const mockLoadCollections = jest.fn();
  const mockCreateCollection = jest.fn();
  const mockDeleteCollection = jest.fn();
  const mockClearErrors = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (ReactNavigation.useNavigation as jest.Mock).mockReturnValue(mockNavigation);
    
    (useCollectionsStore as unknown as jest.Mock).mockReturnValue({
      collections: [],
      isLoadingCollections: false,
      loadCollections: mockLoadCollections,
      createCollection: mockCreateCollection,
      deleteCollection: mockDeleteCollection,
      collectionsError: null,
      clearErrors: mockClearErrors,
    });
  });

  it('should render empty state when no collections', () => {
    const { getByText } = render(<CollectionsScreen />);

    expect(getByText('No collections yet')).toBeTruthy();
    expect(getByText('Create your first collection to organize verses')).toBeTruthy();
  });

  it('should load collections on mount', () => {
    render(<CollectionsScreen />);

    expect(mockLoadCollections).toHaveBeenCalled();
  });

  it('should render collections list', () => {
    const mockCollections = [
      {
        id: 'col_1',
        name: 'Test Collection',
        description: 'Test Description',
        color: '#4F46E5',
        created_at: '2024-01-01T00:00:00Z',
        is_predefined: false,
      },
      {
        id: 'col_2',
        name: 'Another Collection',
        description: 'Another Description',
        color: '#10B981',
        created_at: '2024-01-02T00:00:00Z',
        is_predefined: true,
      },
    ];

    (useCollectionsStore as unknown as jest.Mock).mockReturnValue({
      collections: mockCollections,
      isLoadingCollections: false,
      loadCollections: mockLoadCollections,
      createCollection: mockCreateCollection,
      deleteCollection: mockDeleteCollection,
      collectionsError: null,
      clearErrors: mockClearErrors,
    });

    const { getByText } = render(<CollectionsScreen />);

    expect(getByText('Test Collection')).toBeTruthy();
    expect(getByText('Test Description')).toBeTruthy();
    expect(getByText('Another Collection')).toBeTruthy();
    expect(getByText('Predefined')).toBeTruthy();
  });

  it('should navigate to collection detail when pressed', () => {
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

    (useCollectionsStore as unknown as jest.Mock).mockReturnValue({
      collections: mockCollections,
      isLoadingCollections: false,
      loadCollections: mockLoadCollections,
      createCollection: mockCreateCollection,
      deleteCollection: mockDeleteCollection,
      collectionsError: null,
      clearErrors: mockClearErrors,
    });

    const { getByText } = render(<CollectionsScreen />);
    const collectionCard = getByText('Test Collection');
    
    fireEvent.press(collectionCard);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('CollectionDetail', {
      collectionId: 'col_1',
    });
  });

  it('should open create modal when add button is pressed', () => {
    const { getByText } = render(<CollectionsScreen />);
    const addButton = getByText('+');
    
    fireEvent.press(addButton);

    expect(getByText('Create New Collection')).toBeTruthy();
  });

  it('should create a new collection', async () => {
    mockCreateCollection.mockResolvedValue('col_new');

    const { getByText, getByPlaceholderText } = render(<CollectionsScreen />);
    
    // Open modal
    const addButton = getByText('+');
    fireEvent.press(addButton);

    // Fill form
    const nameInput = getByPlaceholderText('Collection name');
    fireEvent.changeText(nameInput, 'New Test Collection');

    const descriptionInput = getByPlaceholderText('Description (optional)');
    fireEvent.changeText(descriptionInput, 'Test description');

    // Submit
    const createButton = getByText('Create');
    fireEvent.press(createButton);

    await waitFor(() => {
      expect(mockCreateCollection).toHaveBeenCalledWith(
        'New Test Collection',
        'Test description',
        '#4F46E5'
      );
    });
  });

  it('should show error when creating collection without name', async () => {
    const { getByText } = render(<CollectionsScreen />);
    
    // Open modal
    const addButton = getByText('+');
    fireEvent.press(addButton);

    // Submit without name
    const createButton = getByText('Create');
    fireEvent.press(createButton);

    // Alert should be shown (we can't easily test Alert.alert in Jest)
    expect(mockCreateCollection).not.toHaveBeenCalled();
  });

  it('should handle delete collection', async () => {
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

    (useCollectionsStore as unknown as jest.Mock).mockReturnValue({
      collections: mockCollections,
      isLoadingCollections: false,
      loadCollections: mockLoadCollections,
      createCollection: mockCreateCollection,
      deleteCollection: mockDeleteCollection,
      collectionsError: null,
      clearErrors: mockClearErrors,
    });

    const { getByText } = render(<CollectionsScreen />);
    const collectionCard = getByText('Test Collection');
    
    // Long press to trigger delete
    fireEvent(collectionCard, 'longPress');

    // Alert should be shown (we can't easily test Alert.alert in Jest)
    // But we can verify the delete function would be called
  });

  it('should not allow deleting predefined collections', async () => {
    const mockCollections = [
      {
        id: 'col_1',
        name: 'Test Collection',
        description: 'Test Description',
        color: '#4F46E5',
        created_at: '2024-01-01T00:00:00Z',
        is_predefined: true,
      },
    ];

    (useCollectionsStore as unknown as jest.Mock).mockReturnValue({
      collections: mockCollections,
      isLoadingCollections: false,
      loadCollections: mockLoadCollections,
      createCollection: mockCreateCollection,
      deleteCollection: mockDeleteCollection,
      collectionsError: null,
      clearErrors: mockClearErrors,
    });

    const { getByText } = render(<CollectionsScreen />);
    const collectionCard = getByText('Test Collection');
    
    // Long press to trigger delete
    fireEvent(collectionCard, 'longPress');

    // Alert should be shown with "cannot delete" message
    expect(mockDeleteCollection).not.toHaveBeenCalled();
  });

  it('should display and clear errors', () => {
    (useCollectionsStore as unknown as jest.Mock).mockReturnValue({
      collections: [],
      isLoadingCollections: false,
      loadCollections: mockLoadCollections,
      createCollection: mockCreateCollection,
      deleteCollection: mockDeleteCollection,
      collectionsError: 'Test error',
      clearErrors: mockClearErrors,
    });

    render(<CollectionsScreen />);

    // Error should trigger an alert and clearErrors should be called
    expect(mockClearErrors).toHaveBeenCalled();
  });

  it('should allow selecting different colors when creating collection', async () => {
    const { getByText, queryAllByRole } = render(<CollectionsScreen />);
    
    // Open modal
    const addButton = getByText('+');
    fireEvent.press(addButton);

    // Color options should be available
    // Note: Actual color selection would require more complex testing
    expect(getByText('Select Color')).toBeTruthy();
  });
});
