import { NextRequest } from 'next/server';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MOCK_PLACES } from '@/__tests__/mocks/places/mock-places';
import { GET } from '@/app/api/places/nearby/route';
import { buildTextQueryFromKeys } from '@/services/places/nearby/build-text-query-from-string/build-text-query-from-string';
import { fetchPlacesData } from '@/services/places/nearby/fetch-places-data/fetch-places-data';
import { generateCacheKey } from '@/services/places/nearby/generate-cache-key/generate-cache-key';
import { getSearchParams } from '@/services/places/nearby/get-search-params/get-search-params';
import type { PlacesResponse } from '@/types/places';
import type { MockInstance } from 'vitest';

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

describe('Places Nearby API - Keys Optimization', () => {
  // Sample data for tests
  const mockLocation = '40.7128,-74.0060';
  const mockSingleKey = [1]; // pizza
  const mockMultipleKeys = [1, 2]; // pizza, beer
  const mockTextQuery = 'pizza|beer';
  const mockCacheKey = `places-v2:${mockLocation}`;
  const mockPlacesResponse: PlacesResponse = {
    data: MOCK_PLACES,
    count: MOCK_PLACES.length,
    cacheHit: false,
  };

  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();

    // Setup default mock returns
    (generateCacheKey as unknown as MockInstance).mockReturnValue(mockCacheKey);
    (buildTextQueryFromKeys as unknown as MockInstance).mockReturnValue(
      mockTextQuery
    );
    (fetchPlacesData as unknown as MockInstance).mockResolvedValue(
      mockPlacesResponse
    );
  });

  it('should pass a single key to fetchPlacesData', async () => {
    // Setup
    const request = new NextRequest(
      `https://example.com/api/places/nearby?location=${mockLocation}&keys=${mockSingleKey[0]}`
    );

    // Mock getSearchParams to return a single key
    (getSearchParams as unknown as MockInstance).mockReturnValue({
      location: mockLocation,
      keys: mockSingleKey,
    });

    // Execute
    await GET(request);

    // Verify
    expect(fetchPlacesData).toHaveBeenCalledWith(
      expect.objectContaining({
        keys: mockSingleKey,
      })
    );
  });

  it('should pass multiple keys to fetchPlacesData', async () => {
    // Setup
    const request = new NextRequest(
      `https://example.com/api/places/nearby?location=${mockLocation}&keys=${mockMultipleKeys.join(
        ','
      )}`
    );

    // Mock getSearchParams to return multiple keys
    (getSearchParams as unknown as MockInstance).mockReturnValue({
      location: mockLocation,
      keys: mockMultipleKeys,
    });

    // Execute
    await GET(request);

    // Verify
    expect(fetchPlacesData).toHaveBeenCalledWith(
      expect.objectContaining({
        keys: mockMultipleKeys,
      })
    );
  });
});
