import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { categories } from '@/services/places';

// Extract all category names from the categories data
const allCategoryNames = categories.map(([, name]) => name);

// Current store version
const STORE_VERSION = 1;

export interface FiltersState {
  // Selected categories (empty array means "All")
  selectedCategories: string[];
  // Show only favorites
  showFavoritesOnly: boolean;
  // Open now filter
  openNow: boolean;
  // Price level filter (1-4)
  priceLevel: number[];
  // Minimum rating (1-5)
  minimumRating: number | null;
  // User location
  userLocation: { lat: number; lng: number } | null;
  // Map viewport
  viewport: {
    center: { lat: number; lng: number } | null;
    bounds: {
      ne: { lat: number; lng: number };
      sw: { lat: number; lng: number };
    } | null;
    zoom: number;
  };
  // Computed value for "All" mode
  isAllCategoriesMode: boolean;
  // Get all category keywords for API requests
  getAllCategoryKeywords: () => string[];
  // Actions
  setSelectedCategories: (categories: string[]) => void;
  toggleCategory: (category: string) => void;
  setShowFavoritesOnly: (show: boolean) => void;
  setOpenNow: (openNow: boolean) => void;
  setPriceLevel: (priceLevel: number[]) => void;
  setMinimumRating: (rating: number | null) => void;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
  setViewportCenter: (center: { lat: number; lng: number }) => void;
  setViewportBounds: (bounds: {
    ne: { lat: number; lng: number };
    sw: { lat: number; lng: number };
  }) => void;
  setViewportZoom: (zoom: number) => void;
  resetFilters: () => void;
}

// Migration function to handle store version changes
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
          console.log(
            '[FiltersStore] setSelectedCategories called with:',
            categories
          );
          set((state) => {
            state.selectedCategories = categories;
            // Update isAllCategoriesMode based on the new categories
            state.isAllCategoriesMode = categories.length === 0;
          });
        },

        toggleCategory: (category) => {
          console.log('[FiltersStore] toggleCategory called with:', category);

          set((state) => {
            console.log(
              '[FiltersStore] Current selectedCategories:',
              state.selectedCategories
            );

            // If category is already selected, remove it
            if (state.selectedCategories.includes(category)) {
              console.log('[FiltersStore] Removing category:', category);
              state.selectedCategories = state.selectedCategories.filter(
                (c: string) => c !== category
              );
            } else {
              // Otherwise, add it
              console.log('[FiltersStore] Adding category:', category);
              state.selectedCategories.push(category);
            }

            // Update isAllCategoriesMode based on the new selectedCategories
            state.isAllCategoriesMode = state.selectedCategories.length === 0;
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
            // Also update the viewport center if it's not set yet
            if (!state.viewport.center && location) {
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
