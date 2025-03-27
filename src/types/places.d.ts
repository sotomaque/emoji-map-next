import type { CachedResponse } from './generics';

export type Place = {
  id: string;
  location: {
    latitude: number;
    longitude: number;
  };
  emoji: string;
};

/**
 * Response type for the places API endpoint
 */
export type PlacesResponse = CachedResponse<Place[]>;

/**
 * Filter Reasons
 *
 * Details filled in when processing google places response
 * and attempting to match to a place given our keywords
 *
 * output is logged for debugging purposess
 */
export interface FilterReasons {
  noKeywordMatch: number;
  defaultedToPlace: number;
  mappedToMainCategory: number;
  noEmoji: number;
}
