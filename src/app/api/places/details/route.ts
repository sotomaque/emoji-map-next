import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

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

interface PlaceDetails {
  photos: string[];
  reviews: {
    author: string;
    text: string;
    rating: number;
  }[];
}

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
    const photos = data.result.photos?.map(photo => {
      const photoParams = new URLSearchParams({
        maxwidth: '400',
        photoreference: photo.photo_reference,
        key: apiKey,
      });
      return `${env.GOOGLE_PLACES_PHOTO_URL}?${photoParams.toString()}`;
    }) || [];

    // Transform the reviews
    const reviews = data.result.reviews?.map(review => ({
      author: review.author_name,
      text: review.text,
      rating: review.rating,
    })) || [];

    // Create the place details object
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