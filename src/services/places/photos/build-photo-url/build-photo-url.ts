import { isEmpty, isFinite } from 'lodash-es';
import { PHOTOS_CONFIG } from '@/constants/photos';
import { env } from '@/env';

/**
 * Parameters for building a Google Places API photo URL
 */
interface BuildPhotoUrlParams {
  /**
   * The photo name/identifier from Google Places API
   * (typically in format 'places/{placeId}/photos/{photoId}')
   */
  photoName: string;

  /**
   * Maximum height of the photo in pixels
   * @default PHOTOS_CONFIG.DEFAULT_MAX_HEIGHT (1600px)
   */
  maxHeight?: number;
}

/**
 * Builds a Google Places API photo URL for fetching a photo.
 *
 * This function constructs a URL that can be used to fetch a photo from the
 * Google Places API using the photo name and optional parameters.
 *
 * @param params - Parameters for building the photo URL
 * @param params.photoName - The photo name/identifier from Google Places API
 * @param params.maxHeight - Maximum height of the photo in pixels (defaults to 1600px)
 *
 * @returns A fully formed URL string to fetch the photo from Google Places API
 *
 * @example
 * ```typescript
 * const photoUrl = buildPhotoUrl({
 *   photoName: 'places/ChIJN1t_tDeuEmsRUsoyG83frY4/photos/AWU5eFgRQCpCUwI4UhQk9IQJuA_qdJCcDsi8G4CnzJMJHE9aqJK-Dx0',
 *   maxHeight: 800
 * });
 * ```
 */
export function buildPhotoUrl({
  photoName,
  maxHeight = PHOTOS_CONFIG.DEFAULT_MAX_HEIGHT,
}: BuildPhotoUrlParams): string {
  // Validate photoName using Lodash
  if (isEmpty(photoName)) {
    throw new Error('Photo name is required');
  }

  // Validate maxHeight using Lodash
  // Use default if:
  // - Not a number (_.isNumber)
  // - Not a finite number (_.isFinite)
  // - Not a positive number (> 0)
  // - Exceeds reasonable limits (optional, e.g., > 4000)
  const validatedMaxHeight =
    isFinite(maxHeight) &&
    maxHeight > 0 &&
    maxHeight <= PHOTOS_CONFIG.ABSOLUTE_MAX_HEIGHT_LIMIT
      ? maxHeight
      : PHOTOS_CONFIG.DEFAULT_MAX_HEIGHT;

  return `${env.GOOGLE_PLACES_URL}/${photoName}/media?max_height_px=${validatedMaxHeight}&skipHttpRedirect=false&key=${env.GOOGLE_PLACES_API_KEY}`;
}
