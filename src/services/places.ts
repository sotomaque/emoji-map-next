// Basic coordinate interface
export interface Coordinate {
  latitude: number;
  longitude: number;
}

// Basic place interface
export interface Place {
  placeId: string;
  name: string;
  coordinate: Coordinate;
  category: string;
  description?: string;
  priceLevel?: number;
  openNow?: boolean;
  rating?: number;
  sourceKeyword?: string;
}

// Parameters for fetching places
export interface PlacesParams {
  latitude: number;
  longitude: number;
  radius?: number;
  bounds?: {
    ne: { lat: number; lng: number };
    sw: { lat: number; lng: number };
  };
  categories?: string[];
  openNow?: boolean;
  priceLevel?: number[];
  minimumRating?: number;
  refetchTrigger?: number;
}

// Map data point interface for Google Maps
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

// Define a shared categories constant similar to the Swift app
export const categories: [string, string, string][] = [
  ['🍕', 'pizza', 'restaurant'],
  ['🍺', 'beer', 'bar'],
  ['🍣', 'sushi', 'restaurant'],
  ['☕️', 'coffee', 'cafe'],
  ['🍔', 'burger', 'restaurant'],
  ['🌮', 'mexican', 'restaurant'],
  ['🍜', 'ramen', 'restaurant'],
  ['🥗', 'salad', 'restaurant'],
  ['🍦', 'dessert', 'restaurant'],
  ['🍷', 'wine', 'bar'],
  ['🍲', 'asian_fusion', 'restaurant'],
  ['🥪', 'sandwich', 'restaurant'],
];

// Map of categories to emojis
export const categoryEmojis: Record<string, string> = Object.fromEntries(
  categories.map(([emoji, keyword]) => [keyword, emoji])
);

// Map of categories to types
export const categoryTypes: Record<string, string> = Object.fromEntries(
  categories.map(([, keyword, type]) => [keyword, type])
);

// Function to fetch places from the API
export async function fetchPlaces(
  params: Omit<PlacesParams, 'refetchTrigger'>
): Promise<Place[]> {
  console.log('[places] Fetching places with params:', params);

  // Build the API URL
  const searchParams = new URLSearchParams();

  // Add required parameters
  searchParams.append('location', `${params.latitude},${params.longitude}`);
  searchParams.append('type', 'restaurant'); // Default type

  // Add optional parameters
  if (params.radius) {
    searchParams.append('radius', params.radius.toString());
  }

  if (params.bounds) {
    const { ne, sw } = params.bounds;
    searchParams.append('bounds', `${ne.lat},${ne.lng}|${sw.lat},${sw.lng}`);
  }

  if (params.categories && params.categories.length > 0) {
    searchParams.append('keywords', params.categories.join(','));
  }

  if (params.openNow) {
    searchParams.append('openNow', 'true');
  }

  if (params.priceLevel && params.priceLevel.length > 0) {
    searchParams.append('priceLevel', params.priceLevel.join(','));
  }

  if (params.minimumRating) {
    searchParams.append('minimumRating', params.minimumRating.toString());
  }

  // Make the request to our API
  const url = `/api/places/nearby?${searchParams.toString()}`;
  console.log('[places] API URL:', url);

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('[places] API error:', data);
      throw new Error(data.error || 'Failed to fetch places');
    }

    return data.places || [];
  } catch (error) {
    console.error('[places] Fetch error:', error);
    throw error;
  }
}

// Function to convert places to map data points
export function placesToMapDataPoints(places: Place[]): MapDataPoint[] {
  return places.map((place) => {
    // Get the emoji for the category, or use a default
    const emoji = categoryEmojis[place.category] || '📍';

    return {
      id: place.placeId,
      position: {
        lat: place.coordinate.latitude,
        lng: place.coordinate.longitude,
      },
      emoji,
      title: place.name,
      category: place.category,
      priceLevel: place.priceLevel,
      openNow: place.openNow,
      rating: place.rating,
    };
  });
}
