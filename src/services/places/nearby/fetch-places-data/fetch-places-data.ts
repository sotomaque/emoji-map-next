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
 * @param props.limit - Maximum number of results to return (defaults to NEARBY_CONFIG.DEFAULT_LIMIT)
 * @param props.radiusMeters - Radius distance in meters to extend the search radius (defaults to NEARBY_CONFIG.DEFAULT_RADIUS_METERS)
 * @param props.cacheKey - Cache key for storing and retrieving results (if null, caching is skipped)
 * @param props.bypassCache - Whether to bypass the cache and fetch directly from the API (defaults to false)
 * @param props.keys - Array of keys for fetching data from Google Places API
 * @param props.pageToken - Page token for pagination
 *
 * @returns A {@link PlacesResponse} object containing:
 *   - data: Array of simplified place objects with emoji markers
 *   - count: Number of places in the response
 *   - cacheHit: Whether the data was retrieved from cache
 *   - nextPageToken: Token for fetching the next page of results (if available)
 */
export async function fetchPlacesData({
  textQuery,
  location,
  openNow,
  limit = NEARBY_CONFIG.DEFAULT_LIMIT,
  radiusMeters = NEARBY_CONFIG.DEFAULT_RADIUS_METERS,
  cacheKey,
  bypassCache = false,
  keys,
  pageToken,
}: {
  textQuery: string;
  location: string;
  openNow?: boolean;
  limit?: number;
  radiusMeters?: number;
  cacheKey: string | null;
  bypassCache?: boolean;
  keys?: number[];
  pageToken?: string;
}): Promise<PlacesResponse> {
  // If we have a pageToken, we should bypass the cache
  if (pageToken) {
    bypassCache = true;
  }

  let cachedData: Place[] | null = null;
  // const hasFilters = !openNow; // TODO: add additional filters

  // TODO: handle open now edge case & future filters

  // Optimized for batched requests
  // Only attempt cache operations if:
  // 1. cacheKey is non-null
  // 2. bypassCache is false
  if (!bypassCache && cacheKey) {
    try {
      cachedData = await redis.get<Place[]>(cacheKey);

      if (cachedData) {
        log.success(`[CACHE HIT]`, {
          cacheKey,
        });

        // If we have enough cached data or no limit is specified, return it
        if (!limit || cachedData.length >= limit) {
          return {
            cacheHit: true,
            data: cachedData.slice(0, limit),
            count: cachedData.slice(0, limit).length,
          };
        }

        log.debug(
          `[PLACES] Cached data insufficient (${cachedData.length}/${limit}), fetching more`
        );
      } else {
        log.error(`[CACHE MISS]`, {
          cacheKey,
          keys: keys?.join(','),
        });
      }
    } catch (error) {
      log.error(`[PLACES] Error retrieving from cache`, {
        error,
        cacheKey,
      });
      // Continue with API fetch on cache error
    }
  } else {
    if (bypassCache) {
      log.info(`[PLACES] Bypassing cache as requested`);
    } else if (!cacheKey) {
      log.info(`[PLACES] Skipping cache (no cache key)`);
    }
  }
  const processedPlaces = await fetchAndProcessGoogleData({
    textQuery,
    location,
    openNow,
    limit,
    radiusMeters,
    keys,
    pageToken,
  });

  // Cache results only if cacheKey is non-null and we have data to cache
  // Don't cache results from pagination
  if (cacheKey && processedPlaces.data.length > 0 && !pageToken) {
    log.success(`[CACHE SET]`, {
      cacheKey,
      data: processedPlaces.data,
    });
    await setCacheResults({ cacheKey, processedPlaces });
  } else {
    log.error(`[CACHE SKIPPED]`, {
      cacheKey,
    });
  }

  return processedPlaces;
}
