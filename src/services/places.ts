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
  ["🍕", "pizza", "restaurant"],
  ["🍺", "beer", "bar"],
  ["🍣", "sushi", "restaurant"],
  ["☕️", "coffee", "cafe"],
  ["🍔", "burger", "restaurant"],
  ["🌮", "mexican", "restaurant"],
  ["🍜", "ramen", "restaurant"],
  ["🥗", "salad", "restaurant"],
  ["🍦", "dessert", "restaurant"],
  ["🍷", "wine", "bar"],
  ["🍲", "asian_fusion", "restaurant"],
  ["🥪", "sandwich", "restaurant"]
];

// Map of categories to emojis
export const categoryEmojis: Record<string, string> = Object.fromEntries(
  categories.map(([emoji, keyword]) => [keyword, emoji])
);

// Map of categories to types
export const categoryTypes: Record<string, string> = Object.fromEntries(
  categories.map(([, keyword, type]) => [keyword, type])
);

// Function to fetch places from our API
export async function fetchPlaces(params: PlacesParams): Promise<Place[]> {
  try {
    console.log('[fetchPlaces] Fetching places with params:', params);
    
    // Build the query parameters
    const queryParams = new URLSearchParams();
    
    // Add location
    queryParams.append('location', `${params.latitude},${params.longitude}`);
    
    // Add radius if provided
    if (params.radius) {
      queryParams.append('radius', params.radius.toString());
    }
    
    // Add bounds if provided (this will override radius)
    if (params.bounds) {
      const { ne, sw } = params.bounds;
      queryParams.append('bounds', `${sw.lat},${sw.lng}|${ne.lat},${ne.lng}`);
    }
    
    // Determine the type based on categories
    let type = 'restaurant'; // Default type
    
    // Add keywords based on categories
    // If categories is empty or undefined, we're in "All" mode and should use all categories
    const keywordsToUse = params.categories && params.categories.length > 0 
      ? params.categories 
      : categories.map(([, name]) => name); // Use all category names in "All" mode
    
    // Get the type for the first category or use default
    if (keywordsToUse.length > 0) {
      const firstCategoryType = categoryTypes[keywordsToUse[0]] || 'restaurant';
      type = firstCategoryType;
    }
    
    // Add all keywords
    queryParams.append('keywords', keywordsToUse.join(','));
    
    // Add the type
    queryParams.append('type', type);
    
    // Add open now if provided
    if (params.openNow) {
      queryParams.append('openNow', 'true');
    }
    
    console.log('[fetchPlaces] Using type:', type);
    console.log('[fetchPlaces] Using keywords:', keywordsToUse.join(','));
    
    // Make the request to our API
    const url = `/api/places/nearby?${queryParams.toString()}`;
    console.log('[fetchPlaces] Requesting:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[fetchPlaces] Received', data.places?.length || 0, 'places');
    
    // Filter by price level if provided
    let filteredPlaces = data.places || [];
    
    if (params.priceLevel && params.priceLevel.length > 0) {
      filteredPlaces = filteredPlaces.filter(
        (place: Place) => place.priceLevel && params.priceLevel?.includes(place.priceLevel)
      );
    }
    
    // Filter by minimum rating if provided
    if (params.minimumRating) {
      filteredPlaces = filteredPlaces.filter(
        (place: Place) => place.rating && place.rating >= (params.minimumRating || 0)
      );
    }
    
    console.log('[fetchPlaces] Returning', filteredPlaces.length, 'places after filtering');
    return filteredPlaces;
  } catch (error) {
    console.error('[fetchPlaces] Error fetching places:', error);
    return [];
  }
}

// Function to convert places to map data points
export function placesToMapDataPoints(places: Place[]): MapDataPoint[] {
  return places.map(place => {
    console.log('place', place);
    // Get the emoji for the category, or use a default
    const emoji = categoryEmojis[place.category] || '📍';
    
    return {
      id: place.placeId,
      position: {
        lat: place.coordinate.latitude,
        lng: place.coordinate.longitude
      },
      emoji,
      title: place.name,
      category: place.category,
      priceLevel: place.priceLevel,
      openNow: place.openNow,
      rating: place.rating
    };
  });
} 