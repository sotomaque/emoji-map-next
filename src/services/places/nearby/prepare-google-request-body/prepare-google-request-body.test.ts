import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLocationBuffer, isValidLocation } from '@/utils/geo/geo';
import { prepareGoogleRequestBody } from './prepare-google-request-body';

// Mock the geo utilities
vi.mock('@/utils/geo/geo', () => ({
  isValidLocation: vi.fn(),
  createLocationBuffer: vi.fn(),
}));

describe('prepareGoogleRequestBody', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Default mock implementations
    vi.mocked(isValidLocation).mockReturnValue(true);
    vi.mocked(createLocationBuffer).mockReturnValue({
      low: { latitude: 40.6, longitude: -74.1 },
      high: { latitude: 40.8, longitude: -73.9 },
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

  it('should set locationRestriction when location is valid', () => {
    // Mock isValidLocation to return true
    vi.mocked(isValidLocation).mockReturnValue(true);

    // Mock createLocationBuffer to return a rectangle
    const mockBuffer = {
      low: { latitude: 40.6, longitude: -74.1 },
      high: { latitude: 40.8, longitude: -73.9 },
    };
    vi.mocked(createLocationBuffer).mockReturnValue(mockBuffer);

    const result = prepareGoogleRequestBody({
      textQuery: 'coffee',
      location: '40.7128,-74.0060',
    });

    // Verify isValidLocation was called with the correct location
    expect(isValidLocation).toHaveBeenCalledWith('40.7128,-74.0060');

    // Verify createLocationBuffer was called with the correct parameters
    expect(createLocationBuffer).toHaveBeenCalledWith('40.7128,-74.0060', 10);

    // Verify the locationRestriction was set correctly
    expect(result.locationRestriction).toEqual({
      rectangle: mockBuffer,
    });
  });

  it('should not set locationRestriction when location is invalid', () => {
    // Mock isValidLocation to return false
    vi.mocked(isValidLocation).mockReturnValue(false);

    const result = prepareGoogleRequestBody({
      textQuery: 'coffee',
      location: 'invalid',
    });

    // Verify isValidLocation was called with the correct location
    expect(isValidLocation).toHaveBeenCalledWith('invalid');

    // Verify createLocationBuffer was not called
    expect(createLocationBuffer).not.toHaveBeenCalled();

    // Verify the locationRestriction was not set
    expect(result.locationRestriction).toBeUndefined();

    // Verify a warning was logged
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Invalid location format')
    );
  });

  it('should not set locationRestriction when createLocationBuffer returns null', () => {
    // Mock isValidLocation to return true
    vi.mocked(isValidLocation).mockReturnValue(true);

    // Mock createLocationBuffer to return null
    vi.mocked(createLocationBuffer).mockReturnValue(null);

    const result = prepareGoogleRequestBody({
      textQuery: 'coffee',
      location: '40.7128,-74.0060',
    });

    // Verify the locationRestriction was not set
    expect(result.locationRestriction).toBeUndefined();
  });

  it('should use custom buffer size when provided', () => {
    // Mock createLocationBuffer to verify the buffer size
    vi.mocked(createLocationBuffer).mockImplementation(
      (loc, bufferSize = 10) => {
        // Return a mock buffer with the buffer size in the coordinates for testing
        return {
          low: {
            latitude: 40 - bufferSize / 100,
            longitude: -74 - bufferSize / 100,
          },
          high: {
            latitude: 40 + bufferSize / 100,
            longitude: -74 + bufferSize / 100,
          },
        };
      }
    );

    const result = prepareGoogleRequestBody({
      textQuery: 'coffee',
      location: '40.7128,-74.0060',
      bufferMiles: 5,
    });

    // Verify createLocationBuffer was called with the custom buffer size
    expect(createLocationBuffer).toHaveBeenCalledWith('40.7128,-74.0060', 5);

    // Verify the buffer size was used in the result
    expect(result.locationRestriction?.rectangle.low.latitude).toBeCloseTo(
      39.95,
      2
    );
    expect(result.locationRestriction?.rectangle.high.latitude).toBeCloseTo(
      40.05,
      2
    );
  });
});
