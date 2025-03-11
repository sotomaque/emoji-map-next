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
      bufferMiles: undefined,
    });
  });

  it('should parse all parameters correctly', () => {
    const request = createMockRequest(
      'http://localhost?location=London&openNow=true&bypassCache=true&key=1&key=2&limit=10&bufferMiles=5'
    );
    const result = getSearchParams(request);

    expect(result).toEqual({
      location: 'London',
      openNow: true,
      bypassCache: true,
      keys: [1, 2],
      limit: 10,
      bufferMiles: 5,
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
      'http://localhost?key=1&key=999&key=abc&key=2'
    );
    const result = getSearchParams(request);

    expect(result.keys).toEqual([1, 2]);
  });

  it('should handle string values for location', () => {
    const request = createMockRequest('http://localhost?location=null');
    const result = getSearchParams(request);

    expect(result.location).toBe('null'); // Treated as string
  });

  it('should handle multiple keys correctly and remove duplicates', () => {
    const request = createMockRequest(
      'http://localhost?key=1&key=2&key=3&key=1' // Duplicate key
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

  it('should handle bufferMiles parameter correctly', () => {
    const request = createMockRequest('http://localhost?bufferMiles=15');
    const result = getSearchParams(request);

    expect(result.bufferMiles).toBe(15);
  });

  it('should handle invalid bufferMiles value', () => {
    const request = createMockRequest('http://localhost?bufferMiles=abc');
    const result = getSearchParams(request);

    expect(result.bufferMiles).toBe(undefined);
  });

  it('should handle false boolean values correctly', () => {
    const request = createMockRequest(
      'http://localhost?openNow=false&bypassCache=false'
    );
    const result = getSearchParams(request);

    expect(result.openNow).toBe(false);
    expect(result.bypassCache).toBe(false);
  });
});
