import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import type { RequestHandler } from 'msw';

// Mock Statsig's useGateValue hook globally
vi.mock('@statsig/react-bindings', () => ({
  useGateValue: vi.fn().mockReturnValue(false),
  LogLevel: {
    Debug: 'debug',
    Info: 'info',
    Warn: 'warn',
    Error: 'error',
  },
  StatsigProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock environment variables globally
vi.mock('@/env', () => ({
  env: {
    // Google Places API
    GOOGLE_PLACES_API_KEY: 'test-api-key',
    GOOGLE_PLACES_URL: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
    GOOGLE_PLACES_V2_URL: 'https://places.googleapis.com/v1/places:searchText',
    GOOGLE_PLACES_DETAILS_URL: 'https://maps.googleapis.com/maps/api/place/details/json',
    GOOGLE_PLACES_PHOTO_URL: 'https://maps.googleapis.com/maps/api/place/photo',
    
    // Next.js public env vars
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
    NEXT_PUBLIC_SITE_ENV: 'test',
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: 'test-maps-api-key',
    
    // Clerk
    CLERK_SECRET_KEY: 'test-clerk-secret',
    CLERK_SIGNING_SECRET: 'test-clerk-signing-secret',
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'test-clerk-publishable-key',
    
    // Supabase
    POSTGRES_URL: 'test-postgres-url',
    POSTGRES_PRISMA_URL: 'test-postgres-prisma-url',
    SUPABASE_URL: 'test-supabase-url',
    NEXT_PUBLIC_SUPABASE_URL: 'test-supabase-url',
    POSTGRES_URL_NON_POOLING: 'test-postgres-url-non-pooling',
    SUPABASE_JWT_SECRET: 'test-supabase-jwt-secret',
    POSTGRES_USER: 'test-postgres-user',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-supabase-anon-key',
    POSTGRES_PASSWORD: 'test-postgres-password',
    
    // Upstash (Redis)
    KV_URL: 'test-kv-url',
    KV_REST_API_READ_ONLY_TOKEN: 'test-kv-read-only-token',
    KV_REST_API_TOKEN: 'test-kv-token',
    KV_REST_API_URL: 'test-kv-rest-api-url',
    
    // Statsig
    NEXT_PUBLIC_STATSIG_CLIENT_KEY: 'test-statsig-client-key',
  },
}));

// Clean up after each test
afterEach(() => {
  cleanup();
});

// MSW server setup for API mocking
export const createMockServer = (...handlers: RequestHandler[]) => {
  const server = setupServer(...handlers);

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  return server;
};
