import { NextRequest } from 'next/server';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET } from '@/app/api/places/nearby/route';
import { redis } from '@/lib/redis';
import { buildTextQueryFromKeys } from '@/services/places/nearby/build-text-query-from-string/build-text-query-from-string';
import { setCacheResults } from '@/services/places/nearby/cache-results/cache-results';
import { fetchAndProcessGoogleData } from '@/services/places/nearby/fetch-and-process-google-data/fetch-and-process-google-data';
import { generateCacheKey } from '@/services/places/nearby/generate-cache-key/generate-cache-key';
import { getSearchParams } from '@/services/places/nearby/get-search-params/get-search-params';
import type {
  PlacesResponse,
  SimplifiedMapPlace,
} from '@/types/local-places-types';

// Mock all the dependencies
vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock(
  '@/services/places/nearby/fetch-and-process-google-data/fetch-and-process-google-data',
  () => ({
    fetchAndProcessGoogleData: vi.fn(),
  })
);

vi.mock('@/services/places/nearby/get-search-params/get-search-params', () => ({
  getSearchParams: vi.fn(),
}));

vi.mock(
  '@/services/places/nearby/generate-cache-key/generate-cache-key',
  () => ({
    generateCacheKey: vi.fn(),
  })
);

vi.mock(
  '@/services/places/nearby/build-text-query-from-string/build-text-query-from-string',
  () => ({
    buildTextQueryFromKeys: vi.fn(),
  })
);

vi.mock('@/services/places/nearby/cache-results/cache-results', () => ({
  setCacheResults: vi.fn(),
}));

