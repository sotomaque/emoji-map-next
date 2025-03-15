import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MOCK_GOOGLE_PLACES } from '@/__tests__/mocks/places/mock-places';
import { fetchFromGoogle } from './fetch-from-google-places';
import { prepareGoogleRequestBody } from '../prepare-google-request-body/prepare-google-request-body';

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

    // Use mock places from our mock file
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          data: MOCK_GOOGLE_PLACES,
        }),
    });

    // Call the function
    const result = await fetchFromGoogle({
      textQuery: 'pizza',
      location: '40.7128,-74.0060',
      radiusMeters: 16000, // ~10 miles in meters
    });

    // Verify results
    expect(result).toHaveProperty('places');
    expect(Array.isArray(result.places)).toBe(true);
  });

  // Test 2: Empty response
  it('should handle empty response', async () => {
    // Mock fetch to return empty places array
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ places: [] }),
    });

    // Call the function
    const result = await fetchFromGoogle({
      textQuery: 'nonexistent',
      location: '40.7128,-74.0060',
      radiusMeters: 16000, // ~10 miles in meters
    });

    // Verify results
    expect(result).toEqual({
      places: [],
    });
  });

  // Test 3: Invalid response
  it('should handle invalid response', async () => {
    // Mock fetch to return invalid response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ invalid: 'response' }),
    });

    // Call the function
    const result = await fetchFromGoogle({
      textQuery: 'invalid',
      location: '40.7128,-74.0060',
      radiusMeters: 16000, // ~10 miles in meters
    });

    // Verify results
    expect(result).toEqual({
      places: [],
    });
  });

  // Test 4: Network error
  it('should handle network error', async () => {
    // Mock fetch to throw an error
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    // Call the function
    const result = await fetchFromGoogle({
      textQuery: 'error',
      location: '40.7128,-74.0060',
      radiusMeters: 16000, // ~10 miles in meters
    });

    // Verify results
    expect(result).toEqual({
      places: [],
    });
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
      json: () => Promise.resolve({ data: [] }),
    });

    // Call the function
    await fetchFromGoogle({
      textQuery: 'pizza',
      location: '40.7128,-74.0060',
      radiusMeters: 16000, // ~10 miles in meters
      limit: 10,
    });

    // Verify prepareGoogleRequestBody was called with limit
    expect(prepareGoogleRequestBody).toHaveBeenCalledWith({
      textQuery: 'pizza',
      location: '40.7128,-74.0060',
      radiusMeters: 16000,
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
      json: () => Promise.resolve({ data: [] }),
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
      radiusMeters: undefined,
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
      json: () => Promise.resolve({ data: [] }),
    });

    // Call the function
    await fetchFromGoogle({
      textQuery: 'pizza',
      location: '40.7128,-74.0060',
      radiusMeters: 8000, // ~5 miles in meters
      openNow: true,
      limit: 20,
    });

    // Verify prepareGoogleRequestBody was called with all parameters
    expect(prepareGoogleRequestBody).toHaveBeenCalledWith({
      textQuery: 'pizza',
      location: '40.7128,-74.0060',
      radiusMeters: 8000,
      openNow: true,
      limit: 20,
    });
  });
});
