import { env } from '@/env';
import type { GooglePlaceDetails } from '@/types/google-places-details';
import { log } from '@/utils/log';

/**
 * Fetches place details from the Google Places API for a given place ID
 *
 * @param id - The Google Places ID of the location to fetch details for
 * @returns The place details result from the Google Places API
 * @throws {Error} If the API request fails or no result is found
 *
 * @example
 * ```ts
 * const placeDetails = await fetchDetails('ChIJN1t_tDeuEmsRUsoyG83frY4');
 * ```
 */

export async function fetchDetails(id: string) {
  try {
    // Build the Details URL
    const apiKey = env.GOOGLE_PLACES_API_KEY;
    const baseUrl = env.GOOGLE_PLACES_DETAILS_URL;

    const params = new URLSearchParams({
      place_id: id,
      fields: 'name,photos,reviews',
      key: apiKey,
    });

    // Make the request
    log.debug('Fetching details', { url: `${baseUrl}?${params.toString()}` });
    const response = await fetch(`${baseUrl}?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data: {
      result: Pick<GooglePlaceDetails, 'name' | 'photos' | 'reviews'>;
    } = await response.json();

    if (!data?.result) {
      log.error('No result found', { requestResult: Object.keys(data) });
      throw new Error('No result found');
    }

    log.success('Details fetched', { ...data });

    return data.result;
  } catch (error) {
    log.error('Error fetching details', { error });
    throw error;
  }
}
