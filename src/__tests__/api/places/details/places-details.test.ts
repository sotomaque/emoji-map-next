import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../../../../app/api/places/details/route';

// Mock the Redis module
vi.mock('@/lib/redis', () => {
  return {
    redis: {
      get: vi.fn(),
      set: vi.fn(),
    },
    PLACE_DETAILS_CACHE_EXPIRATION_TIME: 3600, // 1 hour in seconds
    generatePlaceDetailsCacheKey: vi.fn().mockImplementation((placeId) => {
      return `place-details:${placeId}`;
    }),
  };
});

// Environment variables are now mocked globally in src/__tests__/setup.ts

// Import the mocked Redis module
import { redis, generatePlaceDetailsCacheKey } from '@/lib/redis';

// Mock the fetch function
const mockPlaceDetailsResponse = {
  status: 'OK',
  result: {
    photos: [{ photo_reference: 'photo1' }, { photo_reference: 'photo2' }],
    reviews: [
      {
        author_name: 'John Doe',
        text: 'Great place!',
        rating: 5,
      },
      {
        author_name: 'Jane Smith',
        text: 'Good food, but a bit pricey.',
        rating: 4,
      },
    ],
  },
};

// Mock cached place details
const mockCachedPlaceDetails = {
  photos: [
    'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=photo-reference-1&key=test-api-key',
    'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=photo-reference-2&key=test-api-key',
  ],
  reviews: [
    {
      author: 'Test User 1',
      text: 'Great place!',
      rating: 5,
    },
    {
      author: 'Test User 2',
      text: 'Good food.',
      rating: 4,
    },
  ],
};

describe('Place Details API Route', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();

    // Mock the global fetch function
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockPlaceDetailsResponse),
    });

    // Mock Redis get to return null (cache miss)
    vi.mocked(redis.get).mockResolvedValue(null);

    // Mock console.log and console.error to keep test output clean
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return place details when a valid placeId is provided', async () => {
    // Create a mock request with a valid placeId
    const request = new NextRequest(
      new URL('http://localhost:3000/api/places/details?placeId=test-place-id')
    );

    // Call the API route handler
    const response = await GET(request);
    const data = await response.json();

    // Verify the cache was checked
    expect(redis.get).toHaveBeenCalledTimes(1);
    expect(generatePlaceDetailsCacheKey).toHaveBeenCalledWith('test-place-id');

    // Verify the fetch was called with the correct URL
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('place_id=test-place-id')
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('fields=name%2Cphotos%2Creviews')
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('key=test-api-key')
    );

    // Verify the response structure
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('placeDetails');
    expect(data).toHaveProperty('source', 'api');

    // Verify the place details structure
    const placeDetails = data.placeDetails;
    expect(placeDetails).toHaveProperty('photos');
    expect(placeDetails.photos).toBeInstanceOf(Array);
    expect(placeDetails.photos.length).toBe(2);
    expect(placeDetails).toHaveProperty('reviews');
    expect(placeDetails.reviews).toBeInstanceOf(Array);
    expect(placeDetails.reviews.length).toBe(2);

    // Verify the results were cached
    expect(redis.set).toHaveBeenCalledTimes(1);
    expect(redis.set).toHaveBeenCalled();
  });

  it('should return cached place details when available', async () => {
    // Mock Redis get to return cached data
    vi.mocked(redis.get).mockResolvedValue(mockCachedPlaceDetails);

    // Create a mock request with a valid placeId
    const request = new NextRequest(
      new URL('http://localhost:3000/api/places/details?placeId=test-place-id')
    );

    // Call the API route handler
    const response = await GET(request);
    const data = await response.json();

    // Verify the cache was checked
    expect(redis.get).toHaveBeenCalledTimes(1);
    expect(generatePlaceDetailsCacheKey).toHaveBeenCalledWith('test-place-id');

    // Verify fetch was NOT called (using cache)
    expect(global.fetch).not.toHaveBeenCalled();

    // Verify the response structure
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('placeDetails');
    expect(data).toHaveProperty('source', 'cache');

    // Verify the place details structure
    const placeDetails = data.placeDetails;
    expect(placeDetails).toHaveProperty('photos');
    expect(placeDetails.photos).toBeInstanceOf(Array);
    expect(placeDetails.photos.length).toBe(2);
    expect(placeDetails).toHaveProperty('reviews');
    expect(placeDetails.reviews).toBeInstanceOf(Array);
    expect(placeDetails.reviews.length).toBe(2);

    // Verify the cache was not updated
    expect(redis.set).not.toHaveBeenCalled();
  });

  it('should return 400 when placeId parameter is missing', async () => {
    // Create a mock request with missing placeId
    const request = new NextRequest(
      new URL('http://localhost:3000/api/places/details')
    );

    // Call the API route handler
    const response = await GET(request);
    const data = await response.json();

    // Verify the response
    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error', 'Missing required parameter: placeId');

    // Verify the cache was not checked
    expect(redis.get).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should handle API errors gracefully', async () => {
    // Mock fetch to return an error
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        status: 'INVALID_REQUEST',
        error_message: 'The provided API key is invalid',
      }),
    });

    // Create a mock request
    const request = new NextRequest(
      new URL('http://localhost:3000/api/places/details?placeId=test-place-id')
    );

    // Call the API route handler
    const response = await GET(request);
    const data = await response.json();

    // Verify the response
    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error', 'The provided API key is invalid');

    // Verify the cache was checked but not updated
    expect(redis.get).toHaveBeenCalledTimes(1);
    expect(redis.set).not.toHaveBeenCalled();
  });

  it('should handle fetch errors gracefully', async () => {
    // Mock fetch to throw an error
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    // Create a mock request
    const request = new NextRequest(
      new URL('http://localhost:3000/api/places/details?placeId=test-place-id')
    );

    // Call the API route handler
    const response = await GET(request);
    const data = await response.json();

    // Verify the response
    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error', 'Failed to fetch place details');

    // Verify the cache was checked but not updated
    expect(redis.get).toHaveBeenCalledTimes(1);
    expect(redis.set).not.toHaveBeenCalled();
  });

  it('should handle missing photos and reviews gracefully', async () => {
    // Create a mock request
    const request = new NextRequest(
      new URL('http://localhost:3000/api/places/details?placeId=test-place-id')
    );

    // Mock fetch to return a response with no photos or reviews
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        status: 'OK',
        result: {},
      }),
    });

    // Call the API route handler
    const response = await GET(request);
    const data = await response.json();

    // Verify the response
    expect(response.status).toBe(200);
    expect(data.placeDetails).toHaveProperty('photos');
    expect(data.placeDetails.photos).toEqual([]);
    expect(data.placeDetails).toHaveProperty('reviews');
    expect(data.placeDetails.reviews).toEqual([]);
  });
});