// Mock console methods to prevent noise in test output
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('Places Nearby API', () => {
  // Sample data for tests
  const mockLocation = '32.8662,-117.2268';
  const mockKeys = [1, 2]; // pizza, beer
  const mockTextQuery = 'pizza|beer';
  const mockCacheKey = 'places-v2:32.8662,-117.2268';

  const mockSimplifiedPlace: SimplifiedMapPlace = {
    id: 'place123',
    location: {
      latitude: 32.8662,
      longitude: -117.2268,
    },
    category: 'pizza',
    emoji: '🍕',
  };

  const mockPlacesResponse: PlacesResponse = {
    places: [mockSimplifiedPlace],
    count: 1,
    cacheHit: false,
  };

  // Default buffer miles and limit from the route.ts file
  const DEFAULT_BUFFER_MILES = 10;
  const DEFAULT_LIMIT = 20;

  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();

    // Default mock implementations
    (getSearchParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      keys: mockKeys,
      location: mockLocation,
      bypassCache: false,
      openNow: undefined,
      limit: undefined,
      bufferMiles: undefined,
    });

    (generateCacheKey as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockCacheKey
    );
    (
      buildTextQueryFromKeys as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue(mockTextQuery);
    (
      fetchAndProcessGoogleData as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockPlacesResponse);
    (redis.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null); // Default to cache miss
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return places data for valid request', async () => {
    // Create a mock request
    const request = new NextRequest(
      'https://example.com/api/places/v2?key=1&key=2&location=32.8662,-117.2268'
    );

    // Execute the handler
    const response = await GET(request);
    const data = await response.json();

    // Verify the response
    expect(response.status).toBe(200);
    expect(data).toEqual(mockPlacesResponse);

    // Verify the correct functions were called
    expect(getSearchParams).toHaveBeenCalledWith(request);
    expect(generateCacheKey).toHaveBeenCalledWith({ location: mockLocation });
    expect(buildTextQueryFromKeys).toHaveBeenCalledWith(mockKeys);
    expect(redis.get).toHaveBeenCalledWith(mockCacheKey);

    // Update expectation to match the actual implementation with default values
    expect(fetchAndProcessGoogleData).toHaveBeenCalledWith({
      textQuery: mockTextQuery,
      location: mockLocation,
      openNow: undefined,
      limit: DEFAULT_LIMIT,
      bufferMiles: DEFAULT_BUFFER_MILES,
    });

    expect(setCacheResults).toHaveBeenCalledWith({
      cacheKey: mockCacheKey,
      processedPlaces: mockPlacesResponse,
    });
  });

  it('should return cached data when available and sufficient', async () => {
    // Create a cached response with cacheHit set to true
    const cachedResponse = {
      ...mockPlacesResponse,
      count: 25, // More than DEFAULT_LIMIT
      cacheHit: true,
    };

    // Mock redis.get to return the cached response with cacheHit: true
    (redis.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...cachedResponse,
      cacheHit: false, // The route will set this to true
    });

    const request = new NextRequest(
      'https://example.com/api/places/v2?key=1&key=2&location=32.8662,-117.2268'
    );
    const response = await GET(request);
    const data = await response.json();

    // Update expectation to match the actual implementation
    expect(response.status).toBe(200);
    expect(data).toEqual({
      ...cachedResponse,
      cacheHit: true, // The route sets this to true for cache hits
    });

    // Verify Google API was not called
    expect(fetchAndProcessGoogleData).not.toHaveBeenCalled();
    expect(setCacheResults).not.toHaveBeenCalled();
  });

  it('should fetch from Google when cache is bypassed', async () => {
    // Mock bypassCache parameter
    (getSearchParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      keys: mockKeys,
      location: mockLocation,
      bypassCache: true,
      openNow: undefined,
      limit: undefined,
      bufferMiles: undefined,
    });

    const request = new NextRequest(
      'https://example.com/api/places/v2?key=1&key=2&location=32.8662,-117.2268&bypassCache=true'
    );
    await GET(request);

    // Verify cache was not checked
    expect(redis.get).not.toHaveBeenCalled();

    // Verify Google API was called
    expect(fetchAndProcessGoogleData).toHaveBeenCalled();
  });

  it('should fetch from Google when cached data is insufficient for requested limit', async () => {
    // Mock a cache hit with fewer places than requested
    const cachedResponse = { ...mockPlacesResponse, count: 5 };
    (redis.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      cachedResponse
    );

    // Mock a limit parameter higher than cached count
    (getSearchParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      keys: mockKeys,
      location: mockLocation,
      bypassCache: false,
      openNow: undefined,
      limit: 10,
      bufferMiles: undefined,
    });

    const request = new NextRequest(
      'https://example.com/api/places/v2?key=1&key=2&location=32.8662,-117.2268&limit=10'
    );
    await GET(request);

    // Verify Google API was called despite cache hit
    expect(redis.get).toHaveBeenCalled();
    expect(fetchAndProcessGoogleData).toHaveBeenCalled();
  });

  it('should return error for missing location parameter', async () => {
    // Mock missing location
    (getSearchParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      keys: mockKeys,
      location: null,
      bypassCache: false,
      openNow: undefined,
      limit: undefined,
      bufferMiles: undefined,
    });

    const request = new NextRequest(
      'https://example.com/api/places/v2?key=1&key=2'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Missing required parameter: location' });

    // Verify no further processing occurred
    expect(redis.get).not.toHaveBeenCalled();
    expect(fetchAndProcessGoogleData).not.toHaveBeenCalled();
  });

  it('should use all valid category keys when no keys are provided', async () => {
    // Mock getSearchParams to return all valid keys when none are provided
    const allValidKeys = Array.from({ length: 25 }, (_, i) => i + 1); // Keys 1-25
    (getSearchParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      keys: allValidKeys,
      location: mockLocation,
      bypassCache: false,
      openNow: undefined,
      limit: undefined,
      bufferMiles: undefined,
    });

    const request = new NextRequest(
      'https://example.com/api/places/v2?location=32.8662,-117.2268'
    );
    const response = await GET(request);

    // Verify the response is successful (not an error)
    expect(response.status).toBe(200);

    // Verify the correct functions were called with all valid keys
    expect(buildTextQueryFromKeys).toHaveBeenCalledWith(allValidKeys);
    expect(fetchAndProcessGoogleData).toHaveBeenCalled();
  });

  it('should handle empty keys array by using all valid keys', async () => {
    // Mock empty keys array (getSearchParams should handle this by using all valid keys)
    const allValidKeys = Array.from({ length: 25 }, (_, i) => i + 1); // Keys 1-25
    (getSearchParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      keys: allValidKeys, // This is what getSearchParams would return when no keys are provided
      location: mockLocation,
      bypassCache: false,
      openNow: undefined,
      limit: undefined,
      bufferMiles: undefined,
    });

    const request = new NextRequest(
      'https://example.com/api/places/v2?location=32.8662,-117.2268'
    );
    const response = await GET(request);
    const data = await response.json();

    // Verify the response is successful (not an error)
    expect(response.status).toBe(200);
    expect(data).toEqual(mockPlacesResponse);

    // Verify the correct functions were called with all valid keys
    expect(buildTextQueryFromKeys).toHaveBeenCalledWith(allValidKeys);
  });

  it('should handle Google API errors gracefully', async () => {
    // Mock Google API error
    (
      fetchAndProcessGoogleData as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error('Google API error'));

    const request = new NextRequest(
      'https://example.com/api/places/v2?key=1&key=2&location=32.8662,-117.2268'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'An error occurred while processing your request',
    });
  });

  it('should return error when Google API fails even with cache available', async () => {
    // Mock a cache hit
    const cachedResponse = { ...mockPlacesResponse, cacheHit: true, count: 5 };
    (redis.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      cachedResponse
    );

    // Mock Google API error
    (
      fetchAndProcessGoogleData as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error('Google API error'));

    // Mock a limit parameter higher than cached count to force API call
    (getSearchParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      keys: mockKeys,
      location: mockLocation,
      bypassCache: false,
      openNow: undefined,
      limit: 10,
      bufferMiles: undefined,
    });

    const request = new NextRequest(
      'https://example.com/api/places/v2?key=1&key=2&location=32.8662,-117.2268&limit=10'
    );
    const response = await GET(request);
    const data = await response.json();

    // The current implementation returns a 500 error when Google API fails
    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'An error occurred while processing your request',
    });
  });

  it('should handle additional parameters correctly', async () => {
    // Mock request with all optional parameters
    (getSearchParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      keys: mockKeys,
      location: mockLocation,
      bypassCache: false,
      openNow: true,
      limit: 20,
      bufferMiles: 5,
    });

    const request = new NextRequest(
      'https://example.com/api/places/v2?key=1&key=2&location=32.8662,-117.2268&openNow=true&limit=20&bufferMiles=5'
    );

    await GET(request);

    // Verify parameters were passed correctly
    expect(fetchAndProcessGoogleData).toHaveBeenCalledWith({
      textQuery: mockTextQuery,
      location: mockLocation,
      openNow: true,
      limit: 20,
      bufferMiles: 5,
    });
  });

  it('should pass openNow parameter to Google API when provided', async () => {
    // Mock openNow parameter
    (getSearchParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      keys: mockKeys,
      location: mockLocation,
      bypassCache: false,
      openNow: true, // Set openNow to true
      limit: undefined,
      bufferMiles: undefined,
    });

    const request = new NextRequest(
      'https://example.com/api/places/v2?key=1&key=2&location=32.8662,-117.2268&openNow=true'
    );
    await GET(request);

    // Verify openNow was passed to Google API
    expect(fetchAndProcessGoogleData).toHaveBeenCalledWith({
      textQuery: mockTextQuery,
      location: mockLocation,
      openNow: true, // Verify openNow is passed as true
      limit: DEFAULT_LIMIT,
      bufferMiles: DEFAULT_BUFFER_MILES,
    });
  });
});
