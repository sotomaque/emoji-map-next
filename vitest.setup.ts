import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import healthResponse from '@/__fixtures__/api/health/response.json';
import placesDetailsResponse from '@/__fixtures__/api/places/details/server-response.json';
import googleMapsResponse from '@/__fixtures__/api/places/nearby/google-response.json';
import placesNearbyResponse from '@/__fixtures__/api/places/nearby/response.json';
import userCreateFixture from '@/__fixtures__/api/webhooks/create.json';
import webhookSuccessResponse from '@/__fixtures__/api/webhooks/success-response.json';
import userUpdateFixture from '@/__fixtures__/api/webhooks/update.json';
import type { RequestHandler } from 'msw';

/**
 * Controls whether console logs are shown during tests
 * This can be controlled via the TEST_SILENT environment variable:
 * - When TEST_SILENT=1, logs are suppressed
 * - When TEST_SILENT is not set or has any other value, logs are shown
 */
const SHOW_CONSOLE_LOGS = process.env.TEST_SILENT !== '1';

// Store original console methods
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;
const originalInfo = console.info;
const originalDebug = console.debug;

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
    GOOGLE_PLACES_URL: 'https://places.googleapis.com/v1',

    // Next.js public env vars
    NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
    NEXT_PUBLIC_SITE_ENV: 'test',

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

    // Cache keys
    NEARBY_CACHE_KEY_VERSION: 'test-nearby-cache-key-version',
    DETAILS_CACHE_KEY_VERSION: 'test-details-cache-key-version',
    PHOTOS_CACHE_KEY_VERSION: 'test-photos-cache-key-version',
  },
}));

// Mock our logger
vi.mock('@/utils/log', () => ({
  log: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock redis
vi.mock('@/lib/redis', () => ({
  CACHE_EXPIRATION_TIME: 3600,
  redis: {
    set: vi.fn(),
  },
}));

// Setup global console mocking
beforeAll(() => {
  if (!SHOW_CONSOLE_LOGS) {
    console.log = vi.fn();
    console.error = vi.fn();
    console.warn = vi.fn();
    console.info = vi.fn();
    console.debug = vi.fn();
  } else {
    // If showing logs, still use vi.fn() to allow spying but pass through to original
    console.log = vi.fn((...args) => originalLog(...args));
    console.error = vi.fn((...args) => originalError(...args));
    console.warn = vi.fn((...args) => originalWarn(...args));
    console.info = vi.fn((...args) => originalInfo(...args));
    console.debug = vi.fn((...args) => originalDebug(...args));
  }
});

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

// Restore original console methods after all tests
afterAll(() => {
  console.log = originalLog;
  console.error = originalError;
  console.warn = originalWarn;
  console.info = originalInfo;
  console.debug = originalDebug;
});

// Define handlers for external API routes (Google, etc.)
export const externalApiHandlers = [
  // Google Places API - External endpoints
  http.get('https://places.googleapis.com/v1/places:searchText*', () => {
    return HttpResponse.json(googleMapsResponse, { status: 200 });
  }),
];

// Define handlers for internal API routes
export const internalApiHandlers = [
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

  // Webhook API
  http.post('*/api/webhooks*', () => {
    return HttpResponse.json(webhookSuccessResponse, { status: 200 });
  }),

  // Handle specific webhook routes
  http.post('*/api/webhooks/clerk', () => {
    return HttpResponse.json(webhookSuccessResponse, { status: 200 });
  }),

  http.post('*/api/webhooks/clerk/update', () => {
    return HttpResponse.json(webhookSuccessResponse, { status: 200 });
  }),

  http.post('*/api/webhooks/clerk/create', () => {
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
  }),
];

// Combine all handlers
export const defaultHandlers = [...externalApiHandlers, ...internalApiHandlers];

// MSW server setup for API mocking
export const createMockServer = (...handlers: RequestHandler[]) => {
  const server = setupServer(...handlers);

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  return server;
};

// Setup server with internal API handlers
export const setupApiTestServer = () => {
  const server = setupServer(...internalApiHandlers);

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  return server;
};

// Initialize the global server but don't start it automatically
// This allows individual test files to use their own server setup
export const globalServer = setupServer(...defaultHandlers);

// Clerk webhook fixtures and types
export const webhookFixtures = {
  userCreate: userCreateFixture,
  userUpdate: userUpdateFixture,
};

export type WebhookFixture =
  | typeof userCreateFixture
  | typeof userUpdateFixture;

export type MockedPrismaClient = {
  user: {
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
};

/**
 * Mock the Svix webhook verification with a specific fixture
 * @param fixture The webhook fixture to use
 */
export function mockClerkWebhook(fixture: WebhookFixture) {
  vi.mock('svix', () => ({
    Webhook: vi.fn().mockImplementation(() => ({
      verify: vi.fn().mockImplementation(() => fixture),
    })),
  }));
}

/**
 * Create a mock handler for Clerk webhooks
 * @param fixture The webhook fixture to use
 * @param mockPrisma The mocked Prisma client
 * @param path The API path to mock (default: '/api/webhooks')
 */
export function createClerkWebhookHandler(
  fixture: WebhookFixture,
  mockPrisma: MockedPrismaClient,
  path = '/api/webhooks'
) {
  return http.post(path, async ({ request }) => {
    // Manually simulate the webhook handler behavior
    const body = (await request.json()) as WebhookFixture;

    if (body.type === 'user.updated') {
      const userData = body.data;

      // Check if user exists
      await mockPrisma.user.findUnique({
        where: { clerkId: userData.id },
      });

      // Get email from the user data
      let email = '';
      if (userData.email_addresses && userData.email_addresses.length > 0) {
        email = userData.email_addresses[0].email_address;
      }

      // Update the user
      await mockPrisma.user.update({
        where: { clerkId: userData.id },
        data: {
          email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          username: userData.username,
          imageUrl: userData.image_url,
          updatedAt: new Date(userData.updated_at),
        },
      });
    } else if (body.type === 'user.created') {
      const userData = body.data;

      // Check if user exists
      const existingUser = await mockPrisma.user.findUnique({
        where: { clerkId: userData.id },
      });

      // Only create if user doesn't exist
      if (!existingUser) {
        // Get email from the user data
        let email = '';
        if (userData.email_addresses && userData.email_addresses.length > 0) {
          email = userData.email_addresses[0].email_address;
        }

        // Create the user
        await mockPrisma.user.create({
          data: {
            clerkId: userData.id,
            id: userData.id,
            email,
            firstName: userData.first_name,
            lastName: userData.last_name,
            username: userData.username,
            imageUrl: userData.image_url,
            createdAt: new Date(userData.created_at),
            updatedAt: new Date(userData.updated_at),
          },
        });
      }
    }

    // Return a response that matches the webhookSuccessResponse fixture format
    return HttpResponse.json(
      {
        success: true,
        message:
          body.type === 'user.created'
            ? 'User created successfully'
            : 'User updated successfully',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  });
}
