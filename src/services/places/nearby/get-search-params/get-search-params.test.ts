import { NextRequest } from 'next/server';
import { describe, it, expect, vi } from 'vitest';
import { getSearchParams } from './get-search-params';

vi.mock('@/constants/category-map', () => ({
  CATEGORY_MAP: [
    { key: 1, name: 'category1', emoji: '🍕', keywords: ['keyword1'] },
    { key: 2, name: 'category2', emoji: '🍺', keywords: ['keyword2'] },
    { key: 3, name: 'category3', emoji: '🍣', keywords: ['keyword3'] },
  ],
}));

// Helper to create mock NextRequest
function createMockRequest(url: string): NextRequest {
  return new NextRequest(url, {
    method: 'GET',
  });
}

describe('getSearchParams', () => {
  it('should handle default values correctly', () => {
    const request = createMockRequest('http://localhost');
    const result = getSearchParams(request);

    expect(result).toEqual({
      location: null,
      openNow: undefined,
      bypassCache: undefined,
      keys: [1, 2, 3],
      limit: undefined,
      radiusMeters: undefined,
    });
  });

  it('should parse all parameters correctly', () => {
    const request = createMockRequest(
      'http://localhost?location=London&openNow=true&bypassCache=true&keys=1&keys=2&keys=3&limit=10&radiusMeters=5'
    );
    const result = getSearchParams(request);

    expect(result).toEqual({
      location: 'London',
      openNow: true,
      bypassCache: true,
      keys: [1, 2, 3],
      limit: 10,
      radiusMeters: 5,
    });
  });

  it('should handle case-insensitive boolean values', () => {
    const request = createMockRequest(
      'http://localhost?openNow=TRUE&bypassCache=True'
    );
    const result = getSearchParams(request);

    expect(result.openNow).toBe(true);
    expect(result.bypassCache).toBe(true);
  });

  it('should filter invalid keys', () => {
    const request = createMockRequest(
      'http://localhost?keys=1&keys=999&keys=abc&keys=2&keys=3'
    );
    const result = getSearchParams(request);

    expect(result.keys).toEqual([1, 2, 3]);
  });

  it('should handle string values for location', () => {
    const request = createMockRequest('http://localhost?location=null');
    const result = getSearchParams(request);

    expect(result.location).toBe('null'); // Treated as string
  });

  it('should handle multiple keys correctly and remove duplicates', () => {
    const request = createMockRequest(
      'http://localhost?keys=1&keys=2&keys=3&keys=1' // Duplicate key
    );
    const result = getSearchParams(request);

    expect(result.keys).toEqual([1, 2, 3]); // Duplicates removed
  });

  it('should return all keys when none specified', () => {
    const request = createMockRequest('http://localhost');
    const result = getSearchParams(request);

    expect(result.keys).toEqual([1, 2, 3]);
  });

  it('should handle numeric limit correctly', () => {
    const request = createMockRequest('http://localhost?limit=20');
    const result = getSearchParams(request);

    expect(result.limit).toBe(20);
  });

  it('should handle invalid limit value', () => {
    const request = createMockRequest('http://localhost?limit=abc');
    const result = getSearchParams(request);

    expect(result.limit).toBe(undefined);
  });

  it('should handle radiusMeters parameter correctly', () => {
    const request = createMockRequest('http://localhost?radiusMeters=15');
    const result = getSearchParams(request);

    expect(result.radiusMeters).toBe(15);
  });

  it('should handle invalid radiusMeters value', () => {
    const request = createMockRequest('http://localhost?radiusMeters=abc');
    const result = getSearchParams(request);

    expect(result.radiusMeters).toBe(undefined);
  });

  it('should set bypassCache to true when parameter is present without value', () => {
    const request = createMockRequest('http://localhost?bypassCache');
    const result = getSearchParams(request);

    expect(result.bypassCache).toBe(true);
  });

  it('should set bypassCache to true when parameter is present with empty value', () => {
    const request = createMockRequest('http://localhost?bypassCache=');
    const result = getSearchParams(request);

    expect(result.bypassCache).toBe(true);
  });

  it('should set bypassCache to true when parameter is "true"', () => {
    const request = createMockRequest('http://localhost?bypassCache=true');
    const result = getSearchParams(request);

    expect(result.bypassCache).toBe(true);
  });

  it('should set bypassCache to true when parameter is "TRUE" (case-insensitive)', () => {
    const request = createMockRequest('http://localhost?bypassCache=TRUE');
    const result = getSearchParams(request);

    expect(result.bypassCache).toBe(true);
  });

  it('should set bypassCache to false when parameter has value other than "true"', () => {
    const request = createMockRequest('http://localhost?bypassCache=false');
    const result = getSearchParams(request);

    expect(result.bypassCache).toBe(false);
  });

  it('should set bypassCache to undefined when parameter is not present', () => {
    const request = createMockRequest('http://localhost');
    const result = getSearchParams(request);

    expect(result.bypassCache).toBe(undefined);
  });

  it('should handle false boolean values correctly for openNow', () => {
    const request = createMockRequest('http://localhost?openNow=false');
    const result = getSearchParams(request);

    expect(result.openNow).toBe(false);
  });
});
