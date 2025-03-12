import type { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSearchParams } from './get-search-params';

// Mock NextRequest and URL
const createMockRequest = (url: string): NextRequest => {
  const mockUrl = new URL(url);
  return {
    nextUrl: mockUrl,
  } as NextRequest;
};

describe('getSearchParams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should extract id parameter correctly', () => {
    const request = createMockRequest(
      'https://example.com/api/places/details?id=ChIJN1t_tDeuEmsRUsoyG83frY4'
    );
    const params = getSearchParams(request);

    expect(params.id).toBe('ChIJN1t_tDeuEmsRUsoyG83frY4');
    expect(params.bypassCache).toBe(false);
  });

  it('should throw an error if id parameter is missing', () => {
    const request = createMockRequest('https://example.com/api/places/details');

    expect(() => getSearchParams(request)).toThrow(
      'Missing required parameter: id'
    );
  });

  it('should throw an error if id parameter is empty', () => {
    const request = createMockRequest(
      'https://example.com/api/places/details?id='
    );

    expect(() => getSearchParams(request)).toThrow(
      'Missing required parameter: id'
    );
  });

  it('should set bypassCache to true when parameter exists without value', () => {
    const request = createMockRequest(
      'https://example.com/api/places/details?id=place123&bypassCache'
    );
    const params = getSearchParams(request);

    expect(params.id).toBe('place123');
    expect(params.bypassCache).toBe(true);
  });

  it('should set bypassCache to true when parameter has empty value', () => {
    const request = createMockRequest(
      'https://example.com/api/places/details?id=place123&bypassCache='
    );
    const params = getSearchParams(request);

    expect(params.id).toBe('place123');
    expect(params.bypassCache).toBe(true);
  });

  it('should set bypassCache to true when parameter value is "true" (case-insensitive)', () => {
    const request1 = createMockRequest(
      'https://example.com/api/places/details?id=place123&bypassCache=true'
    );
    const params1 = getSearchParams(request1);

    expect(params1.id).toBe('place123');
    expect(params1.bypassCache).toBe(true);

    const request2 = createMockRequest(
      'https://example.com/api/places/details?id=place123&bypassCache=TRUE'
    );
    const params2 = getSearchParams(request2);

    expect(params2.id).toBe('place123');
    expect(params2.bypassCache).toBe(true);

    const request3 = createMockRequest(
      'https://example.com/api/places/details?id=place123&bypassCache=True'
    );
    const params3 = getSearchParams(request3);

    expect(params3.id).toBe('place123');
    expect(params3.bypassCache).toBe(true);
  });

  it('should set bypassCache to false when parameter value is not "true"', () => {
    const request = createMockRequest(
      'https://example.com/api/places/details?id=place123&bypassCache=false'
    );
    const params = getSearchParams(request);

    expect(params.id).toBe('place123');
    expect(params.bypassCache).toBe(false);

    const request2 = createMockRequest(
      'https://example.com/api/places/details?id=place123&bypassCache=1'
    );
    const params2 = getSearchParams(request2);

    expect(params2.id).toBe('place123');
    expect(params2.bypassCache).toBe(false);

    const request3 = createMockRequest(
      'https://example.com/api/places/details?id=place123&bypassCache=yes'
    );
    const params3 = getSearchParams(request3);

    expect(params3.id).toBe('place123');
    expect(params3.bypassCache).toBe(false);
  });

  it('should set bypassCache to false when parameter is not present', () => {
    const request = createMockRequest(
      'https://example.com/api/places/details?id=place123'
    );
    const params = getSearchParams(request);

    expect(params.id).toBe('place123');
    expect(params.bypassCache).toBe(false);
  });

  it('should handle special characters in id parameter', () => {
    // Note: In URLs, '+' is automatically converted to space by URL parsing
    const request = createMockRequest(
      'https://example.com/api/places/details?id=ChIJ-special_chars%2B123'
    );
    const params = getSearchParams(request);

    // The '+' is decoded to a space in URL parsing
    expect(params.id).toBe('ChIJ-special_chars+123');
    expect(params.bypassCache).toBe(false);
  });

  it('should handle multiple query parameters', () => {
    const request = createMockRequest(
      'https://example.com/api/places/details?id=place123&otherParam=value&bypassCache=true'
    );
    const params = getSearchParams(request);

    expect(params.id).toBe('place123');
    expect(params.bypassCache).toBe(true);
  });

  it('should handle URL-encoded parameters', () => {
    const encodedId = encodeURIComponent('ChIJ/special chars+123');
    const request = createMockRequest(
      `https://example.com/api/places/details?id=${encodedId}`
    );
    const params = getSearchParams(request);

    expect(params.id).toBe('ChIJ/special chars+123');
    expect(params.bypassCache).toBe(false);
  });

  it('should handle very long id values', () => {
    const longId = 'ChIJN1t_tDeuEmsRUsoyG83frY4'.repeat(10); // Very long ID
    const request = createMockRequest(
      `https://example.com/api/places/details?id=${longId}`
    );
    const params = getSearchParams(request);

    expect(params.id).toBe(longId);
    expect(params.bypassCache).toBe(false);
  });

  it('should handle query parameters with multiple values', () => {
    // URL with duplicate id parameter (only the first one should be used)
    const request = createMockRequest(
      'https://example.com/api/places/details?id=place123&id=place456'
    );
    const params = getSearchParams(request);

    // The first value should be used
    expect(params.id).toBe('place123');
    expect(params.bypassCache).toBe(false);
  });

  it('should handle query parameters with unusual characters', () => {
    // Test with various special characters that might be in place IDs
    const specialChars = 'ChIJ1234567890-_~!@#$%^&*()';
    const encodedId = encodeURIComponent(specialChars);
    const request = createMockRequest(
      `https://example.com/api/places/details?id=${encodedId}`
    );
    const params = getSearchParams(request);

    expect(params.id).toBe(specialChars);
    expect(params.bypassCache).toBe(false);
  });

  it('should handle query parameters with international characters', () => {
    // Test with non-ASCII characters
    const encodedId = encodeURIComponent('ChIJ-café-中文-日本語');
    const request = createMockRequest(
      `https://example.com/api/places/details?id=${encodedId}`
    );
    const params = getSearchParams(request);

    expect(params.id).toBe('ChIJ-café-中文-日本語');
    expect(params.bypassCache).toBe(false);
  });
});
