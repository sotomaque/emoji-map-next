import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/merchant/search/route';

// Types
type RequestBody = {
  name?: string;
  city?: string;
  state?: string;
};

// Mock data
const mockGoogleResponse = {
  places: [
    {
      id: 'place-1',
      formattedAddress: '123 Main St, San Francisco, CA 94105',
      nationalPhoneNumber: '+1 (555) 123-4567',
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
      },
      displayName: {
        text: 'Test Business',
      },
    },
    {
      id: 'place-2',
      formattedAddress: '456 Market St, San Francisco, CA 94105',
      nationalPhoneNumber: '+1 (555) 987-6543',
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
      },
      displayName: {
        text: 'Another Business',
      },
    },
  ],
};

// Helper function to create NextRequest
function createNextRequest(body: RequestBody): NextRequest {
  return new NextRequest('http://localhost', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('Merchant Search Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should handle missing required fields', async () => {
    const request = createNextRequest({});

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid data');
  });

  it('should handle partial required fields', async () => {
    const request = createNextRequest({
      name: 'Test Business',
      // missing city and state
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid data');
  });

  it('should handle empty string fields', async () => {
    const request = createNextRequest({
      name: '',
      city: '',
      state: '',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid data');
  });

  it('should make API call with correct parameters', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockGoogleResponse),
    });
    global.fetch = mockFetch;

    const request = createNextRequest({
      name: 'Test Business',
      city: 'San Francisco',
      state: 'CA',
    });

    await POST(request);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('places:searchText');
    expect(JSON.parse(options.body).textQuery).toBe(
      'Test Business in San Francisco, CA'
    );
  });

  it('should handle successful API response', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      json: () => Promise.resolve(mockGoogleResponse),
    } as Response);

    const request = createNextRequest({
      name: 'Test Business',
      city: 'San Francisco',
      state: 'CA',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(2);
    expect(data.count).toBe(2);
    expect(data.data[0]).toEqual({
      id: 'place-1',
      formattedAddress: '123 Main St, San Francisco, CA 94105',
      nationalPhoneNumber: '+1 (555) 123-4567',
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
      },
      displayName: 'Test Business',
    });
  });

  it('should handle API error response', async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error('API Error'));

    const request = createNextRequest({
      name: 'Test Business',
      city: 'San Francisco',
      state: 'CA',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Error fetching data');
  });

  it('should handle invalid API response format', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      json: () =>
        Promise.resolve({
          places: [
            {
              invalid: 'data',
            },
          ],
        }),
    } as Response);

    const request = createNextRequest({
      name: 'Test Business',
      city: 'San Francisco',
      state: 'CA',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid data');
  });

  it('should handle empty API response', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      json: () => Promise.resolve({ places: [] }),
    } as Response);

    const request = createNextRequest({
      name: 'Test Business',
      city: 'San Francisco',
      state: 'CA',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(0);
    expect(data.count).toBe(0);
  });
});
