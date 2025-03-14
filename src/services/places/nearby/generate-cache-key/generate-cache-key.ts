import { isEmpty, sortBy } from 'lodash-es';
import { NEARBY_CONFIG } from '@/constants/nearby';
import { isValidLocation } from '@/utils/geo/geo';
import { log } from '@/utils/log';
import { normalizeLocation } from '@/utils/redis/cache-utils';

/**
 * Generate a cache key for the places API
 *
 * @param {Object} params - The parameters object
 * @param {string} params.location - The location string in format "latitude,longitude"
 * @param {number[]} [params.keys] - Optional array of category keys to filter by
 * @returns {string | null} A formatted cache key string or null if the location is invalid
 *
 * @remarks
 * - We only cache based on location and category keys
 * - This allows us to reuse cached results for different text queries
 * - The function normalizes the location by rounding coordinates to 4 decimal places
 * - Returns null for invalid locations to prevent caching with improper keys
 * - Valid cache keys will be in the format 'places:${version}:{latitude},{longitude}:{keys}'
 * - Category keys are sorted numerically to ensure consistent cache keys
 */
export function generateCacheKey({
  location,
  keys,
}: {
  location: string;
  keys?: number[];
}): string | null {
  // Validate the location format
  if (!isValidLocation(location)) {
    return null;
  }

  // Normalize the location by rounding the coordinates
  const normalizedLocation = normalizeLocation(location, 4);

  const cacheKey = `${NEARBY_CONFIG.CACHE_KEY}:${NEARBY_CONFIG.CACHE_KEY_VERSION}:${normalizedLocation}`;

  if (!keys || isEmpty(keys)) {
    log.error('[GENERATE CACHE KEY] No keys provided');
    return cacheKey;
  }

  // i.e. [1,2,3] and [3,2,1] should be the same cache key
  const sortedKeys = sortBy(keys);

  return `${cacheKey}:${sortedKeys.join(',')}`;
}
