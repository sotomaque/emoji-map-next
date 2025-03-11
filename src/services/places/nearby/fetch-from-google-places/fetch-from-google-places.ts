import { env } from '@/env';
import type { GooglePlacesResponse } from '@/types/local-places-types';
import { prepareGoogleRequestBody } from '../prepare-google-request-body/prepare-google-request-body';

type Props = {
  textQuery: string;
  location: string;
  openNow?: boolean;
  limit?: number;
  bufferMiles?: number;
};

export async function fetchFromGoogle({
  textQuery,
  location,
  openNow,
  limit,
  bufferMiles,
}: Props): Promise<GooglePlacesResponse> {
  console.log({ limit });
  console.log('[API] Fetching from Google Places API');

  const apiKey = env.GOOGLE_PLACES_API_KEY;
  const baseUrl = env.GOOGLE_PLACES_V2_URL;

  try {
    const requestBody = prepareGoogleRequestBody({
      textQuery,
      location,
      openNow,
      limit,
      bufferMiles,
    });

    console.log(`[API] Fetching results`);
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

    if (!data?.places || !Array.isArray(data?.places)) {
      console.error('[API] Invalid response from Google Places API:', data);

      return {
        places: [],
        count: 0,
        cacheHit: false,
      };
    }

    console.log(
      `[API] Received ${data.places.length} results from Google Places API`
    );

    return { places: data.places, count: data.places.length, cacheHit: false };
  } catch (error) {
    console.error('[API] Error fetching from Google Places API:', error);

    return {
      places: [],
      count: 0,
      cacheHit: false,
    };
  }
}
