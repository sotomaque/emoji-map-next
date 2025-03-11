import type { PlacesResponse } from '@/types/local-places-types';
import { fetchFromGoogle } from '../fetch-from-google-places/fetch-from-google-places';
import { processGoogleResponse } from '../process-entire-response/process-entire-response';

interface Params {
  textQuery: string;
  location: string;
  openNow?: boolean;
  limit?: number;
  bufferMiles?: number;
}

export async function fetchAndProcessGoogleData({
  textQuery,
  location,
  openNow,
  limit,
  bufferMiles,
}: Params): Promise<PlacesResponse> {
  // Fetch the data from Google Places API
  const googleData = await fetchFromGoogle({
    textQuery,
    location,
    openNow,
    limit,
    bufferMiles,
  });

  // Process the response from Google Places API
  const response = processGoogleResponse({
    googleData,
    textQuery,
  });

  return {
    places: response,
    count: googleData.count,
    cacheHit: false,
  };
}
