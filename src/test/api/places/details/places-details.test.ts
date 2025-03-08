import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../../../../app/api/places/details/route';

// Mock the environment variables
vi.mock('@/src/env', () => {
  return {
    env: {
      GOOGLE_PLACES_API_KEY: 'test-api-key',
      GOOGLE_PLACES_DETAILS_URL:
        'https://maps.googleapis.com/maps/api/place/details/json',
      GOOGLE_PLACES_PHOTO_URL:
        'https://maps.googleapis.com/maps/api/place/photo',
    },
  };
});

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

describe('Place Details API Route', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();

    // Mock the global fetch function
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockPlaceDetailsResponse),
    });

    // Mock console.log and console.error to keep test output clean
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return place details when a valid placeId is provided', async () => {
    // Create a mock request with a valid placeId
    const request = new NextRequest(
      new URL('http://localhost:3000/api/places/details?placeId=place123')
    );

    // Call the API route handler
    const response = await GET(request);
    const data = await response.json();

    // Verify the fetch was called with the correct URL
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Check that the URL contains the expected parameters
    const fetchUrl = vi.mocked(global.fetch).mock.calls[0][0];
    expect(fetchUrl).toContain('place_id=place123');
    expect(fetchUrl).toContain('fields=name%2Cphotos%2Creviews');
    expect(fetchUrl).toContain('key=test-api-key');

    // Verify the response structure
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('placeDetails');

    // Verify photos are transformed correctly
    expect(data.placeDetails).toHaveProperty('photos');
    expect(data.placeDetails.photos).toBeInstanceOf(Array);
    expect(data.placeDetails.photos.length).toBe(2);
    expect(data.placeDetails.photos[0]).toContain('photoreference=photo1');
    expect(data.placeDetails.photos[1]).toContain('photoreference=photo2');

    // Verify reviews are transformed correctly
    expect(data.placeDetails).toHaveProperty('reviews');
    expect(data.placeDetails.reviews).toBeInstanceOf(Array);
    expect(data.placeDetails.reviews.length).toBe(2);
    expect(data.placeDetails.reviews[0]).toEqual({
      author: 'John Doe',
      text: 'Great place!',
      rating: 5,
    });
    expect(data.placeDetails.reviews[1]).toEqual({
      author: 'Jane Smith',
      text: 'Good food, but a bit pricey.',
      rating: 4,
    });
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
  });

  it('should handle API errors correctly', async () => {
    // Create a mock request
    const request = new NextRequest(
      new URL('http://localhost:3000/api/places/details?placeId=invalid')
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
    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error', 'The provided API key is invalid');
  });

  it('should handle fetch errors gracefully', async () => {
    // Create a mock request
    const request = new NextRequest(
      new URL('http://localhost:3000/api/places/details?placeId=place123')
    );

    // Mock fetch to throw an error
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    // Call the API route handler
    const response = await GET(request);
    const data = await response.json();

    // Verify the response
    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error', 'Failed to fetch place details');
  });

  it('should handle missing photos and reviews gracefully', async () => {
    // Create a mock request
    const request = new NextRequest(
      new URL('http://localhost:3000/api/places/details?placeId=place123')
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
