import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import filter from 'lodash/filter';
import map from 'lodash/map';
import { env } from '@/env';
import { findMatchingKeyword, createSimplifiedPlace } from '@/lib/places-utils';
import {
  redis,
  CACHE_EXPIRATION_TIME,
  generatePlacesTextSearchCacheKey,
} from '@/lib/redis';
import { categoryEmojis } from '@/services/places';
import type {
  GooglePlace,
  NearbyPlace,
  PlacesSearchTextRequest,
  PlacesSearchTextResponse,
} from '@/types/places';

/**
 * Validates the request parameters
 * @param textQuery - The search query
 * @param location - The location in format "lat,lng"
 * @returns An error response if validation fails, null otherwise
 */
function validateRequest(textQuery: string | null, location: string | null) {
  if (!textQuery) {
    return NextResponse.json(
      { error: 'Missing required parameter: textQuery' },
      { status: 400 }
    );
  }

  if (!location) {
    return NextResponse.json(
      { error: 'Missing required parameter: location' },
      { status: 400 }
    );
  }

  return null;
}

/**
 * Attempts to get data from cache
 * @param cacheKey - The cache key
 * @param maxResults - The maximum number of results to return
 * @returns The cached data if available and sufficient, null otherwise
 */
async function getCachedData(cacheKey: string | null, maxResults: number) {
  if (cacheKey === null) {
    console.log('[API] No valid cache key generated, skipping cache');
    return null;
  }

  try {
    const cachedData = await redis.get<NearbyPlace[]>(cacheKey);

    if (!cachedData) {
      console.log(`[API] Cache miss for key: ${cacheKey}`);
      return null;
    }

    console.log(`[API] Cache hit for key: ${cacheKey}`);

    if (cachedData.length < maxResults) {
      console.log(
        `[API] Cache hit has only ${cachedData.length} results, but ${maxResults} were requested`
      );
      return null;
    }

    console.log(
      `[API] Returning ${maxResults} cached results out of ${cachedData.length} total`
    );
    return cachedData.slice(0, maxResults);
  } catch (redisError) {
    console.error('[API] Error accessing Redis cache:', redisError);
    return null;
  }
}

/**
 * Prepares the request body for the Google Places API
 * @param textQuery - The search query
 * @param location - The location in format "lat,lng"
 * @param radius - The search radius in meters
 * @param bounds - The bounds in format "lat1,lng1|lat2,lng2"
 * @param maxResults - The maximum number of results to return
 * @returns The request body for the Google Places API
 */
function prepareGoogleRequestBody(
  textQuery: string,
  location: string,
  radius: string,
  bounds: string | null,
  maxResults: number
): PlacesSearchTextRequest {
  const requestBody: PlacesSearchTextRequest = {
    textQuery,
    maxResultCount: maxResults,
  };

  // Add location parameters
  const [lat, lng] = location.split(',').map(Number);
  if (!isNaN(lat) && !isNaN(lng)) {
    requestBody.locationBias = {
      circle: {
        center: {
          latitude: lat,
          longitude: lng,
        },
        radius: parseInt(radius, 10),
      },
    };
  }

  // Add bounds if provided (this will override radius)
  if (bounds) {
    // Validate bounds format: should be "lat1,lng1|lat2,lng2"
    const boundsRegex =
      /^-?\d+(\.\d+)?,-?\d+(\.\d+)?\|-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;
    if (boundsRegex.test(bounds)) {
      const [southwest, northeast] = bounds.split('|');
      const [swLat, swLng] = southwest.split(',').map(Number);
      const [neLat, neLng] = northeast.split(',').map(Number);

      if (!isNaN(swLat) && !isNaN(swLng) && !isNaN(neLat) && !isNaN(neLng)) {
        requestBody.locationBias = {
          rectangle: {
            low: {
              latitude: swLat,
              longitude: swLng,
            },
            high: {
              latitude: neLat,
              longitude: neLng,
            },
          },
        };
      }
    } else {
      console.warn(
        `[API] Invalid bounds format: ${bounds}, using radius instead`
      );
    }
  }

  return requestBody;
}

/**
 * Fetches data from Google Places API
 * @param requestBody - The request body for the Google Places API
 * @returns The response from Google Places API or an error response
 */
