import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import filter from 'lodash/filter';
import map from 'lodash/map';
import { env } from '@/env';
import { findMatchingKeyword, createSimplifiedPlace } from '@/lib/places-utils';
import {
  redis,
  CACHE_EXPIRATION_TIME,
  generatePlacesV2CacheKey,
} from '@/lib/redis';
import { categoryEmojis } from '@/services/places';
import type {
  GooglePlace,
  NearbyPlace,
  PlacesSearchTextRequest,
  PlacesSearchTextResponse,
} from '@/types/places';

// Category mappings for richer search queries
const categoryMappings: { [key: number]: [string, string[]] } = {
  1: ["pizza", ["italian", "pepperoni", "cheese", "pasta", "calzone"]],
  2: ["beer", ["brewery", "pub", "ale", "lager", "bar"]],
  3: ["sushi", ["japanese", "sashimi", "roll", "tempura", "miso"]],
  4: ["coffee", ["cafe", "espresso", "latte", "pastry", "mocha"]],
  5: ["burger", ["fries", "diner", "cheeseburger", "shake", "grill"]],
  6: ["mexican", ["taco", "burrito", "salsa", "guacamole", "enchilada"]],
  7: ["ramen", ["noodle", "broth", "japanese", "miso", "tonkotsu"]],
  8: ["salad", ["healthy", "greens", "dressing", "veggie", "bowl"]],
  9: ["dessert", ["cake", "ice cream", "pastry", "sweet", "cookie"]],
  10: ["wine", ["vineyard", "bar", "red", "white", "tasting"]],
  11: ["asian_fusion", ["thai", "vietnamese", "korean", "chinese", "noodle"]],
  12: ["sandwich", ["deli", "sub", "bread", "panini", "lunch"]],
};

// Utility functions to access the mapping
function getCategoryByKey(key: number): string | undefined {
  return categoryMappings[key]?.[0];
}

function getRelatedWordsByKey(key: number): string[] | undefined {
  return categoryMappings[key]?.[1];
}

// Function to find the primary category for a related word
function getPrimaryCategoryForRelatedWord(word: string): string | undefined {
  // Normalize the word
  const normalizedWord = word.toLowerCase().trim();
  
  // Check if the word is already a primary category
  for (const key in categoryMappings) {
    if (categoryMappings[key][0] === normalizedWord) {
      return normalizedWord; // It's already a primary category
    }
  }
  
  // Check if the word is a related word for any category
  for (const key in categoryMappings) {
    const relatedWords = categoryMappings[key][1];
    if (relatedWords.includes(normalizedWord)) {
      return categoryMappings[key][0]; // Return the primary category
    }
    
    // Also check for partial matches
    for (const relatedWord of relatedWords) {
      if (relatedWord.includes(normalizedWord) || normalizedWord.includes(relatedWord)) {
        return categoryMappings[key][0]; // Return the primary category
      }
    }
  }
  
  // No match found
  return undefined;
}

// Function to build a textQuery from an array of category keys
export function buildTextQueryFromKeys(keys: number[]): string {
  // Get all related words for the given keys
  const allRelatedWords = keys.flatMap(key => {
    const category = getCategoryByKey(key);
    const relatedWords = getRelatedWordsByKey(key);
    
    // Include both the category name and related words
    return category && relatedWords ? [category, ...relatedWords] : [];
  });
  
  // Join with pipe separator for Google Places API
  return allRelatedWords.join('|');
}

/**
 * Validates the request parameters
 * @param keys - The category keys
 * @param textQuery - The search query (optional if keys are provided)
 * @param location - The location in format "lat,lng"
 * @returns An error response if validation fails, null otherwise
 */
