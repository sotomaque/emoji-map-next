import { NEARBY_CONFIG } from '@/constants/nearby';
import { redis } from '@/lib/redis';
import type { PlacesResponse } from '@/types/places';
import { isValidLocation } from '@/utils/geo/geo';
import { log } from '@/utils/log';

/**
 * Props for the cacheResults function
 */
type Props = {
  /**
   * The cache key to store the results under.
   * Should be in the format 'places:v2:{latitude},{longitude}'
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
 * 1. Start with 'places:v1:' prefix
 * 2. Have a location suffix in the format '{latitude},{longitude}'
 *    - Both latitude and longitude must be present
 *    - At least one of them must be a valid number
 */
function isValidCacheKey(key: string): boolean {
  // Key should start with 'places:${version}:' prefix
  if (
    !key.startsWith(
      `${NEARBY_CONFIG.CACHE_KEY}:${NEARBY_CONFIG.CACHE_KEY_VERSION}:`
    )
  ) {
    return false;
  }

  // Extract the location part (after the prefix)
  const locationPart = key.substring(
    `${NEARBY_CONFIG.CACHE_KEY}:${NEARBY_CONFIG.CACHE_KEY_VERSION}:`.length
  );

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
 * - sets the entire processedPlaces object in redis
 *
 * @remarks
 * - This function sets the entire processedPlaces object in redis
 * - i.e. { cacheHit: true, count: 10, data: [{id: '123', location: {latitude: 123, longitude: 456}, photo_id: '123', emoji: '🍕'}, ...]}
 */
export async function setCacheResults({ cacheKey, processedPlaces }: Props) {
  // Validate input parameters
  if (!processedPlaces || !processedPlaces.count) {
    log.error('[API] No processed places to cache', { processedPlaces });
    return;
  }

  if (!isValidCacheKey(cacheKey)) {
    log.error('[API] Invalid cache key format:', { cacheKey });
    return;
  }

  try {
    await redis.set(cacheKey, processedPlaces.data, {
      ex: NEARBY_CONFIG.CACHE_EXPIRATION_TIME,
    });
    log.info('[API] Successfully cached', {
      cacheKey,
      count: processedPlaces.count,
    });
  } catch (error) {
    log.error('[API] Error caching results:', { error });
  }
}
