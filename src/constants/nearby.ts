import { env } from '@/env';

/**
 * Configuration for the nearby places API
 *
 * Contains default values, limits, and cache settings for the nearby places functionality.
 *
 * @property {number} DEFAULT_LIMIT - Default number of places to return (20)
 * @property {number} DEFAULT_BUFFER_MILES - Default search radius in miles (15)
 * @property {string} DEFAULT_RANK_PREFERENCE - Default ranking method ('DISTANCE')
 * @property {number} ABSOLUT_MAX_LIMIT - Maximum number of places per request (60, Google Places API limit)
 * @property {number} ABSOLUT_MAX_BUFFER_MILES - Maximum search radius in miles (100)
 * @property {string} CACHE_KEY - Redis cache key prefix for nearby places
 * @property {string} CACHE_KEY_VERSION - Version for cache invalidation
 * @property {number} CACHE_EXPIRATION_TIME - Cache TTL in milliseconds (30 days)
 */
export const NEARBY_CONFIG = {
  // Default limit for the Google Places API
  DEFAULT_LIMIT: 20,
  DEFAULT_RADIUS_METERS: 1000, // 1 km
  DEFAULT_RANK_PREFERENCE: 'RANK_PREFERENCE_UNSPECIFIED',

  // Google Places API has a limit of 20 places per request
  ABSOLUT_MAX_LIMIT: 20,
  ABSOLUT_MAX_BUFFER_MILES: 100,

  // Serial requests
  SERIAL_REQUESTS_LIMIT: env.NEARBY_SERIAL_REQUESTS_LIMIT,

  // Cache key for the nearby API
  CACHE_KEY: 'places',
  CACHE_KEY_VERSION: env.NEARBY_CACHE_KEY_VERSION,
  CACHE_EXPIRATION_TIME: 60 * 60 * 24 * 30 * 1000, // 30 days in milliseconds
} as const;
