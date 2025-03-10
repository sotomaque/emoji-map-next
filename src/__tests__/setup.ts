import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import healthResponse from '@/__fixtures__/api/health/response.json';
import placesDetailsResponse from '@/__fixtures__/api/places/details/response.json';
import placesNearbyResponse from '@/__fixtures__/api/places/nearby/response.json';
import googlePlacesNewResponse from '@/__fixtures__/api/places/v2/google-response.json';
import placesV2Response from '@/__fixtures__/api/places/v2/response.json';
import webhookSuccessResponse from '@/__fixtures__/api/webhooks/success-response.json';
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
    GOOGLE_PLACES_URL:
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
    GOOGLE_PLACES_V2_URL: 'https://places.googleapis.com/v1/places:searchText',
    GOOGLE_PLACES_DETAILS_URL:
      'https://maps.googleapis.com/maps/api/place/details/json',
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
  vi.resetAllMocks();
});

// Define handlers for both external and internal API routes
export const defaultHandlers = [
  // External API handlers
  // Google Places API - External endpoints
  http.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json*', () => {
    return HttpResponse.json(
      googlePlacesNewResponse,
      { status: 200 }
    );
  }),
  
  http.get('https://maps.googleapis.com/maps/api/place/details/json*', () => {
    return HttpResponse.json(
      {
        result: {
          place_id: 'test_place_id',
          name: 'Test Place',
          formatted_address: '123 Test St, Test City',
          geometry: {
            location: {
              lat: 37.7749,
              lng: -122.4194
            }
          },
          photos: [
            { photo_reference: 'photo1' },
            { photo_reference: 'photo2' }
          ],
          types: ['restaurant', 'food']
        },
        status: 'OK'
      },
      { status: 200 }
    );
  }),
  
  http.post('https://places.googleapis.com/v1/places:searchText*', () => {
    return HttpResponse.json(
      googlePlacesNewResponse,
      { status: 200 }
    );
  }),
  
  // Internal API handlers
  // Health API
  http.get('*/api/health', () => {
    return HttpResponse.json(healthResponse, { status: 200 });
  }),
  
  http.get('*/api/health/error', () => {
    return HttpResponse.json(
      { status: 'error', message: 'Service unavailable' },
      { status: 503 }
    );
  }),
  
  // Places API
  http.get('*/api/places/nearby*', () => {
    return HttpResponse.json(placesNearbyResponse, { status: 200 });
  }),
  
  http.get('*/api/places/details*', () => {
    return HttpResponse.json(placesDetailsResponse, { status: 200 });
  }),
  
  http.get('*/api/places/v2*', () => {
    return HttpResponse.json(placesV2Response, { status: 200 });
  }),
  
  // Webhook API
  http.post('*/api/webhooks*', () => {
    return HttpResponse.json(webhookSuccessResponse, { status: 200 });
  }),
  
  // Handle missing parameters for API routes
  http.get('*/api/places/nearby', ({ request }) => {
    const url = new URL(request.url);
    if (!url.searchParams.get('location')) {
      return HttpResponse.json(
        { error: 'Missing required parameter: location' },
        { status: 400 }
      );
    }
    return HttpResponse.json(placesNearbyResponse, { status: 200 });
  }),
  
  http.get('*/api/places/details', ({ request }) => {
    const url = new URL(request.url);
    if (!url.searchParams.get('placeId')) {
      return HttpResponse.json(
        { error: 'Missing required parameter: placeId' },
        { status: 400 }
      );
    }
    return HttpResponse.json(placesDetailsResponse, { status: 200 });
  }),
  
  // Handle server errors
  http.get('*/api/places/nearby/error', () => {
    return HttpResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }),
  
  http.get('*/api/places/details/error', () => {
    return HttpResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  })
];

// MSW server setup for API mocking
export const createMockServer = (...handlers: RequestHandler[]) => {
  const server = setupServer(...handlers);

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  return server;
};

// Initialize the global server but don't start it automatically
// This allows individual test files to use their own server setup
export const globalServer = setupServer(...defaultHandlers);
