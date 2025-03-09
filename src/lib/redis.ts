import { env } from '@/env';
import { Redis } from '@upstash/redis';
import { generatePlacesCacheKey } from '@/utils/redis/cache-utils';

// Check if the required environment variables are set
if (!env.KV_REST_API_URL || !env.KV_REST_API_TOKEN) {
  console.warn(
    'KV_REST_API_URL and KV_REST_API_TOKEN must be set for Redis caching to work'
  );
}

// Create a Redis client
export const redis = new Redis({
  url: env.KV_REST_API_URL,
  token: env.KV_REST_API_TOKEN,
});

// Cache expiration time (7 days in seconds)
export const CACHE_EXPIRATION_TIME = 60 * 60 * 24 * 7; // 7 days

// Re-export the generatePlacesCacheKey function for convenience
export { generatePlacesCacheKey };
