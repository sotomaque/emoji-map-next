import { isValidLocation } from '@/utils/geo/geo';
import { normalizeLocation } from '@/utils/redis/cache-utils';

// TODO: MOVE TO CONSTS
const PLACES_V2_CACHE_KEY = 'places-v2';

/**
 * Generate a cache key for the places v2 API
 *
 * @param location - The location string in format "latitude,longitude"
 * @returns A formatted cache key string or null if the location is invalid
 *
 * @remarks
 * - We only cache based on location and radius, similar to the nearby API
 * - This allows us to reuse cached results for different text queries
 * - The function normalizes the location by rounding coordinates
 * - Returns null for invalid locations to prevent caching with improper keys
 * - Valid cache keys will be in the format 'places-v2:{latitude},{longitude}'
 */
export function generateCacheKey({
  location,
}: {
  location: string;
}): string | null {
  // Validate the location format
  if (!isValidLocation(location)) {
    return null;
  }

  // Normalize the location by rounding the coordinates
  const normalizedLocation = normalizeLocation(location, 4);

  // Simplified cache key that only depends on location
  return `${PLACES_V2_CACHE_KEY}:${normalizedLocation}`;
}
