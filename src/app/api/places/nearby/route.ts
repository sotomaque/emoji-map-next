import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { buildTextQueryFromKeys } from '@/services/places/nearby/build-text-query-from-string/build-text-query-from-string';
import { fetchPlacesData } from '@/services/places/nearby/fetch-places-data/fetch-places-data';
import { generateCacheKey } from '@/services/places/nearby/generate-cache-key/generate-cache-key';
import { getSearchParams } from '@/services/places/nearby/get-search-params/get-search-params';
import type { ErrorResponse } from '@/types/error-response';
import type { PlacesResponse } from '@/types/places';
import { log } from '@/utils/log';

/**
 * API route handler for fetching places data (v2).
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<PlacesResponse | ErrorResponse>> {
  try {
    // i.e. { keys: ['coffee'], location: '40.71,-74.01', bypassCache: false, openNow: false, limit: 10, bufferMiles: 10 }
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

    // i.e. `places:v1:40.71,-74.01`
    const cacheKey = generateCacheKey({ location: location! }); // Non-null assertion after validation

    // i.e. { id: 'places/123', location: { latitude: 40.71, longitude: -74.01 }, emoji: '🍵' }
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
