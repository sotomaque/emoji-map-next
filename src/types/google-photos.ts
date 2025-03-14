import type { CachedResponse } from './generics';

/**
 * Response type for photo URLs
 */
export type PhotosData = URL[];

/**
 * Response type for the /api/places/photos endpoint
 */
export type PhotosResponse = CachedResponse<PhotosData>;
