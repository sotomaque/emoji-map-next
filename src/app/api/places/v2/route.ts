import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { env } from '@/env';
import {
  redis,
  CACHE_EXPIRATION_TIME,
  generatePlacesTextSearchCacheKey,
} from '@/lib/redis';
import { findMatchingKeyword, createSimplifiedPlace } from '@/lib/places-utils';
import type {
  GooglePlace,
  NearbyPlace,
  PlacesSearchTextRequest,
  PlacesSearchTextResponse,
} from '@/types/places';
import { categoryEmojis } from '@/services/places';
import _ from 'lodash';

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
    if (!textQuery) {
      return NextResponse.json(
        { error: 'Missing required parameter: textQuery' },
        { status: 400 }
      );
    }

    // Validate location parameter
    if (!location) {
      return NextResponse.json(
        { error: 'Missing required parameter: location' },
        { status: 400 }
      );
    }

    console.log('[API] Processing places-new request with:', {
      textQuery,
      location,
      radius,
      bounds,
      maxResults,
    });

    // Extract keywords from the textQuery (split by pipe character)
    const keywords = textQuery
      .split('|')
      .map((k: string) => k.trim().toLowerCase());
    // Pre-compute lowercase keywords for efficient matching
    const lowercaseKeywords = keywords.map((keyword) => keyword.toLowerCase());

    // Generate a cache key based on the request parameters
    const cacheKey = generatePlacesTextSearchCacheKey({
      textQuery,
      location,
      radius,
      bounds,
    });

    // Try to get data from cache first
    const cachedData = await redis.get<NearbyPlace[]>(cacheKey);

    if (cachedData && !bypassCache) {
      console.log(`[API] Cache hit for key: ${cacheKey}`);
      console.log(`[API] Returning ${cachedData.length} cached results`);

      // Apply maxResults limit to cached data
      const limitedCachedResults = cachedData.slice(0, maxResults);
      console.log(
        `[API] Limited to ${limitedCachedResults.length} results based on maxResults=${maxResults}`
      );

      return NextResponse.json({
        places: limitedCachedResults,
        count: limitedCachedResults.length,
      });
    }

    console.log(
      `[API] Cache miss for key: ${cacheKey}, fetching from Google Places API`
    );

    // Build the Google Places API URL
    const apiKey = env.GOOGLE_PLACES_API_KEY;
    const baseUrl = env.GOOGLE_PLACES_V2_URL;

    // Prepare the request body
    const requestBody: PlacesSearchTextRequest = {
      textQuery,
      maxResultCount: maxResults,
    };

    // Add location parameters if provided
    if (location) {
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

    // Make the request to Google Places API
    const response = await fetch(`${baseUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Goog-FieldMask': '*',
      },
      body: JSON.stringify(requestBody),
    });

    // Parse the response
    const data: PlacesSearchTextResponse = await response.json();

    if (!data.places || !Array.isArray(data.places)) {
      console.error(
        '[API] Error: Invalid response from Google Places API',
        data
      );
      return NextResponse.json(
        { error: 'Failed to fetch places' },
        { status: 500 }
      );
    }

    console.log(`[API] Received ${data.places.length} results`);

    // Process the places to add category and emoji and filter fields
    // We can use our utility functions directly here for more control
    const processedPlaces = _(data.places)
      .map((place: GooglePlace) => {
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
      })
      .filter((place: Partial<NearbyPlace>) => place.id !== undefined)
      .value();

    // Limit the number of results
    const limitedResults = processedPlaces.slice(0, maxResults);
    console.log(
      `[API] Limited to ${limitedResults.length} results based on maxResultCount=${maxResults}`
    );

    // Cache the results for future requests (cache the full results, not the limited ones)
    if (processedPlaces.length > 0) {
      console.log(
        `[API] Caching ${processedPlaces.length} results with key: ${cacheKey}`
      );
      await redis.set(cacheKey, processedPlaces, { ex: CACHE_EXPIRATION_TIME });
    }

    return NextResponse.json({
      places: limitedResults,
      count: limitedResults.length,
    });
  } catch (error) {
    console.error('[API] Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