async function fetchFromGoogle(requestBody: PlacesSearchTextRequest) {
  console.log('[API] Fetching from Google Places API');

  const apiKey = env.GOOGLE_PLACES_API_KEY;
  const baseUrl = env.GOOGLE_PLACES_V2_URL;

  try {
    const response = await fetch(`${baseUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Goog-FieldMask': '*',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!data.places || !Array.isArray(data.places)) {
      console.error('[API] Invalid response from Google Places API:', data);
      return NextResponse.json(
        { error: 'Failed to process request' },
        { status: 500 }
      );
    }

    console.log(
      `[API] Received ${data.places.length} results from Google Places API`
    );
    return data;
  } catch (error) {
    console.error('[API] Error fetching from Google Places API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

/**
 * Processes the response from Google Places API
 * @param data - The response from Google Places API
 * @param keywords - The keywords to match
 * @param lowercaseKeywords - The lowercase keywords to match
 * @returns The processed places
 */
function processGoogleResponse(
  data: PlacesSearchTextResponse,
  keywords: string[],
  lowercaseKeywords: string[]
) {
  // Process the places to add category and emoji and filter fields
  const processedPlaces = map(data.places, (place: GooglePlace) => {
    // Find the first keyword that matches any of the place's properties
    const matchedKeyword = findMatchingKeyword(
      place,
      keywords,
      lowercaseKeywords
    );

    // If no keyword match was found, skip this place
    if (!matchedKeyword) {
      return { id: undefined } as unknown as NearbyPlace;
    }

    // Get the emoji for the category from our mapping
    const emoji = categoryEmojis[matchedKeyword];

    if (!emoji) {
      console.error(`[API] No emoji found for category: ${matchedKeyword}`);
      return { id: undefined } as unknown as NearbyPlace;
    }

    // Create a simplified place object with only the fields we care about
    return createSimplifiedPlace(place, matchedKeyword, emoji);
  });

  // Filter out places with undefined id
  const filteredPlaces = filter(
    processedPlaces,
    (place: Partial<NearbyPlace>) => place.id !== undefined
  );

  console.log(
    `[API] Processed and filtered to ${filteredPlaces.length} valid results`
  );
  return filteredPlaces;
}

/**
 * Caches the processed results
 * @param cacheKey - The cache key
 * @param filteredPlaces - The processed places
 * @param bypassCache - Whether to bypass the cache
 */
async function cacheResults(
  cacheKey: string | null,
  filteredPlaces: NearbyPlace[],
  bypassCache: boolean
) {
  if (filteredPlaces.length === 0 || bypassCache || cacheKey === null) {
    return;
  }

  try {
    console.log(
      `[API] Caching ${filteredPlaces.length} results with key: ${cacheKey}`
    );
    await redis.set(cacheKey, filteredPlaces, { ex: CACHE_EXPIRATION_TIME });
  } catch (redisError) {
    console.error('[API] Error caching results:', redisError);
    // Continue without caching if we can't set the cache
  }
}

/**
 * @swagger
 * /api/places/nearby/places-new:
 *   get:
 *     summary: Search for places using Google Places API searchText method
 *     description: Searches for places using the Google Places API searchText method
 *     tags:
 *       - places
 *     parameters:
 *       - name: textQuery
 *         in: query
 *         required: true
 *         description: The search query, can use pipe character for multiple types (e.g., "Indian|Mexican")
 *         schema:
 *           type: string
 *         example: "Indian|Mexican"
 *       - name: location
 *         in: query
 *         description: Latitude and longitude in format "lat,lng"
 *         schema:
 *           type: string
 *         example: "37.7749,-122.4194"
 *       - name: radius
 *         in: query
 *         description: Search radius in meters
 *         schema:
 *           type: string
 *         example: "5000"
 *       - name: bounds
 *         in: query
 *         description: Bounds in format "lat1,lng1|lat2,lng2"
 *         schema:
 *           type: string
 *         example: "37.7,-122.5|37.8,-122.3"
 *       - name: maxResults
 *         in: query
 *         description: Maximum number of results to return
 *         schema:
 *           type: string
 *         example: "50"
 *     responses:
 *       200:
 *         description: List of places matching the criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 places:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Bad request - missing required parameters
 *       500:
 *         description: Server error
 */
export async function GET(request: NextRequest) {
  try {
    // Get parameters from the URL query string
    const url = new URL(request.url);
    const textQuery = url.searchParams.get('textQuery');
    const location = url.searchParams.get('location');
    const radius = url.searchParams.get('radius') || '5000';
    const bounds = url.searchParams.get('bounds');
    const maxResults = parseInt(url.searchParams.get('maxResults') || '50', 10);
    const bypassCache = url.searchParams.get('bypassCache') === 'true';

    // Validate required parameters
    const validationError = validateRequest(textQuery, location);
    if (validationError) {
      return validationError;
    }

    // Log request parameters
    console.log('[API] Processing places-new request with:', {
      textQuery,
      location,
      radius,
      bounds,
      maxResults,
    });

    // Extract keywords from the textQuery (split by pipe character)
    const keywords = textQuery!
      .split('|')
      .map((k: string) => k.trim().toLowerCase());
    // Pre-compute lowercase keywords for efficient matching
    const lowercaseKeywords = keywords.map((keyword) => keyword.toLowerCase());

    // Generate a cache key based on the request parameters
    const cacheKey = generatePlacesTextSearchCacheKey({
      textQuery: textQuery!,
      location,
      radius,
      bounds,
    });

    // Try to get data from cache if not bypassing cache
    if (!bypassCache) {
      const cachedResults = await getCachedData(cacheKey, maxResults);
      if (cachedResults) {
        return NextResponse.json({
          places: cachedResults,
          count: cachedResults.length,
        });
      }
    } else {
      console.log('[API] Skipping cache, fetching directly from Google');
    }

    // Prepare the request body for Google Places API
    const requestBody = prepareGoogleRequestBody(
      textQuery!,
      location!,
      radius,
      bounds,
      maxResults
    );

    // Fetch data from Google Places API
    const googleResponse = await fetchFromGoogle(requestBody);

    // If the response is an error, return it
    if (googleResponse instanceof NextResponse) {
      return googleResponse;
    }

    // Process the response from Google Places API
    const filteredPlaces = processGoogleResponse(
      googleResponse,
      keywords,
      lowercaseKeywords
    );

    // Cache the results for future requests
    await cacheResults(cacheKey, filteredPlaces, bypassCache);

    // Return the results
    return NextResponse.json({
      places: filteredPlaces,
      count: filteredPlaces.length,
    });
  } catch (error) {
    console.error('[API] Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
/*
TODO

Invalid Location Format: When the location parameter is provided in an invalid format (not "lat,lng"), the code attempts to parse it but doesn't handle the case where parsing fails gracefully. The [lat, lng] = location.split(',').map(Number) operation will result in NaN values, which are then checked with !isNaN(lat) && !isNaN(lng), but this could be more robust.
Inconsistent Cache Behavior: If the cache has some results but fewer than requested (maxResults), the code fetches from Google but doesn't combine the cached results with the new results. This means we might be making unnecessary API calls when we already have some valid data.
No Validation of maxResults: The code doesn't validate that maxResults is a reasonable value. If a user provides a very large number, it could lead to excessive API usage or performance issues.
Potential Race Condition: If multiple requests come in for the same data at the same time when the cache is empty, multiple calls to the Google API could be made for the same data before any of them complete and cache the results.
Error Handling for Redis Operations: While the route has a general try/catch block, it doesn't specifically handle Redis errors that might occur during redis.set() operations.
Keyword Matching Logic: The findMatchingKeyword function returns the first keyword that matches, but this might not always be the most relevant match. For example, if a place has both "Mexican" and "Restaurant" in its name and the query is "Mexican|Restaurant", it will always match "Mexican" even if "Restaurant" might be more appropriate in some cases.
Cache Expiration Time: The cache expiration time is set to a fixed value (7 days based on the import), which might not be appropriate for all types of places data. Some data might need to be refreshed more frequently.
No Pagination Support: The API doesn't support pagination, which could be an issue for queries that return a large number of results.
Redundant Lowercase Conversion: The code converts keywords to lowercase twice - once when creating the keywords array and again when creating the lowercaseKeywords array. This is inefficient.
Potential Memory Issues: If the Google API returns a very large number of places, the code processes all of them in memory, which could lead to performance issues.
No Rate Limiting: There's no rate limiting for the API, which could lead to excessive usage of the Google Places API if the endpoint is called frequently.
Lack of Proper Error Responses: The error responses could be more informative. For example, when the Google API returns an error, the response just says "Failed to fetch places" without providing more details.
Potential Type Issues: The code uses type assertions like as unknown as NearbyPlace which could hide type errors.
Fallback Response: The fallback response at the end of the route should never be reached based on the logic, but it's still there. This could indicate a logical error or a misunderstanding of the code flow.

*/
