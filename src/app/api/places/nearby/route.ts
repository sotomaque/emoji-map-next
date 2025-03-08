import { NextRequest, NextResponse } from 'next/server';
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
    const type = searchParams.get('type');
    const keywordsParam = searchParams.get('keywords') || '';
    const openNow = searchParams.get('openNow') === 'true';

    // Parse keywords into an array
    const keywords = keywordsParam.split(',').filter((k) => k.trim() !== '');

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

    // Make a request for each keyword
    for (const keyword of keywords.length > 0 ? keywords : ['']) {
      const params = new URLSearchParams({
        location,
        radius,
        type,
        key: apiKey,
      });

      // Add optional parameters if provided
      if (keyword) params.append('keyword', keyword);
      if (openNow) params.append('opennow', 'true');

      // Make the request to Google Places API
      const url = `${baseUrl}?${params.toString()}`;
      console.log(`Making request for keyword "${keyword}":`, url);

      const response = await fetch(url);
      const data: GooglePlacesResponse = await response.json();

      // Check for API errors
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error(
          `API Error for keyword "${keyword}":`,
          data.status,
          data.error_message
        );
        continue; // Skip this keyword if there's an error, but continue with others
      }

      // Add results to our collection, avoiding duplicates
      for (const result of data.results) {
        if (!uniquePlaceIds.has(result.place_id)) {
          uniquePlaceIds.add(result.place_id);

          // Store the keyword that found this place
          (result as ExtendedPlaceResult).sourceKeyword = keyword;

          allResults.push(result as ExtendedPlaceResult);
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
