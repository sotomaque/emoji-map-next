import { describe, it, expect, vi, beforeEach } from 'vitest';
import { redis, CACHE_EXPIRATION_TIME } from '@/lib/redis';
import type {
  SimplifiedMapPlace,
  PlacesResponse,
} from '@/types/local-places-types';
import { setCacheResults } from './cache-results';

// Mock redis
vi.mock('@/lib/redis', () => ({
  CACHE_EXPIRATION_TIME: 3600,
  redis: {
    set: vi.fn(),
  },
}));

describe('cacheResults', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  // Helper function to create a PlacesResponse from places
  function createPlacesResponse(places: SimplifiedMapPlace[]): PlacesResponse {
    return {
      places,
      count: places.length,
      cacheHit: false,
    };
  }

  // Test 1: Successfully cache results with valid key
  it('should cache results successfully with valid key format', async () => {
    // Sample data with valid key format (starts with 'places-v2:')
    const cacheKey = 'places-v2:40.71,-74.01';
    const places: SimplifiedMapPlace[] = [
      {
        id: '123',
        location: { latitude: 40.7128, longitude: -74.006 },
        category: 'restaurant',
        emoji: '🍕',
      },
      {
        id: '456',
        location: { latitude: 40.7129, longitude: -74.0061 },
        category: 'cafe',
        emoji: '☕',
      },
    ];

    const processedPlaces = createPlacesResponse(places);

    await setCacheResults({ cacheKey, processedPlaces });

    // Verify redis.set was called with the correct arguments
    expect(redis.set).toHaveBeenCalledWith(cacheKey, processedPlaces, {
      ex: CACHE_EXPIRATION_TIME,
    });

    // Verify success log message
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(
        `Successfully cached ${processedPlaces.count} places with key: ${cacheKey}`
      )
    );
  });

  // Test 2: Invalid cache key format (missing prefix)
  it('should not cache results with invalid key format (missing prefix)', async () => {
    const cacheKey = 'invalid-key:40.71,-74.01';
    const places: SimplifiedMapPlace[] = [
      {
        id: '123',
        location: { latitude: 40.7128, longitude: -74.006 },
        category: 'restaurant',
        emoji: '🍕',
      },
    ];

    const processedPlaces = createPlacesResponse(places);

    await setCacheResults({ cacheKey, processedPlaces });

    // Verify redis.set was not called
    expect(redis.set).not.toHaveBeenCalled();

    // Verify error log message
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Invalid cache key format:'),
      cacheKey
    );
  });

  // Test 3: Invalid cache key format (missing location part)
  it('should not cache results with invalid key format (missing location part)', async () => {
    const cacheKey = 'places-v2:';
    const places: SimplifiedMapPlace[] = [
      {
        id: '123',
        location: { latitude: 40.7128, longitude: -74.006 },
        category: 'restaurant',
        emoji: '🍕',
      },
    ];

    const processedPlaces = createPlacesResponse(places);

    await setCacheResults({ cacheKey, processedPlaces });

    // Verify redis.set was not called
    expect(redis.set).not.toHaveBeenCalled();

    // Verify error log message
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Invalid cache key format:'),
      cacheKey
    );
  });

  // Test 4: Invalid cache key format (missing longitude)
  it('should not cache results with invalid key format (missing longitude)', async () => {
    const cacheKey = 'places-v2:40.71';
    const places: SimplifiedMapPlace[] = [
      {
        id: '123',
        location: { latitude: 40.7128, longitude: -74.006 },
        category: 'restaurant',
        emoji: '🍕',
      },
    ];

    const processedPlaces = createPlacesResponse(places);

    await setCacheResults({ cacheKey, processedPlaces });

    // Verify redis.set was not called
    expect(redis.set).not.toHaveBeenCalled();

    // Verify error log message
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Invalid cache key format:'),
      cacheKey
    );
  });

  // Test 5: Invalid cache key format (missing latitude)
  it('should not cache results with invalid key format (missing latitude)', async () => {
    const cacheKey = 'places-v2:,-74.01';
    const places: SimplifiedMapPlace[] = [
      {
        id: '123',
        location: { latitude: 40.7128, longitude: -74.006 },
        category: 'restaurant',
        emoji: '🍕',
      },
    ];

    const processedPlaces = createPlacesResponse(places);

    await setCacheResults({ cacheKey, processedPlaces });

    // Verify redis.set was not called
    expect(redis.set).not.toHaveBeenCalled();

    // Verify error log message
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Invalid cache key format:'),
      cacheKey
    );
  });

  // Test 6: Invalid cache key format (non-numeric coordinates)
  it('should not cache results with invalid key format (non-numeric coordinates)', async () => {
    const cacheKey = 'places-v2:abc,def';
    const places: SimplifiedMapPlace[] = [
      {
        id: '123',
        location: { latitude: 40.7128, longitude: -74.006 },
        category: 'restaurant',
        emoji: '🍕',
      },
    ];

    const processedPlaces = createPlacesResponse(places);

    await setCacheResults({ cacheKey, processedPlaces });

    // Verify redis.set was not called
    expect(redis.set).not.toHaveBeenCalled();

    // Verify error log message
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Invalid cache key format:'),
      cacheKey
    );
  });

  // Test 7: Valid key with special case (one numeric coordinate)
  it('should cache results with valid key format (one numeric coordinate)', async () => {
    const cacheKey = 'places-v2:40.71,special';
    const places: SimplifiedMapPlace[] = [
      {
        id: '123',
        location: { latitude: 40.7128, longitude: -74.006 },
        category: 'restaurant',
        emoji: '🍕',
      },
    ];

    const processedPlaces = createPlacesResponse(places);

    await setCacheResults({ cacheKey, processedPlaces });

    // Verify redis.set was called with the correct arguments
    expect(redis.set).toHaveBeenCalledWith(cacheKey, processedPlaces, {
      ex: CACHE_EXPIRATION_TIME,
    });

    // Verify success log message
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(
        `Successfully cached ${processedPlaces.count} places with key: ${cacheKey}`
      )
    );
  });

  // Test 8: Empty results
  it('should not cache empty results', async () => {
    const cacheKey = 'places-v2:40.71,-74.01';
    const processedPlaces = createPlacesResponse([]);

    await setCacheResults({ cacheKey, processedPlaces });

    // Verify redis.set was not called
    expect(redis.set).not.toHaveBeenCalled();

    // Verify error log message
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('No processed places to cache')
    );
  });

  // Test 9: Null results
  it('should not cache null results', async () => {
    const cacheKey = 'places-v2:40.71,-74.01';
    const processedPlaces = null as unknown as PlacesResponse;

    await setCacheResults({ cacheKey, processedPlaces });

    // Verify redis.set was not called
    expect(redis.set).not.toHaveBeenCalled();

    // Verify error log message
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('No processed places to cache')
    );
  });

  // Test 10: Redis error
  it('should handle Redis errors gracefully', async () => {
    const cacheKey = 'places-v2:40.71,-74.01';
    const places: SimplifiedMapPlace[] = [
      {
        id: '123',
        location: { latitude: 40.7128, longitude: -74.006 },
        category: 'restaurant',
        emoji: '🍕',
      },
    ];

    const processedPlaces = createPlacesResponse(places);

    // Mock Redis error
    const mockError = new Error('Redis connection error');
    vi.mocked(redis.set).mockRejectedValueOnce(mockError);

    await setCacheResults({ cacheKey, processedPlaces });

    // Verify error log message
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error caching results:'),
      mockError
    );
  });
});
