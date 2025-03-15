import { NextRequest } from 'next/server';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MOCK_PLACES } from '@/__tests__/mocks/places/mock-places';
import { GET } from '@/app/api/places/nearby/route';
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

vi.mock('@/constants/nearby', () => ({
  NEARBY_CONFIG: {
    DEFAULT_LIMIT: 20,
    DEFAULT_RADIUS_METERS: 1000,
    ABSOLUT_MAX_LIMIT: 50,
    DEFAULT_RANK_PREFERENCE: 'DISTANCE',
    SERIAL_REQUESTS_LIMIT: 3,
  },
}));

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

  it('should make multiple serial requests when there is only one key', async () => {
    // Mock a single key
    const singleKey = [1]; // just pizza
    (getSearchParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      keys: singleKey,
      location: mockLocation,
      bypassCache: false,
      openNow: undefined,
      limit: undefined,
      radiusMeters: undefined,
    });

    // Create mock responses with nextPageToken for pagination
    const firstPageResponse: PlacesResponse = {
      data: [{ ...mockSimplifiedPlace, id: 'place1' }],
      count: 1,
      cacheHit: false,
      nextPageToken: 'token1',
    };

    const secondPageResponse: PlacesResponse = {
      data: [{ ...mockSimplifiedPlace, id: 'place2' }],
      count: 1,
      cacheHit: false,
      nextPageToken: 'token2',
    };

    const thirdPageResponse: PlacesResponse = {
      data: [{ ...mockSimplifiedPlace, id: 'place3' }],
      count: 1,
      cacheHit: false,
      nextPageToken: undefined,
    };

    // Setup mock to return different responses for each call
    (fetchPlacesData as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(firstPageResponse)
      .mockResolvedValueOnce(secondPageResponse)
      .mockResolvedValueOnce(thirdPageResponse);

    const request = new NextRequest(
      `https://example.com/api/places/v2?key=1&location=${mockLocation}`
    );
    const response = await GET(request);
    const data = await response.json();

    // Verify the response contains merged data from all pages
    expect(response.status).toBe(200);
    expect(data.data.length).toBe(3);
    expect(data.count).toBe(3);

    // Verify fetchPlacesData was called multiple times with correct parameters
    expect(fetchPlacesData).toHaveBeenCalledTimes(3);

    // First call should be without pageToken
    expect(fetchPlacesData).toHaveBeenNthCalledWith(1, {
      textQuery: mockTextQuery,
      location: mockLocation,
      openNow: undefined,
      limit: undefined,
      radiusMeters: undefined,
      cacheKey: mockCacheKey,
      bypassCache: false,
      keys: singleKey,
    });

    // Second call should include the first pageToken
    expect(fetchPlacesData).toHaveBeenNthCalledWith(2, {
      textQuery: mockTextQuery,
      location: mockLocation,
      openNow: undefined,
      limit: undefined,
      radiusMeters: undefined,
      cacheKey: null, // Don't cache pagination results
      bypassCache: true, // Always bypass cache for pagination
      keys: singleKey,
      pageToken: 'token1',
    });

    // Third call should include the second pageToken
    expect(fetchPlacesData).toHaveBeenNthCalledWith(3, {
      textQuery: mockTextQuery,
      location: mockLocation,
      openNow: undefined,
      limit: undefined,
      radiusMeters: undefined,
      cacheKey: null, // Don't cache pagination results
      bypassCache: true, // Always bypass cache for pagination
      keys: singleKey,
      pageToken: 'token2',
    });
  });

  it('should stop pagination after MAX_PAGES requests', async () => {
    // Mock a single key
    const singleKey = [1]; // just pizza
    (getSearchParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      keys: singleKey,
      location: mockLocation,
      bypassCache: false,
      openNow: undefined,
      limit: undefined,
      radiusMeters: undefined,
    });

    // Create mock responses with nextPageToken for pagination
    // All responses have nextPageToken to test the MAX_PAGES limit
    const pageResponse: PlacesResponse = {
      data: [{ ...mockSimplifiedPlace, id: 'place' }],
      count: 1,
      cacheHit: false,
      nextPageToken: 'next-token',
    };

    // Setup mock to always return a response with nextPageToken
    (fetchPlacesData as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      pageResponse
    );

    const request = new NextRequest(
      `https://example.com/api/places/v2?key=1&location=${mockLocation}`
    );
    await GET(request);

    // Verify fetchPlacesData was called exactly MAX_PAGES times (3)
    expect(fetchPlacesData).toHaveBeenCalledTimes(3);
  });

  it('should stop pagination when limit is reached', async () => {
    // Mock a single key with a limit
    const singleKey = [1]; // just pizza
    (getSearchParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      keys: singleKey,
      location: mockLocation,
      bypassCache: false,
      openNow: undefined,
      limit: 2, // Set limit to 2
      radiusMeters: undefined,
    });

    // Create mock responses with nextPageToken for pagination
    const firstPageResponse: PlacesResponse = {
      data: [{ ...mockSimplifiedPlace, id: 'place1' }],
      count: 1,
      cacheHit: false,
      nextPageToken: 'token1',
    };

    const secondPageResponse: PlacesResponse = {
      data: [{ ...mockSimplifiedPlace, id: 'place2' }],
      count: 1,
      cacheHit: false,
      nextPageToken: 'token2', // Has more pages, but we should stop due to limit
    };

    // Setup mock to return different responses for each call
    (fetchPlacesData as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(firstPageResponse)
      .mockResolvedValueOnce(secondPageResponse);

    const request = new NextRequest(
      `https://example.com/api/places/v2?key=1&location=${mockLocation}&limit=2`
    );
    const response = await GET(request);
    const data = await response.json();

    // Verify the response contains merged data from both pages
    expect(response.status).toBe(200);
    expect(data.data.length).toBe(2);
    expect(data.count).toBe(2);

    // Verify fetchPlacesData was called exactly 2 times (not 3, despite having a nextPageToken)
    expect(fetchPlacesData).toHaveBeenCalledTimes(2);
  });

  it('should apply limit to merged results if they exceed the limit', async () => {
    // Mock a single key with a limit
    const singleKey = [1]; // just pizza
    (getSearchParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      keys: singleKey,
      location: mockLocation,
      bypassCache: false,
      openNow: undefined,
      limit: 2, // Set limit to 2
      radiusMeters: undefined,
    });

    // Create mock responses with nextPageToken for pagination
    const firstPageResponse: PlacesResponse = {
      data: [
        { ...mockSimplifiedPlace, id: 'place1' },
        { ...mockSimplifiedPlace, id: 'place2' },
      ],
      count: 2,
      cacheHit: false,
      nextPageToken: 'token1',
    };

    const secondPageResponse: PlacesResponse = {
      data: [{ ...mockSimplifiedPlace, id: 'place3' }],
      count: 1,
      cacheHit: false,
      nextPageToken: undefined,
    };

    // Setup mock to return different responses for each call
    (fetchPlacesData as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(firstPageResponse)
      .mockResolvedValueOnce(secondPageResponse);

    const request = new NextRequest(
      `https://example.com/api/places/v2?key=1&location=${mockLocation}&limit=2`
    );
    const response = await GET(request);
    const data = await response.json();

    // Verify the response contains only 2 items due to the limit
    expect(response.status).toBe(200);
    expect(data.data.length).toBe(2);
    expect(data.count).toBe(2);

    // Verify fetchPlacesData was called twice
    expect(fetchPlacesData).toHaveBeenCalledTimes(2);
  });

  it('should not make pagination requests if first response has no nextPageToken', async () => {
    // Mock a single key
    const singleKey = [1]; // just pizza
    (getSearchParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      keys: singleKey,
      location: mockLocation,
      bypassCache: false,
      openNow: undefined,
      limit: undefined,
      radiusMeters: undefined,
    });

    // Create mock response without nextPageToken
    const singlePageResponse: PlacesResponse = {
      data: [{ ...mockSimplifiedPlace, id: 'place1' }],
      count: 1,
      cacheHit: false,
      nextPageToken: undefined, // No next page
    };

    // Setup mock to return a response without nextPageToken
    (fetchPlacesData as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      singlePageResponse
    );

    const request = new NextRequest(
      `https://example.com/api/places/v2?key=1&location=${mockLocation}`
    );
    const response = await GET(request);
    const data = await response.json();

    // Verify the response
    expect(response.status).toBe(200);
    expect(data).toEqual(singlePageResponse);
  });
});
