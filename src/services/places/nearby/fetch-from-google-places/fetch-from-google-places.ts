import { env } from '@/env';
import type { GooglePlacesResponse } from '@/types/google-places';
import { log } from '@/utils/log';
import { prepareGoogleRequestBody } from '../prepare-google-request-body/prepare-google-request-body';

/**
 * Parameters for fetching data from Google Places API
 */
type Props = {
  /** Text query to search for places (e.g., "restaurants", "coffee shops") */
  textQuery: string;

  /** Location in the format "latitude,longitude" */
  location: string;

  /** Whether to only return places that are currently open */
  openNow?: boolean;

  /** Maximum number of places to return */
  limit?: number;

  /** Buffer distance in miles to extend the search radius */
  bufferMiles?: number;
};

const apiKey = env.GOOGLE_PLACES_API_KEY;
const baseUrl = env.GOOGLE_PLACES_URL;
const path = 'places:searchText';

/**
 * Fetches raw place data directly from the Google Places API.
 *
 * This function:
 * 1. Prepares the request body with search parameters
 * 2. Makes a POST request to the Google Places API
 * 3. Processes and validates the response
 * 4. Returns the data in a standardized format
 *
 * When used with batching, this function will be called multiple times with different
 * text queries representing different category batches.
 *
 * @param props - Parameters for the Google Places API request
 * @param props.textQuery - Text query to search for places (e.g., "restaurants", "coffee shops")
 * @param props.location - Location in the format "latitude,longitude"
 * @param props.openNow - Whether to only return places that are currently open
 * @param props.limit - Maximum number of places to return
 * @param props.bufferMiles - Buffer distance in miles to extend the search radius
 *
 * @returns A {@link GooglePlacesResponse} object containing:
 *   - places: Array of raw Google Place objects
 *
 * @remarks
 * This function handles errors gracefully and will return an empty places array
 * if the API request fails or returns invalid data.
 *
 * @example
 * ```typescript
 * const googleData = await fetchFromGoogle({
 *   textQuery: "coffee shops",
 *   location: "40.7128,-74.0060",
 *   limit: 10
 * });
 * ```
 */
export async function fetchFromGoogle({
  textQuery,
  location,
  openNow,
  limit,
  bufferMiles,
}: Props): Promise<GooglePlacesResponse> {
  try {
    const requestBody = prepareGoogleRequestBody({
      textQuery,
      location,
      openNow,
      limit,
      bufferMiles,
    });

    const url = `${baseUrl}/${path}?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // 'X-Goog-FieldMask': [
        //   'place.name',
        //   'places.id',
        //   'places.primaryTypeDisplayName.text',
        //   'places.types',
        //   'places.location',
        //   'places.displayName.text',
        // ].join(','),
        'X-Goog-FieldMask': '*',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      return { places: [] };
    }

    const data = await response.json();

    if (!data?.places || !Array.isArray(data?.places)) {
      return {
        places: [],
      };
    }

    const limitedResults = limit ? data.places.slice(0, limit) : data.places;

    return {
      places: limitedResults,
    };
  } catch (error) {
    log.error(`[API] Error fetching from Google Places`, { error });
    return {
      places: [],
    };
  }
}
