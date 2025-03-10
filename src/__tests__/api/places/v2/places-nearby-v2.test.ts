import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fixtureResponse from '@/__fixtures__/googe/places-new/response.json';
import { GET } from '@/app/api/places/v2/route';
import { findMatchingKeyword, createSimplifiedPlace } from '@/lib/places-utils';
import { redis } from '@/lib/redis';

// Mock the Redis module
vi.mock('@/lib/redis', () => {
  return {
    redis: {
      get: vi.fn(),
      set: vi.fn(),
    },
    CACHE_EXPIRATION_TIME: 604800, // 7 days in seconds
    generatePlacesTextSearchCacheKey: vi
      .fn()
      .mockImplementation(({ textQuery, location }) => {
        const normalizedLocation = location
          ? `${parseFloat(location.split(',')[0]).toFixed(2)},${parseFloat(
              location.split(',')[1]
            ).toFixed(2)}`
          : '';
        return `places-text:${textQuery.toLowerCase()}:loc:${normalizedLocation}:0`;
      }),
  };
});

// Mock the places-utils module
vi.mock('@/lib/places-utils', () => {
  return {
    findMatchingKeyword: vi
      .fn()
      .mockImplementation((place, keywords, lowercaseKeywords) => {
        // Simple implementation that checks if any keyword is in the place name
        const placeName = place.name.toLowerCase();
        return keywords.find((keyword: string, index: number) =>
          placeName.includes(lowercaseKeywords[index])
        );
      }),
    createSimplifiedPlace: vi
      .fn()
      .mockImplementation((place, category, emoji) => {
        return {
          id: place.id || place.place_id, // Handle both formats
          name: place.name,
          formattedAddress: place.formattedAddress || place.vicinity, // Handle both formats
          location: place.location || {
            latitude: place.geometry?.location?.lat,
            longitude: place.geometry?.location?.lng,
          }, // Handle both formats
          category,
          emoji,
          priceLevel:
            place.priceLevel !== 'PRICE_LEVEL_UNSPECIFIED'
              ? place.priceLevel
              : null,
          openNow:
            place.currentOpeningHours?.openNow ||
            place.opening_hours?.open_now ||
            null, // Handle both formats
        };
      }),
  };
});

// Environment variables are now mocked globally in src/__tests__/setup.ts

// Mock the categoryEmojis
vi.mock('@/services/places', () => {
  return {
    categoryEmojis: {
      pizza: '🍕',
      coffee: '☕️',
      mexican: '🌮',
      sandwich: '🥪',
      restaurant: '🍴',
      lodging: '🏨',
      bar: '🍺',
      cafe: '☕️',
    },
  };
});

// Transform the fixture data to match the expected format for the API
const mockFetchResponse = {
  places: fixtureResponse.results.map((place) => ({
    id: place.place_id,
    name: place.name,
    types: place.types,
    formattedAddress: place.vicinity,
    location: {
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
    },
    priceLevel: place.price_level
      ? `PRICE_LEVEL_${place.price_level}`
      : undefined,
    currentOpeningHours: {
      openNow: place.opening_hours?.open_now,
      periods: [],
      weekdayDescriptions: [],
    },
    // Add other properties as needed
    rating: place.rating,
    photos: place.photos,
    businessStatus: place.business_status,
    iconMaskBaseUri: place.icon_mask_base_uri,
    iconBackgroundColor: place.icon_background_color,
  })),
};

// Set up the global fetch mock
global.fetch = vi.fn();

