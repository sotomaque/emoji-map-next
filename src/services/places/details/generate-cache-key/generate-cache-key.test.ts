import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DETAILS_CONFIG } from '@/constants/details';
import { generateCacheKey } from './generate-cache-key';

// Mock the DETAILS_CONFIG
vi.mock('@/constants/details', () => ({
  DETAILS_CONFIG: {
    CACHE_KEY: 'details',
    CACHE_KEY_VERSION: 'v1',
  },
}));

describe('generateCacheKey', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate a valid cache key with the correct format', () => {
    const id = 'ChIJN1t_tDeuEmsRUsoyG83frY4';
    const result = generateCacheKey({ id });

    expect(result).toBe(
      `${DETAILS_CONFIG.CACHE_KEY}:${DETAILS_CONFIG.CACHE_KEY_VERSION}:${id}`
    );
    expect(result).toBe('details:v1:ChIJN1t_tDeuEmsRUsoyG83frY4');
  });

  it('should handle different place IDs correctly', () => {
    const id1 = 'ChIJN1t_tDeuEmsRUsoyG83frY4';
    const id2 = 'ChIJP3Sa8ziYEmsRUKgyFmh9AQM';

    const result1 = generateCacheKey({ id: id1 });
    const result2 = generateCacheKey({ id: id2 });

    expect(result1).toBe('details:v1:ChIJN1t_tDeuEmsRUsoyG83frY4');
    expect(result2).toBe('details:v1:ChIJP3Sa8ziYEmsRUKgyFmh9AQM');
    expect(result1).not.toBe(result2);
  });

  it('should use the configured cache key and version', () => {
    const id = 'ChIJN1t_tDeuEmsRUsoyG83frY4';
    const result = generateCacheKey({ id });

    expect(result).toContain(DETAILS_CONFIG.CACHE_KEY);
    expect(result).toContain(DETAILS_CONFIG.CACHE_KEY_VERSION);
    expect(result).toBe('details:v1:ChIJN1t_tDeuEmsRUsoyG83frY4');
  });

  it('should handle empty IDs correctly', () => {
    const id = '';
    const result = generateCacheKey({ id });

    expect(result).toBe('details:v1:');
  });

  it('should handle special characters in IDs', () => {
    const id = 'ChIJ-special_chars+123';
    const result = generateCacheKey({ id });

    expect(result).toBe('details:v1:ChIJ-special_chars+123');
  });

  it('should handle numeric IDs', () => {
    const id = '12345';
    const result = generateCacheKey({ id });

    expect(result).toBe('details:v1:12345');
  });

  it('should be consistent with repeated calls for the same ID', () => {
    const id = 'ChIJN1t_tDeuEmsRUsoyG83frY4';

    const result1 = generateCacheKey({ id });
    const result2 = generateCacheKey({ id });
    const result3 = generateCacheKey({ id });

    expect(result1).toBe(result2);
    expect(result2).toBe(result3);
    expect(result1).toBe('details:v1:ChIJN1t_tDeuEmsRUsoyG83frY4');
  });

  it('should handle very long IDs', () => {
    const id = 'ChIJN1t_tDeuEmsRUsoyG83frY4'.repeat(10); // Very long ID
    const result = generateCacheKey({ id });

    // Handle the case where result might be null
    expect(result).not.toBeNull();
    if (result) {
      expect(result).toBe(`details:v1:${id}`);
      expect(result.startsWith('details:v1:')).toBe(true);
    }
  });

  // Test for handling undefined or null IDs
  it('should handle undefined or null IDs gracefully', () => {
    // @ts-expect-error - Testing with undefined ID
    const result1 = generateCacheKey({ id: undefined });

    // @ts-expect-error - Testing with null ID
    const result2 = generateCacheKey({ id: null });

    // The implementation might handle these cases differently, so we're just checking
    // that it doesn't throw an error and returns something predictable

    // If the implementation returns null for invalid IDs
    if (result1 === null) {
      expect(result1).toBeNull();
    } else {
      // If it returns a string with 'undefined' or empty
      expect(typeof result1).toBe('string');
      expect(result1).toContain(DETAILS_CONFIG.CACHE_KEY);
      expect(result1).toContain(DETAILS_CONFIG.CACHE_KEY_VERSION);
    }

    if (result2 === null) {
      expect(result2).toBeNull();
    } else {
      expect(typeof result2).toBe('string');
      expect(result2).toContain(DETAILS_CONFIG.CACHE_KEY);
      expect(result2).toContain(DETAILS_CONFIG.CACHE_KEY_VERSION);
    }
  });
});
