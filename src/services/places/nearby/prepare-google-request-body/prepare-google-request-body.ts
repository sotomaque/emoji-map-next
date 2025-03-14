import { NEARBY_CONFIG } from '@/constants/nearby';
import type { LocationRestriction } from '@/types/geo-types';
import { createLocationBuffer, isValidLocation } from '@/utils/geo/geo';
import { log } from '@/utils/log';

export interface GoogleRequestBody {
  textQuery: string;

  // @deprecated, will be ignored if you set it
  // with pageSize
  maxResultCount?: number;
  pageSize?: number;

  rankPreference?: 'DISTANCE' | 'POPULARITY' | 'RANK_PREFERENCE_UNSPECIFIED';
  openNow?: boolean;
  locationRestriction?: LocationRestriction;
}

/**
 * Prepares the request body for the Google Places API
 *
 * @param textQuery - The text query to search for
 * @param location - The location string in format "latitude,longitude"
 * @param openNow - Whether to only return places that are open now
 * @param limit - The maximum number of results to return
 * @param bufferMiles - The buffer distance in miles (default: 10)
 * @returns The prepared request body for the Google Places API
 */
export function prepareGoogleRequestBody({
  textQuery,
  location,
  openNow,
  limit = NEARBY_CONFIG.DEFAULT_LIMIT,
  bufferMiles = NEARBY_CONFIG.DEFAULT_BUFFER_MILES,
}: {
  textQuery: string;
  location: string;
  openNow?: boolean;
  limit?: number;
  bufferMiles?: number;
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

  // Set rankPreference to DISTANCE by default
  requestBody.rankPreference = NEARBY_CONFIG.DEFAULT_RANK_PREFERENCE;

  // Add location restriction if location is valid
  if (isValidLocation(location)) {
    // Create a buffer around the location
    const locationBuffer = createLocationBuffer(
      location,
      Math.min(bufferMiles, NEARBY_CONFIG.ABSOLUT_MAX_BUFFER_MILES)
    );

    // Add the location buffer as a rectangle restriction if valid
    if (locationBuffer) {
      requestBody.locationRestriction = {
        rectangle: locationBuffer,
      };

      log.debug(
        `[API] Using locationRestriction with rectangle: SW=(${locationBuffer.low.latitude},${locationBuffer.low.longitude}), NE=(${locationBuffer.high.latitude},${locationBuffer.high.longitude})`
      );
    }
  } else {
    log.warn(
      `[API] Invalid location format: ${location}, not using locationRestriction`
    );
  }

  return requestBody;
}
