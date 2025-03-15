import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  MOCK_GOOGLE_PLACES,
  MOCK_PLACES,
} from '@/__tests__/mocks/places/mock-places';
import type { GooglePlacesResponse } from '@/types/google-places';
import { fetchAndProcessGoogleData } from './fetch-and-process-google-data';
import { fetchFromGoogle } from '../fetch-from-google-places/fetch-from-google-places';
import { processGoogleResponse } from '../process-entire-response/process-entire-response';

// Mock dependencies
vi.mock('../fetch-from-google-places/fetch-from-google-places', () => ({
  fetchFromGoogle: vi.fn(),
}));

vi.mock('../process-entire-response/process-entire-response', () => ({
  processGoogleResponse: vi.fn(),
}));

describe('fetchAndProcessGoogleData', () => {
  // Sample test data
  const mockTextQuery = 'pizza|coffee';
  const mockLocation = '32.8662,-117.2268';
  const mockOpenNow = true;
  const mockLimit = 20;
  const mockRadiusMeters = 16000; // ~10 miles in meters
  const mockKeys = [1, 2, 3];

  const mockGoogleResponse: GooglePlacesResponse = {
    places: MOCK_GOOGLE_PLACES,
  };

  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should fetch and process Google data successfully', async () => {
    // Mock the dependencies
    vi.mocked(fetchFromGoogle).mockResolvedValue(mockGoogleResponse);
    vi.mocked(processGoogleResponse).mockReturnValue(MOCK_PLACES);

    // Call the function
    const result = await fetchAndProcessGoogleData({
      textQuery: mockTextQuery,
      location: mockLocation,
      openNow: mockOpenNow,
      limit: mockLimit,
      radiusMeters: mockRadiusMeters,
      keys: mockKeys,
    });

    // Verify fetchFromGoogle was called with correct parameters
    expect(fetchFromGoogle).toHaveBeenCalledWith({
      textQuery: mockTextQuery,
      location: mockLocation,
      openNow: mockOpenNow,
      limit: mockLimit,
      radiusMeters: mockRadiusMeters,
    });

    // Verify processGoogleResponse was called with correct parameters
    expect(processGoogleResponse).toHaveBeenCalledWith({
      googleData: mockGoogleResponse,
      textQuery: mockTextQuery,
      keys: mockKeys,
    });

    // Verify the result
    expect(result).toEqual({
      data: MOCK_PLACES,
      count: MOCK_PLACES.length,
      cacheHit: false,
    });
  });

  it('should handle empty results from Google', async () => {
    // Mock empty response from Google
    const emptyResponse: GooglePlacesResponse = {
      places: [],
    };

    vi.mocked(fetchFromGoogle).mockResolvedValue(emptyResponse);
    vi.mocked(processGoogleResponse).mockReturnValue([]);

    // Call the function
    const result = await fetchAndProcessGoogleData({
      textQuery: mockTextQuery,
      location: mockLocation,
    });

    // Verify the result
    expect(result).toEqual({
      data: [],
      count: 0,
      cacheHit: false,
    });
  });

  it('should pass optional parameters correctly', async () => {
    // Mock the dependencies
    vi.mocked(fetchFromGoogle).mockResolvedValue(mockGoogleResponse);
    vi.mocked(processGoogleResponse).mockReturnValue(MOCK_PLACES);

    // Call with only required parameters
    await fetchAndProcessGoogleData({
      textQuery: mockTextQuery,
      location: mockLocation,
    });

    // Verify fetchFromGoogle was called with undefined optional parameters
    expect(fetchFromGoogle).toHaveBeenCalledWith({
      textQuery: mockTextQuery,
      location: mockLocation,
      openNow: undefined,
      limit: undefined,
      radiusMeters: undefined,
    });

    // Verify processGoogleResponse was called with correct parameters
    expect(processGoogleResponse).toHaveBeenCalledWith({
      googleData: mockGoogleResponse,
      textQuery: mockTextQuery,
      keys: undefined,
    });

    // Reset mocks
    vi.resetAllMocks();
    vi.mocked(fetchFromGoogle).mockResolvedValue(mockGoogleResponse);
    vi.mocked(processGoogleResponse).mockReturnValue(MOCK_PLACES);

    // Call with some optional parameters
    await fetchAndProcessGoogleData({
      textQuery: mockTextQuery,
      location: mockLocation,
      openNow: true,
      keys: mockKeys,
    });

    // Verify fetchFromGoogle was called with the correct parameters
    expect(fetchFromGoogle).toHaveBeenCalledWith({
      textQuery: mockTextQuery,
      location: mockLocation,
      openNow: true,
      limit: undefined,
      radiusMeters: undefined,
    });

    // Verify processGoogleResponse was called with correct parameters including keys
    expect(processGoogleResponse).toHaveBeenCalledWith({
      googleData: mockGoogleResponse,
      textQuery: mockTextQuery,
      keys: mockKeys,
    });
  });

  it('should handle errors from fetchFromGoogle gracefully', async () => {
    // Mock fetchFromGoogle to throw an error
    vi.mocked(fetchFromGoogle).mockRejectedValue(new Error('API error'));

    // Call the function and expect it to throw
    await expect(
      fetchAndProcessGoogleData({
        textQuery: mockTextQuery,
        location: mockLocation,
      })
    ).rejects.toThrow('API error');
  });

  it('should handle errors from processGoogleResponse gracefully', async () => {
    // Mock fetchFromGoogle to return data but processGoogleResponse to throw
    vi.mocked(fetchFromGoogle).mockResolvedValue(mockGoogleResponse);
    vi.mocked(processGoogleResponse).mockImplementation(() => {
      throw new Error('Processing error');
    });

    // Call the function and expect it to throw
    await expect(
      fetchAndProcessGoogleData({
        textQuery: mockTextQuery,
        location: mockLocation,
      })
    ).rejects.toThrow('Processing error');
  });

  it('should handle multiple places correctly', async () => {
    const multipleGoogleResponse: GooglePlacesResponse = {
      places: MOCK_GOOGLE_PLACES,
    };

    // Mock the dependencies
    vi.mocked(fetchFromGoogle).mockResolvedValue(multipleGoogleResponse);
    vi.mocked(processGoogleResponse).mockReturnValue(MOCK_PLACES);

    // Call the function
    const result = await fetchAndProcessGoogleData({
      textQuery: mockTextQuery,
      location: mockLocation,
    });

    // Verify the result
    expect(result).toEqual({
      data: MOCK_PLACES,
      count: MOCK_GOOGLE_PLACES.length,
      cacheHit: false,
    });
  });
});
