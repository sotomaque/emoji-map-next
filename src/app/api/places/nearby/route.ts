import { NextRequest, NextResponse } from 'next/server';
import type {
  Place,
  GooglePlacesResponse,
  PlaceResult,
} from '@/src/types/google-places';
import { env } from '@/src/env';

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
 *       - name: keyword
 *         in: query
 *         description: Specific keyword to search for
 *         required: false
 *         schema:
 *           type: string
 *           example: "burger"
 *       - name: category
 *         in: query
 *         description: Category name to assign to results
 *         required: false
 *         schema:
 *           type: string
 *           example: "burger"
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
    const keyword = searchParams.get('keyword');
    const openNow = searchParams.get('openNow') === 'true';
    const category = searchParams.get('category') || '';

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
    const response = await fetch(`${baseUrl}?${params.toString()}`);
    const data: GooglePlacesResponse = await response.json();

    // Check for API errors
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return NextResponse.json(
        { error: data.error_message || `API Error: ${data.status}` },
        { status: 500 }
      );
    }

    // Transform the results to match our Place model
    const places: Place[] = data.results.map((result: PlaceResult) => ({
      placeId: result.place_id,
      name: result.name,
      coordinate: {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
      },
      category: category, // Use the provided category
      description: result.vicinity,
      priceLevel: result.price_level,
      openNow: result.opening_hours?.open_now,
      rating: result.rating,
    }));

    return NextResponse.json({ places });
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nearby places' },
      { status: 500 }
    );
  }
}
