import { Redis } from '@upstash/redis';
import { env } from '@/env';

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

// TODO: store pictures in redis? not just the urls?
// TODO: store stuff as json?
// Cache expiration time (7 days in seconds) for places
