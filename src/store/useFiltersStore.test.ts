import { describe, it, expect, beforeEach } from 'vitest';
import { useFiltersStore } from './useFiltersStore';

// Create a mock implementation of the store for testing
const createTestStore = () => {
  // Get the initial state
  const initialState = useFiltersStore.getState();

  // Reset to a known state before each test
  beforeEach(() => {
    useFiltersStore.setState(
      {
        ...initialState,
        selectedCategories: [],
        showFavoritesOnly: false,
        openNow: false,
        priceLevel: [1, 2, 3, 4],
        minimumRating: null,
        userLocation: null,
        viewport: {
          center: null,
          bounds: null,
          zoom: 14,
        },
        isAllCategoriesMode: true,
      },
      true
    ); // true replaces the state entirely instead of merging
  });

  return useFiltersStore;
};

describe('useFiltersStore', () => {
  // Create a test store
  const store = createTestStore();

  it('should initialize with default values', () => {
    const state = store.getState();

    expect(state.selectedCategories).toEqual([]);
    expect(state.showFavoritesOnly).toBe(false);
    expect(state.openNow).toBe(false);
    expect(state.priceLevel).toEqual([1, 2, 3, 4]);
    expect(state.minimumRating).toBe(null);
    expect(state.userLocation).toBe(null);
    expect(state.viewport.center).toBe(null);
    expect(state.viewport.bounds).toBe(null);
    expect(state.viewport.zoom).toBe(14);
    expect(state.isAllCategoriesMode).toBe(true);
  });

  it('should set selected categories', () => {
    const categories = ['restaurant', 'cafe'];

    store.getState().setSelectedCategories(categories);

    expect(store.getState().selectedCategories).toEqual(categories);
    expect(store.getState().isAllCategoriesMode).toBe(false);
  });

  it('should toggle categories correctly', () => {
    // Toggle a category on (add it)
    store.getState().toggleCategory('restaurant');
    expect(store.getState().selectedCategories).toEqual(['restaurant']);
    expect(store.getState().isAllCategoriesMode).toBe(false);

    // Toggle another category on
    store.getState().toggleCategory('cafe');
    expect(store.getState().selectedCategories).toEqual(['restaurant', 'cafe']);
    expect(store.getState().isAllCategoriesMode).toBe(false);

    // Toggle a category off (remove it)
    store.getState().toggleCategory('restaurant');
    expect(store.getState().selectedCategories).toEqual(['cafe']);
    expect(store.getState().isAllCategoriesMode).toBe(false);

    // Toggle the last category off, should enable "All" mode
    store.getState().toggleCategory('cafe');
    expect(store.getState().selectedCategories).toEqual([]);
    expect(store.getState().isAllCategoriesMode).toBe(true);
  });

  it('should set show favorites only', () => {
    store.getState().setShowFavoritesOnly(true);
    expect(store.getState().showFavoritesOnly).toBe(true);

    store.getState().setShowFavoritesOnly(false);
    expect(store.getState().showFavoritesOnly).toBe(false);
  });

  it('should set open now filter', () => {
    store.getState().setOpenNow(true);
    expect(store.getState().openNow).toBe(true);

    store.getState().setOpenNow(false);
    expect(store.getState().openNow).toBe(false);
  });

  it('should set price level filter', () => {
    const priceLevel = [2, 3];

    store.getState().setPriceLevel(priceLevel);
    expect(store.getState().priceLevel).toEqual(priceLevel);
  });

  it('should set minimum rating', () => {
    store.getState().setMinimumRating(4);
    expect(store.getState().minimumRating).toBe(4);

    store.getState().setMinimumRating(null);
    expect(store.getState().minimumRating).toBe(null);
  });

  it('should set user location', () => {
    const location = { lat: 40.7128, lng: -74.006 };

    store.getState().setUserLocation(location);
    expect(store.getState().userLocation).toEqual(location);
    // Should also set viewport center if it was null
    expect(store.getState().viewport.center).toEqual(location);

    // Set viewport center to something else
    const newCenter = { lat: 37.7749, lng: -122.4194 };
    store.getState().setViewportCenter(newCenter);

    // Set user location again, viewport center should not change
    const newLocation = { lat: 51.5074, lng: -0.1278 };
    store.getState().setUserLocation(newLocation);
    expect(store.getState().userLocation).toEqual(newLocation);
    expect(store.getState().viewport.center).toEqual(newCenter); // Should remain unchanged
  });

  it('should set viewport properties', () => {
    // Test setting viewport center
    const center = { lat: 40.7128, lng: -74.006 };
    store.getState().setViewportCenter(center);
    expect(store.getState().viewport.center).toEqual(center);

    // Test setting viewport bounds
    const bounds = {
      ne: { lat: 40.8, lng: -73.9 },
      sw: { lat: 40.7, lng: -74.1 },
    };
    store.getState().setViewportBounds(bounds);
    expect(store.getState().viewport.bounds).toEqual(bounds);

    // Test setting viewport zoom
    store.getState().setViewportZoom(12);
    expect(store.getState().viewport.zoom).toBe(12);
  });

  it('should reset filters correctly', () => {
    // Set some values
    store.getState().setSelectedCategories(['restaurant', 'cafe']);
    store.getState().setShowFavoritesOnly(true);
    store.getState().setOpenNow(true);
    store.getState().setPriceLevel([2, 3]);
    store.getState().setMinimumRating(4);
    store.getState().setUserLocation({ lat: 40.7128, lng: -74.006 });
    store.getState().setViewportCenter({ lat: 37.7749, lng: -122.4194 });
    store.getState().setViewportBounds({
      ne: { lat: 40.8, lng: -73.9 },
      sw: { lat: 40.7, lng: -74.1 },
    });
    store.getState().setViewportZoom(12);

    // Reset filters
    store.getState().resetFilters();

    // Check that filters are reset
    expect(store.getState().selectedCategories).toEqual([]);
    expect(store.getState().showFavoritesOnly).toBe(false);
    expect(store.getState().openNow).toBe(false);
    expect(store.getState().priceLevel).toEqual([1, 2, 3, 4]);
    expect(store.getState().minimumRating).toBe(null);
    expect(store.getState().isAllCategoriesMode).toBe(true);

    // User location and viewport should not be reset
    expect(store.getState().userLocation).toEqual({
      lat: 40.7128,
      lng: -74.006,
    });
    expect(store.getState().viewport.center).toEqual({
      lat: 37.7749,
      lng: -122.4194,
    });
    expect(store.getState().viewport.bounds).toEqual({
      ne: { lat: 40.8, lng: -73.9 },
      sw: { lat: 40.7, lng: -74.1 },
    });
    expect(store.getState().viewport.zoom).toBe(12);
  });

  it('should get all category keywords', () => {
    const keywords = store.getState().getAllCategoryKeywords();

    // Check that keywords is an array of strings
    expect(Array.isArray(keywords)).toBe(true);
    expect(keywords.length).toBeGreaterThan(0);
    expect(typeof keywords[0]).toBe('string');
  });
});
