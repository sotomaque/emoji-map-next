import { isEmpty } from 'lodash-es';
import { log } from '@/utils/log';
import { buildPhotoUrl } from '../build-photo-url/build-photo-url';

/**
 * Fetches a single photo URL from Google Places API.
 *
 * This function takes a photo name (identifier) from Google Places API and
 * makes a request to fetch the actual photo URL. It uses the buildPhotoUrl
 * utility to construct the API URL and handles various error cases.
 *
 * @param photoName - The photo name/identifier from Google Places API
 *                   (typically in format 'places/{placeId}/photos/{photoId}')
 *
 * @returns A Promise that resolves to a URL object representing the photo URL
 *
 * @throws Error if:
 *   - The photo name is invalid or empty
 *   - The API request fails
 *   - No photo URL is returned
 *   - The returned URL is invalid and cannot be parsed by the URL constructor
 *
 * @example
 * ```typescript
 * try {
 *   const photoUrl = await fetchPhoto('places/ChIJN1t_tDeuEmsRUsoyG83frY4/photos/AWU5eFgRQCpCUwI4UhQk9IQJuA_qdJCcDsi8G4CnzJMJHE9aqJK-Dx0');
 *   // Use photoUrl.href to get the string representation
 *   const imageElement = document.createElement('img');
 *   imageElement.src = photoUrl.href;
 * } catch (error) {
 *   console.error('Failed to fetch photo:', error);
 * }
 * ```
 */
export async function fetchPhoto(photoName: string): Promise<URL> {
  // Validate photoName
  if (isEmpty(photoName)) {
    throw new Error('Photo name is required');
  }

  try {
    // Build the photo URL
    const url = buildPhotoUrl({ photoName });
    log.info('Fetching photo', { photoName });

    // Make the request
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Handle error responses
    if (!response.ok) {
      throw new Error(
        `Failed to fetch photo: ${response.status} ${response.statusText}`
      );
    }

    // Extract the photo URL from the response
    const photoUrl = response.url;
    if (!photoUrl) {
      throw new Error('No photo URL returned');
    }

    log.info('Successfully fetched photo', { photoName, photoUrl });

    return new URL(photoUrl);
  } catch (error) {
    log.error('Error fetching photo', { photoName, error });
    throw error;
  }
}
