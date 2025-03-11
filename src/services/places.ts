import { env } from '@/env';
import type { PlacesResponse, SimplifiedMapPlace } from '@/types/local-places-types';

// Parameters for fetching places
export interface PlacesParams {
  latitude: number;
  longitude: number;
  radius?: number;
  bounds?: {
    ne: { lat: number; lng: number };
    sw: { lat: number; lng: number };
  };
  categoryKeys?: number[];
  openNow?: boolean;
  priceLevel?: number[];
  minimumRating?: number;
  refetchTrigger?: number;
}

// Google Maps compatible marker interface
export interface GoogleMapsMarker {
  id: string;
  position: { lat: number; lng: number };
  emoji: string;
  title: string;
  category?: string;
}

/**
 * Fetches places from the API based on the provided parameters
 */
export async function fetchPlaces(params: PlacesParams): Promise<SimplifiedMapPlace[]> {
  const { latitude, longitude, categoryKeys, openNow } = params;
  
  // Build the URL with query parameters
  const url = new URL(`${env.NEXT_PUBLIC_SITE_URL}/api/places/nearby`);
  
  // Add location parameter (required)
  url.searchParams.append('location', `${latitude},${longitude}`);
  
  // Add keys parameter only if specific categories are selected
  if (categoryKeys && categoryKeys.length > 0) {
    // Filter out any invalid keys (should be numbers between 1-25 based on CATEGORY_MAP)
    const validKeys = categoryKeys.filter(key => 
      typeof key === 'number' && key >= 1 && key <= 25
    );
    
    if (validKeys.length > 0) {
      // Add each key as a separate 'key' parameter instead of a single comma-separated 'keys' parameter
      validKeys.forEach(key => {
        url.searchParams.append('key', key.toString());
      });
    }
  }
  
  // Add optional parameters
  if (openNow !== undefined) {
    url.searchParams.append('openNow', openNow.toString());
  }
  
  // Fetch data from the API
  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as PlacesResponse;
    return data.places;
  } catch (error) {
    console.error('Error fetching places:', error);
    throw error;
  }
}

/**
 * Converts SimplifiedMapPlace objects to GoogleMapsMarker objects for use with Google Maps
 */
export function placesToGoogleMapsMarkers(places: SimplifiedMapPlace[]): GoogleMapsMarker[] {
  return places.map(place => ({
    id: place.id,
    position: { 
      lat: place.location.latitude, 
      lng: place.location.longitude 
    },
    emoji: place.emoji,
    title: place.id,
    category: place.category,
  }));
}
