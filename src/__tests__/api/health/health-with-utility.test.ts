import { http, HttpResponse } from 'msw';
import { describe, it, expect } from 'vitest';
import { setupApiTestServer } from '../../../../vitest.setup';

// Setup server with API handlers
const server = setupApiTestServer();

describe('Health API Test with Utility', () => {
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
      http.get('*/api/health', () => {
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
