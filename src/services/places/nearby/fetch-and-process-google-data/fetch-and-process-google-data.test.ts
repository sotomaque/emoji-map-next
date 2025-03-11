import { describe, it, expect, vi, beforeEach } from 'vitest';
import type {
  GooglePlace,
  GooglePlacesResponse,
  SimplifiedMapPlace,
} from '@/types/local-places-types';
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
  const mockBufferMiles = 10;

  const mockGooglePlace: GooglePlace = {
    id: 'place123',
    name: 'Test Pizza Place',
    formattedAddress: '123 Test St, Test City, TS 12345',
    location: {
      latitude: 32.8662,
      longitude: -117.2268,
    },
    types: ['restaurant', 'food', 'point_of_interest'],
  };

  const mockGoogleResponse: GooglePlacesResponse = {
    places: [mockGooglePlace],
    count: 1,
    cacheHit: false,
  };

  const mockSimplifiedPlace: SimplifiedMapPlace = {
    id: 'place123',
    location: {
      latitude: 32.8662,
      longitude: -117.2268,
    },
    category: 'restaurant',
    emoji: '🍕',
    openNow: true,
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
    vi.mocked(processGoogleResponse).mockReturnValue([mockSimplifiedPlace]);

    // Call the function
    const result = await fetchAndProcessGoogleData({
      textQuery: mockTextQuery,
      location: mockLocation,
      openNow: mockOpenNow,
      limit: mockLimit,
      bufferMiles: mockBufferMiles,
    });

    // Verify fetchFromGoogle was called with correct parameters
    expect(fetchFromGoogle).toHaveBeenCalledWith({
      textQuery: mockTextQuery,
      location: mockLocation,
      openNow: mockOpenNow,
      limit: mockLimit,
      bufferMiles: mockBufferMiles,
    });

    // Verify processGoogleResponse was called with correct parameters
    expect(processGoogleResponse).toHaveBeenCalledWith({
      googleData: mockGoogleResponse,
      textQuery: mockTextQuery,
    });

    // Verify the result
    expect(result).toEqual({
      places: [mockSimplifiedPlace],
      count: 1,
      cacheHit: false,
    });
  });

  it('should handle empty results from Google', async () => {
    // Mock empty response from Google
    const emptyResponse: GooglePlacesResponse = {
      places: [],
      count: 0,
      cacheHit: false,
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
      places: [],
      count: 0,
      cacheHit: false,
    });
  });

  it('should pass optional parameters correctly', async () => {
    // Mock the dependencies
    vi.mocked(fetchFromGoogle).mockResolvedValue(mockGoogleResponse);
    vi.mocked(processGoogleResponse).mockReturnValue([mockSimplifiedPlace]);

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
      bufferMiles: undefined,
    });

    // Reset mocks
    vi.resetAllMocks();
    vi.mocked(fetchFromGoogle).mockResolvedValue(mockGoogleResponse);
    vi.mocked(processGoogleResponse).mockReturnValue([mockSimplifiedPlace]);

    // Call with some optional parameters
    await fetchAndProcessGoogleData({
      textQuery: mockTextQuery,
      location: mockLocation,
      openNow: true,
    });

    // Verify fetchFromGoogle was called with the correct parameters
    expect(fetchFromGoogle).toHaveBeenCalledWith({
      textQuery: mockTextQuery,
      location: mockLocation,
      openNow: true,
      limit: undefined,
      bufferMiles: undefined,
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
    // Create a response with multiple places
    const multipleGooglePlaces: GooglePlace[] = [
      mockGooglePlace,
      {
        ...mockGooglePlace,
        id: 'place456',
        name: 'Test Coffee Shop',
      },
      {
        ...mockGooglePlace,
        id: 'place789',
        name: 'Test Bakery',
      },
    ];

    const multipleGoogleResponse: GooglePlacesResponse = {
      places: multipleGooglePlaces,
      count: multipleGooglePlaces.length,
      cacheHit: false,
    };

    const multipleSimplifiedPlaces: SimplifiedMapPlace[] = [
      mockSimplifiedPlace,
      {
        ...mockSimplifiedPlace,
        id: 'place456',
        category: 'cafe',
        emoji: '☕',
      },
      {
        ...mockSimplifiedPlace,
        id: 'place789',
        category: 'bakery',
        emoji: '🥐',
      },
    ];

    // Mock the dependencies
    vi.mocked(fetchFromGoogle).mockResolvedValue(multipleGoogleResponse);
    vi.mocked(processGoogleResponse).mockReturnValue(multipleSimplifiedPlaces);

    // Call the function
    const result = await fetchAndProcessGoogleData({
      textQuery: mockTextQuery,
      location: mockLocation,
    });

    // Verify the result
    expect(result).toEqual({
      places: multipleSimplifiedPlaces,
      count: multipleGooglePlaces.length,
      cacheHit: false,
    });
  });
});
