import { env } from '@/env';

/**
 * Configuration for the place photos API
 *
 * Contains default values, limits, and cache settings for the place photos functionality.
 *
 * @property {number} DEFAULT_LIMIT - Default number of photos to return (5)
 * @property {number} DEFAULT_MAX_HEIGHT - Default maximum height for photos (1600px)
 * @property {number} ABSOLUTE_MAX_HEIGHT_LIMIT - Maximum allowed height for photos (4000px)
 * @property {string} CACHE_KEY - Redis cache key prefix for place photos
 * @property {string} CACHE_VERSION - Version for cache invalidation
 * @property {number} CACHE_EXPIRATION_TIME - Cache TTL in milliseconds (30 days)
 */
export const PHOTOS_CONFIG = {
  // DEFAULTS
  DEFAULT_LIMIT: 5,
  DEFAULT_MAX_HEIGHT: 1600,

  // MAX HEIGHT
  ABSOLUTE_MAX_HEIGHT_LIMIT: 4000,

  // CACHE KEY
  CACHE_KEY: 'photos',
  CACHE_VERSION: env.PHOTOS_CACHE_KEY_VERSION,
  CACHE_EXPIRATION_TIME: 60 * 60 * 24 * 30 * 1000, // 30 days in milliseconds
} as const;
