import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Define MapDataPoint type since we can't import it
export interface MapDataPoint {
  id: string;
  position: { lat: number; lng: number };
  emoji: string;
  title: string;
  category?: string;
  priceLevel?: number;
  openNow?: boolean;
  rating?: number;
}

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
  markers: Map<string, MapDataPoint>;

  // Markers by viewport key (unfiltered)
  viewportMarkers: Map<string, Set<string>>;

  // Currently visible markers (filtered)
  visibleMarkers: MapDataPoint[];

  // New markers that should be animated
  newMarkerIds: Set<string>;

  // Current viewport
  currentViewport: Viewport | null;

  // Is transitioning between viewports
  isTransitioning: boolean;

  // Actions
  setMarkers: (markers: MapDataPoint[], viewport: Viewport) => void;
  setVisibleMarkers: (markers: MapDataPoint[]) => void;
  setCurrentViewport: (viewport: Viewport) => void;
  setIsTransitioning: (isTransitioning: boolean) => void;
  hasViewportCached: (viewport: Viewport) => boolean;
  getMarkersForViewport: (viewport: Viewport) => MapDataPoint[];
  filterMarkers: (
    viewport: Viewport,
    filterCriteria: FilterCriteria
  ) => MapDataPoint[];
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

    setMarkers: (markers: MapDataPoint[], viewport: Viewport) => {
      const viewportKey = getViewportKey(viewport);
      const newMarkerIds = new Set<string>();
      const viewportMarkerIds = new Set<string>();
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

      set({
        markers: markersMap,
        viewportMarkers: viewportMarkersMap,
        visibleMarkers: markers,
        newMarkerIds,
        currentViewport: viewport,
      });

      console.log(
        `[MarkerStore] Cached ${markers.length} markers for viewport ${viewportKey}`
      );
      console.log(`[MarkerStore] New markers: ${newMarkerIds.size}`);
    },

    setVisibleMarkers: (markers: MapDataPoint[]) => {
      set({ visibleMarkers: markers });
    },

    setCurrentViewport: (viewport: Viewport) => {
      set({ currentViewport: viewport });
    },

    setIsTransitioning: (isTransitioning: boolean) => {
      set({ isTransitioning });
    },

    hasViewportCached: (viewport: Viewport): boolean => {
      const viewportKey = getViewportKey(viewport);
      return get().viewportMarkers.has(viewportKey);
    },

    getMarkersForViewport: (viewport: Viewport): MapDataPoint[] => {
      const viewportKey = getViewportKey(viewport);
      const markerIds = get().viewportMarkers.get(viewportKey);

      if (!markerIds) {
        console.log(
          `[MarkerStore] No cached markers for viewport ${viewportKey}`
        );
        return [];
      }

      const markers: MapDataPoint[] = [];
      markerIds.forEach((id) => {
        const marker = get().markers.get(id);
        if (marker) {
          markers.push(marker);
        }
      });

      console.log(
        `[MarkerStore] Retrieved ${markers.length} markers for viewport ${viewportKey}`
      );
      return markers;
    },

    filterMarkers: (
      viewport: Viewport,
      filterCriteria: FilterCriteria
    ): MapDataPoint[] => {
      // Get all markers for the viewport
      const allMarkers = get().getMarkersForViewport(viewport);

      // Apply filters
      return allMarkers.filter((marker) => {
        // Filter by favorites if enabled
        if (
          filterCriteria.showFavoritesOnly &&
          !filterCriteria.favoriteIds.has(marker.id)
        ) {
          return false;
        }

        // Filter by category if not in "All" mode
        if (
          !filterCriteria.isAllCategoriesMode &&
          marker.category &&
          !filterCriteria.categories.includes(marker.category)
        ) {
          return false;
        }

        // Filter by open now
        if (filterCriteria.openNow && marker.openNow === false) {
          return false;
        }

        // Filter by price level
        if (
          marker.priceLevel !== undefined &&
          !filterCriteria.priceLevel.includes(marker.priceLevel)
        ) {
          return false;
        }

        // Filter by minimum rating
        if (
          filterCriteria.minimumRating !== null &&
          (marker.rating === undefined ||
            marker.rating < filterCriteria.minimumRating)
        ) {
          return false;
        }

        // Marker passed all filters
        return true;
      });
    },

    clearCache: () => {
      set({
        markers: new Map(),
        viewportMarkers: new Map(),
        visibleMarkers: [],
        newMarkerIds: new Set(),
      });
      console.log('[MarkerStore] Cache cleared');
    },
  }))
);
