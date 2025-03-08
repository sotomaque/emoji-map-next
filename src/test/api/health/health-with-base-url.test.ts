import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Define a base URL for testing
const BASE_URL = 'https://api.example.com';

// Mock server setup with base URL
const server = setupServer(
  http.get(`${BASE_URL}/api/health`, () => {
    return HttpResponse.json(
      {
        status: 'ok',
        message: 'API is running',
        timestamp: new Date().toISOString(),
        environment: 'test',
      },
      { status: 200 }
    );
  })
);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());

describe('Health API Test with Base URL', () => {
  it('should fetch health data from a specific environment', async () => {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('message', 'API is running');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('environment', 'test');
  });

  it('handles different environments through URL configuration', async () => {
    // Add a handler for a different environment
    server.use(
      http.get('https://staging.example.com/api/health', () => {
        return HttpResponse.json(
          {
            status: 'ok',
            message: 'API is running',
            timestamp: new Date().toISOString(),
            environment: 'staging',
          },
          { status: 200 }
        );
      })
    );

    const response = await fetch('https://staging.example.com/api/health');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('environment', 'staging');
  });
});
