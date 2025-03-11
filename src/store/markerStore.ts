import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { SimplifiedMapPlace } from '@/types/local-places-types';

// Define viewport type
export type Viewport = {
  center: { lat: number; lng: number } | null;
  bounds: {
    ne: { lat: number; lng: number };
    sw: { lat: number; lng: number };
  } | null;
  zoom: number;
};

// Define a key for viewport caching
const getViewportKey = (viewport: Viewport): string => {
  if (!viewport.bounds) return '';

  // Round to 3 decimal places for reasonable precision
  const ne = viewport.bounds.ne;
  const sw = viewport.bounds.sw;
  const zoom = Math.round(viewport.zoom);

  return `${ne.lat.toFixed(3)},${ne.lng.toFixed(3)}_${sw.lat.toFixed(3)},${sw.lng.toFixed(3)}_${zoom}`;
};

// Define filter criteria type
export interface FilterCriteria {
  categories: string[];
  isAllCategoriesMode: boolean;
  showFavoritesOnly: boolean;
  favoriteIds: Set<string>;
  openNow: boolean;
  priceLevel: number[];
  minimumRating: number | null;
}

// Define the store type
interface MarkerStore {
  // All markers by ID
  markers: Map<string, SimplifiedMapPlace>;

  // Markers by viewport key (unfiltered)
  viewportMarkers: Map<string, Set<string>>;

  // Currently visible markers (filtered)
  visibleMarkers: SimplifiedMapPlace[];

  // New markers that should be animated
  newMarkerIds: Set<string>;

  // Current viewport
  currentViewport: Viewport | null;

  // Is transitioning between viewports
  isTransitioning: boolean;

  // Actions
  setMarkers: (markers: SimplifiedMapPlace[], viewport: Viewport) => void;
  setVisibleMarkers: (markers: SimplifiedMapPlace[]) => void;
  setCurrentViewport: (viewport: Viewport) => void;
  setIsTransitioning: (isTransitioning: boolean) => void;
  hasViewportCached: (viewport: Viewport) => boolean;
  getMarkersForViewport: () => SimplifiedMapPlace[];
  filterMarkers: (filterCriteria: FilterCriteria) => SimplifiedMapPlace[];
  clearCache: () => void;
}

// Create the store with middleware
export const useMarkerStore = create<MarkerStore>()(
  devtools((set, get) => ({
    markers: new Map(),
    viewportMarkers: new Map(),
    visibleMarkers: [],
    newMarkerIds: new Set(),
    currentViewport: null,
    isTransitioning: false,

    setMarkers: (markers: SimplifiedMapPlace[], viewport: Viewport) => {
      const viewportKey = getViewportKey(viewport);
      const newMarkerIds = new Set<string>();
      const viewportMarkerIds = new Set<string>();

      // Get the existing markers map - we'll add to this instead of replacing it
      const markersMap = new Map(get().markers);

      // Process each marker
      markers.forEach((marker) => {
        viewportMarkerIds.add(marker.id);

        // Check if this is a new marker
        if (!markersMap.has(marker.id)) {
          newMarkerIds.add(marker.id);
          console.log(
            `[MarkerStore] New marker: ${marker.id} (${marker.emoji})`
          );
        } else {
          console.log(
            `[MarkerStore] Existing marker: ${marker.id} (${marker.emoji})`
          );
        }

        // Update or add the marker
        markersMap.set(marker.id, marker);
      });

      // Update the viewport markers
      const viewportMarkersMap = new Map(get().viewportMarkers);
      viewportMarkersMap.set(viewportKey, viewportMarkerIds);

      // Get all markers as an array
      const allMarkers = Array.from(markersMap.values());

      set({
        markers: markersMap,
        viewportMarkers: viewportMarkersMap,
        visibleMarkers: allMarkers, // Show all markers, not just the new ones
        newMarkerIds,
        currentViewport: viewport,
      });

      console.log(
        `[MarkerStore] Cached ${markers.length} markers for viewport ${viewportKey}`
      );
      console.log(`[MarkerStore] New markers: ${newMarkerIds.size}`);
      console.log(`[MarkerStore] Total markers in store: ${markersMap.size}`);
      console.log(`[MarkerStore] Visible markers: ${allMarkers.length}`);
    },

    setVisibleMarkers: (markers: SimplifiedMapPlace[]) => {
      set({ visibleMarkers: markers });
    },

    setCurrentViewport: (viewport: Viewport) => {
      set({ currentViewport: viewport });
    },

    setIsTransitioning: (isTransitioning: boolean) => {
      set({ isTransitioning });
    },

    hasViewportCached: (viewport: Viewport): boolean => {
      // Check if we have any markers in the store
      const hasMarkers = get().markers.size > 0;

      // If we have markers, we consider all viewports "cached"
      if (hasMarkers) {
        return true;
      }

      // Otherwise, check if this specific viewport is cached
      const viewportKey = getViewportKey(viewport);
      return get().viewportMarkers.has(viewportKey);
    },

    getMarkersForViewport: () => {
      // Get all markers from the store
      const markers = get().markers;
      const allMarkers = Array.from(markers.values());

      console.log(
        `[MarkerStore] Retrieved ${allMarkers.length} total markers from store`
      );
      return allMarkers;
    },

    filterMarkers: (filterCriteria: FilterCriteria): SimplifiedMapPlace[] => {
      // Get all markers from the store
      const markers = get().markers;
      const filteredMarkers: SimplifiedMapPlace[] = [];

      // Apply filters to all markers
      markers.forEach((marker) => {
        // Filter by category
        if (
          !filterCriteria.isAllCategoriesMode &&
          filterCriteria.categories.length > 0 &&
          marker.category &&
          !filterCriteria.categories.includes(marker.category)
        ) {
          return;
        }

        // Filter by favorites
        if (
          filterCriteria.showFavoritesOnly &&
          !filterCriteria.favoriteIds.has(marker.id)
        ) {
          return;
        }

        // Skip other filters that don't apply to SimplifiedMapPlace

        // If it passes all filters, add it to the filtered markers
        filteredMarkers.push(marker);
      });

      console.log(
        `[MarkerStore] Filtered to ${filteredMarkers.length} markers out of ${markers.size} total`
      );
      return filteredMarkers;
    },

    clearCache: () => {
      // Keep the markers but clear other state
      const currentMarkers = get().markers;
      const allMarkers = Array.from(currentMarkers.values());

      set({
        // Keep the existing markers
        markers: currentMarkers,
        // Clear other state
        viewportMarkers: new Map(),
        // Set all markers as visible
        visibleMarkers: allMarkers,
        // Mark all as new for animation
        newMarkerIds: new Set(allMarkers.map((marker) => marker.id)),
      });

      console.log(
        `[MarkerStore] Cache partially cleared, keeping ${currentMarkers.size} markers as visible`
      );
    },
  }))
);
