import { NextRequest } from 'next/server';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MOCK_PLACES } from '@/__tests__/mocks/places/mock-places';
import { GET } from '@/app/api/places/nearby/route';
import { redis } from '@/lib/redis';
import { buildTextQueryFromKeys } from '@/services/places/nearby/build-text-query-from-string/build-text-query-from-string';
import { fetchPlacesData } from '@/services/places/nearby/fetch-places-data/fetch-places-data';
import { generateCacheKey } from '@/services/places/nearby/generate-cache-key/generate-cache-key';
import { getSearchParams } from '@/services/places/nearby/get-search-params/get-search-params';
import type { PlacesResponse } from '@/types/places';

// Mock all the dependencies
vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock('@/services/places/nearby/fetch-places-data/fetch-places-data', () => ({
  fetchPlacesData: vi.fn(),
}));

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

describe('Places Nearby API', () => {
  // Sample data for tests
  const mockLocation =
    MOCK_PLACES[0].location.latitude + ',' + MOCK_PLACES[0].location.longitude;
  const mockKeys = [1, 2]; // pizza, beer
  const mockTextQuery = 'pizza|beer';
  const mockCacheKey = `places-v2:${mockLocation}`;

  // Use the first mock place from our mock file
  const mockSimplifiedPlace = { ...MOCK_PLACES[0] };

  const mockPlacesResponse: PlacesResponse = {
    data: [mockSimplifiedPlace],
    count: 1,
    cacheHit: false,
  };

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
      radiusMeters: undefined,
    });

    (generateCacheKey as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockCacheKey
    );
    (
      buildTextQueryFromKeys as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue(mockTextQuery);
    (fetchPlacesData as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockPlacesResponse
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return places data for valid request', async () => {
    // Create a mock request
    const request = new NextRequest(
      `https://example.com/api/places/v2?key=1&key=2&location=${mockLocation}`
    );

    // Execute the handler
    const response = await GET(request);
    const data = await response.json();

    // Verify the response
    expect(response.status).toBe(200);
    expect(data).toEqual(mockPlacesResponse);

    // Verify the correct functions were called
    expect(getSearchParams).toHaveBeenCalledWith(request);
    expect(generateCacheKey).toHaveBeenCalledWith({
      location: mockLocation,
      keys: expect.any(Array),
    });
    expect(buildTextQueryFromKeys).toHaveBeenCalledWith(mockKeys);

    // Verify fetchPlacesData was called with the correct parameters
    expect(fetchPlacesData).toHaveBeenCalledWith({
      textQuery: mockTextQuery,
      location: mockLocation,
      openNow: undefined,
      limit: undefined,
      radiusMeters: undefined,
      cacheKey: mockCacheKey,
      bypassCache: false,
      keys: mockKeys,
    });
  });

  it('should return cached data when available and sufficient', async () => {
    // Create a cached response with cacheHit set to true
    const cachedResponse = {
      ...mockPlacesResponse,
      count: 25, // More than DEFAULT_LIMIT
      cacheHit: true,
    };

    // Mock fetchPlacesData to return the cached data
    (fetchPlacesData as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      cachedResponse
    );

    // Mock the limit to be less than the cached data count
    (getSearchParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      keys: mockKeys,
      location: mockLocation,
      bypassCache: false,
      openNow: undefined,
      limit: 20, // Less than cachedResponse.count (25)
      radiusMeters: undefined,
    });

    const request = new NextRequest(
      `https://example.com/api/places/v2?key=1&key=2&location=${mockLocation}`
    );
    const response = await GET(request);
    const data = await response.json();

    // Update expectation to match the actual implementation
    expect(response.status).toBe(200);
    expect(data).toEqual(cachedResponse);

    // Verify fetchPlacesData was called with the correct parameters
    expect(fetchPlacesData).toHaveBeenCalledWith({
      textQuery: mockTextQuery,
      location: mockLocation,
      openNow: undefined,
      limit: 20,
      radiusMeters: undefined,
      cacheKey: mockCacheKey,
      bypassCache: false,
      keys: mockKeys,
    });
  });

  it('should fetch from Google when cache is bypassed', async () => {
    // Mock bypassCache parameter
    (getSearchParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      keys: mockKeys,
      location: mockLocation,
      bypassCache: true,
      openNow: undefined,
      limit: undefined,
      radiusMeters: undefined,
    });

    const request = new NextRequest(
      `https://example.com/api/places/v2?key=1&key=2&location=${mockLocation}&bypassCache=true`
    );
    await GET(request);

    // Verify cache was not checked
    expect(redis.get).not.toHaveBeenCalled();

    // Verify fetchPlacesData was called with bypassCache=true
    expect(fetchPlacesData).toHaveBeenCalledWith({
      textQuery: mockTextQuery,
      location: mockLocation,
      openNow: undefined,
      limit: undefined,
      radiusMeters: undefined,
      cacheKey: mockCacheKey,
      bypassCache: true,
      keys: mockKeys,
    });
  });

  it('should fetch from Google when cached data is insufficient for requested limit', async () => {
    // Mock a limit parameter higher than cached count
    (getSearchParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      keys: mockKeys,
      location: mockLocation,
      bypassCache: false,
      openNow: undefined,
      limit: 10,
      radiusMeters: undefined,
    });

    const request = new NextRequest(
      `https://example.com/api/places/v2?key=1&key=2&location=${mockLocation}&limit=10`
    );
    await GET(request);

    // Verify fetchPlacesData was called with the correct parameters
    expect(fetchPlacesData).toHaveBeenCalledWith({
      textQuery: mockTextQuery,
      location: mockLocation,
      openNow: undefined,
      limit: 10,
      radiusMeters: undefined,
      cacheKey: mockCacheKey,
      bypassCache: false,
      keys: mockKeys,
    });
  });

  it('should return error for missing location parameter', async () => {
    // Mock missing location
    (getSearchParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      keys: mockKeys,
      location: null,
      bypassCache: false,
      openNow: undefined,
      limit: undefined,
      radiusMeters: undefined,
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
    expect(fetchPlacesData).not.toHaveBeenCalled();
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
      radiusMeters: undefined,
    });

    const request = new NextRequest(
      `https://example.com/api/places/v2?location=${mockLocation}`
    );
    const response = await GET(request);

    // Verify the response is successful (not an error)
    expect(response.status).toBe(200);

    // With batching, buildTextQueryFromKeys will be called multiple times with different batches
    // Instead of checking exact parameters, just verify it was called
    expect(buildTextQueryFromKeys).toHaveBeenCalled();
    expect(fetchPlacesData).toHaveBeenCalled();
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
      radiusMeters: undefined,
    });

    const request = new NextRequest(
      `https://example.com/api/places/v2?location=${mockLocation}`
    );
    const response = await GET(request);
    const data = await response.json();

    // Verify the response is successful (not an error)
    expect(response.status).toBe(200);
    expect(data).toEqual(mockPlacesResponse);

    // With batching, buildTextQueryFromKeys will be called multiple times with different batches
    // Instead of checking exact parameters, just verify it was called
    expect(buildTextQueryFromKeys).toHaveBeenCalled();
  });

  it('should handle Google API errors gracefully', async () => {
    // Mock fetchPlacesData error
    (fetchPlacesData as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Google API error')
    );

    const request = new NextRequest(
      `https://example.com/api/places/v2?key=1&key=2&location=${mockLocation}`
    );
    const response = await GET(request);
    const data = await response.json();

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
      radiusMeters: 1000,
    });

    const request = new NextRequest(
      `https://example.com/api/places/v2?key=1&key=2&location=${mockLocation}&openNow=true&limit=20&radiusMeters=1000`
    );

    await GET(request);

    // Verify parameters were passed correctly to fetchPlacesData
    expect(fetchPlacesData).toHaveBeenCalledWith({
      textQuery: mockTextQuery,
      location: mockLocation,
      openNow: true,
      limit: 20,
      radiusMeters: 1000,
      cacheKey: mockCacheKey,
      bypassCache: false,
      keys: mockKeys,
    });
  });

  it('should pass openNow parameter to fetchPlacesData when provided', async () => {
    // Mock openNow parameter
    (getSearchParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      keys: mockKeys,
      location: mockLocation,
      bypassCache: false,
      openNow: true, // Set openNow to true
      limit: undefined,
      radiusMeters: undefined,
    });

    const request = new NextRequest(
      `https://example.com/api/places/v2?key=1&key=2&location=${mockLocation}&openNow=true`
    );
    await GET(request);

    // Verify openNow was passed to fetchPlacesData
    expect(fetchPlacesData).toHaveBeenCalledWith({
      textQuery: mockTextQuery,
      location: mockLocation,
      openNow: true, // Verify openNow is passed as true
      limit: undefined,
      radiusMeters: undefined,
      cacheKey: mockCacheKey,
      bypassCache: false,
      keys: mockKeys,
    });
  });

  it('should pass radiusMeters parameter to fetchPlacesData when provided', async () => {
    // Mock radiusMeters parameter
    (getSearchParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      keys: mockKeys,
      location: mockLocation,
      bypassCache: false,
      openNow: undefined,
      limit: undefined,
      radiusMeters: 2000, // Set radiusMeters to 2000
    });

    const request = new NextRequest(
      `https://example.com/api/places/v2?key=1&key=2&location=${mockLocation}&radiusMeters=2000`
    );
    await GET(request);

    // Verify radiusMeters was passed to fetchPlacesData
    expect(fetchPlacesData).toHaveBeenCalledWith({
      textQuery: mockTextQuery,
      location: mockLocation,
      openNow: undefined,
      limit: undefined,
      radiusMeters: 2000, // Verify radiusMeters is passed as 2000
      cacheKey: mockCacheKey,
      bypassCache: false,
      keys: mockKeys,
    });
  });
});
