import { NEARBY_CONFIG } from '@/constants/nearby';
import type { LocationBias } from '@/types/geo-types';
import { createLocationBias, getValidLocation } from '@/utils/geo/geo';
import { log } from '@/utils/log';

export interface GoogleRequestBody {
  textQuery: string;

  // @deprecated, will be ignored if you set it
  // with pageSize
  maxResultCount?: number;
  pageSize?: number;

  rankPreference?: 'DISTANCE' | 'POPULARITY' | 'RANK_PREFERENCE_UNSPECIFIED';
  openNow?: boolean;
  locationBias?: LocationBias;

  pageToken?: string; // Next page token
}

/**
 * Prepares the request body for the Google Places API
 *
 * @param textQuery - The text query to search for
 * @param location - The location string in format "latitude,longitude"
 * @param openNow - Whether to only return places that are open now
 * @param limit - The maximum number of results to return
 * @param radiusMeters - The radius distance in meters
 * @param pageToken - The page token for pagination
 * @returns The prepared request body for the Google Places API
 */
export function prepareGoogleRequestBody({
  textQuery,
  location,
  openNow,
  limit = NEARBY_CONFIG.DEFAULT_LIMIT,
  radiusMeters = NEARBY_CONFIG.DEFAULT_RADIUS_METERS,
  pageToken,
}: {
  textQuery: string;
  location: string;
  openNow?: boolean;
  limit?: number;
  radiusMeters?: number;
  pageToken?: string;
}): GoogleRequestBody {
  // Initialize the request body
  const requestBody: GoogleRequestBody = {
    textQuery,
    pageSize: Math.min(limit, NEARBY_CONFIG.ABSOLUT_MAX_LIMIT),
  };

  // Add openNow if provided
  if (openNow) {
    requestBody.openNow = openNow;
  }

  // Add pageToken if provided
  if (pageToken) {
    requestBody.pageToken = pageToken;
  }

  // Set rankPreference to DISTANCE by default
  requestBody.rankPreference = NEARBY_CONFIG.DEFAULT_RANK_PREFERENCE;

  const validatedLocation = getValidLocation(location);

  if (validatedLocation) {
    log.debug(`[API] Valid location: ${location}`);

    // Create a buffer around the location
    const locationBias = createLocationBias({
      location,
      radiusMeters,
    });

    if (locationBias) {
      requestBody.locationBias = {
        circle: locationBias.circle,
      };
    }
  } else {
    log.warn(
      `[API] Invalid location format: ${location}, not using locationBias`
    );
  }

  log.debug(`[API] Request body: ${JSON.stringify(requestBody)}`);
  return requestBody;
}
