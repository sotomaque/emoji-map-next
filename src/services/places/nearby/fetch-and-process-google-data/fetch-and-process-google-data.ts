import type { PlacesResponse } from '@/types/places';
import { fetchFromGoogle } from '../fetch-from-google-places/fetch-from-google-places';
import { processGoogleResponse } from '../process-entire-response/process-entire-response';

/**
 * Parameters for fetching and processing Google Places data
 */
interface Params {
  /** Text query to search for places (e.g., "restaurants", "coffee shops") */
  textQuery: string;

  /** Location in the format "latitude,longitude" */
  location: string;

  /** Whether to only return places that are currently open */
  openNow?: boolean;

  /** Maximum number of places to return */
  limit?: number;

  /** Radius distance in meters */
  radiusMeters?: number;

  /** Array of category keys */
  keys?: number[];
}

/**
 * Fetches place data from Google Places API and processes it into a standardized format.
 *
 * This function performs two main operations:
 * 1. Fetches raw place data from Google Places API using the provided search parameters
 * 2. Processes the raw data into a simplified format with emoji markers
 *
 * When used with batching, this function will be called multiple times with different
 * subsets of category keys, and the results will be merged by the caller.
 *
 * @param params - Parameters for the Google Places API request
 * @param params.textQuery - Text query to search for places (e.g., "restaurants", "coffee shops")
 * @param params.location - Location in the format "latitude,longitude"
 * @param params.openNow - Whether to only return places that are currently open
 * @param params.limit - Maximum number of places to return
 * @param params.bufferMiles - Buffer distance in miles to extend the search radius
 * @param params.keys - Array of category keys (for batch processing)
 *
 * @returns A {@link PlacesResponse} object containing:
 *   - data: Array of simplified place objects with emoji markers
 *   - count: Number of places in the response
 *   - cacheHit: Always false for fresh API requests (true only when served from cache)
 *
 * @example
 * ```typescript
 * const placesData = await fetchAndProcessGoogleData({
 *   textQuery: "restaurants",
 *   location: "40.7128,-74.0060",
 *   openNow: true,
 *   limit: 20
 * });
 * ```
 */
export async function fetchAndProcessGoogleData({
  textQuery,
  location,
  openNow,
  limit,
  radiusMeters,
  keys,
}: Params): Promise<PlacesResponse> {
  // Fetch the data from Google Places API
  const googleData = await fetchFromGoogle({
    textQuery,
    location,
    openNow,
    limit,
    radiusMeters,
  });

  // Process the response from Google Places API
  // Pass the specific keys for this batch to ensure proper emoji assignment
  const response = processGoogleResponse({
    googleData,
    textQuery,
    keys,
  });

  return {
    data: response,
    count: response.length,
    cacheHit: false,
  };
}
