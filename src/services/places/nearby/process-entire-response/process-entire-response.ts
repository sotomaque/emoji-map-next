import type { GooglePlacesResponse } from '@/types/google-places';
import type { Place, FilterReasons } from '@/types/places';
import { log } from '@/utils/log';
import { processIndividualPlace } from '../process-individual-result/process-individual-result';

/**
 * Parameters for processing Google Places API response
 */
type Props = {
  /** Raw Google Places API response data */
  googleData: GooglePlacesResponse;

  /** Original text query used for the search, can contain multiple keywords separated by '|' */
  textQuery: string;
};

/**
 * Processes the entire Google Places API response into simplified map places with emoji markers.
 *
 * This function:
 * 1. Splits the text query into individual keywords
 * 2. Processes each place in the Google response
 * 3. Tracks filtering statistics for debugging purposes
 * 4. Returns an array of simplified places with emoji markers
 *
 * Each place is processed individually to:
 * - Extract relevant information (ID, location)
 * - Assign an appropriate emoji based on place type and keywords
 * - Filter out places that don't match the search criteria
 *
 * @param props - Processing parameters
 * @param props.googleData - Raw Google Places API response data
 * @param props.textQuery - Original text query used for the search (can contain multiple keywords separated by '|')
 *
 * @returns An array of {@link Place} objects, each containing:
 *   - id: Unique identifier for the place
 *   - location: Latitude and longitude coordinates
 *   - emoji: Emoji marker representing the place type
 *
 * @example
 * ```typescript
 * const simplifiedPlaces = processGoogleResponse({
 *   googleData: googlePlacesResponse,
 *   textQuery: "restaurants|cafes|bars"
 * });
 * ```
 */
export function processGoogleResponse({
  googleData,
  textQuery,
}: Props): Place[] {
  const keywords = textQuery
    .split('|')
    .map((k: string) => k.trim().toLowerCase());

  // Keep track of filtering stats
  const filterReasons: FilterReasons = {
    noKeywordMatch: 0,
    noEmoji: 0,
    defaultedToPlace: 0,
    mappedToMainCategory: 0,
  };

  // Process each place
  const results = googleData.places.map((place) =>
    processIndividualPlace({
      place,
      keywords,
      filterReasons,
    })
  );

  log.info('[API] Filter reasons:', { filterReasons });

  return results;
}
