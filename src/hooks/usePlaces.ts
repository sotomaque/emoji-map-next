import { useQuery } from '@tanstack/react-query';
import {
  type PlacesParams,
  fetchPlaces,
} from '../services/places';

// Hook for fetching places based on parameters
export function usePlaces(params: PlacesParams) {
  // Extract refetchTrigger from params to include in queryKey
  const { refetchTrigger, ...apiParams } = params;

  // Separate viewport parameters from filter parameters
  const { latitude, longitude, radius, bounds } = apiParams;

  // Create a viewport key for the query
  const viewportKey = {
    latitude,
    longitude,
    radius,
    bounds: bounds ? JSON.stringify(bounds) : undefined,
  };

  return useQuery({
    // Only include viewport parameters in the query key
    // This ensures that changes to filter parameters don't trigger a refetch
    queryKey: ['places', viewportKey, refetchTrigger],
    queryFn: async () => {
      try {
        console.log('[usePlaces] Fetching places with params:', apiParams);

        // Fetch places from the API with all parameters
        const places = await fetchPlaces(apiParams);

        return {
          places,
          mapDataPoints: places, // No transformation needed, using SimplifiedMapPlace directly
        };
      } catch (error) {
        console.error(
          '[usePlaces] Error fetching or processing places:',
          error
        );
        // Re-throw the error so React Query can handle it
        throw new Error(
          error instanceof Error ? error.message : 'Failed to fetch places'
        );
      }
    },
    enabled: Boolean(apiParams.latitude && apiParams.longitude), // Only enable if we have location
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1, // Only retry once on failure
  });
}

// Type for useCurrentLocation options
interface UseCurrentLocationOptions {
  onSuccess?: (location: { lat: number; lng: number } | null) => void;
}

// Hook for getting user location
export function useCurrentLocation(options?: UseCurrentLocationOptions) {
  return useQuery({
    queryKey: ['userLocation'],
    queryFn: async (): Promise<{ lat: number; lng: number } | null> => {
      return new Promise<{ lat: number; lng: number } | null>((resolve) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              console.log('[useCurrentLocation] Got user location:', location);
              resolve(location);
            },
            (error) => {
              console.error(
                '[useCurrentLocation] Error getting location:',
                error
              );
              resolve(null);
            },
            {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0,
            }
          );
        } else {
          console.error('[useCurrentLocation] Geolocation not supported');
          resolve(null);
        }
      });
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true, // Always refetch on mount to handle permission changes
    ...(options?.onSuccess
      ? {
          gcTime: 0, // Needed for onSuccess to work properly in React Query v5
        }
      : {}),
  });
}
