import type { NextRequest } from 'next/server';
import { describe, it, expect } from 'vitest';
import { PHOTOS_CONFIG } from '@/constants/photos';
import { getSearchParams } from './getSearchParams';

// Mock NextRequest
const createMockRequest = (
  params: Record<string, string | null>
): NextRequest => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === null) {
      // Add parameter without value (e.g., ?bypassCache)
      searchParams.append(key, '');
    } else {
      searchParams.append(key, value);
    }
  });

  return {
    nextUrl: {
      searchParams,
    },
  } as unknown as NextRequest;
};

describe('getSearchParams', () => {
  it('should extract id and limit when both are provided', () => {
    const mockRequest = createMockRequest({ id: 'place123', limit: '10' });

    const result = getSearchParams(mockRequest);

    expect(result).toEqual({
      id: 'place123',
      limit: 10,
      bypassCache: false,
    });
  });

  it('should use default limit when limit is not provided', () => {
    const mockRequest = createMockRequest({ id: 'place123' });

    const result = getSearchParams(mockRequest);

    expect(result).toEqual({
      id: 'place123',
      limit: PHOTOS_CONFIG.DEFAULT_LIMIT,
      bypassCache: false,
    });
  });

  it('should parse limit as integer', () => {
    const mockRequest = createMockRequest({ id: 'place123', limit: '15.5' });

    const result = getSearchParams(mockRequest);

    expect(result).toEqual({
      id: 'place123',
      limit: 15, // Should be parsed as integer
      bypassCache: false,
    });
  });

  it('should throw error when id is not provided', () => {
    const mockRequest = createMockRequest({ limit: '10' });

    expect(() => getSearchParams(mockRequest)).toThrow(
      'Missing required parameter: id'
    );
  });

  it('should throw error when id is empty string', () => {
    const mockRequest = createMockRequest({ id: '', limit: '10' });

    expect(() => getSearchParams(mockRequest)).toThrow(
      'Missing required parameter: id'
    );
  });

  it('should handle non-numeric limit values by using default', () => {
    const mockRequest = createMockRequest({
      id: 'place123',
      limit: 'not-a-number',
    });

    const result = getSearchParams(mockRequest);

    expect(result).toEqual({
      id: 'place123',
      limit: PHOTOS_CONFIG.DEFAULT_LIMIT, // Should use default when parseInt returns NaN
      bypassCache: false,
    });
  });

  it('should set bypassCache to true when parameter is present without value', () => {
    const mockRequest = createMockRequest({
      id: 'place123',
      bypassCache: null,
    });

    const result = getSearchParams(mockRequest);

    expect(result).toEqual({
      id: 'place123',
      limit: PHOTOS_CONFIG.DEFAULT_LIMIT,
      bypassCache: true,
    });
  });

  it('should set bypassCache to true when parameter is present with empty value', () => {
    const mockRequest = createMockRequest({ id: 'place123', bypassCache: '' });

    const result = getSearchParams(mockRequest);

    expect(result).toEqual({
      id: 'place123',
      limit: PHOTOS_CONFIG.DEFAULT_LIMIT,
      bypassCache: true,
    });
  });

  it('should set bypassCache to true when parameter is "true"', () => {
    const mockRequest = createMockRequest({
      id: 'place123',
      bypassCache: 'true',
    });

    const result = getSearchParams(mockRequest);

    expect(result).toEqual({
      id: 'place123',
      limit: PHOTOS_CONFIG.DEFAULT_LIMIT,
      bypassCache: true,
    });
  });

  it('should set bypassCache to true when parameter is "TRUE" (case-insensitive)', () => {
    const mockRequest = createMockRequest({
      id: 'place123',
      bypassCache: 'TRUE',
    });

    const result = getSearchParams(mockRequest);

    expect(result).toEqual({
      id: 'place123',
      limit: PHOTOS_CONFIG.DEFAULT_LIMIT,
      bypassCache: true,
    });
  });

  it('should set bypassCache to false when parameter is not present', () => {
    const mockRequest = createMockRequest({ id: 'place123' });

    const result = getSearchParams(mockRequest);

    expect(result).toEqual({
      id: 'place123',
      limit: PHOTOS_CONFIG.DEFAULT_LIMIT,
      bypassCache: false,
    });
  });

  it('should set bypassCache to false when parameter has value other than "true"', () => {
    const mockRequest = createMockRequest({
      id: 'place123',
      bypassCache: 'false',
    });

    const result = getSearchParams(mockRequest);

    expect(result).toEqual({
      id: 'place123',
      limit: PHOTOS_CONFIG.DEFAULT_LIMIT,
      bypassCache: false,
    });
  });
});
