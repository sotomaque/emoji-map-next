import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { CATEGORY_MAP } from '@/constants/category-map';

/**
 * Development logging helper
 */
const logDev = (message: string, data?: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[FiltersStore] ${message}`, data);
  }
};

/**
 * Get all category keys
 */
const getAllCategoryKeys = (): number[] => {
  return Object.keys(CATEGORY_MAP).map(Number);
};

/**
 * Filters State Interface
 */
export interface FiltersState {
  /** Selected category keys (empty array means "All") */
  selectedCategoryKeys: number[];

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

  /** Get all category keys for API requests */
  getAllCategoryKeys: () => number[];

  /** Get selected category names (for backward compatibility) */
  getSelectedCategoryNames: () => string[];

  /** Set selected category keys */
  setSelectedCategoryKeys: (keys: number[]) => void;

  /** Toggle a category key selection */
  toggleCategoryKey: (key: number) => void;

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
 * Migration function for persisted state
 */
const migrate = (persistedState: unknown, version: number) => {
  logDev(`Migrating state from version ${version}`);

  // If we have a fresh state or no version, return a fresh state
  if (!persistedState || version === 0) {
    return createFreshState();
  }

  // Handle migrations based on version
  if (version === 1) {
    // Migration from v1 to v2: Convert selectedCategories to selectedCategoryKeys
    interface OldState {
      selectedCategories?: string[];
      showFavoritesOnly?: boolean;
      openNow?: boolean;
      priceLevel?: number[];
      minimumRating?: number | null;
      userLocation?: { lat: number; lng: number } | null;
      viewport?: {
        center: { lat: number; lng: number } | null;
        bounds: {
          ne: { lat: number; lng: number };
          sw: { lat: number; lng: number };
        } | null;
        zoom: number;
      };
    }

    const oldState = persistedState as OldState;
    const freshState = createFreshState();

    // Convert old selectedCategories to new selectedCategoryKeys
    if (oldState.selectedCategories && oldState.selectedCategories.length > 0) {
      const categoryKeys: number[] = [];
      for (const categoryName of oldState.selectedCategories) {
        // Find the key for this category name
        const entry = Object.entries(CATEGORY_MAP).find(
          ([, category]) => category.name === categoryName
        );
        if (entry) {
          categoryKeys.push(Number(entry[0]));
        }
      }
      freshState.selectedCategoryKeys = categoryKeys;
      freshState.isAllCategoriesMode = categoryKeys.length === 0;
    }

    // Copy over other properties
    if (oldState.showFavoritesOnly !== undefined)
      freshState.showFavoritesOnly = oldState.showFavoritesOnly;
    if (oldState.openNow !== undefined) freshState.openNow = oldState.openNow;
    if (oldState.priceLevel !== undefined)
      freshState.priceLevel = oldState.priceLevel;
    if (oldState.minimumRating !== undefined)
      freshState.minimumRating = oldState.minimumRating;
    if (oldState.userLocation !== undefined)
      freshState.userLocation = oldState.userLocation;
    if (oldState.viewport !== undefined)
      freshState.viewport = oldState.viewport;

    return freshState;
  }

  // If we don't have a specific migration, return the persisted state
  return persistedState;
};

/**
 * Create a fresh state object
 */
const createFreshState = (): Omit<
  FiltersState,
  keyof Omit<
    FiltersState,
    | 'isAllCategoriesMode'
    | 'selectedCategoryKeys'
    | 'showFavoritesOnly'
    | 'openNow'
    | 'priceLevel'
    | 'minimumRating'
    | 'userLocation'
    | 'viewport'
  >
> => {
  // Create a fresh state with default values
  const freshState = {
    selectedCategoryKeys: [],
    showFavoritesOnly: false,
    openNow: false,
    priceLevel: [1, 2, 3, 4],
    minimumRating: null,
    userLocation: null,
    viewport: {
      center: null,
      bounds: null,
      zoom: 12,
    },
    isAllCategoriesMode: true,
  };

  // Return the fresh state (cast to unknown first to satisfy TypeScript)
  return freshState as unknown as Omit<
    FiltersState,
    keyof Omit<
      FiltersState,
      | 'isAllCategoriesMode'
      | 'selectedCategoryKeys'
      | 'showFavoritesOnly'
      | 'openNow'
      | 'priceLevel'
      | 'minimumRating'
      | 'userLocation'
      | 'viewport'
    >
  >;
};

/**
 * Filters Store
 *
 * Zustand store for managing map filters state with persistence and dev tools
 * Uses Immer for immutable state updates
 */
// Create the vanilla store
export const useFiltersStore = create<FiltersState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        selectedCategoryKeys: [],
        showFavoritesOnly: false,
        openNow: false,
        priceLevel: [1, 2, 3, 4],
        minimumRating: null,
        userLocation: null,
        viewport: {
          center: null,
          bounds: null,
          zoom: 12,
        },

        // Initialize isAllCategoriesMode as a regular property
        isAllCategoriesMode: true,

        // Actions
        getAllCategoryKeys: () => {
          return getAllCategoryKeys();
        },

        getSelectedCategoryNames: () => {
          const { selectedCategoryKeys } = get();
          return selectedCategoryKeys
            .map((key: number) => CATEGORY_MAP[key]?.name || '')
            .filter(Boolean);
        },

        setSelectedCategoryKeys: (keys: number[]) => {
          logDev('Setting selected category keys', keys);
          set((state: FiltersState) => {
            state.selectedCategoryKeys = keys;
            // Update isAllCategoriesMode when keys change
            state.isAllCategoriesMode = keys.length === 0;
            return state;
          });
        },

        toggleCategoryKey: (key: number) => {
          logDev('Toggling category key', key);
          set((state: FiltersState) => {
            const index = state.selectedCategoryKeys.indexOf(key);
            if (index === -1) {
              state.selectedCategoryKeys.push(key);
            } else {
              state.selectedCategoryKeys.splice(index, 1);
            }
            // Update isAllCategoriesMode when keys change
            state.isAllCategoriesMode = state.selectedCategoryKeys.length === 0;
            return state;
          });
        },

        setShowFavoritesOnly: (show: boolean) => {
          logDev('Setting show favorites only', show);
          set((state: FiltersState) => {
            state.showFavoritesOnly = show;
            return state;
          });
        },

        setOpenNow: (openNow: boolean) => {
          logDev('Setting open now', openNow);
          set((state: FiltersState) => {
            state.openNow = openNow;
            return state;
          });
        },

        setPriceLevel: (priceLevel: number[]) => {
          logDev('Setting price level', priceLevel);
          set((state: FiltersState) => {
            state.priceLevel = priceLevel;
            return state;
          });
        },

        setMinimumRating: (rating: number | null) => {
          logDev('Setting minimum rating', rating);
          set((state: FiltersState) => {
            state.minimumRating = rating;
            return state;
          });
        },

        setUserLocation: (location: { lat: number; lng: number } | null) => {
          logDev('Setting user location', location);
          set((state: FiltersState) => {
            state.userLocation = location;
            return state;
          });
        },

        setViewportCenter: (center: { lat: number; lng: number }) => {
          set((state: FiltersState) => {
            state.viewport.center = center;
            return state;
          });
        },

        setViewportBounds: (bounds: {
          ne: { lat: number; lng: number };
          sw: { lat: number; lng: number };
        }) => {
          set((state: FiltersState) => {
            state.viewport.bounds = bounds;
            return state;
          });
        },

        setViewportZoom: (zoom: number) => {
          set((state: FiltersState) => {
            state.viewport.zoom = zoom;
            return state;
          });
        },

        resetFilters: () => {
          logDev('Resetting filters');
          set((state: FiltersState) => {
            state.selectedCategoryKeys = [];
            state.showFavoritesOnly = false;
            state.openNow = false;
            state.priceLevel = [1, 2, 3, 4];
            state.minimumRating = null;
            state.isAllCategoriesMode = true;
            return state;
          });
        },
      })),
      {
        name: 'filters-storage',
        version: 2,
        migrate,
        partialize: (state: FiltersState) => ({
          selectedCategoryKeys: state.selectedCategoryKeys,
          showFavoritesOnly: state.showFavoritesOnly,
          openNow: state.openNow,
          priceLevel: state.priceLevel,
          minimumRating: state.minimumRating,
          isAllCategoriesMode: state.isAllCategoriesMode,
          // Don't persist computed properties or functions
          // Don't persist viewport as it will be set on component mount
        }),
      }
    ),
    {
      name: 'EmojiMapFiltersStore',
    }
  )
);
