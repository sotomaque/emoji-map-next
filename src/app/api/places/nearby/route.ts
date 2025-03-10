import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type {
  Place,
  GooglePlacesResponse,
  PlaceResult,
} from '@/types/google-places';
import { env } from '@/env';
import {
  redis,
  CACHE_EXPIRATION_TIME,
  generatePlacesCacheKey,
} from '@/lib/redis';
import { categoryEmojis } from '@/services/places';

// Extend the PlaceResult interface to include the sourceKeyword property
interface ExtendedPlaceResult extends PlaceResult {
  sourceKeyword?: string;
}

/**
 * @swagger
 * /api/places/nearby:
 *   get:
 *     summary: Get nearby places
 *     description: Fetches places near a specified location based on type and category
 *     tags:
 *       - places
 *     parameters:
 *       - name: location
 *         in: query
 *         description: Latitude and longitude in format "lat,lng"
 *         required: true
 *         schema:
 *           type: string
 *           example: "37.7749,-122.4194"
 *       - name: radius
 *         in: query
 *         description: Search radius in meters
 *         required: false
 *         schema:
 *           type: integer
 *           default: 5000
 *           example: 5000
 *       - name: bounds
 *         in: query
 *         description: Bounds in format "lat1,lng1|lat2,lng2"
 *         required: false
 *         schema:
 *           type: string
 *           example: "37.7749,-122.4194|37.7749,-122.4194"
 *       - name: type
 *         in: query
 *         description: Google Places type (e.g., "restaurant", "cafe")
 *         required: true
 *         schema:
 *           type: string
 *           example: "restaurant"
 *       - name: keywords
 *         in: query
 *         description: Comma-separated list of keywords to search for
 *         required: false
 *         schema:
 *           type: string
 *           example: "burger,fast food"
 *       - name: openNow
 *         in: query
 *         description: Set to "true" to only show places that are currently open
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *           example: "true"
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
 *                     $ref: '#/components/schemas/Place'
 *       400:
 *         description: Bad request - missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const location = searchParams.get('location');
    const radius = searchParams.get('radius') || '5000';
    const bounds = searchParams.get('bounds');
    const type = searchParams.get('type');
    const keywordsParam = searchParams.get('keywords') || '';
    const openNow = searchParams.get('openNow') === 'true';

    // Parse keywords into an array
    const keywords = keywordsParam.split(',').filter((k) => k.trim() !== '');

    console.log('[API] Processing request with:', {
      location,
      radius,
      bounds,
      type,
      keywords,
      openNow,
    });

    // Validate required parameters
    if (!location) {
      return NextResponse.json(
        { error: 'Missing required parameter: location' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: 'Missing required parameter: type' },
        { status: 400 }
      );
    }

    // Generate a cache key based only on the location and radius
    const cacheKey = generatePlacesCacheKey({
      location,
      radius: radius || undefined,
    });

    // Try to get data from cache first
    const cachedData = await redis.get<ExtendedPlaceResult[]>(cacheKey);

    let allResults: ExtendedPlaceResult[] = [];
    let fromCache = false;

    if (cachedData) {
      console.log(`[API] Cache hit for key: ${cacheKey}`);

      // Filter cached results by type and openNow (skip bounds filtering to avoid unnecessary API calls)
      allResults = cachedData.filter((result) => {
        // Check if the result matches the requested type
        const matchesType = result.types?.includes(type || '') || false;

        // Check if the result matches the openNow filter (if specified)
        const matchesOpenNow =
          !openNow || result.opening_hours?.open_now === true;

        return matchesType && matchesOpenNow;
      });

      console.log(
        `[API] After type and openNow filtering: ${allResults.length} results from ${cachedData.length} cached items`
      );

      // If we don't have any results after filtering, we need to fetch from the API
      if (allResults.length === 0) {
        console.log(
          `[API] No matching results in cache for type: ${type}, openNow: ${openNow}, fetching from API`
        );
        fromCache = false;
      } else {
        fromCache = true;
      }
    }

    // If we don't have cached data or no matching results after filtering, fetch from the API
    if (!cachedData || allResults.length === 0) {
      console.log(
        `[API] ${cachedData ? 'No matching results in cache' : 'Cache miss'}, fetching from Google Places API`
      );

      // Build the Google Places API URL using type-safe environment variables
      const apiKey = env.GOOGLE_PLACES_API_KEY;
      const baseUrl = env.GOOGLE_PLACES_URL;

      // Create a Set to store unique place IDs to avoid duplicates
      const uniquePlaceIds = new Set<string>();

      // Combine all keywords with pipe character for a single request
      const combinedKeywords = keywords.length > 0 ? keywords.join('|') : '';

      console.log(
        `[API] Using combined keywords: ${combinedKeywords || '(type only)'}`
      );

      // Build the request parameters
      const params = new URLSearchParams({
        location,
        radius,
        type,
        key: apiKey,
      });

      // Add bounds if provided (this will override radius)
      if (bounds) {
        // Validate bounds format: should be "lat1,lng1|lat2,lng2"
        const boundsRegex =
          /^-?\d+(\.\d+)?,-?\d+(\.\d+)?\|-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;
        if (boundsRegex.test(bounds)) {
          params.append('bounds', bounds);
        } else {
          console.warn(
            `[API] Invalid bounds format: ${bounds}, using radius instead`
          );
        }
      }

      // Add optional parameters if provided
      if (combinedKeywords) params.append('keyword', combinedKeywords);
      if (openNow) params.append('opennow', 'true');

      // Make the request to Google Places API
      const url = `${baseUrl}?${params.toString()}`;
      console.log(`[API] Request:`, url);

      try {
        const response = await fetch(url);
        const data: GooglePlacesResponse = await response.json();

        // Check for API errors
        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
          console.error(`[API] Error:`, data.status, data.error_message);
          return NextResponse.json(
            { error: 'Failed to fetch nearby places' },
            { status: 500 }
          );
        }

        // Log the number of results
        console.log(`[API] Received ${data.results?.length || 0} results`);

        // Process the results
        for (const result of data.results) {
          // Add the result to our list if it's not already there
          if (!uniquePlaceIds.has(result.place_id)) {
            uniquePlaceIds.add(result.place_id);

            // Determine which keyword matched this result
            let matchedKeyword = '';
            if (keywords.length > 0) {
              const placeText =
                `${result.name} ${result.vicinity || ''}`.toLowerCase();

              // Find the first keyword that matches
              matchedKeyword =
                keywords.find((keyword) =>
                  placeText.includes(keyword.toLowerCase())
                ) || type;
            } else {
              matchedKeyword = type;
            }

            allResults.push({
              ...result,
              // Store the specific keyword that matched this place
              sourceKeyword: matchedKeyword,
            });
          }
        }
      } catch (error) {
        console.error('[API] Fetch error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch nearby places' },
          { status: 500 }
        );
      }

      // Cache the results for future requests
      if (allResults.length > 0) {
        console.log(
          `[API] Caching ${allResults.length} results with key: ${cacheKey}`
        );
        await redis.set(cacheKey, allResults, { ex: CACHE_EXPIRATION_TIME });
      }
    }

    // If we have keywords and the data came from cache, filter the results by keywords
    if (fromCache && keywords.length > 0) {
      console.log(
        `[API] Filtering cached results by keywords: ${keywords.join(', ')}`
      );

      // Create a Set of unique place IDs that match any of the keywords
      const matchingPlaceIds = new Set<string>();

      // Map to store which keyword matched each place
      const placeKeywords = new Map<string, string>();

      // For each result, check if it matches any of the keywords
      for (const result of allResults) {
        // Check if the place name or vicinity contains any of the keywords
        const placeText =
          `${result.name} ${result.vicinity || ''}`.toLowerCase();

        // Find the first keyword that matches
        const matchedKeyword = keywords.find((keyword) =>
          placeText.includes(keyword.toLowerCase())
        );

        if (matchedKeyword) {
          matchingPlaceIds.add(result.place_id);
          placeKeywords.set(result.place_id, matchedKeyword);
        }
      }

      // Filter the results to only include places that match the keywords
      allResults = allResults.filter((result) =>
        matchingPlaceIds.has(result.place_id)
      );

      // Update the sourceKeyword for each result
      allResults = allResults.map((result) => ({
        ...result,
        sourceKeyword:
          placeKeywords.get(result.place_id) || result.sourceKeyword || type,
      }));

      console.log(
        `[API] After keyword filtering: ${allResults.length} results`
      );
    }

    // Transform the results to match our Place model
    // This matches the iOS Place model structure
    const places: (Place & { emoji: string })[] = allResults
      .map((result: ExtendedPlaceResult) => {
        // Use the keyword that found this place as its category
        const category = result.sourceKeyword || keywords[0] || type;

        // Get the emoji for the category, or use a default
        const emoji = categoryEmojis[category];

        if (!emoji) {
          console.error(`[places] No emoji found for category: ${category}`);

          return {};
        }

        return {
          placeId: result.place_id,
          name: result.name,
          coordinate: {
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
          },
          category,
          emoji,
          description: result.vicinity || 'No description available',
          priceLevel: result.price_level || null,
          openNow: result.opening_hours?.open_now || null,
          rating: result.rating || null,
        };
      })
      .filter((place) => place.placeId !== undefined);

    console.log(
      `[API] Returning ${places.length} unique places ${fromCache ? 'from cache' : 'from API'}`
    );

    return NextResponse.json({
      places,
      source: fromCache ? 'cache' : 'api',
    });
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nearby places' },
      { status: 500 }
    );
  }
}
