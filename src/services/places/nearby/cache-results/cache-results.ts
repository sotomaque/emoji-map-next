import { CACHE_EXPIRATION_TIME, redis } from '@/lib/redis';
import type { PlacesResponse } from '@/types/local-places-types';
import { isValidLocation } from '@/utils/geo/geo';

/**
 * Props for the cacheResults function
 */
type Props = {
  /**
   * The cache key to store the results under.
   * Should be in the format 'places-v2:{latitude},{longitude}'
   */
  cacheKey: string;

  /** Array of processed places to cache */
  processedPlaces: PlacesResponse;
};

/**
 * Validates if a cache key is properly formatted
 * @param key The cache key to validate
 * @returns True if the key is valid, false otherwise
 *
 * A valid key must:
 * 1. Start with 'places-v2:' prefix
 * 2. Have a location suffix in the format '{latitude},{longitude}'
 *    - Both latitude and longitude must be present
 *    - At least one of them must be a valid number
 */
function isValidCacheKey(key: string): boolean {
  // Key should start with 'places-v2:' prefix
  if (!key.startsWith('places-v2:')) {
    return false;
  }

  // Extract the location part (after the prefix)
  const locationPart = key.substring('places-v2:'.length);

  // Validate the location part using the shared utility function
  return isValidLocation(locationPart);
}

/**
 * Caches processed place results in Redis
 *
 * @param cacheKey - The key to store the results under (should be in format 'places-v2:{latitude},{longitude}')
 * @param processedPlaces - The processed place results to cache
 *
 * @remarks
 * This function will not cache results if:
 * - The processedPlaces array is empty or null
 * - The cacheKey is not properly formatted (should be 'places-v2:{latitude},{longitude}')
 *   where both latitude and longitude are present and at least one is a valid number
 */
export async function setCacheResults({ cacheKey, processedPlaces }: Props) {
  // Validate input parameters
  if (!processedPlaces || !processedPlaces.count) {
    console.error('[API] No processed places to cache');
    return;
  }

  if (!isValidCacheKey(cacheKey)) {
    console.error('[API] Invalid cache key format:', cacheKey);
    return;
  }

  try {
    await redis.set(cacheKey, processedPlaces, { ex: CACHE_EXPIRATION_TIME });
    console.log(
      `[API] Successfully cached ${processedPlaces.count} places with key: ${cacheKey}`
    );
  } catch (error) {
    console.error('[API] Error caching results:', error);
  }
}
