import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MOCK_PLACES } from '@/__tests__/mocks/places/mock-places';
import { redis } from '@/lib/redis';
import type { Place, PlacesResponse } from '@/types/places';
import { log } from '@/utils/log';
import { setCacheResults } from './cache-results';

// Mock NEARBY_CONFIG
vi.mock('@/constants/nearby', () => ({
  NEARBY_CONFIG: {
    CACHE_KEY: 'places',
    CACHE_KEY_VERSION: 'v1',
    CACHE_EXPIRATION_TIME: 3600,
  },
}));

// Mock isValidLocation
vi.mock('@/utils/geo/geo', () => ({
  isValidLocation: (location: string) => {
    if (location === '40.71,-74.01') return true;
    if (location === '40.71,special') return true;
    return false;
  },
}));

describe('cacheResults', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // Helper function to create a Place from places
  function createPlacesResponse(places: Place[]): PlacesResponse {
    return {
      data: places,
      count: places.length,
      cacheHit: false,
    };
  }

  // Test 1: Cache results successfully with valid key format
  it('should cache results successfully with valid key format', async () => {
    // Setup test data
    const cacheKey = 'places:v1:40.71,-74.01';
    const processedPlaces = createPlacesResponse(MOCK_PLACES);

    // Call the function
    await setCacheResults({ cacheKey, processedPlaces });

    // Verify redis.set was called with the correct arguments
    expect(redis.set).toHaveBeenCalledWith(cacheKey, processedPlaces.data, {
      ex: 3600,
    });

    // Verify success log message
    expect(log.success).toHaveBeenCalledWith('[NEARBY] cache set');
  });

  // Test 2: Invalid key format (missing prefix)
  it('should not cache results with invalid key format (missing prefix)', async () => {
    // Setup test data with invalid key format
    const cacheKey = 'invalid-key:40.71,-74.01';
    const processedPlaces = createPlacesResponse(MOCK_PLACES);

    // Call the function
    await setCacheResults({ cacheKey, processedPlaces });

    // Verify redis.set was not called
    expect(redis.set).not.toHaveBeenCalled();

    // Verify error log message
    expect(log.error).toHaveBeenCalledWith('[NEARBY] Invalid cache key format');
  });

  // Test 3: Invalid key format (missing location part)
  it('should not cache results with invalid key format (missing location part)', async () => {
    // Setup test data with invalid key format
    const cacheKey = 'places:v1:';
    const processedPlaces = createPlacesResponse(MOCK_PLACES);

    // Call the function
    await setCacheResults({ cacheKey, processedPlaces });

    // Verify redis.set was not called
    expect(redis.set).not.toHaveBeenCalled();

    // Verify error log message
    expect(log.error).toHaveBeenCalledWith('[NEARBY] Invalid cache key format');
  });

  // Test 4: Invalid key format (missing longitude)
  it('should not cache results with invalid key format (missing longitude)', async () => {
    // Setup test data with invalid key format
    const cacheKey = 'places:v1:40.71';
    const processedPlaces = createPlacesResponse(MOCK_PLACES);

    // Call the function
    await setCacheResults({ cacheKey, processedPlaces });

    // Verify redis.set was not called
    expect(redis.set).not.toHaveBeenCalled();

    // Verify error log message
    expect(log.error).toHaveBeenCalledWith('[NEARBY] Invalid cache key format');
  });

  // Test 5: Invalid key format (missing latitude)
  it('should not cache results with invalid key format (missing latitude)', async () => {
    // Setup test data with invalid key format
    const cacheKey = 'places:v1:,-74.01';
    const processedPlaces = createPlacesResponse(MOCK_PLACES);

    // Call the function
    await setCacheResults({ cacheKey, processedPlaces });

    // Verify redis.set was not called
    expect(redis.set).not.toHaveBeenCalled();

    // Verify error log message
    expect(log.error).toHaveBeenCalledWith('[NEARBY] Invalid cache key format');
  });

  // Test 6: Invalid key format (non-numeric coordinates)
  it('should not cache results with invalid key format (non-numeric coordinates)', async () => {
    // Setup test data with invalid key format
    const cacheKey = 'places:v1:abc,def';
    const processedPlaces = createPlacesResponse(MOCK_PLACES);

    // Call the function
    await setCacheResults({ cacheKey, processedPlaces });

    // Verify redis.set was not called
    expect(redis.set).not.toHaveBeenCalled();

    // Verify error log message
    expect(log.error).toHaveBeenCalledWith('[NEARBY] Invalid cache key format');
  });

  // Test 7: Valid key format (one numeric coordinate)
  it('should cache results with valid key format (one numeric coordinate)', async () => {
    // Setup test data with valid key format
    const cacheKey = 'places:v1:40.71,special';
    const processedPlaces = createPlacesResponse(MOCK_PLACES);

    // Call the function
    await setCacheResults({ cacheKey, processedPlaces });

    // Verify redis.set was called with the correct arguments
    expect(redis.set).toHaveBeenCalledWith(cacheKey, processedPlaces.data, {
      ex: 3600,
    });

    // Verify success log message
    expect(log.success).toHaveBeenCalledWith('[NEARBY] cache set');
  });

  // Test 8: Empty results
  it('should not cache empty results', async () => {
    // Setup test data with empty results
    const cacheKey = 'places:v1:40.71,-74.01';
    const processedPlaces = createPlacesResponse([]);

    // Call the function
    await setCacheResults({ cacheKey, processedPlaces });

    // Verify redis.set was not called
    expect(redis.set).not.toHaveBeenCalled();

    // No error log for empty results in the implementation
  });

  // Test 9: Null results
  it('should not cache null results', async () => {
    // Setup test data with null results
    const cacheKey = 'places:v1:40.71,-74.01';
    const processedPlaces = null as unknown as PlacesResponse;

    // Call the function
    await setCacheResults({ cacheKey, processedPlaces });

    // Verify redis.set was not called
    expect(redis.set).not.toHaveBeenCalled();

    // No error log for null results in the implementation
  });

  // Test 10: Redis error
  it('should handle Redis errors gracefully', async () => {
    // Setup test data
    const cacheKey = 'places:v1:40.71,-74.01';
    const processedPlaces = createPlacesResponse(MOCK_PLACES);
    const mockError = new Error('Redis connection error');

    // Mock redis.set to throw an error
    vi.mocked(redis.set).mockRejectedValueOnce(mockError);

    // Call the function
    await setCacheResults({ cacheKey, processedPlaces });

    // Verify error log message
    expect(log.error).toHaveBeenCalledWith('[NEARBY] Error caching results');
  });
});
