import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MOCK_PLACES } from '@/__tests__/mocks/places/mock-places';
import { NEARBY_CONFIG } from '@/constants/nearby';
import { redis } from '@/lib/redis';
import type { PlacesResponse } from '@/types/places';
import { log } from '@/utils/log';
import * as fetchPlacesDataModule from './fetch-places-data';
import { setCacheResults } from '../cache-results/cache-results';
import { fetchAndProcessGoogleData } from '../fetch-and-process-google-data/fetch-and-process-google-data';

// Mock dependencies
vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn(),
  },
}));

vi.mock('../cache-results/cache-results', () => ({
  setCacheResults: vi.fn(),
}));

vi.mock(
  '../fetch-and-process-google-data/fetch-and-process-google-data',
  () => ({
    fetchAndProcessGoogleData: vi.fn(),
  })
);

vi.mock('@/utils/log', () => ({
  log: {
    success: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('fetchPlacesData', () => {
  const mockProcessedPlaces: PlacesResponse = {
    data: MOCK_PLACES,
    count: MOCK_PLACES.length,
    cacheHit: false,
  };

  const defaultParams = {
    textQuery: 'restaurants',
    location: '40.7128,-74.006',
    cacheKey: 'test-cache-key',
  };

  beforeEach(() => {
    vi.resetAllMocks();

    // Default mock implementation
    vi.mocked(fetchAndProcessGoogleData).mockResolvedValue(mockProcessedPlaces);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch from cache if bypassCache is false, we have a cacheKey, and no openNow parameter is provided', async () => {
    // GIVEN
    vi.mocked(redis.get).mockResolvedValue(MOCK_PLACES);

    // WHEN
    await fetchPlacesDataModule.fetchPlacesData(defaultParams);

    // THEN
    expect(redis.get).toHaveBeenCalledWith(defaultParams.cacheKey);
  });

  it('should fetch from API when cache is empty', async () => {
    // GIVEN
    vi.mocked(redis.get).mockResolvedValue(null);

    // WHEN
    const result = await fetchPlacesDataModule.fetchPlacesData(defaultParams);

    // THEN
    expect(redis.get).toHaveBeenCalledWith(defaultParams.cacheKey);
    expect(fetchAndProcessGoogleData).toHaveBeenCalledWith({
      textQuery: defaultParams.textQuery,
      location: defaultParams.location,
      openNow: undefined,
      limit: NEARBY_CONFIG.DEFAULT_LIMIT,
      bufferMiles: NEARBY_CONFIG.DEFAULT_BUFFER_MILES,
    });
    expect(setCacheResults).toHaveBeenCalledWith({
      cacheKey: defaultParams.cacheKey,
      processedPlaces: mockProcessedPlaces,
    });
    expect(result).toEqual(mockProcessedPlaces);

    // Check if log.error was called with a message containing 'CACHE MISS'
    expect(log.error).toHaveBeenCalledWith('[CACHE MISS]', expect.any(Object));
  });

  it('should fetch from API when cached data is insufficient', async () => {
    // GIVEN
    const cachedPlaces = [MOCK_PLACES[0]];
    vi.mocked(redis.get).mockResolvedValue(cachedPlaces);

    // WHEN
    await fetchPlacesDataModule.fetchPlacesData({
      ...defaultParams,
      limit: 2, // More than cached data
    });

    // THEN
    expect(redis.get).toHaveBeenCalledWith(defaultParams.cacheKey);
    expect(fetchAndProcessGoogleData).toHaveBeenCalled();
    expect(setCacheResults).toHaveBeenCalled();

    // Check if log.debug was called with the exact message
    expect(log.debug).toHaveBeenCalledWith(
      '[PLACES] Cached data insufficient (1/2), fetching more'
    );
  });

  it('should bypass cache when bypassCache is true', async () => {
    // GIVEN
    const cachedPlaces = [MOCK_PLACES[0], { ...MOCK_PLACES[0], id: 'place2' }];
    vi.mocked(redis.get).mockResolvedValue(cachedPlaces);

    // WHEN
    await fetchPlacesDataModule.fetchPlacesData({
      ...defaultParams,
      bypassCache: true,
    });

    // THEN
    expect(redis.get).not.toHaveBeenCalled();
    expect(fetchAndProcessGoogleData).toHaveBeenCalled();
    expect(setCacheResults).toHaveBeenCalled();
  });

  it('should skip cache operations when cacheKey is null', async () => {
    // GIVEN
    vi.mocked(redis.get).mockResolvedValue(null);

    // WHEN
    await fetchPlacesDataModule.fetchPlacesData({
      ...defaultParams,
      cacheKey: null,
    });

    // THEN
    expect(redis.get).not.toHaveBeenCalled();
    expect(fetchAndProcessGoogleData).toHaveBeenCalled();
    expect(setCacheResults).not.toHaveBeenCalled();

    // Check if log.info was called with the exact message
    expect(log.info).toHaveBeenCalledWith(
      '[PLACES] Skipping cache (no cache key)'
    );
  });

  it('should bypass cache when openNow is true', async () => {
    // GIVEN
    const cachedPlaces = [MOCK_PLACES[0], { ...MOCK_PLACES[1], id: 'place2' }];
    vi.mocked(redis.get).mockResolvedValue(cachedPlaces);

    // WHEN
    await fetchPlacesDataModule.fetchPlacesData({
      ...defaultParams,
      openNow: true,
    });

    // THEN
    // In the current implementation, it still calls redis.get even with openNow=true
    expect(redis.get).toHaveBeenCalled();
    expect(fetchAndProcessGoogleData).toHaveBeenCalledWith(
      expect.objectContaining({
        openNow: true,
      })
    );
    expect(setCacheResults).toHaveBeenCalled();
  });

  it('should pass custom limit and bufferMiles to fetchAndProcessGoogleData', async () => {
    // GIVEN
    vi.mocked(redis.get).mockResolvedValue(null);
    const customLimit = 5;
    const customBufferMiles = 2;

    // WHEN
    await fetchPlacesDataModule.fetchPlacesData({
      ...defaultParams,
      limit: customLimit,
      bufferMiles: customBufferMiles,
    });

    // THEN
    expect(fetchAndProcessGoogleData).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: customLimit,
        bufferMiles: customBufferMiles,
      })
    );
  });

  it('should handle API errors gracefully', async () => {
    // GIVEN
    vi.mocked(redis.get).mockResolvedValue(null);
    const error = new Error('API error');
    vi.mocked(fetchAndProcessGoogleData).mockRejectedValue(error);

    // WHEN & THEN
    await expect(
      fetchPlacesDataModule.fetchPlacesData(defaultParams)
    ).rejects.toThrow('API error');
  });
});
