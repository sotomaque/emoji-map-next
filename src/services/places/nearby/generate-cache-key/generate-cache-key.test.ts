import { describe, it, expect, vi } from 'vitest';
import { generateCacheKey } from './generate-cache-key';

// Mock the NEARBY_CONFIG
vi.mock('@/constants/nearby', () => ({
  NEARBY_CONFIG: {
    CACHE_KEY: 'places',
    CACHE_KEY_VERSION: 'v1',
    CACHE_EXPIRATION_TIME: 3600,
  },
}));

// Mock the normalizeLocation function
vi.mock('@/utils/redis/cache-utils', () => ({
  normalizeLocation: (location: string) => {
    // Simple mock implementation that returns the expected normalized values
    if (location === '40.7128,-74.0060') return '40.71,-74.01';
    if (location === '40.7129,-74.0061') return '40.71,-74.01';
    if (location === '40.712,-74.006') return '40.71,-74.01';
    if (location === '40.7128,special') return '40.71,special';
    return location;
  },
}));

// Mock isValidLocation
vi.mock('@/utils/geo/geo', () => ({
  isValidLocation: (location: string) => {
    if (location === 'invalid') return false;
    if (location === '') return false;
    if (location === ',45.123') return false;
    if (location === '40.71,') return false;
    if (location === 'abc,def') return false;
    return true;
  },
}));

describe('generateCacheKey', () => {
  // Test 1: Basic functionality
  it('should generate a cache key with the correct format', () => {
    const params = {
      location: '40.7128,-74.0060',
    };

    const result = generateCacheKey(params);

    expect(result).toBe('places:v1:40.71,-74.01');
  });

  // Test 2: Different text queries with same location should have same cache key
  it('should generate the same cache key for different text queries with same location', () => {
    const params1 = {
      location: '40.7128,-74.0060',
    };

    const params2 = {
      location: '40.7128,-74.0060',
    };

    const result1 = generateCacheKey(params1);
    const result2 = generateCacheKey(params2);

    expect(result1).toBe(result2);
    expect(result1).toBe('places:v1:40.71,-74.01');
  });

  // Test 3: Similar locations should have same cache key after normalization
  it('should normalize similar locations to the same cache key', () => {
    const params1 = {
      location: '40.7128,-74.0060',
    };

    const params2 = {
      location: '40.7129,-74.0061',
    };

    const result1 = generateCacheKey(params1);
    const result2 = generateCacheKey(params2);

    expect(result1).toBe(result2);
    expect(result1).toBe('places:v1:40.71,-74.01');
  });

  // Test 4: Invalid location format (no comma)
  it('should return null for invalid location format (no comma)', () => {
    const params = {
      location: 'invalid',
    };

    const result = generateCacheKey(params);

    // Should return null for invalid location
    expect(result).toBeNull();
  });

  // Test 5: Empty location
  it('should return null for empty location', () => {
    const params = {
      location: '',
    };

    const result = generateCacheKey(params);

    // Should return null for empty location
    expect(result).toBeNull();
  });

  // Test 6: Missing latitude
  it('should return null when latitude is missing', () => {
    const params = {
      location: ',45.123',
    };

    const result = generateCacheKey(params);

    // Should return null for missing latitude
    expect(result).toBeNull();
  });

  // Test 7: Missing longitude
  it('should return null when longitude is missing', () => {
    const params = {
      location: '40.71,',
    };

    const result = generateCacheKey(params);

    // Should return null for missing longitude
    expect(result).toBeNull();
  });

  // Test 8: Non-numeric coordinates
  it('should return null when both coordinates are non-numeric', () => {
    const params = {
      location: 'abc,def',
    };

    const result = generateCacheKey(params);

    // Should return null when both coordinates are non-numeric
    expect(result).toBeNull();
  });

  // Test 9: One valid coordinate
  it('should generate a key when at least one coordinate is valid', () => {
    const params = {
      location: '40.7128,special',
    };

    const result = generateCacheKey(params);

    // Should generate a key when at least one coordinate is valid
    expect(result).toBe('places:v1:40.71,special');
  });

  // Test 10: With category keys
  it('should include sorted category keys in the cache key', () => {
    const params = {
      location: '40.7128,-74.0060',
      keys: [3, 1, 2],
    };

    const result = generateCacheKey(params);

    // Keys should be sorted numerically and appended to the cache key
    expect(result).toBe('places:v1:40.71,-74.01:1,2,3');
  });

  // Test 11: Different order of keys should produce the same cache key
  it('should generate the same cache key for different order of category keys', () => {
    const params1 = {
      location: '40.7128,-74.0060',
      keys: [3, 1, 2],
    };

    const params2 = {
      location: '40.7128,-74.0060',
      keys: [1, 2, 3],
    };

    const result1 = generateCacheKey(params1);
    const result2 = generateCacheKey(params2);

    expect(result1).toBe(result2);
    expect(result1).toBe('places:v1:40.71,-74.01:1,2,3');
  });

  // Test 12: Empty keys array
  it('should handle empty keys array', () => {
    const params = {
      location: '40.7128,-74.0060',
      keys: [],
    };

    const result = generateCacheKey(params);

    // Empty keys array should be treated the same as no keys
    expect(result).toBe('places:v1:40.71,-74.01');
  });

  // Test 13: With duplicate keys
  it('should handle duplicate keys', () => {
    const params = {
      location: '40.7128,-74.0060',
      keys: [1, 2, 1, 3, 2],
    };

    const result = generateCacheKey(params);

    // Duplicate keys should be preserved in the sorted result
    expect(result).toBe('places:v1:40.71,-74.01:1,1,2,2,3');
  });

  // Test 14: With invalid location but valid keys
  it('should return null for invalid location even with valid keys', () => {
    const params = {
      location: 'invalid',
      keys: [1, 2, 3],
    };

    const result = generateCacheKey(params);

    // Should return null for invalid location regardless of keys
    expect(result).toBeNull();
  });
});
