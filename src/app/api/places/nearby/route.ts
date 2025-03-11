import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { buildTextQueryFromKeys } from '@/services/places/nearby/build-text-query-from-string/build-text-query-from-string';
import { setCacheResults } from '@/services/places/nearby/cache-results/cache-results';
import { fetchAndProcessGoogleData } from '@/services/places/nearby/fetch-and-process-google-data/fetch-and-process-google-data';
import { generateCacheKey } from '@/services/places/nearby/generate-cache-key/generate-cache-key';
import { getSearchParams } from '@/services/places/nearby/get-search-params/get-search-params';
import type { PlacesResponse } from '@/types/local-places-types';

// Define a typed error response
interface ErrorResponse {
  error: string;
}

// Configuration constants
const DEFAULT_LIMIT = 20;
const DEFAULT_BUFFER_MILES = 10;

// Logger utility (simplified, replace with a real logger like Winston in prod)
const log = {
  info: (message: string, meta?: Record<string, unknown>) =>
    console.log(`[API] ${message}`, meta ? JSON.stringify(meta) : ''),
  error: (message: string, error: unknown) =>
    console.error(`[API] ${message}`, error),
};

/**
 * Fetches places data from cache or Google Places API as needed.
 */
async function fetchPlacesData({
  textQuery,
  location,
  openNow,
  limit = DEFAULT_LIMIT,
  bufferMiles = DEFAULT_BUFFER_MILES,
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
  let cachedData: PlacesResponse | null = null;

  // Only attempt cache operations if cacheKey is non-null and bypassCache is false
  if (!bypassCache && cacheKey) {
    cachedData = await redis.get<PlacesResponse>(cacheKey);
    if (cachedData) {
      log.info(`Cache hit with ${cachedData.count} places`, { cacheKey });
      if (!limit || cachedData.count >= limit) {
        return { ...cachedData, cacheHit: true };
      }
      log.info('Cached data insufficient, fetching more', {
        limit,
        cachedCount: cachedData.count,
      });
    } else {
      log.info('Cache miss', { cacheKey });
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

/**
 * API route handler for fetching places data (v2).
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<PlacesResponse | ErrorResponse>> {
  try {
    const { keys, location, bypassCache, openNow, limit, bufferMiles } =
      getSearchParams(request);

    // no keys - default to all categories
    if (!location) {
      return NextResponse.json(
        { error: 'Missing required parameter: location' },
        { status: 400 }
      );
    }

    // At this point, keys will always be valid (either user-provided valid keys or all keys from CATEGORY_MAP)
    const textQuery = buildTextQueryFromKeys(keys);
    const cacheKey = generateCacheKey({ location: location! }); // Non-null assertion after validation

    const placesData = await fetchPlacesData({
      textQuery,
      location: location!,
      openNow,
      limit,
      bufferMiles,
      cacheKey,
      bypassCache,
    });

    return NextResponse.json(placesData);
  } catch (error) {
    log.error('Error processing request', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

// Export config for Next.js (e.g., disable body parser if not needed)
export const config = {
  api: {
    bodyParser: false,
  },
};
