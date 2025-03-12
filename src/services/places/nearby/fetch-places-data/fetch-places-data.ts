import { NEARBY_CONFIG } from '@/constants/nearby';
import { redis } from '@/lib/redis';
import type { PlacesResponse, Place } from '@/types/places';
import { log } from '@/utils/log';
import { setCacheResults } from '../cache-results/cache-results';
import { fetchAndProcessGoogleData } from '../fetch-and-process-google-data/fetch-and-process-google-data';

/**
 * Fetches places data from cache or Google Places API as needed.
 *
 * This function:
 * 1. Attempts to retrieve data from the cache if a valid cache key is provided and bypassCache is false
 * 2. If cache data is insufficient or unavailable, fetches data from the Google Places API
 * 3. Caches the results for future requests if a valid cache key is provided
 * 4. Returns the places data in a standardized format
 *
 * @param props - Parameters for fetching places data
 * @param props.textQuery - Text query to search for places (e.g., "restaurants", "coffee shops")
 * @param props.location - Location in the format "latitude,longitude"
 * @param props.openNow - Whether to only return places that are currently open
 * @param props.limit - Maximum number of places to return (defaults to NEARBY_CONFIG.DEFAULT_LIMIT)
 * @param props.bufferMiles - Buffer distance in miles to extend the search radius (defaults to NEARBY_CONFIG.DEFAULT_BUFFER_MILES)
 * @param props.cacheKey - Cache key for storing and retrieving results (if null, caching is skipped)
 * @param props.bypassCache - Whether to bypass the cache and fetch directly from the API (defaults to false)
 *
 * @returns A {@link PlacesResponse} object containing:
 *   - data: Array of simplified place objects with emoji markers
 *   - count: Number of places in the response
 *   - cacheHit: Whether the data was retrieved from cache
 */
export async function fetchPlacesData({
  textQuery,
  location,
  openNow,
  limit = NEARBY_CONFIG.DEFAULT_LIMIT,
  bufferMiles = NEARBY_CONFIG.DEFAULT_BUFFER_MILES,
  cacheKey,
  bypassCache = false,
}: {
  textQuery: string;
  location: string;
  openNow?: boolean;
  limit?: number;
  bufferMiles?: number;
  cacheKey: string | null;
  bypassCache?: boolean;
}): Promise<PlacesResponse> {
  let cachedData: Place[] | null = null;

  // Only attempt cache operations if cacheKey is non-null and bypassCache is false
  if (!bypassCache && cacheKey) {
    cachedData = await redis.get<Place[]>(cacheKey);
    if (cachedData) {
      log.success(`Cache hit with ${cachedData.length} places`, { cacheKey });
      if (!limit || cachedData.length >= limit) {
        return {
          cacheHit: true,
          data: cachedData,
          count: cachedData.length,
        };
      }
      log.debug('Cached data insufficient, fetching more', {
        limit,
        cachedCount: cachedData.length,
      });
    } else {
      log.debug('Cache miss', { cacheKey });
    }
  } else if (!cacheKey) {
    log.info('Skipping cache due to null cacheKey');
  }

  // Fetch from Google Places API
  log.info('Fetching from Google Places API', { textQuery, location });
  const processedPlaces = await fetchAndProcessGoogleData({
    textQuery,
    location,
    openNow,
    limit,
    bufferMiles,
  });

  // Cache results only if cacheKey is non-null
  if (cacheKey) {
    await setCacheResults({ cacheKey, processedPlaces });
  } else {
    log.info('Skipping cache set due to null cacheKey');
  }

  return processedPlaces;
}
