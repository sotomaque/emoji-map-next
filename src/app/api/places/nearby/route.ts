import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { chunk } from 'lodash-es';
import { buildTextQueryFromKeys } from '@/services/places/nearby/build-text-query-from-string/build-text-query-from-string';
import { fetchPlacesData } from '@/services/places/nearby/fetch-places-data/fetch-places-data';
import { generateCacheKey } from '@/services/places/nearby/generate-cache-key/generate-cache-key';
import { getSearchParams } from '@/services/places/nearby/get-search-params/get-search-params';
import type { ErrorResponse } from '@/types/error-response';
import type { PlacesResponse } from '@/types/places';
import { log } from '@/utils/log';

// IDEA:
// i pass two keys
// i make two requests
// but cache both

// TODO:
// - add support for filtering by price levels ($, $$, $$$, $$$$)
// - add support for filtering by minimumRating
// - make ios app pass radiusMeters

/**
 * Nearby Places API Route Handler
 *
 * GET endpoint to fetch nearby places based on search parameters:
 * - location (required): Latitude/longitude coordinates
 * - keys: Category keys to filter places by (defaults to all categories)
 * - openNow: Filter for currently open places
 * - limit: Maximum number of results to return
 * - radiusMeters: Search radius in meters
 * - bypassCache: Force fresh data fetch
 *
 * The handler:
 * 1. Validates required parameters
 * 2. Builds text query from category keys
 * 3. Generates cache key from location
 * 4. Fetches places data (from cache if available)
 * 5. Returns formatted places response
 *
 * @param {NextRequest} request - Next.js API request object
 * @returns {Promise<NextResponse>} JSON response with places data or error
 * @throws Will return 400 if location parameter is missing
 * @throws Will return 500 for any other errors during processing
 */

// Maximum number of keys to include in a single batch
const MAX_KEYS_PER_BATCH = 2;

export async function GET(
  request: NextRequest
): Promise<NextResponse<PlacesResponse | ErrorResponse>> {
  try {
    const { keys, location, bypassCache, openNow, limit, radiusMeters } =
      getSearchParams(request);

    if (!location) {
      return NextResponse.json(
        { error: 'Missing required parameter: location' },
        { status: 400 }
      );
    }

    // If we have more than MAX_KEYS_PER_BATCH keys, we need to batch the requests
    if (keys && keys.length > MAX_KEYS_PER_BATCH) {
      // Split keys into batches of MAX_KEYS_PER_BATCH
      const keyBatches = chunk(keys, MAX_KEYS_PER_BATCH);

      // Process each batch in parallel
      const batchPromises = keyBatches.map(async (keyBatch) => {
        const textQuery = buildTextQueryFromKeys(keyBatch);
        const cacheKey = generateCacheKey({
          location: location!,
          keys: keyBatch,
        });

        return fetchPlacesData({
          textQuery,
          location: location!,
          openNow,
          limit,
          radiusMeters,
          cacheKey,
          bypassCache,
          keys: keyBatch,
        });
      });

      // Wait for all batches to complete
      const batchResults = await Promise.all(batchPromises);

      // Merge the results from all batches
      const mergedResults: PlacesResponse = {
        data: [],
        count: 0,
        cacheHit: batchResults.every((result) => result.cacheHit),
      };

      // Combine all the data from each batch
      for (const result of batchResults) {
        // Add unique places (avoid duplicates by checking IDs)
        for (const place of result.data) {
          if (!mergedResults.data.some((p) => p.id === place.id)) {
            mergedResults.data.push(place);
          }
        }
      }

      // Update the count
      mergedResults.count = mergedResults.data.length;

      return NextResponse.json(mergedResults);
    }

    // Standard flow for requests with few keys
    // At this point, keys will always be valid (either user-provided valid keys or all keys from CATEGORY_MAP)
    const textQuery = buildTextQueryFromKeys(keys);

    // TODO: double check cache key is working
    // prefix:version:location:keys
    // i.e. `places:v1:40.71,-74.01:1,2,3`
    const cacheKey = generateCacheKey({ location: location!, keys }); // Non-null assertion after validation

    // i.e. { id: 'places/123', location: { latitude: 40.71, longitude: -74.01 }, emoji: '🍵' }
    const placesData = await fetchPlacesData({
      textQuery,
      location: location!,
      openNow,
      limit,
      radiusMeters,
      cacheKey,
      bypassCache,
      keys,
    });

    return NextResponse.json(placesData);
  } catch (error) {
    log.error(`[API] Error processing request`, { error });

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
