'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback } from 'react';
import { useFiltersStore } from '@/src/store/useFiltersStore';
import { usePlaces, useCurrentLocation } from '@/src/hooks/usePlaces';
import type { MapDataPoint } from '@/src/services/places';

// Dynamically import the EmojiSelector component with no SSR
const EmojiSelector = dynamic(() => import('@/src/components/map/EmojiSelector'), {
  ssr: false,
  loading: () => (
    <div className="h-32 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center justify-center">
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  )
});

// Dynamically import the GoogleMap component with no SSR
const GoogleMap = dynamic(() => import('@/src/components/map/GoogleMap'), {
  ssr: false,
  loading: () => (
    <div className="flex-grow flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🗺️</div>
        <h2 className="text-2xl font-semibold mb-2">Loading Map...</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Preparing your emoji map experience
        </p>
      </div>
    </div>
  )
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
    viewport,
    setUserLocation,
    setViewportCenter,
    setViewportBounds,
    setViewportZoom
  } = useFiltersStore();

  // Local state for favorites
  const [favoriteMarkerIds, setFavoriteMarkerIds] = useState<Set<string>>(new Set());

  // Get user location
  const { data: locationData, isLoading: isLoadingLocation } = useCurrentLocation();

  // Set user location when available
  useEffect(() => {
    if (locationData) {
      setUserLocation(locationData);
    }
  }, [locationData, setUserLocation]);

  // Determine categories to use for API request
  const categoriesToUse = isAllCategoriesMode ? getAllCategoryKeywords() : selectedCategories;

  // Use viewport center for API request if available, otherwise use user location
  const searchLocation = viewport.center || userLocation;

  // Fetch places based on filters and viewport
  const { data, isLoading: isLoadingPlaces, refetch } = usePlaces({
    latitude: searchLocation?.lat || 0,
    longitude: searchLocation?.lng || 0,
    radius: 5000, // 5km
    bounds: viewport.bounds || undefined,
    categories: categoriesToUse,
    openNow,
    priceLevel,
    minimumRating: minimumRating || undefined
  });

  // Refetch data when filters or viewport changes
  useEffect(() => {
    console.log('[AppPage] Filters or viewport changed, refetching data:', {
      categories: categoriesToUse,
      location: searchLocation,
      viewport
    });

    // Use a debounce to prevent too many API calls
    const timer = setTimeout(() => {
      if (searchLocation) {
        refetch();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [categoriesToUse, openNow, priceLevel, minimumRating, searchLocation, viewport.bounds, refetch]);

  // Filter markers based on favorites if needed
  const markers = showFavoritesOnly
    ? (data?.mapDataPoints || []).filter(marker => favoriteMarkerIds.has(marker.id))
    : (data?.mapDataPoints || []);

  // Handle shuffle click (refetch data)
  const handleShuffleClick = useCallback(() => {
    console.log('Shuffling places...');
    refetch();
  }, [refetch]);

  // Handle map click
  const handleMapClick = useCallback(() => {
    console.log('Map clicked');
    // Close any open info windows or perform other actions
  }, []);

  // Handle marker click
  const handleMarkerClick = useCallback((marker: MapDataPoint) => {
    console.log('Marker clicked:', marker);
    // Toggle favorite status
    setFavoriteMarkerIds(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(marker.id)) {
        newFavorites.delete(marker.id);
      } else {
        newFavorites.add(marker.id);
      }
      return newFavorites;
    });
  }, []);

  // Handle bounds changed
  const handleBoundsChanged = useCallback((bounds: google.maps.LatLngBounds | null) => {
    if (bounds) {
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();

      // Debounce bounds updates to prevent too many state changes
      const newBounds = {
        ne: { lat: ne.lat(), lng: ne.lng() },
        sw: { lat: sw.lat(), lng: sw.lng() }
      };

      // Only update if the bounds have changed significantly
      if (!viewport.bounds ||
        Math.abs(newBounds.ne.lat - viewport.bounds.ne.lat) > 0.001 ||
        Math.abs(newBounds.ne.lng - viewport.bounds.ne.lng) > 0.001 ||
        Math.abs(newBounds.sw.lat - viewport.bounds.sw.lat) > 0.001 ||
        Math.abs(newBounds.sw.lng - viewport.bounds.sw.lng) > 0.001) {
        setViewportBounds(newBounds);
        console.log('[AppPage] Map bounds changed:', newBounds);
      }
    }
  }, [viewport.bounds, setViewportBounds]);

  // Handle center changed
  const handleCenterChanged = useCallback((center: { lat: number; lng: number }) => {
    // Only update if the center has changed significantly
    if (!viewport.center ||
      Math.abs(center.lat - viewport.center.lat) > 0.001 ||
      Math.abs(center.lng - viewport.center.lng) > 0.001) {
      setViewportCenter(center);
      console.log('[AppPage] Map center changed:', center);
    }
  }, [viewport.center, setViewportCenter]);

  // Handle zoom changed
  const handleZoomChanged = useCallback((zoom: number) => {
    if (zoom !== viewport.zoom) {
      setViewportZoom(zoom);
      console.log('[AppPage] Map zoom changed:', zoom);
    }
  }, [viewport.zoom, setViewportZoom]);

  // Loading state
  const isLoading = isLoadingLocation || isLoadingPlaces;

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow relative">
        <GoogleMap
          markers={markers}
          onMapClick={handleMapClick}
          onMarkerClick={handleMarkerClick}
          onBoundsChanged={handleBoundsChanged}
          onCenterChanged={handleCenterChanged}
          onZoomChanged={handleZoomChanged}
          initialCenter={userLocation || undefined}
          initialZoom={viewport.zoom}
        />
      </div>
      <div className="h-32 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <EmojiSelector
          onShuffleClick={handleShuffleClick}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
