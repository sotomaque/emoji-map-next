import { env } from '@/env';
import type { Detail } from '@/types/details';
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
    const baseUrl = env.GOOGLE_PLACES_URL;

    const fields = [
      'name',
      'rating',
      'priceLevel',
      'userRatingCount',
      'currentOpeningHours.openNow',
      'primaryTypeDisplayName.text',
      'takeout',
      'delivery',
      'dineIn',
      'editorialSummary.text',
      'outdoorSeating',
      'liveMusic',
      'menuForChildren',
      'servesDessert',
      'servesCoffee',
      'goodForChildren',
      'goodForGroups',
      'allowsDogs',
      'restroom',
      'paymentOptions',
      'generativeSummary.overview.text',
    ];

    const params = new URLSearchParams({
      fields: fields.join(','),
      key: apiKey,
    });

    const fullUrl = `${baseUrl}/places/${id}?${params.toString()}`;

    // Make the request
    log.info('Fetching details from Google Places API', { url: fullUrl });

    const response = await fetch(fullUrl);

    if (!response.ok) {
      log.error('API Error', {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data: Detail = await response.json();

    log.success('Details fetched1', { ...data });

    if (!data) {
      log.error('No result found', { requestResult: Object.keys(data) });
      throw new Error('No result found');
    }

    log.success('Details fetched', { ...data });

    return data;
  } catch (error) {
    log.error('Error fetching details', { error });
    throw error;
  }
}
