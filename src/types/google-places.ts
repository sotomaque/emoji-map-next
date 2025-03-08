// Location type
export interface Location {
  lat: number;
  lng: number;
}

// Geometry type
export interface Geometry {
  location: Location;
}

// Opening hours type
export interface OpeningHours {
  open_now?: boolean;
}

// Place result from Google Places API
export interface PlaceResult {
  place_id: string;
  name: string;
  geometry: Geometry;
  vicinity: string;
  price_level?: number;
  opening_hours?: OpeningHours;
  rating?: number;
}

// Google Places API response
export interface GooglePlacesResponse {
  results: PlaceResult[];
  status: string;
  error_message?: string;
}

// Our transformed Place model - matches the iOS app's Place model
export interface Place {
  placeId: string;
  name: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  category: string;
  description: string;
  priceLevel?: number | null;
  openNow?: boolean | null;
  rating?: number | null;
}
