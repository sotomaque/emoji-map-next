import { env } from '@/env';
import type { Photo } from '@/types/google-places';
import { log } from '@/utils/log';

/**
 * Interface for the response from Google Places API when fetching photo metadata
 */
interface PhotoMetadataResponse {
  photos?: Photo[];
}

/**
 * Fetches photo metadata for a place from Google Places API.
 *
 * This function makes a request to the Google Places API to retrieve metadata
 * about photos associated with a specific place. It extracts the photo names
 * from the response, which can then be used to fetch the actual photo URLs.
 *
 * @param id - The Google Place ID for which to fetch photo metadata
 *
 * @returns A Promise that resolves to an array of photo name strings
 *
 * @throws Error if the API request fails or if no photos are found
 *
 * @example
 * ```typescript
 * try {
 *   const photoNames = await fetchPhotoMetadata('ChIJN1t_tDeuEmsRUsoyG83frY4');
 *   // Use photoNames to fetch actual photos
 * } catch (error) {
 *   console.error('Failed to fetch photo metadata:', error);
 * }
 * ```
 */
export async function fetchPhotoMetadata(id: string): Promise<string[]> {
  if (!id) {
    throw new Error('Place ID is required');
  }

  const url = `${env.GOOGLE_PLACES_URL}/places/${id}?fields=photos&key=${env.GOOGLE_PLACES_API_KEY}`;
  log.info('Fetching photo metadata', { id, url });

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as PhotoMetadataResponse;

    if (!data.photos) {
      throw new Error('No photos found');
    }

    const photoNames = data.photos.map((photo) => photo.name);

    if (photoNames.length === 0) {
      throw new Error('No photos found');
    }

    log.info('Successfully fetched photo metadata', {
      id,
      photoCount: photoNames.length,
    });

    return photoNames;
  } catch (error) {
    log.error('Error fetching photo metadata', { id, error });
    throw error;
  }
}
