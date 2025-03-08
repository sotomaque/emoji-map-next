import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type {
  Place,
  GooglePlacesResponse,
  PlaceResult,
} from '@/src/types/google-places';
import { env } from '@/src/env';

// Extend the PlaceResult interface to include the types property
interface ExtendedPlaceResult extends PlaceResult {
  types?: string[];
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
      openNow
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

    // Build the Google Places API URL using type-safe environment variables
    const apiKey = env.GOOGLE_PLACES_API_KEY;
    const baseUrl = env.GOOGLE_PLACES_URL;

    // Create a Set to store unique place IDs to avoid duplicates
    const uniquePlaceIds = new Set<string>();
    const allResults: ExtendedPlaceResult[] = [];

    // If we have many keywords, batch them to reduce the number of API calls
    const BATCH_SIZE = 3; // Process keywords in batches of 3
    const keywordsToUse = keywords.length > 0 ? keywords : [''];
    const keywordBatches: string[][] = [];
    
    // Create batches of keywords
    for (let i = 0; i < keywordsToUse.length; i += BATCH_SIZE) {
      keywordBatches.push(keywordsToUse.slice(i, i + BATCH_SIZE));
    }
    
    console.log(`[API] Processing ${keywordsToUse.length} keywords in ${keywordBatches.length} batches`);

    // Process each batch of keywords
    for (const batch of keywordBatches) {
      console.log(`[API] Processing batch of keywords: ${batch.join(', ') || '(type only)'}`);
      
      // Make a request for each keyword in the batch
      const batchPromises = batch.map(async (keyword: string) => {
        const params = new URLSearchParams({
          location,
          radius,
          type,
          key: apiKey,
        });

        // Add bounds if provided (this will override radius)
        if (bounds) {
          // Validate bounds format: should be "lat1,lng1|lat2,lng2"
          const boundsRegex = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?\|-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;
          if (boundsRegex.test(bounds)) {
            params.append('bounds', bounds);
          } else {
            console.warn(`[API] Invalid bounds format: ${bounds}, using radius instead`);
          }
        }

        // Add optional parameters if provided
        if (keyword) params.append('keyword', keyword);
        if (openNow) params.append('opennow', 'true');

        // Make the request to Google Places API
        const url = `${baseUrl}?${params.toString()}`;
        console.log(`[API] Request ${keyword ? 'for keyword "' + keyword + '"' : '(type only)'}:`, url);

        try {
          const response = await fetch(url);
          const data: GooglePlacesResponse = await response.json();

          // Check for API errors
          if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            console.error(
              `[API] Error ${keyword ? 'for keyword "' + keyword + '"' : '(type only)'}:`,
              data.status,
              data.error_message
            );
            return []; // Return empty array for this keyword if there's an error
          }

          // Log the number of results for this keyword
          console.log(`[API] Received ${data.results?.length || 0} results ${keyword ? 'for keyword "' + keyword + '"' : '(type only)'}`);

          // Return the results with the keyword that found them
          return data.results.map(result => ({
            ...result,
            sourceKeyword: keyword
          } as ExtendedPlaceResult));
        } catch (error) {
          console.error(`[API] Fetch error for keyword "${keyword}":`, error);
          // Propagate the error instead of returning an empty array
          throw error;
        }
      });

      // Wait for all requests in this batch to complete
      const batchResults = await Promise.all(batchPromises);
      
      // Add results to our collection, avoiding duplicates
      for (const results of batchResults) {
        for (const result of results) {
          if (!uniquePlaceIds.has(result.place_id)) {
            uniquePlaceIds.add(result.place_id);
            allResults.push(result);
          }
        }
      }
    }

    // Transform the results to match our Place model
    // This matches the iOS Place model structure
    const places: Place[] = allResults.map((result: ExtendedPlaceResult) => {
      // Use the keyword that found this place as its category
      const bestCategory = result.sourceKeyword || keywords[0] || type;

      return {
        placeId: result.place_id,
        name: result.name,
        coordinate: {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        },
        category: bestCategory,
        description: result.vicinity || 'No description available',
        priceLevel: result.price_level || null,
        openNow: result.opening_hours?.open_now || null,
        rating: result.rating || null,
      };
    });

    console.log(
      `Returning ${places.length} unique places from ${keywords.length} keywords`
    );
    return NextResponse.json({ places });
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nearby places' },
      { status: 500 }
    );
  }
}
