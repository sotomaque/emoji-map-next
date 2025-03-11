import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchFromGoogle } from './fetch-from-google-places';
import { prepareGoogleRequestBody } from '../prepare-google-request-body/prepare-google-request-body';

// Mock dependencies
vi.mock('@/env', () => ({
  env: {
    GOOGLE_PLACES_API_KEY: 'mock-api-key',
    GOOGLE_PLACES_V2_URL: 'https://mock-google-api.com/v2',
  },
}));

vi.mock('../prepare-google-request-body/prepare-google-request-body', () => ({
  prepareGoogleRequestBody: vi.fn(),
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('fetchFromGoogle', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Mock console methods to prevent noise in test output
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  // Test 1: Successful fetch with valid response
  it('should fetch data successfully and return places', async () => {
    // Mock request body
    const mockRequestBody = {
      textQuery: 'pizza',
      rankPreference: 'DISTANCE' as const,
    };
    vi.mocked(prepareGoogleRequestBody).mockReturnValue(mockRequestBody);

    // Mock successful response
    const mockPlaces = [
      { id: '1', name: 'Pizza Place 1' },
      { id: '2', name: 'Pizza Place 2' },
    ];
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ places: mockPlaces }),
    });

    // Call the function
    const result = await fetchFromGoogle({
      textQuery: 'pizza',
      location: '40.7128,-74.0060',
      bufferMiles: 10,
    });

    // Verify results
    expect(result).toEqual({
      places: mockPlaces,
      count: 2,
      cacheHit: false,
    });

    // Verify prepareGoogleRequestBody was called correctly
    expect(prepareGoogleRequestBody).toHaveBeenCalledWith({
      textQuery: 'pizza',
      location: '40.7128,-74.0060',
      bufferMiles: 10,
      openNow: undefined,
      limit: undefined,
    });

    // Verify fetch was called correctly
    expect(mockFetch).toHaveBeenCalledWith(
      'https://mock-google-api.com/v2?key=mock-api-key',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Goog-FieldMask': '*',
        },
        body: JSON.stringify(mockRequestBody),
      }
    );
  });

  // Test 2: Empty response
  it('should handle empty response', async () => {
    // Mock request body
    vi.mocked(prepareGoogleRequestBody).mockReturnValue({
      textQuery: 'nonexistent',
      rankPreference: 'DISTANCE' as const,
    });

    // Mock empty response
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ places: [] }),
    });

    // Call the function
    const result = await fetchFromGoogle({
      textQuery: 'nonexistent',
      location: '40.7128,-74.0060',
      bufferMiles: 10,
    });

    // Verify results
    expect(result).toEqual({
      places: [],
      count: 0,
      cacheHit: false,
    });
  });

  // Test 3: Invalid response
  it('should handle invalid response', async () => {
    // Mock request body
    vi.mocked(prepareGoogleRequestBody).mockReturnValue({
      textQuery: 'pizza',
      rankPreference: 'DISTANCE' as const,
    });

    // Mock invalid response
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ invalid: 'response' }),
    });

    // Call the function
    const result = await fetchFromGoogle({
      textQuery: 'pizza',
      location: '40.7128,-74.0060',
      bufferMiles: 10,
    });

    // Verify results
    expect(result).toEqual({
      places: [],
      count: 0,
      cacheHit: false,
    });

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      '[API] Invalid response from Google Places API:',
      { invalid: 'response' }
    );
  });

  // Test 4: Network error
  it('should handle network error', async () => {
    // Mock request body
    vi.mocked(prepareGoogleRequestBody).mockReturnValue({
      textQuery: 'pizza',
      rankPreference: 'DISTANCE' as const,
    });

    // Mock network error
    const networkError = new Error('Network error');
    mockFetch.mockRejectedValue(networkError);

    // Call the function
    const result = await fetchFromGoogle({
      textQuery: 'pizza',
      location: '40.7128,-74.0060',
      bufferMiles: 10,
    });

    // Verify results
    expect(result).toEqual({
      places: [],
      count: 0,
      cacheHit: false,
    });

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      '[API] Error fetching from Google Places API:',
      networkError
    );
  });

  // Test 5: With limit parameter
  it('should pass limit parameter to prepareGoogleRequestBody', async () => {
    // Mock request body
    vi.mocked(prepareGoogleRequestBody).mockReturnValue({
      textQuery: 'pizza',
      rankPreference: 'DISTANCE' as const,
      maxResultCount: 10,
    });

    // Mock successful response
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ places: [] }),
    });

    // Call the function
    await fetchFromGoogle({
      textQuery: 'pizza',
      location: '40.7128,-74.0060',
      bufferMiles: 10,
      limit: 10,
    });

    // Verify prepareGoogleRequestBody was called with limit
    expect(prepareGoogleRequestBody).toHaveBeenCalledWith({
      textQuery: 'pizza',
      location: '40.7128,-74.0060',
      bufferMiles: 10,
      openNow: undefined,
      limit: 10,
    });
  });

  // Test 6: With openNow parameter
  it('should pass openNow parameter to prepareGoogleRequestBody', async () => {
    // Mock request body
    vi.mocked(prepareGoogleRequestBody).mockReturnValue({
      textQuery: 'pizza',
      rankPreference: 'DISTANCE' as const,
      openNow: true,
    });

    // Mock successful response
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ places: [] }),
    });

    // Call the function
    await fetchFromGoogle({
      textQuery: 'pizza',
      location: '40.7128,-74.0060',
      openNow: true,
    });

    // Verify prepareGoogleRequestBody was called with openNow
    expect(prepareGoogleRequestBody).toHaveBeenCalledWith({
      textQuery: 'pizza',
      location: '40.7128,-74.0060',
      bufferMiles: undefined,
      openNow: true,
      limit: undefined,
    });
  });

  // Test 7: With all parameters
  it('should pass all parameters to prepareGoogleRequestBody', async () => {
    // Mock request body
    vi.mocked(prepareGoogleRequestBody).mockReturnValue({
      textQuery: 'pizza',
      rankPreference: 'DISTANCE' as const,
      maxResultCount: 20,
      openNow: true,
    });

    // Mock successful response
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ places: [] }),
    });

    // Call the function
    await fetchFromGoogle({
      textQuery: 'pizza',
      location: '40.7128,-74.0060',
      bufferMiles: 5,
      openNow: true,
      limit: 20,
    });

    // Verify prepareGoogleRequestBody was called with all parameters
    expect(prepareGoogleRequestBody).toHaveBeenCalledWith({
      textQuery: 'pizza',
      location: '40.7128,-74.0060',
      bufferMiles: 5,
      openNow: true,
      limit: 20,
    });
  });
});
