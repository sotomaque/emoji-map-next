import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { beforeAll, afterAll, afterEach } from 'vitest';
import healthResponse from '@/__fixtures__/api/health/response.json';
import placesDetailsResponse from '@/__fixtures__/api/places/details/response.json';
import placesNearbyResponse from '@/__fixtures__/api/places/nearby/response.json';
import placesV2Response from '@/__fixtures__/api/places/v2/response.json';
import webhookSuccessResponse from '@/__fixtures__/api/webhooks/success-response.json';

// Define handlers for internal API routes
export const apiHandlers = [
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
  
  // Handle specific webhook routes
  http.post('*/api/webhooks/clerk', () => {
    return HttpResponse.json(webhookSuccessResponse, { status: 200 });
  }),
  
  http.post('*/api/webhooks/clerk/update', () => {
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

// Setup server with API handlers
export const setupApiTestServer = () => {
  const server = setupServer(...apiHandlers);
  
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
  
  return server;
}; 