function validateRequest(keys: number[] | null, textQuery: string | null, location: string | null) {
  // Either keys or textQuery must be provided
  if (!keys?.length && !textQuery) {
    return NextResponse.json(
      { error: 'Missing required parameter: either keys or textQuery must be provided' },
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
 * Attempts to get data from cache and filter by textQuery
 * @param cacheKey - The cache key
 * @param textQuery - The search query to filter by
 * @param maxResults - The maximum number of results to return
 * @returns The filtered cached data if available and sufficient, null otherwise
 */
async function getCachedData(cacheKey: string | null, textQuery: string, maxResults: number) {
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

    console.log(`[API] Cache hit for key: ${cacheKey}, found ${cachedData.length} places`);

    // Extract keywords from the textQuery (split by pipe character)
    const keywords = textQuery
      .split('|')
      .map((k: string) => k.trim().toLowerCase());
    
    // Filter cached results by the keywords
    const filteredResults = cachedData.filter((place) => {
      // Check if any of the keywords match the place
      return keywords.some((keyword) => {
        // Check if the place has a matching category or type
        const matchesCategory = place.category?.toLowerCase().includes(keyword) || false;
        const matchesType = place.primaryType?.toLowerCase().includes(keyword) || false;
        const matchesName = place.name?.toLowerCase().includes(keyword) || false;
        
        return matchesCategory || matchesType || matchesName;
      });
    });

    console.log(
      `[API] After keyword filtering: ${filteredResults.length} results from ${cachedData.length} cached items`
    );

    if (filteredResults.length === 0) {
      console.log(
        `[API] No matching results in cache for textQuery: ${textQuery}, fetching from API`
      );
      return null;
    }

    console.log(
      `[API] Returning ${Math.min(filteredResults.length, maxResults)} filtered results`
    );
    return filteredResults.slice(0, maxResults);
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
 * @param pageSize - The page size (max 20)
 * @returns The request body for the Google Places API
 */
function prepareGoogleRequestBody(
  textQuery: string,
  location: string,
  radius: string,
  bounds: string | null,
  pageSize: number
): PlacesSearchTextRequest {
  const requestBody: PlacesSearchTextRequest = {
    textQuery,
    pageSize: Math.min(pageSize, 20), // Google's limit is 20
    "rankPreference": "DISTANCE"
  };

  // Add location parameters
  const [lat, lng] = location.split(',').map(Number);
  if (!isNaN(lat) && !isNaN(lng)) {
    // Always use locationBias with circle to sort results by proximity
    // The radius parameter controls how far to search, with a maximum of 50000 meters (50km)
    const parsedRadius = Math.min(parseInt(radius, 10), 50000);
    
    requestBody.locationBias = {
      circle: {
        center: {
          latitude: lat,
          longitude: lng,
        },
        radius: parsedRadius,
      },
    };
    
    console.log(`[API] Using locationBias with circle: center=(${lat},${lng}), radius=${parsedRadius}m`);
  }

  // Add bounds if provided (this will override circle locationBias)
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
        
        console.log(`[API] Using locationBias with rectangle: SW=(${swLat},${swLng}), NE=(${neLat},${neLng})`);
      }
    } else {
      console.warn(
        `[API] Invalid bounds format: ${bounds}, using circle locationBias instead`
      );
    }
  }

  return requestBody;
}

/**
 * Fetches data from Google Places API
 * @param requestBody - The request body for the Google Places API
 * @param maxResults - The maximum number of results to return
 * @returns The response from Google Places API or an error response
 */
async function fetchFromGoogle(requestBody: PlacesSearchTextRequest, maxResults: number) {
  console.log('[API] Fetching from Google Places API');

  const apiKey = env.GOOGLE_PLACES_API_KEY;
  const baseUrl = env.GOOGLE_PLACES_V2_URL;
  
  // Set a maximum of 20 results per page (Google's limit)
  const pageSize = Math.min(20, requestBody.pageSize || 20);
  requestBody.pageSize = pageSize;
  
  // Hard limit the total number of places to 150 regardless of viewport size
  const absoluteMaxResults = Math.min(maxResults, 150);
  
  // Store all places from all pages
  let allPlaces: GooglePlace[] = [];
  // Track if we need to fetch more pages
  let nextPageToken: string | undefined;
  // Track how many pages we've fetched
  let pageCount = 0;
  // Maximum number of pages to fetch (to prevent infinite loops)
  const maxPages = Math.ceil(absoluteMaxResults / pageSize);
  
  console.log(`[API] Will fetch up to ${maxPages} pages with ${pageSize} results per page (max ${absoluteMaxResults} total places)`);

  try {
    do {
      // Add the page token to the request body if we have one
      if (nextPageToken) {
        requestBody.pageToken = nextPageToken;
        // Small delay to ensure the page token is valid
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      pageCount++;
      console.log(`[API] Fetching page ${pageCount} of results`);
      
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
        `[API] Received ${data.places.length} results from Google Places API (page ${pageCount})`
      );
      
      // Add the places from this page to our collection
      allPlaces = [...allPlaces, ...data.places];
      
      // Check if we have a next page token and should fetch more pages
      nextPageToken = data.nextPageToken;
      
      // Stop if we've reached the maximum number of results or pages
      if (allPlaces.length >= absoluteMaxResults || pageCount >= maxPages) {
        console.log(`[API] Reached limit: ${allPlaces.length} places, ${pageCount} pages`);
        break;
      }
      
    } while (nextPageToken);

    console.log(`[API] Fetched a total of ${allPlaces.length} places from ${pageCount} pages`);
    
    // Return the combined results (without the nextPageToken since we've fetched all pages)
    return { places: allPlaces };
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
  // Log the raw data received from Google
  console.log(`[API] Raw Google response contains ${data.places.length} places`);
  console.log(`[API] Using keywords: ${keywords.join(', ')}`);
  
  // Track filtering reasons for debugging
  const filterReasons = {
    noKeywordMatch: 0,
    noEmoji: 0,
    defaultedToPlace: 0,
    mappedToMainCategory: 0
  };
  
  // Keep track of places by category for analysis
  const placesByCategory: Record<string, number> = {};
  
  // Process the places to add category and emoji and filter fields
  const processedPlaces = map(data.places, (place: GooglePlace) => {
    // Log the raw place data for debugging
    console.log(`[API] Processing place: ${place.name}`, {
      id: place.id,
      primaryType: place.primaryType,
      types: place.types,
      primaryTypeDisplayName: place.primaryTypeDisplayName?.text,
      displayName: place.displayName?.text,
    });
    
    // Find the first keyword that matches any of the place's properties
    const matchedKeyword = findMatchingKeyword(
      place,
      keywords,
      lowercaseKeywords
    );

    // If no keyword match was found, use a fallback or primary type
    let categoryToUse = matchedKeyword;
    
    if (!categoryToUse) {
      filterReasons.noKeywordMatch++;
      console.log(`[API] No keyword match for place: ${place.name}`);
      
      // Try to use the primary type display name or primary type as fallback
      if (place.primaryTypeDisplayName?.text) {
        categoryToUse = place.primaryTypeDisplayName.text.toLowerCase();
        console.log(`[API] Using primaryTypeDisplayName as fallback: ${categoryToUse}`);
      } else if (place.primaryType) {
        categoryToUse = place.primaryType.toLowerCase();
        console.log(`[API] Using primaryType as fallback: ${categoryToUse}`);
      } else {
        // Last resort fallback
        categoryToUse = "place";
        filterReasons.defaultedToPlace++;
        console.log(`[API] No type information available, defaulting to: ${categoryToUse}`);
      }
    } else {
      console.log(`[API] Matched keyword: ${categoryToUse} for place: ${place.name}`);
    }

    // Check if we need to map this category to a main category
    const mainCategory = getPrimaryCategoryForRelatedWord(categoryToUse);
    if (mainCategory && mainCategory !== categoryToUse) {
      console.log(`[API] Mapping category "${categoryToUse}" to main category "${mainCategory}"`);
      categoryToUse = mainCategory;
      filterReasons.mappedToMainCategory++;
    }

    // Keep track of categories for analysis
    placesByCategory[categoryToUse] = (placesByCategory[categoryToUse] || 0) + 1;

    // Get the emoji for the category from our mapping
    let emoji = categoryEmojis[categoryToUse];

    // If no emoji found for the category, try a generic fallback
    if (!emoji) {
      console.log(`[API] No emoji found for category: ${categoryToUse}`);
      
      // Try to find an emoji for a similar category
      for (const key of Object.keys(categoryEmojis)) {
        if (key.includes(categoryToUse) || categoryToUse.includes(key)) {
          emoji = categoryEmojis[key];
          console.log(`[API] Found similar emoji for ${categoryToUse} using ${key}: ${emoji}`);
          break;
        }
      }
      
      // If still no emoji, use a default
      if (!emoji) {
        emoji = "📍"; // Default map pin emoji
        filterReasons.noEmoji++;
        console.log(`[API] No emoji found for category: ${categoryToUse}, using default pin`);
      }
    }

    // Create a simplified place object with only the fields we care about
    return createSimplifiedPlace(place, categoryToUse, emoji);
  });

  // Filter out places with undefined id (should be none now with our fallbacks)
  const filteredPlaces = filter(
    processedPlaces,
    (place: Partial<NearbyPlace>) => place.id !== undefined
  );

  // Log detailed filtering information
  console.log(`[API] Filtering stats: ${filterReasons.noKeywordMatch} places had no keyword match, ${filterReasons.noEmoji} places had no emoji, ${filterReasons.defaultedToPlace} places defaulted to generic 'place', ${filterReasons.mappedToMainCategory} places mapped to main categories`);
  console.log(`[API] Places by category:`, placesByCategory);
  console.log(`[API] Processed ${processedPlaces.length} places, filtered to ${filteredPlaces.length} valid results`);
  
  // If we're still losing places after processing, log more details
  if (filteredPlaces.length < data.places.length) {
    console.log(`[API] Warning: Lost ${data.places.length - filteredPlaces.length} places during processing`);
    
    // Log a sample of filtered out places for debugging
    const filteredOutPlaces = processedPlaces.filter(place => !place.id);
    if (filteredOutPlaces.length > 0) {
      console.log(`[API] Sample of filtered out place:`, filteredOutPlaces[0]);
    }
  }
  
  return filteredPlaces;
}

/**
 * Caches the processed results
 * @param cacheKey - The cache key
 * @param places - The processed places
 * @param bypassCache - Whether to bypass the cache
 */
async function cacheResults(
  cacheKey: string | null,
  places: NearbyPlace[],
) {
  if (places.length === 0 || cacheKey === null) {
    return;
  }

  try {
    console.log(
      `[API] Caching ${places.length} results with key: ${cacheKey}`
    );
    await redis.set(cacheKey, places, { ex: CACHE_EXPIRATION_TIME });
  } catch (redisError) {
    console.error('[API] Error caching results:', redisError);
    // Continue without caching if we can't set the cache
  }
}

/**
 * @swagger
 * /api/places/v2:
 *   get:
 *     summary: Search for places using Google Places API searchText method
 *     description: Searches for places using the Google Places API searchText method with location bias to sort results by proximity
 *     tags:
 *       - places
 *     parameters:
 *       - name: key
 *         in: query
 *         required: false
 *         description: Category key(s) to search for (can be specified multiple times, e.g., key=1&key=2)
 *         schema:
 *           type: array
 *           items:
 *             type: integer
 *         example: [1, 2]
 *       - name: textQuery
 *         in: query
 *         required: false
 *         description: The search query, can use pipe character for multiple types (e.g., "Indian|Mexican"). Not needed if key is provided.
 *         schema:
 *           type: string
 *         example: "Indian|Mexican"
 *       - name: location
 *         in: query
 *         description: Latitude and longitude in format "lat,lng". Used for location bias to sort results by proximity.
 *         schema:
 *           type: string
 *         example: "37.7749,-122.4194"
 *       - name: radius
 *         in: query
 *         description: Search radius in meters (max 50000). Defines the area for location bias.
 *         schema:
 *           type: string
 *         example: "5000"
 *       - name: bounds
 *         in: query
 *         description: Bounds in format "lat1,lng1|lat2,lng2". If provided, overrides the circle location bias.
 *         schema:
 *           type: string
 *         example: "37.7,-122.5|37.8,-122.3"
 *       - name: maxResults
 *         in: query
 *         description: Maximum number of results to return (capped at 150)
 *         schema:
 *           type: string
 *         example: "50"
 *       - name: pageSize
 *         in: query
 *         description: Number of results per page (max 20, default 20)
 *         schema:
 *           type: string
 *         example: "20"
 *     responses:
 *       200:
 *         description: List of places matching the criteria, sorted by proximity to the specified location
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
    // TODO: add open now
    const maxResults = parseInt(url.searchParams.get('maxResults') || '50', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10);
    const pageToken = url.searchParams.get('pageToken');
    console.log({maxResults, pageSize, pageToken})
    const bypassCache = url.searchParams.get('bypassCache') === 'true';
    
    // Parse category keys if provided
    const keyParams = url.searchParams.getAll('key');
    const keys = keyParams.length > 0 
      ? keyParams.map(k => parseInt(k, 10)).filter(k => !isNaN(k) && k in categoryMappings)
      : null;
    
    // Build textQuery from keys if keys are provided and textQuery is not
    const effectiveTextQuery = keys?.length 
      ? buildTextQueryFromKeys(keys) 
      : textQuery;

    // Validate required parameters
    const validationError = validateRequest(keys, effectiveTextQuery, location);
    if (validationError) {
      return validationError;
    }

    // Log request parameters
    console.log('[API] Processing places-v2 request with:', {
      keys: keys?.map(k => `${k}:${getCategoryByKey(k)}`),
      textQuery: effectiveTextQuery,
      location,
      radius,
      bounds,
      maxResults,
    });

    // Extract keywords from the textQuery (split by pipe character)
    const keywords = effectiveTextQuery!
      .split('|')
      .map((k: string) => k.trim().toLowerCase());
    // Pre-compute lowercase keywords for efficient matching
    const lowercaseKeywords = keywords.map((keyword) => keyword.toLowerCase());

    // Generate a cache key based only on location and radius (not textQuery)
    const cacheKey = generatePlacesV2CacheKey({
      location,
      radius,
      bounds,
    });

    // Try to get data from cache if not bypassing cache
    if (!bypassCache) {
      const cachedResults = await getCachedData(cacheKey, effectiveTextQuery!, maxResults);
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
      effectiveTextQuery!,
      location!,
      radius,
      bounds,
      pageSize
    );
    
    // Add page token if provided
    if (pageToken) {
      requestBody.pageToken = pageToken;
    }

    // Fetch data from Google Places API
    const googleResponse = await fetchFromGoogle(requestBody, maxResults);

    // If the response is an error, return it
    if (googleResponse instanceof NextResponse) {
      return googleResponse;
    }

    // Process the response from Google Places API to get all places
    const allProcessedPlaces = processGoogleResponse(
      googleResponse,
      keywords,
      lowercaseKeywords
    );

    // Cache all the processed places for future requests
    await cacheResults(cacheKey, allProcessedPlaces);

    // Return the results
    return NextResponse.json({
      places: allProcessedPlaces,
      count: allProcessedPlaces.length
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
