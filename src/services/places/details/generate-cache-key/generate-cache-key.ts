import { DETAILS_CONFIG } from '@/constants/details';

/**
 * Generate a cache key for the details API
 *
 * @param id - The place id
 * @returns A formatted cache key string i.e. `details:v1:${id}`
 */
export function generateCacheKey({ id }: { id: string }): string {
  // Simplified cache key that only depends on place id
  return `${DETAILS_CONFIG.CACHE_KEY}:${DETAILS_CONFIG.CACHE_KEY_VERSION}:${id}`;
}
