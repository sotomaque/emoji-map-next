import { create } from 'zustand';
import { persist , devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { categories } from '@/services/places';

// Extract all category names from the categories data
const allCategoryNames = categories.map(([, name]) => name);

// Current store version
const STORE_VERSION = 1;

/**
 * Helper function for development-only logging
 *
 * @param {string} message - The message to log
 * @param {unknown} [data] - Optional data to log with the message
 */
const logDev = (message: string, data?: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    if (data) {
      console.log(`[FiltersStore] ${message}`, data);
    } else {
      console.log(`[FiltersStore] ${message}`);
    }
  }
};

/**
 * Filters State Interface
 *
 * Defines the state and actions for the filters store used to filter map markers
 *
 * @interface FiltersState
 */
export interface FiltersState {
  /** Selected categories (empty array means "All") */
  selectedCategories: string[];

  /** Show only favorites */
  showFavoritesOnly: boolean;

  /** Open now filter */
  openNow: boolean;

  /** Price level filter (1-4) */
  priceLevel: number[];

  /** Minimum rating (1-5) */
  minimumRating: number | null;

  /** User location */
  userLocation: { lat: number; lng: number } | null;

  /** Map viewport */
  viewport: {
    center: { lat: number; lng: number } | null;
    bounds: {
      ne: { lat: number; lng: number };
      sw: { lat: number; lng: number };
    } | null;
    zoom: number;
  };

  /** Computed value for "All" mode */
  isAllCategoriesMode: boolean;

  /** Get all category keywords for API requests */
  getAllCategoryKeywords: () => string[];

  /** Set selected categories */
  setSelectedCategories: (categories: string[]) => void;

  /** Toggle a category selection */
  toggleCategory: (category: string) => void;

  /** Set show favorites only filter */
  setShowFavoritesOnly: (show: boolean) => void;

  /** Set open now filter */
  setOpenNow: (openNow: boolean) => void;

  /** Set price level filter */
  setPriceLevel: (priceLevel: number[]) => void;

  /** Set minimum rating filter */
  setMinimumRating: (rating: number | null) => void;

  /** Set user location */
  setUserLocation: (location: { lat: number; lng: number } | null) => void;

  /** Set viewport center */
  setViewportCenter: (center: { lat: number; lng: number }) => void;

  /** Set viewport bounds */
  setViewportBounds: (bounds: {
    ne: { lat: number; lng: number };
    sw: { lat: number; lng: number };
  }) => void;

  /** Set viewport zoom */
  setViewportZoom: (zoom: number) => void;

  /** Reset all filters to default values */
  resetFilters: () => void;
}

/**
 * Migration function to handle store version changes
 *
 * @param {unknown} persistedState - The persisted state from localStorage
 * @param {number} version - The version of the persisted state
 * @returns {unknown} The migrated state
 */
const migrate = (persistedState: unknown, version: number) => {
  if (version === 0) {
    // Migration from version 0 to 1
    const state = persistedState as Partial<FiltersState>;
    return {
      ...state,
      // Add any new fields or transform existing ones
      openNow: state.openNow || false,
      priceLevel: state.priceLevel || [1, 2, 3, 4],
      minimumRating: state.minimumRating || null,
      isAllCategoriesMode: state.selectedCategories?.length === 0,
    };
  }
  return persistedState;
};

/**
 * Filters Store
 *
 * Zustand store for managing map filters state with persistence and dev tools
 * Uses Immer for immutable state updates
 */
export const useFiltersStore = create<FiltersState>()(
  devtools(
    persist(
      immer((set) => ({
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
        isAllCategoriesMode: true, // Default to true since selectedCategories is empty

        // Get all category keywords for API requests
        getAllCategoryKeywords: () => allCategoryNames,

        setSelectedCategories: (categories) => {
          logDev('setSelectedCategories called with:', categories);
          set((state) => {
            state.selectedCategories = categories;
            // Update isAllCategoriesMode based on the new categories
            state.isAllCategoriesMode = categories.length === 0;
          });
        },

        toggleCategory: (category) => {
          logDev('toggleCategory called with:', category);

          set((state) => {
            logDev('Current selectedCategories:', state.selectedCategories);

            // If category is already selected, remove it
            if (state.selectedCategories.includes(category)) {
              logDev('Removing category:', category);
              state.selectedCategories = state.selectedCategories.filter(
                (c: string) => c !== category
              );
              state.isAllCategoriesMode = state.selectedCategories.length === 0;
              return;
            }

            // Otherwise, add it
            logDev('Adding category:', category);
            state.selectedCategories.push(category);
            state.isAllCategoriesMode = false;
          });
        },

        setShowFavoritesOnly: (show) =>
          set((state) => {
            state.showFavoritesOnly = show;
          }),

        setOpenNow: (openNow) =>
          set((state) => {
            state.openNow = openNow;
          }),

        setPriceLevel: (priceLevel) =>
          set((state) => {
            state.priceLevel = priceLevel;
          }),

        setMinimumRating: (rating) =>
          set((state) => {
            state.minimumRating = rating;
          }),

        setUserLocation: (location) =>
          set((state) => {
            state.userLocation = location;
            // Only update the viewport center when user location changes if center is null
            if (location && state.viewport.center === null) {
              state.viewport.center = location;
            }
          }),

        setViewportCenter: (center) =>
          set((state) => {
            state.viewport.center = center;
          }),

        setViewportBounds: (bounds) =>
          set((state) => {
            state.viewport.bounds = bounds;
          }),

        setViewportZoom: (zoom) =>
          set((state) => {
            state.viewport.zoom = zoom;
          }),

        resetFilters: () =>
          set((state) => {
            state.selectedCategories = [];
            state.showFavoritesOnly = false;
            state.openNow = false;
            state.priceLevel = [1, 2, 3, 4];
            state.minimumRating = null;
            state.isAllCategoriesMode = true;
            // Don't reset viewport or user location
          }),
      })),
      {
        name: 'emoji-map-filters',
        version: STORE_VERSION,
        migrate,
        partialize: (state) => ({
          selectedCategories: state.selectedCategories,
          showFavoritesOnly: state.showFavoritesOnly,
          openNow: state.openNow,
          priceLevel: state.priceLevel,
          minimumRating: state.minimumRating,
          isAllCategoriesMode: state.isAllCategoriesMode,
          // Don't persist viewport as it will be set on component mount
        }),
      }
    ),
    {
      name: 'EmojiMapFiltersStore',
    }
  )
);
