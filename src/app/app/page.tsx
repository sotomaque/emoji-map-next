'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useFiltersStore } from '@/store/useFiltersStore';
import { usePlaces, useCurrentLocation } from '@/hooks/usePlaces';
import type { MapDataPoint } from '@/services/places';
import EmojiSelectorSkeleton from '@/components/map/EmojiSelectorSkeleton';
import MapSkeleton from '@/components/map/MapSkeleton';
import { useMarkerStore, type Viewport } from '@/store/markerStore';

// Dynamically import the EmojiSelector component with no SSR
const EmojiSelector = dynamic(() => import('@/components/map/EmojiSelector'), {
  ssr: false,
  loading: () => <EmojiSelectorSkeleton />
});

// Dynamically import the GoogleMap component with no SSR
const GoogleMap = dynamic(() => import('@/components/map/GoogleMap'), {
  ssr: false,
  loading: () => <MapSkeleton />
});

export default function AppPage() {
  // Get filters from Zustand store
  const {
    selectedCategories,
    showFavoritesOnly,
    isAllCategoriesMode,
    getAllCategoryKeywords,
    openNow,
    priceLevel,
    minimumRating,
    userLocation,
    viewport: zustandViewport,
    setUserLocation,
    setViewportCenter,
    setViewportBounds,
    setViewportZoom,
  } = useFiltersStore();

  // Local state for favorites
  const [favoriteMarkerIds, setFavoriteMarkerIds] = useState<Set<string>>(
    new Set()
  );

  // Get user location
  const { data: locationData, isLoading: isLoadingLocation } =
    useCurrentLocation();

  // Update user location when available
  useEffect(() => {
    if (locationData) {
      setUserLocation(locationData);
    }
  }, [locationData, setUserLocation]);

  // Determine categories to use for API request
  const categoriesToUse = isAllCategoriesMode
    ? getAllCategoryKeywords()
    : selectedCategories;

  // Use viewport center for API request if available, otherwise use user location
  const searchLocation = zustandViewport.center || userLocation;

  // Refs for debounce timeouts
  const boundsChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const centerChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track if we're currently panning the map
  const isPanningRef = useRef(false);

  // Create a persistent marker cache to track which markers have already been rendered
  // const markerCacheRef = useRef(new Map<string, MapDataPoint>());

  // Track the previous viewport for comparison
  // const prevViewportRef = useRef({...});

  // Fetch places based on filters and viewport
  const {
    isLoading: isLoadingPlaces,
    refetch,
  } = usePlaces({
    latitude: searchLocation?.lat || 0,
    longitude: searchLocation?.lng || 0,
    radius: 5000, // 5km
    bounds: zustandViewport.bounds || undefined,
    categories: categoriesToUse,
    openNow,
    priceLevel,
    minimumRating: minimumRating || undefined,
  });

  // Get marker store functions - only destructure what we need
  const {
    visibleMarkers: markers,
    newMarkerIds,
    isTransitioning,
    setMarkers,
    setCurrentViewport,
    setIsTransitioning,
    hasViewportCached,
    getMarkersForViewport,
    clearCache,
  } = useMarkerStore();

  // Convert Zustand viewport to our Viewport type
  const currentViewport: Viewport = useMemo(() => ({
    center: zustandViewport.center,
    bounds: zustandViewport.bounds,
    zoom: zustandViewport.zoom,
  }), [zustandViewport]);

  // Handle map bounds changed
  const handleBoundsChanged = useCallback((bounds: google.maps.LatLngBounds | null) => {
    if (!bounds) return;

    // Clear any existing timeout
    if (boundsChangeTimeoutRef.current) {
      clearTimeout(boundsChangeTimeoutRef.current);
    }

    // Set panning flag
    isPanningRef.current = true;

    // Convert Google Maps bounds to the format expected by the store
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const newBounds = {
      ne: { lat: ne.lat(), lng: ne.lng() },
      sw: { lat: sw.lat(), lng: sw.lng() },
    };

    // Update the viewport in Zustand
    setViewportBounds(newBounds);

    // Create a new viewport object
    const newViewport: Viewport = {
      center: zustandViewport.center,
      bounds: newBounds,
      zoom: zustandViewport.zoom,
    };

    // Update the current viewport in the marker store
    setCurrentViewport(newViewport);

    // Debounce the API call to prevent too many requests while panning
    boundsChangeTimeoutRef.current = setTimeout(() => {
      isPanningRef.current = false;
      console.log('[AppPage] Bounds change debounce complete');

      // Check if we already have markers for this viewport
      if (hasViewportCached(newViewport)) {
        console.log('[AppPage] Using cached markers for this viewport');
        // No need to fetch, just use the cached markers
        const cachedMarkers = getMarkersForViewport(newViewport);

        // Apply any filters if needed
        const filteredMarkers = showFavoritesOnly
          ? cachedMarkers.filter((marker) => favoriteMarkerIds.has(marker.id))
          : cachedMarkers;

        // Update visible markers
        setMarkers(filteredMarkers, newViewport);
      } else {
        console.log('[AppPage] Fetching new markers for this viewport');
        // Trigger refetch with transition
        handleRefetchWithTransition(newViewport);
      }
    }, 500); // 500ms debounce
  }, [
    zustandViewport,
    setViewportBounds,
    setCurrentViewport,
    hasViewportCached,
    getMarkersForViewport,
    showFavoritesOnly,
    favoriteMarkerIds,
    setMarkers
  ]);

  // Handle map center changed
  const handleCenterChanged = useCallback((center: { lat: number; lng: number }) => {
    // Only update center if we're not already panning
    // This prevents duplicate API calls since bounds change also fires
    if (isPanningRef.current) {
      console.log('[AppPage] Skipping center change during active panning');
      return;
    }

    // Update viewport center in Zustand
    setViewportCenter(center);

    // Create a new viewport object
    const newViewport: Viewport = {
      center,
      bounds: zustandViewport.bounds,
      zoom: zustandViewport.zoom,
    };

    // Update the current viewport in the marker store
    setCurrentViewport(newViewport);

    // Clear any existing timeout
    if (centerChangeTimeoutRef.current) {
      clearTimeout(centerChangeTimeoutRef.current);
    }

    // Debounce the API call
    centerChangeTimeoutRef.current = setTimeout(() => {
      console.log('[AppPage] Center change debounce complete');

      // Check if we already have markers for this viewport
      if (hasViewportCached(newViewport)) {
        console.log('[AppPage] Using cached markers for this viewport');
        // No need to fetch, just use the cached markers
        const cachedMarkers = getMarkersForViewport(newViewport);

        // Apply any filters if needed
        const filteredMarkers = showFavoritesOnly
          ? cachedMarkers.filter((marker) => favoriteMarkerIds.has(marker.id))
          : cachedMarkers;

        // Update visible markers
        setMarkers(filteredMarkers, newViewport);
      } else {
        console.log('[AppPage] Fetching new markers for this viewport');
        // Trigger refetch with transition
        handleRefetchWithTransition(newViewport);
      }
    }, 500); // 500ms debounce
  }, [
    zustandViewport,
    setViewportCenter,
    setCurrentViewport,
    hasViewportCached,
    getMarkersForViewport,
    showFavoritesOnly,
    favoriteMarkerIds,
    setMarkers
  ]);

  // Handle map zoom changed
  const handleZoomChanged = useCallback((zoom: number) => {
    console.log('[AppPage] Zoom changed:', zoom);

    // Update viewport zoom in Zustand
    setViewportZoom(zoom);

    // Create a new viewport object
    const newViewport: Viewport = {
      center: zustandViewport.center,
      bounds: zustandViewport.bounds,
      zoom,
    };

    // Update the current viewport in the marker store
    setCurrentViewport(newViewport);

    // We don't trigger a refetch here as the bounds change will handle that
  }, [zustandViewport, setViewportZoom, setCurrentViewport]);

  // Handle refetch with transition state
  const handleRefetchWithTransition = useCallback(async (viewport: Viewport) => {
    if (!searchLocation) return;

    // Set transitioning state to true
    setIsTransitioning(true);

    try {
      // Refetch data
      const result = await refetch();
      console.log('[AppPage] Data refetched successfully');

      // If we have data, update the marker store
      if (result.data && result.data.mapDataPoints) {
        // Apply any filters if needed
        const filteredMarkers = showFavoritesOnly
          ? result.data.mapDataPoints.filter((marker) => favoriteMarkerIds.has(marker.id))
          : result.data.mapDataPoints;

        // Update the marker store
        setMarkers(filteredMarkers, viewport);
      }

      // Add a small delay before removing transition state
      // This gives time for the new markers to prepare for animation
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    } catch (error) {
      console.error('[AppPage] Error refetching data:', error);
      setIsTransitioning(false);
    }
  }, [searchLocation, refetch, showFavoritesOnly, favoriteMarkerIds, setMarkers, setIsTransitioning]);

  // Handle shuffle click (refetch data)
  const handleShuffleClick = useCallback(() => {
    console.log('Shuffle clicked');

    // Clear the marker cache
    clearCache();

    // Trigger a refetch with transition
    handleRefetchWithTransition(currentViewport);
  }, [clearCache, handleRefetchWithTransition, currentViewport]);

  // Handle map click
  const handleMapClick = useCallback(() => {
    console.log('Map clicked');
    // Close any open info windows or perform other actions
  }, []);

  // Handle marker click
  const handleMarkerClick = useCallback((marker: MapDataPoint) => {
    console.log('Marker clicked:', marker);
    // Toggle favorite status
    setFavoriteMarkerIds((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(marker.id)) {
        newFavorites.delete(marker.id);
      } else {
        newFavorites.add(marker.id);
      }
      return newFavorites;
    });
  }, []);

  // Loading state
  const isLoading = isLoadingLocation || isLoadingPlaces;

  return (
    <div className='flex flex-col h-screen'>
      <div className='flex justify-center'>
        <div className='absolute top-0 z-50 py-4'>
          <EmojiSelector
            onShuffleClick={handleShuffleClick}
            isLoading={isLoading}
          />
        </div>
      </div>

      <div className='flex-grow relative'>
        <GoogleMap
          markers={markers}
          onMapClick={handleMapClick}
          onMarkerClick={handleMarkerClick}
          onBoundsChanged={handleBoundsChanged}
          onCenterChanged={handleCenterChanged}
          onZoomChanged={handleZoomChanged}
          initialCenter={userLocation || undefined}
          initialZoom={zustandViewport.zoom}
          isTransitioning={isTransitioning}
          newMarkerIds={newMarkerIds}
        />
      </div>
    </div>
  );
}
