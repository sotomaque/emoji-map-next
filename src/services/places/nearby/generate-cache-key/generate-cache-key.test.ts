import { describe, it, expect, vi } from 'vitest';
import { generateCacheKey } from './generate-cache-key';

// Mock the normalizeLocation function
vi.mock('@/utils/redis/cache-utils', () => ({
  normalizeLocation: (location: string) => {
    // Simple mock implementation that just returns the input for most cases
    if (location === '40.7128,-74.0060') return '40.71,-74.01';
    if (location === '40.712,-74.006') return '40.71,-74.01';
    return location;
  },
}));

describe('generateCacheKey', () => {
  // Test 1: Basic functionality
  it('should generate a cache key with the correct format', () => {
    const params = {
      location: '40.7128,-74.0060',
    };

    const result = generateCacheKey(params);

    expect(result).toBe('places-v2:40.71,-74.01');
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
    expect(result1).toBe('places-v2:40.71,-74.01');
  });

  // Test 3: Similar locations should have same cache key after normalization
  it('should normalize similar locations to the same cache key', () => {
    const params1 = {
      location: '40.7128,-74.0060',
    };

    const params2 = {
      location: '40.712,-74.006',
    };

    const result1 = generateCacheKey(params1);
    const result2 = generateCacheKey(params2);

    expect(result1).toBe(result2);
    expect(result1).toBe('places-v2:40.71,-74.01');
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
      location: '40.71,special',
    };

    const result = generateCacheKey(params);

    // Should generate a key when at least one coordinate is valid
    expect(result).toBe('places-v2:40.71,special');
  });
});
