import { env } from '@/env';

/**
 * Configuration constants for search functionality
 * @constant
 * @property {number} DEFAULT_RADIUS_METERS - Default search radius in meters (5km)
 * @property {string} CACHE_KEY - Base key used for caching search results
 * @property {string} CACHE_KEY_VERSION - Version identifier for cache keys from environment
 * @property {number} CACHE_EXPIRATION_TIME - Cache expiration time in milliseconds (30 days)
 * @property {number} LOCATION_DIGITS - Number of decimal places to round location coordinates
 */

export const SEARCH_CONFIG = {
  DEFAULT_RADIUS_METERS: 5000, // 5 km
  CACHE_KEY: 'search',
  CACHE_KEY_VERSION: env.SEARCH_CACHE_KEY_VERSION,
  CACHE_EXPIRATION_TIME: 60 * 60 * 24 * 30 * 1000, // 30 days in milliseconds
  LOCATION_DIGITS: 2,
} as const;
