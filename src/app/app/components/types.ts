import type { Dispatch, SetStateAction } from 'react';
import type { DetailResponse } from '@/types/details';
import type { PhotosResponse } from '@/types/google-photos';
import type { PlacesResponse } from '@/types/places';
import type { UseQueryResult } from '@tanstack/react-query';

// Define interfaces for the nested objects in the response
export interface TextObject {
  text: string;
  languageCode?: string;
}

export interface CurrentOpeningHours {
  openNow: boolean;
  periods?: unknown[];
  weekdayDescriptions?: string[];
}

export interface GenerativeSummary {
  overview: TextObject;
}

// Define an interface for the enhanced response that includes version and meta
export interface EnhancedDetailResponse extends DetailResponse {
  version?: string;
  meta?: {
    timestamp: string;
    requestId: string;
    params: {
      id: string;
      bypassCache: boolean;
      version: string;
    };
  };
}

// Define an interface for the enhanced places response
export interface EnhancedPlacesResponse extends PlacesResponse {
  version?: string;
  meta?: {
    timestamp: string;
    requestId: string;
    params: {
      location: string;
      textQuery: string;
      limit: number;
      bypassCache: boolean;
      openNow: boolean;
      version: string;
    };
  };
}

// Props for NearbyPlacesSection component
export interface NearbyPlacesSectionProps {
  location: string;
  setLocation: (value: string) => void;
  keysQuery: string;
  setKeysQuery: (value: string) => void;
  limit: number;
  setLimit: (value: number) => void;
  bypassCache: boolean;
  setBypassCache: (value: boolean) => void;
  openNow: boolean;
  setOpenNow: (value: boolean) => void;
  gettingLocation: boolean;
  locationError: string | null;
  getCurrentLocation: () => void;
  showRawJson: boolean;
  setShowRawJson: (value: boolean) => void;
  selectedPriceLevels: number[];
  setSelectedPriceLevels: Dispatch<SetStateAction<number[]>>;
  minimumRating: number | null;
  setMinimumRating: Dispatch<SetStateAction<number | null>>;
  nearbyPlacesQuery: UseQueryResult<PlacesResponse, Error>;
  handleGetDetails: (id: string) => void;
  handleGetPhotos: (id: string) => void;
  handleClearNearbyPlaces: () => void;
}

// Props for PlaceDetailsSection component
export interface PlaceDetailsSectionProps {
  placeId: string;
  setPlaceId: (value: string) => void;
  showRawJson: boolean;
  setShowRawJson: (value: boolean) => void;
  placeDetailsQuery: UseQueryResult<DetailResponse, Error>;
  bypassCache: boolean;
  setBypassCache: (value: boolean) => void;
  handleClearPlaceDetails: () => void;
}

// Props for PhotosSection component
export interface PhotosSectionProps {
  photoId: string;
  setPhotoId: (value: string) => void;
  showRawJson: boolean;
  setShowRawJson: (value: boolean) => void;
  photoQuery: UseQueryResult<PhotosResponse, Error>;
  bypassCache: boolean;
  setBypassCache: (value: boolean) => void;
  handleClearPhotos: () => void;
}

// Default values
export const DEFAULT_LOCATION = '40.7128,-74.0060';
export const DEFAULT_TEXT_QUERY = 'pizza|beer';
export const DEFAULT_LIMIT = 20;
export const DEFAULT_PHOTO_ID = '';
export const DEFAULT_PLACE_ID = '';