describe('Places New API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock implementations
    vi.mocked(redis.get).mockResolvedValue(null);
    vi.mocked(redis.set).mockResolvedValue(undefined);

    // Reset the fetch mock for each test
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockFetchResponse),
    });
  });

  it('should return 400 if textQuery is missing', async () => {
    // Create a mock request without textQuery
    const request = new NextRequest(
      'http://localhost:3000/api/places/nearby/places-new?location=37.7749,-122.4194'
    );

    // Call the API route
    const response = await GET(request);

    // Check the response
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Missing required parameter: textQuery');
  });

  it('should return 400 if location is missing', async () => {
    // Create a mock request without location
    const request = new NextRequest(
      'http://localhost:3000/api/places/nearby/places-new?textQuery=coffee'
    );

    // Call the API route
    const response = await GET(request);

    // Check the response
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Missing required parameter: location');
  });

  it('should return cached data if available', async () => {
    // Mock cached data
    const cachedData = [
      {
        id: 'cached1',
        name: 'Cached Coffee Shop',
        formattedAddress: '123 Cached Street',
        location: { latitude: 37.7749, longitude: -122.4194 },
        category: 'coffee',
        emoji: '☕️',
        priceLevel: 'PRICE_LEVEL_MODERATE',
        openNow: true,
      },
    ];
    vi.mocked(redis.get).mockResolvedValue(cachedData);

    // Create a mock request
    const request = new NextRequest(
      'http://localhost:3000/api/places/nearby/places-new?textQuery=coffee&location=37.7749,-122.4194'
    );

    // Call the API route
    const response = await GET(request);

    // Check the response
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.places).toEqual(cachedData);
    expect(data.count).toBe(1);

    // Verify that fetch was not called
    expect(global.fetch).not.toHaveBeenCalled();

    // Verify that the cache was checked
    expect(redis.get).toHaveBeenCalledWith(expect.any(String));

    // Verify that the cache was not set
    expect(redis.set).not.toHaveBeenCalled();
  });

  it('should fetch and process data if cache is empty', async () => {
    // Create a mock request
    const request = new NextRequest(
      'http://localhost:3000/api/places/nearby/places-new?textQuery=restaurant|bar|lodging&location=37.7749,-122.4194'
    );

    // Call the API route
    const response = await GET(request);

    // Check the response
    expect(response.status).toBe(200);
    const data = await response.json();

    // The fixture has multiple places with restaurant, bar, or lodging types
    expect(data.places.length).toBeGreaterThan(0);

    // Verify that fetch was called
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        'https://places.googleapis.com/v1/places:searchText?key=test-api-key'
      ),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Goog-FieldMask': '*',
        }),
        body: expect.any(String),
      })
    );

    // Verify that findMatchingKeyword was called for each place in the fixture
    expect(findMatchingKeyword).toHaveBeenCalledTimes(
      mockFetchResponse.places.length
    );

    // Verify that createSimplifiedPlace was called at least once
    expect(createSimplifiedPlace).toHaveBeenCalled();

    // Verify that the cache was checked
    expect(redis.get).toHaveBeenCalledWith(expect.any(String));

    // Verify that the cache was set
    expect(redis.set).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Array),
      expect.objectContaining({ ex: expect.any(Number) })
    );
  });

  it('should respect the maxResults parameter', async () => {
    // Create a mock request with maxResults=2
    const request = new NextRequest(
      'http://localhost:3000/api/places/nearby/places-new?textQuery=restaurant|bar|lodging&location=37.7749,-122.4194&maxResults=2'
    );

    // Call the API route
    const response = await GET(request);

    // Check the response
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.places.length).toBeLessThanOrEqual(2);
    expect(data.count).toBeLessThanOrEqual(2);
  });

  it('should handle API errors gracefully', async () => {
    // Mock fetch to return an error
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ error: 'API error' }),
    });

    // Create a mock request
    const request = new NextRequest(
      'http://localhost:3000/api/places/nearby/places-new?textQuery=coffee&location=37.7749,-122.4194'
    );

    // Call the API route
    const response = await GET(request);

    // Check the response
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to fetch places');
  });

  it('should handle exceptions gracefully', async () => {
    // Mock fetch to throw an error
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    // Create a mock request
    const request = new NextRequest(
      'http://localhost:3000/api/places/nearby/places-new?textQuery=coffee&location=37.7749,-122.4194'
    );

    // Call the API route
    const response = await GET(request);

    // Check the response
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to process request');
  });

  it('should bypass cache when bypassCache=true', async () => {
    // Mock cached data
    const cachedData = [
      {
        id: 'cached1',
        name: 'Cached Coffee Shop',
        formattedAddress: '123 Cached Street',
        location: { latitude: 37.7749, longitude: -122.4194 },
        category: 'coffee',
        emoji: '☕️',
        priceLevel: 'PRICE_LEVEL_MODERATE',
        openNow: true,
      },
    ];
    vi.mocked(redis.get).mockResolvedValue(cachedData);

    // Create a mock request with bypassCache=true
    const request = new NextRequest(
      'http://localhost:3000/api/places/nearby/places-new?textQuery=restaurant&location=37.7749,-122.4194&bypassCache=true'
    );

    // Call the API route
    const response = await GET(request);

    // Check the response
    expect(response.status).toBe(200);
    const data = await response.json();
    // The actual number of places may vary based on the implementation
    // Just check that it's not the cached data
    expect(data.places.length).not.toBe(0);

    // Verify that fetch was called despite having cached data
    expect(global.fetch).toHaveBeenCalled();
  });

  it('should handle bounds parameter correctly', async () => {
    // Create a mock request with bounds
    const request = new NextRequest(
      'http://localhost:3000/api/places/nearby/places-new?textQuery=restaurant&location=37.7749,-122.4194&bounds=37.7,-122.5|37.8,-122.3'
    );

    // Call the API route
    const response = await GET(request);

    // Check the response
    expect(response.status).toBe(200);

    // Verify that fetch was called with the correct request body
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining('"rectangle"'),
      })
    );
  });

  it('should handle invalid bounds format gracefully', async () => {
    // Create a mock request with invalid bounds
    const request = new NextRequest(
      'http://localhost:3000/api/places/nearby/places-new?textQuery=restaurant&location=37.7749,-122.4194&bounds=invalid'
    );

    // Call the API route
    const response = await GET(request);

    // Check the response
    expect(response.status).toBe(200);

    // Verify that fetch was called with circle locationBias instead of rectangle
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining('"circle"'),
      })
    );
  });

  it('should properly process multiple keywords in textQuery with batching', async () => {
    // Reset mocks
    vi.clearAllMocks();

    // Create a mock request with multiple keywords separated by pipe
    const request = new NextRequest(
      'http://localhost:3000/api/places/nearby/places-new?textQuery=coffee|restaurant|bar&location=37.7749,-122.4194'
    );

    // Mock the fetch response to include places matching different keywords
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        places: [
          // Coffee place
          {
            id: 'coffee1',
            name: 'Coffee Shop',
            types: ['cafe', 'food'],
            formattedAddress: '123 Coffee St',
            location: {
              latitude: 37.7749,
              longitude: -122.4194,
            },
          },
          // Restaurant place
          {
            id: 'restaurant1',
            name: 'Fine Dining',
            types: ['restaurant', 'food'],
            formattedAddress: '456 Restaurant Ave',
            location: {
              latitude: 37.775,
              longitude: -122.4195,
            },
          },
          // Bar place
          {
            id: 'bar1',
            name: 'Cocktail Bar',
            types: ['bar', 'nightlife'],
            formattedAddress: '789 Bar Blvd',
            location: {
              latitude: 37.7751,
              longitude: -122.4196,
            },
          },
        ],
      }),
    });

    // Call the API route
    const response = await GET(request);

    // Check the response
    expect(response.status).toBe(200);
    const data = await response.json();

    // Verify that we got places back
    expect(data.places.length).toBeGreaterThan(0);

    // Verify that findMatchingKeyword was called for each place
    expect(findMatchingKeyword).toHaveBeenCalledTimes(3);

    // Verify that findMatchingKeyword was called with the correct parameters
    expect(findMatchingKeyword).toHaveBeenCalledWith(
      expect.any(Object),
      expect.arrayContaining(['coffee', 'restaurant', 'bar']),
      expect.arrayContaining(['coffee', 'restaurant', 'bar'])
    );

    // Verify that createSimplifiedPlace was called for each matching place
    expect(createSimplifiedPlace).toHaveBeenCalledTimes(data.places.length);

    // Verify that only one API call was made despite having multiple keywords
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Verify that the textQuery in the request body includes all keywords
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining('"textQuery":"coffee|restaurant|bar"'),
      })
    );

    // Verify that the cache was set with the combined cache key
    expect(redis.set).toHaveBeenCalledWith(
      expect.stringContaining('coffee|restaurant|bar'),
      expect.any(Array),
      expect.any(Object)
    );
  });

  it('should respect maxResults parameter with multiple keywords in textQuery', async () => {
    // Reset mocks
    vi.clearAllMocks();

    // Create a mock request with multiple keywords and maxResults=1
    const request = new NextRequest(
      'http://localhost:3000/api/places/nearby/places-new?textQuery=coffee|restaurant|bar&location=37.7749,-122.4194&maxResults=1'
    );

    // Mock the fetch response to include places matching different keywords
    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        places: [
          // Coffee place
          {
            id: 'coffee1',
            name: 'Coffee Shop',
            types: ['cafe', 'food'],
            formattedAddress: '123 Coffee St',
            location: {
              latitude: 37.7749,
              longitude: -122.4194,
            },
          },
          // Restaurant place
          {
            id: 'restaurant1',
            name: 'Fine Dining',
            types: ['restaurant', 'food'],
            formattedAddress: '456 Restaurant Ave',
            location: {
              latitude: 37.775,
              longitude: -122.4195,
            },
          },
          // Bar place
          {
            id: 'bar1',
            name: 'Cocktail Bar',
            types: ['bar', 'nightlife'],
            formattedAddress: '789 Bar Blvd',
            location: {
              latitude: 37.7751,
              longitude: -122.4196,
            },
          },
        ],
      }),
    });

    // Call the API route
    const response = await GET(request);

    // Check the response
    expect(response.status).toBe(200);
    const data = await response.json();

    // Verify that we got exactly 1 place back (respecting maxResults)
    expect(data.places.length).toBe(1);
    expect(data.count).toBe(1);

    // Verify that the API request included the maxResults parameter
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining('"maxResultCount":1'),
      })
    );

    // Verify that we still processed all places from the API
    expect(findMatchingKeyword).toHaveBeenCalledTimes(3);

    // But we only created simplified places for the ones we're returning
    // (This might vary based on implementation - some might create all and then slice)
    expect(createSimplifiedPlace).toHaveBeenCalled();

    // Verify that we cached the full results, not just the limited ones
    expect(redis.set).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Array),
      expect.any(Object)
    );
  });
});
