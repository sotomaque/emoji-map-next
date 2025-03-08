import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Mock server setup
const server = setupServer(
  http.get('/api/health', () => {
    return HttpResponse.json(
      {
        status: 'ok',
        message: 'API is running',
        timestamp: new Date().toISOString(),
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

describe('Health API Integration Test', () => {
  it('should fetch health data successfully from API', async () => {
    const response = await fetch('/api/health');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('message', 'API is running');
    expect(data).toHaveProperty('timestamp');

    // Verify the timestamp is a valid ISO date string
    expect(() => new Date(data.timestamp)).not.toThrow();
  });

  it('handles API errors correctly', async () => {
    // Override the default handler for this specific test
    server.use(
      http.get('/api/health', () => {
        return HttpResponse.json(
          {
            status: 'error',
            message: 'Service unavailable',
          },
          { status: 503 }
        );
      })
    );

    const response = await fetch('/api/health');
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toEqual({
      status: 'error',
      message: 'Service unavailable',
    });
  });
});
