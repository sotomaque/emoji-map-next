import { useQuery } from '@tanstack/react-query';
import { type PlacesParams, fetchPlaces, placesToMapDataPoints } from '../services/places';

// Hook for fetching places based on parameters
export function usePlaces(params: PlacesParams) {
  return useQuery({
    queryKey: ['places', params],
    queryFn: async () => {
      try {
        console.log('[usePlaces] Fetching places with params:', params);
        
        // Fetch places from the API
        const places = await fetchPlaces(params);
        
        // Convert places to map data points
        const mapDataPoints = placesToMapDataPoints(places);
        
        return {
          places,
          mapDataPoints
        };
      } catch (error) {
        console.error('[usePlaces] Error fetching or processing places:', error);
        // Re-throw the error so React Query can handle it
        throw new Error(error instanceof Error ? error.message : 'Failed to fetch places');
      }
    },
    enabled: Boolean(params.latitude && params.longitude), // Only enable if we have location
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1, // Only retry once on failure
  });
}

// Hook for getting user location
export function useCurrentLocation() {
  return useQuery({
    queryKey: ['userLocation'],
    queryFn: () => {
      return new Promise<{ lat: number; lng: number } | null>((resolve) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              console.log('[useCurrentLocation] Got user location:', location);
              resolve(location);
            },
            (error) => {
              console.error('[useCurrentLocation] Error getting location:', error);
              resolve(null);
            },
            {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
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
  });
} 