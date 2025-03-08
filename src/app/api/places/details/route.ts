import { env } from '@/src/env';
import { NextRequest, NextResponse } from 'next/server';

// Define the response types based on the iOS app models
interface Photo {
  photo_reference: string;
}

interface APIReview {
  author_name: string;
  text: string;
  rating: number;
}

interface PlaceDetailsResult {
  photos?: Photo[];
  reviews?: APIReview[];
}

interface PlaceDetailsResponse {
  result: PlaceDetailsResult;
  status: string;
  error_message?: string;
}

// This matches the iOS PlaceDetails model
interface PlaceDetails {
  photos: string[];
  reviews: {
    author: string;
    text: string;
    rating: number;
  }[];
}

/**
 * @swagger
 * /api/places/details:
 *   get:
 *     summary: Get place details
 *     description: Fetches details for a specific place including photos and reviews
 *     tags:
 *       - places
 *     parameters:
 *       - name: placeId
 *         in: query
 *         description: The Google Places ID of the place
 *         required: true
 *         schema:
 *           type: string
 *           example: "ChIJN1t_tDeuEmsRUsoyG83frY4"
 *     responses:
 *       200:
 *         description: Details of the place
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 placeDetails:
 *                   $ref: '#/components/schemas/PlaceDetails'
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
    const placeId = searchParams.get('placeId');

    // Validate required parameters
    if (!placeId) {
      return NextResponse.json(
        { error: 'Missing required parameter: placeId' },
        { status: 400 }
      );
    }

    // Build the Google Places API URL using type-safe environment variables
    const apiKey = env.GOOGLE_PLACES_API_KEY;
    const baseUrl = env.GOOGLE_PLACES_DETAILS_URL;

    const params = new URLSearchParams({
      place_id: placeId,
      fields: 'name,photos,reviews',
      key: apiKey,
    });

    // Make the request to Google Places API
    const response = await fetch(`${baseUrl}?${params.toString()}`);
    const data: PlaceDetailsResponse = await response.json();

    // Check for API errors
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return NextResponse.json(
        { error: data.error_message || `API Error: ${data.status}` },
        { status: 500 }
      );
    }

    // Create photo URLs
    const photos =
      data.result.photos?.map((photo) => {
        const photoParams = new URLSearchParams({
          maxwidth: '400',
          photoreference: photo.photo_reference,
          key: apiKey,
        });
        return `${env.GOOGLE_PLACES_PHOTO_URL}?${photoParams.toString()}`;
      }) || [];

    // Transform the reviews to match the iOS app's expected format
    // The iOS app expects an array of tuples in the format [(author: String, text: String, rating: Int)]
    // In JSON, we'll represent this as an array of objects with specific keys
    const reviews =
      data.result.reviews?.map((review) => ({
        author: review.author_name,
        text: review.text,
        rating: Math.round(review.rating), // Ensure rating is an integer as expected by iOS
      })) || [];

    // Create the place details object that matches the iOS PlaceDetails model
    const placeDetails: PlaceDetails = {
      photos,
      reviews,
    };

    return NextResponse.json({ placeDetails });
  } catch (error) {
    console.error('Error fetching place details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch place details' },
      { status: 500 }
    );
  }
}
