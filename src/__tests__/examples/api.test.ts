import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Mock server setup
const server = setupServer(
  http.get('https://api.example.com/data', () => {
    return HttpResponse.json(
      {
        success: true,
        data: { message: 'Hello from mocked API' },
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

describe('API Test Example', () => {
  it('fetches data successfully from API', async () => {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      data: { message: 'Hello from mocked API' },
    });
  });

  it('handles API errors correctly', async () => {
    // Override the default handler for this specific test
    server.use(
      http.get('https://api.example.com/data', () => {
        return HttpResponse.json(
          {
            success: false,
            error: 'Internal Server Error',
          },
          { status: 500 }
        );
      })
    );

    const response = await fetch('https://api.example.com/data');
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      success: false,
      error: 'Internal Server Error',
    });
  });
});
