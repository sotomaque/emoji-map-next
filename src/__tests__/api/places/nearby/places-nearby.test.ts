import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../../../../app/api/places/nearby/route';

// Mock the environment variables and Next.js modules
vi.mock('@/src/env', () => {
  return {
    env: {
      GOOGLE_PLACES_API_KEY: 'test-api-key',
      GOOGLE_PLACES_URL:
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
    },
  };
});

// Mock the fetch function
const mockFetchResponse = {
  status: 'OK',
  results: [
    {
      place_id: 'place123',
      name: 'Test Restaurant',
      geometry: {
        location: {
          lat: 37.7749,
          lng: -122.4194,
        },
      },
      vicinity: '123 Test Street',
      price_level: 2,
      opening_hours: {
        open_now: true,
      },
      rating: 4.5,
    },
  ],
};

describe('Nearby Places API Route', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();

    // Mock the global fetch function
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockFetchResponse),
    });

    // Mock console.log and console.error to keep test output clean
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return nearby places when valid parameters are provided', async () => {
    // Create a mock request with valid parameters
    const request = new NextRequest(
      new URL(
        'http://localhost:3000/api/places/nearby?location=37.7749,-122.4194&type=restaurant'
      )
    );

    // Call the API route handler
    const response = await GET(request);
    const data = await response.json();

    // Verify the fetch was called with the correct URL
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('location=37.7749%2C-122.4194')
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('type=restaurant')
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('key=test-api-key')
    );

    // Verify the response structure
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('places');
    expect(data.places).toBeInstanceOf(Array);
    expect(data.places.length).toBe(1);

    // Verify the place data is transformed correctly
    const place = data.places[0];
    expect(place).toHaveProperty('placeId', 'place123');
    expect(place).toHaveProperty('name', 'Test Restaurant');
    expect(place).toHaveProperty('coordinate');
    expect(place.coordinate).toHaveProperty('latitude', 37.7749);
    expect(place.coordinate).toHaveProperty('longitude', -122.4194);
    expect(place).toHaveProperty('description', '123 Test Street');
    expect(place).toHaveProperty('priceLevel', 2);
    expect(place).toHaveProperty('openNow', true);
    expect(place).toHaveProperty('rating', 4.5);
  });

  it('should return 400 when location parameter is missing', async () => {
    // Create a mock request with missing location
    const request = new NextRequest(
      new URL('http://localhost:3000/api/places/nearby?type=restaurant')
    );

    // Call the API route handler
    const response = await GET(request);
    const data = await response.json();

    // Verify the response
    expect(response.status).toBe(400);
    expect(data).toHaveProperty(
      'error',
      'Missing required parameter: location'
    );
  });

  it('should return 400 when type parameter is missing', async () => {
    // Create a mock request with missing type
    const request = new NextRequest(
      new URL(
        'http://localhost:3000/api/places/nearby?location=37.7749,-122.4194'
      )
    );

    // Call the API route handler
    const response = await GET(request);
    const data = await response.json();

    // Verify the response
    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error', 'Missing required parameter: type');
  });

  it('should handle keywords parameter correctly', async () => {
    // Create a mock request with keywords
    const request = new NextRequest(
      new URL(
        'http://localhost:3000/api/places/nearby?location=37.7749,-122.4194&type=restaurant&keywords=pizza,italian'
      )
    );

    // Mock fetch to return different responses for each keyword
    global.fetch = vi
      .fn()
      .mockImplementationOnce(() => ({
        json: () =>
          Promise.resolve({
            status: 'OK',
            results: [
              {
                place_id: 'pizza1',
                name: 'Pizza Place',
                geometry: { location: { lat: 37.7, lng: -122.4 } },
                vicinity: 'Pizza Street',
              },
            ],
          }),
      }))
      .mockImplementationOnce(() => ({
        json: () =>
          Promise.resolve({
            status: 'OK',
            results: [
              {
                place_id: 'italian1',
                name: 'Italian Restaurant',
                geometry: { location: { lat: 37.8, lng: -122.5 } },
                vicinity: 'Italian Avenue',
              },
            ],
          }),
      }));

    // Call the API route handler
    const response = await GET(request);
    const data = await response.json();

    // Verify fetch was called twice (once for each keyword)
    expect(global.fetch).toHaveBeenCalledTimes(2);

    // Verify the first call includes the pizza keyword
    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('keyword=pizza')
    );

    // Verify the second call includes the italian keyword
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('keyword=italian')
    );

    // Verify the response contains both places
    expect(response.status).toBe(200);
    expect(data.places.length).toBe(2);
    expect(data.places[0].placeId).toBe('pizza1');
    expect(data.places[1].placeId).toBe('italian1');
  });

  it('should handle API errors gracefully', async () => {
    // Create a mock request
    const request = new NextRequest(
      new URL(
        'http://localhost:3000/api/places/nearby?location=37.7749,-122.4194&type=restaurant'
      )
    );

    // Mock fetch to return an error
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        status: 'INVALID_REQUEST',
        error_message: 'The provided API key is invalid',
      }),
    });

    // Call the API route handler
    const response = await GET(request);
    const data = await response.json();

    // Verify the response
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('places');
    expect(data.places).toBeInstanceOf(Array);
    expect(data.places.length).toBe(0);
  });

  it('should handle fetch errors gracefully', async () => {
    // Create a mock request
    const request = new NextRequest(
      new URL(
        'http://localhost:3000/api/places/nearby?location=40.7128,-74.0060&type=restaurant'
      )
    );

    // Mock fetch to throw an error
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    // Call the API route handler
    const response = await GET(request);
    const data = await response.json();

    // Verify the response
    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error', 'Failed to fetch nearby places');
  });
});
