import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NEARBY_CONFIG } from '@/constants/nearby';
import type { GeoPoint } from '@/types/geo-types';
import { createLocationBias, getValidLocation } from '@/utils/geo/geo';
import { log } from '@/utils/log';
import { prepareGoogleRequestBody } from './prepare-google-request-body';

// Mock the geo utilities
vi.mock('@/utils/geo/geo', () => ({
  getValidLocation: vi.fn(),
  createLocationBias: vi.fn(),
}));

vi.mock('@/utils/log', () => ({
  log: {
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('prepareGoogleRequestBody', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Default mock implementations
    const mockGeoPoint: GeoPoint = { latitude: 40.7128, longitude: -74.006 };
    vi.mocked(getValidLocation).mockReturnValue(mockGeoPoint);
    vi.mocked(createLocationBias).mockReturnValue({
      circle: {
        center: { latitude: 40.7128, longitude: -74.006 },
        radius: 1000,
      },
    });
  });

  it('should set textQuery correctly', () => {
    const result = prepareGoogleRequestBody({
      textQuery: 'coffee',
      location: '40.7128,-74.0060',
    });

    expect(result.textQuery).toBe('coffee');
  });

  it('should set pageSize from limit', () => {
    const result = prepareGoogleRequestBody({
      textQuery: 'coffee',
      location: '40.7128,-74.0060',
      limit: 10,
    });

    expect(result.pageSize).toBe(10);
  });

  it('should use default pageSize when limit is null', () => {
    const result = prepareGoogleRequestBody({
      textQuery: 'coffee',
      location: '40.7128,-74.0060',
    });

    expect(result.pageSize).toBe(20);
  });

  it('should set openNow when provided', () => {
    const result = prepareGoogleRequestBody({
      textQuery: 'coffee',
      location: '40.7128,-74.0060',
      openNow: true,
    });

    expect(result.openNow).toBe(true);
  });

  it('should not set openNow when null', () => {
    const result = prepareGoogleRequestBody({
      textQuery: 'coffee',
      location: '40.7128,-74.0060',
    });

    expect(result.openNow).toBeUndefined();
  });

  it('should set locationBias when location is valid', () => {
    // Mock getValidLocation to return a valid GeoPoint
    const mockGeoPoint: GeoPoint = { latitude: 40.7128, longitude: -74.006 };
    vi.mocked(getValidLocation).mockReturnValue(mockGeoPoint);

    // Mock createLocationBias to return a circle
    const mockBias = {
      circle: {
        center: { latitude: 40.7128, longitude: -74.006 },
        radius: 1000,
      },
    };
    vi.mocked(createLocationBias).mockReturnValue(mockBias);

    const result = prepareGoogleRequestBody({
      textQuery: 'coffee',
      location: '40.7128,-74.0060',
    });

    // Verify getValidLocation was called with the correct location
    expect(getValidLocation).toHaveBeenCalledWith('40.7128,-74.0060');

    // Verify createLocationBias was called with the correct parameters
    expect(createLocationBias).toHaveBeenCalledWith({
      location: '40.7128,-74.0060',
      radiusMeters: NEARBY_CONFIG.DEFAULT_RADIUS_METERS, // Since no radiusMeters was provided
    });

    // Verify the locationBias was set correctly
    expect(result.locationBias).toEqual({
      circle: mockBias.circle,
    });
  });

  it('should not set locationBias when location is invalid', () => {
    // Mock getValidLocation to return null for invalid location
    vi.mocked(getValidLocation).mockReturnValue(null);

    const result = prepareGoogleRequestBody({
      textQuery: 'coffee',
      location: 'invalid',
    });

    // Verify getValidLocation was called with the correct location
    expect(getValidLocation).toHaveBeenCalledWith('invalid');

    // Verify createLocationBias was not called
    expect(createLocationBias).not.toHaveBeenCalled();

    // Verify the locationBias was not set
    expect(result.locationBias).toBeUndefined();

    // Verify a warning was logged
    expect(log.warn).toHaveBeenCalledWith(
      expect.stringContaining('Invalid location format')
    );
  });

  it('should not set locationBias when createLocationBias returns null', () => {
    // Mock getValidLocation to return a valid GeoPoint
    const mockGeoPoint: GeoPoint = { latitude: 40.7128, longitude: -74.006 };
    vi.mocked(getValidLocation).mockReturnValue(mockGeoPoint);

    // Mock createLocationBias to return null
    vi.mocked(createLocationBias).mockReturnValue(null);

    const result = prepareGoogleRequestBody({
      textQuery: 'coffee',
      location: '40.7128,-74.0060',
    });

    // Verify the locationBias was not set
    expect(result.locationBias).toBeUndefined();
  });

  it('should use custom radius when provided', () => {
    // Mock getValidLocation to return a valid GeoPoint
    const mockGeoPoint: GeoPoint = { latitude: 40.7128, longitude: -74.006 };
    vi.mocked(getValidLocation).mockReturnValue(mockGeoPoint);

    // Mock createLocationBias to verify the radius
    vi.mocked(createLocationBias).mockImplementation(
      (params: { location: string; radiusMeters: number }) => {
        // Return a mock bias with the radius for testing
        return {
          circle: {
            center: { latitude: 40.7128, longitude: -74.006 },
            radius: params.radiusMeters,
          },
        };
      }
    );

    const result = prepareGoogleRequestBody({
      textQuery: 'coffee',
      location: '40.7128,-74.0060',
      radiusMeters: 5000,
    });

    // Verify createLocationBias was called with the custom radius
    expect(createLocationBias).toHaveBeenCalledWith({
      location: '40.7128,-74.0060',
      radiusMeters: 5000,
    });

    // Verify the radius was used in the result
    expect(result.locationBias?.circle.radius).toBe(5000);
  });

  // New tests for pageToken parameter

  it('should set pageToken when provided', () => {
    const mockPageToken = 'test-page-token';
    const result = prepareGoogleRequestBody({
      textQuery: 'coffee',
      location: '40.7128,-74.0060',
      pageToken: mockPageToken,
    });

    expect(result.pageToken).toBe(mockPageToken);
  });

  it('should not set pageToken when not provided', () => {
    const result = prepareGoogleRequestBody({
      textQuery: 'coffee',
      location: '40.7128,-74.0060',
    });

    expect(result.pageToken).toBeUndefined();
  });

  it('should include pageToken in debug log when provided', () => {
    const mockPageToken = 'test-page-token';
    prepareGoogleRequestBody({
      textQuery: 'coffee',
      location: '40.7128,-74.0060',
      pageToken: mockPageToken,
    });

    // Verify that log.debug was called at least once
    expect(log.debug).toHaveBeenCalled();

    // Based on the actual calls, we can see that the second call contains the request body
    // with the pageToken included
    const debugMock = vi.mocked(log.debug);

    // Check that there's a call with the request body that includes the pageToken
    expect(
      debugMock.mock.calls.some(
        (call) =>
          typeof call[0] === 'string' &&
          call[0].includes('[API] Request body') &&
          call[0].includes('test-page-token')
      )
    ).toBe(true);
  });

  it('should set pageToken and other parameters correctly when all are provided', () => {
    const mockPageToken = 'test-page-token';
    const result = prepareGoogleRequestBody({
      textQuery: 'coffee',
      location: '40.7128,-74.0060',
      openNow: true,
      limit: 10,
      radiusMeters: 5000,
      pageToken: mockPageToken,
    });

    expect(result.textQuery).toBe('coffee');
    expect(result.pageSize).toBe(10);
    expect(result.openNow).toBe(true);
    expect(result.pageToken).toBe(mockPageToken);
    expect(result.locationBias).toBeDefined();
  });
});
