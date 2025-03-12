import { env } from '@/env';

/**
 * Configuration for the place details API
 *
 * Contains cache settings for the place details functionality.
 *
 * @property {string} CACHE_KEY - Redis cache key prefix for place details
 * @property {string} CACHE_KEY_VERSION - Version for cache invalidation
 * @property {number} CACHE_EXPIRATION_TIME - Cache TTL in seconds (1 day)
 */
export const DETAILS_CONFIG = {
  // Cache key for the details API
  CACHE_KEY: 'details',
  CACHE_KEY_VERSION: env.NEARBY_CACHE_KEY_VERSION,
  CACHE_EXPIRATION_TIME: 60 * 60 * 24, // 1 day
} as const;
