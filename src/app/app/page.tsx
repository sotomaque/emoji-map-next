'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useGateValue } from '@statsig/react-bindings';
import EmojiSelectorSkeleton from '@/components/map/emoji-selector/emoji-selector-skeleton';
import MapSkeleton from '@/components/map/map-skeleton';
import { FEATURE_FLAGS } from '@/constants/feature-flags';
import { usePlaces, useCurrentLocation } from '@/hooks/usePlaces/usePlaces';
import {
  useMarkerStore,
  type Viewport,
  type FilterCriteria,
} from '@/store/markerStore';
import { useFiltersStore } from '@/store/useFiltersStore';

// Dynamically import the EmojiSelector component with no SSR
const EmojiSelector = dynamic(
  () => import('@/components/map/emoji-selector/emoji-selector'),
  {
    ssr: false,
    loading: () => <EmojiSelectorSkeleton />,
  }
);

// Dynamically import the GoogleMap component with no SSR
const GoogleMap = dynamic(() => import('@/components/map/map'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

// Main page component that handles feature flag check
export default function AppPage() {
  const router = useRouter();
  const IS_APP_ENABLED = useGateValue(FEATURE_FLAGS.ENABLE_APP);

  // Use useEffect for client-side redirects
  useEffect(() => {
    if (!IS_APP_ENABLED) {
      router.push('/');
    }
  }, [IS_APP_ENABLED, router]);

  // If app is not enabled, render nothing or a loading state
  if (!IS_APP_ENABLED) {
    return null;
  }

  // If app is enabled, render the app content
  return <AppContent />;
}

// Separate component for app content to avoid conditional hook calls
function AppContent() {
  // Get filters from Zustand store
  const {
    selectedCategoryKeys,
    showFavoritesOnly,
    isAllCategoriesMode,
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
  const [favoriteMarkerIds] = useState<Set<string>>(new Set());

  // Get user location
  const { data: locationData } = useCurrentLocation();

  // Update user location when available
  useEffect(() => {
    if (locationData) {
      setUserLocation(locationData);
    }
  }, [locationData, setUserLocation]);

  // Determine category keys to use for API request
  const categoryKeysToUse = isAllCategoriesMode
    ? [] // Empty array when in "All" mode (either no categories or all categories selected)
    : selectedCategoryKeys;

  console.log({ categoryKeysToUse });

  // Use viewport center for API request if available, otherwise use user location
  const searchLocation = zustandViewport.center || userLocation;

  // Refs for debounce timeouts
  const boundsChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const centerChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const filtersChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track if we're currently panning the map
  const isPanningRef = useRef(false);

  // Track if we need to refetch due to filter changes
  const needsRefetchRef = useRef(false);

  // Fetch places based on filters and viewport
  const { refetch } = usePlaces({
    latitude: searchLocation?.lat || 0,
    longitude: searchLocation?.lng || 0,
    radius: 5000, // 5km
    bounds: zustandViewport.bounds || undefined,
    categoryKeys: categoryKeysToUse,
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
    setVisibleMarkers,
    setCurrentViewport,
    setIsTransitioning,
    hasViewportCached,
    filterMarkers,
  } = useMarkerStore();

  // Convert Zustand viewport to our Viewport type
  const currentViewport: Viewport = useMemo(
    () => ({
      center: zustandViewport.center,
      bounds: zustandViewport.bounds,
      zoom: zustandViewport.zoom,
    }),
    [zustandViewport]
  );

  // Create filter criteria object
  const filterCriteria: FilterCriteria = useMemo(
    () => ({
      categories: selectedCategoryKeys.map((key) => key.toString()), // Convert to strings for compatibility
      isAllCategoriesMode,
      showFavoritesOnly,
      favoriteIds: favoriteMarkerIds,
      openNow,
      priceLevel,
      minimumRating,
    }),
    [
      selectedCategoryKeys,
      isAllCategoriesMode,
      showFavoritesOnly,
      favoriteMarkerIds,
      openNow,
      priceLevel,
      minimumRating,
    ]
  );

  // Handle refetch with transition state
  const handleRefetchWithTransition = useCallback(
    async (viewport: Viewport) => {
      if (!searchLocation) return;

      // Set transitioning state to true
      setIsTransitioning(true);

      try {
        // Refetch data - this will fetch ALL categories regardless of user selection
        // and then we'll filter them client-side based on the selected categories
        const result = await refetch();
        console.log('[AppPage] Data refetched successfully');

        // If we have data, update the marker store
        if (result.data && result.data.mapDataPoints) {
          // Store all markers in the cache (unfiltered)
          setMarkers(result.data.mapDataPoints, viewport);

          // Apply filters to determine which markers to show
          const filteredMarkers = filterMarkers(filterCriteria);

          // Update visible markers
          setVisibleMarkers(filteredMarkers);

          console.log(
            `[AppPage] Showing ${filteredMarkers.length} filtered markers out of all accumulated markers in the store`
          );
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
    },
    [
      searchLocation,
      refetch,
      setMarkers,
      filterMarkers,
      filterCriteria,
      setVisibleMarkers,
      setIsTransitioning,
    ]
  );

  // Apply filters locally when filter criteria change but viewport remains the same
  useEffect(() => {
    // Skip if we don't have a current viewport or if the viewport isn't cached
    if (!currentViewport || !hasViewportCached(currentViewport)) {
      // Mark that we need to refetch when the viewport changes
      needsRefetchRef.current = true;
      return;
    }

    // Clear any existing timeout
    if (filtersChangeTimeoutRef.current) {
      clearTimeout(filtersChangeTimeoutRef.current);
    }

    // Debounce filter application to prevent too many updates
    filtersChangeTimeoutRef.current = setTimeout(() => {
      console.log('[AppPage] Applying filters locally');

      // Apply filters locally
      const filteredMarkers = filterMarkers(filterCriteria);

      // Update visible markers without making a network request
      setVisibleMarkers(filteredMarkers);

      console.log(`[AppPage] Filtered to ${filteredMarkers.length} markers`);
    }, 300); // 300ms debounce for local filtering

    return () => {
      if (filtersChangeTimeoutRef.current) {
        clearTimeout(filtersChangeTimeoutRef.current);
      }
    };
  }, [
    filterCriteria,
    currentViewport,
    hasViewportCached,
    filterMarkers,
    setVisibleMarkers,
  ]);

  // Handle map bounds changed
  const handleBoundsChanged = useCallback(
    (bounds: google.maps.LatLngBounds | null) => {
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

          // Apply filters to the cached markers
          const filteredMarkers = filterMarkers(filterCriteria);

          // Update visible markers
          setVisibleMarkers(filteredMarkers);

          console.log(
            `[AppPage] Showing ${filteredMarkers.length} filtered markers`
          );

          // Even though we have markers, we should still fetch new ones for this viewport
          // to ensure we have the most up-to-date data
          // We'll do this in the background without showing a loading state
          console.log(
            '[AppPage] Fetching additional markers for this viewport in the background'
          );
          refetch()
            .then((result) => {
              if (result.data && result.data.mapDataPoints) {
                // Add the new markers to the store
                setMarkers(result.data.mapDataPoints, newViewport);

                // Apply filters again with the new markers
                const updatedFilteredMarkers = filterMarkers(filterCriteria);

                // Update visible markers
                setVisibleMarkers(updatedFilteredMarkers);

                console.log(
                  `[AppPage] Updated with ${result.data.mapDataPoints.length} additional markers, now showing ${updatedFilteredMarkers.length} filtered markers`
                );
              }
            })
            .catch((error) => {
              console.error(
                '[AppPage] Error fetching additional markers:',
                error
              );
            });
        } else {
          console.log('[AppPage] Fetching new markers for this viewport');
          // Trigger refetch with transition
          handleRefetchWithTransition(newViewport);
          // Reset the needs refetch flag
          needsRefetchRef.current = false;
        }
      }, 1000); // 1000ms debounce (1 second)
    },
    [
      setViewportBounds,
      zustandViewport.center,
      zustandViewport.zoom,
      setCurrentViewport,
      hasViewportCached,
      filterMarkers,
      filterCriteria,
      setVisibleMarkers,
      refetch,
      setMarkers,
      handleRefetchWithTransition,
    ]
  );

  // Handle map center changed
  const handleCenterChanged = useCallback(
    (center: { lat: number; lng: number }) => {
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

          // Apply filters to the cached markers
          const filteredMarkers = filterMarkers(filterCriteria);

          // Update visible markers
          setVisibleMarkers(filteredMarkers);

          console.log(
            `[AppPage] Showing ${filteredMarkers.length} filtered markers`
          );
        } else {
          console.log('[AppPage] Fetching new markers for this viewport');
          // Trigger refetch with transition
          handleRefetchWithTransition(newViewport);
          // Reset the needs refetch flag
          needsRefetchRef.current = false;
        }
      }, 1000); // 1000ms debounce (1 second)
    },
    [
      zustandViewport,
      setViewportCenter,
      setCurrentViewport,
      hasViewportCached,
      filterMarkers,
      filterCriteria,
      setVisibleMarkers,
      handleRefetchWithTransition,
    ]
  );

  // Handle map zoom changed
  const handleZoomChanged = useCallback(
    (zoom: number) => {
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
    },
    [zustandViewport, setViewportZoom, setCurrentViewport]
  );

  // Handle map click
  const handleMapClick = useCallback(() => {}, []);

  // Handle marker click
  const handleMarkerClick = useCallback(() => {}, []);

  return (
    <div className='flex flex-col h-screen'>
      <div className='flex justify-center'>
        <div className='absolute top-0 z-50 py-4'>
          <EmojiSelector onShuffleClick={() => {}} isLoading={false} />
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
