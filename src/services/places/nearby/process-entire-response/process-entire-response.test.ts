import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { GooglePlace } from '@/types/local-places-types';
import { processGoogleResponse } from './process-entire-response';
import { processIndividualPlace } from '../process-individual-result/process-individual-result';

// Mock the processIndividualPlace function
vi.mock('../process-individual-result/process-individual-result', () => ({
  processIndividualPlace: vi.fn(),
}));

describe('processGoogleResponse', () => {
  // Sample Google place data
  const samplePlace1: GooglePlace = {
    name: 'Pizza Place',
    id: '123',
    types: ['restaurant', 'food', 'pizza'],
    formattedAddress: '123 Pizza St',
    location: { latitude: 40.7128, longitude: -74.006 },
  };

  const samplePlace2: GooglePlace = {
    name: 'Burger Joint',
    id: '456',
    types: ['restaurant', 'food', 'burger'],
    formattedAddress: '456 Burger Ave',
    location: { latitude: 40.7129, longitude: -74.0061 },
  };

  const samplePlace3: GooglePlace = {
    name: 'Invalid Place',
    id: '789',
    types: [],
    formattedAddress: '789 Invalid Rd',
    location: { latitude: 40.713, longitude: -74.0062 },
  };

  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // Test 1: Process multiple places with valid results
  it('should process multiple places', () => {
    // Setup mock return values
    const mockResult1 = {
      id: '123',
      location: { latitude: 40.7128, longitude: -74.006 },
      category: 'restaurant',
      emoji: '🍕',
    };

    const mockResult2 = {
      id: '456',
      location: { latitude: 40.7129, longitude: -74.0061 },
      category: 'restaurant',
      emoji: '🍔',
    };

    // Configure mock to return different values for different inputs
    const mockProcessIndividualPlace = vi.mocked(processIndividualPlace);

    // @ts-expect-error - Mocking the return value of processIndividualPlace
    mockProcessIndividualPlace.mockImplementation(({ place }) => {
      if (place.id === '123') return mockResult1;
      if (place.id === '456') return mockResult2;
      return null;
    });

    // Test data
    const googleData = {
      places: [samplePlace1, samplePlace2, samplePlace3],
      count: 3,
      fromCache: false,
      cacheHit: false,
    };

    // Execute function
    const result = processGoogleResponse({
      googleData,
      textQuery: 'pizza | burger',
    });

    // Verify results - now includes null values
    expect(result).toHaveLength(3);
    expect(result).toEqual([mockResult1, mockResult2, null]);

    // Verify processIndividualPlace was called correctly
    expect(processIndividualPlace).toHaveBeenCalledTimes(3);
    expect(processIndividualPlace).toHaveBeenCalledWith({
      place: samplePlace1,
      keywords: ['pizza', 'burger'],
      filterReasons: {
        noKeywordMatch: 0,
        noEmoji: 0,
        defaultedToPlace: 0,
        mappedToMainCategory: 0,
      },
    });
  });

  // Test 2: Process with empty places array
  it('should return empty array when no places are provided', () => {
    const googleData = {
      places: [],
      count: 0,
      fromCache: false,
      cacheHit: false,
    };

    const result = processGoogleResponse({
      googleData,
      textQuery: 'pizza',
    });

    expect(result).toHaveLength(0);
    expect(processIndividualPlace).not.toHaveBeenCalled();
  });

  // Test 3: Process with all null results
  it('should include null results', () => {
    // Configure mock to return null for all places
    // @ts-expect-error - Mocking the return value of processIndividualPlace
    vi.mocked(processIndividualPlace).mockReturnValue(null);

    const googleData = {
      places: [samplePlace1, samplePlace2],
      count: 2,
      fromCache: false,
      cacheHit: false,
    };

    const result = processGoogleResponse({
      googleData,
      textQuery: 'invalid',
    });

    expect(result).toHaveLength(2);
    expect(result).toEqual([null, null]);
    expect(processIndividualPlace).toHaveBeenCalledTimes(2);
  });

  // Test 4: Process with multiple keywords and verify they're properly split
  it('should properly split multiple keywords', () => {
    // Configure mock to return a valid result
    vi.mocked(processIndividualPlace).mockReturnValue({
      id: '123',
      location: { latitude: 40.7128, longitude: -74.006 },
      category: 'restaurant',
      emoji: '🍕',
    });

    const googleData = {
      places: [samplePlace1],
      count: 1,
      fromCache: false,
      cacheHit: false,
    };

    // Execute with multiple keywords in different formats
    processGoogleResponse({
      googleData,
      textQuery: 'pizza | burger|ice cream | coffee ',
    });

    // Verify keywords were properly processed
    expect(processIndividualPlace).toHaveBeenCalledWith(
      expect.objectContaining({
        keywords: ['pizza', 'burger', 'ice cream', 'coffee'],
      })
    );
  });

  // Test 5: Verify that filterReasons is shared across calls
  it('should share filterReasons across all processIndividualPlace calls', () => {
    // Setup to capture the arguments
    vi.mocked(processIndividualPlace).mockImplementation(
      ({ place, filterReasons }) => {
        // Simulate updating the tracking objects
        if (place.id === '123') {
          filterReasons.noKeywordMatch += 1;
        } else if (place.id === '456') {
          filterReasons.mappedToMainCategory += 1;
        }

        return {
          id: place.id,
          location: place.location,
          category: 'restaurant',
          emoji: '🍴',
        };
      }
    );

    const googleData = {
      places: [samplePlace1, samplePlace2],
      count: 2,
      fromCache: false,
      cacheHit: false,
    };

    processGoogleResponse({
      googleData,
      textQuery: 'pizza | burger',
    });

    // Verify the last call received the accumulated values
    const lastCallArgs = vi.mocked(processIndividualPlace).mock.calls[1][0];
    expect(lastCallArgs.filterReasons).toEqual({
      noKeywordMatch: 1,
      noEmoji: 0,
      defaultedToPlace: 0,
      mappedToMainCategory: 1,
    });
  });

  // Test 6: Process with empty text query
  it('should handle empty text query by passing empty keywords array', () => {
    // Configure mock to return a valid result
    vi.mocked(processIndividualPlace).mockReturnValue({
      id: '123',
      location: { latitude: 40.7128, longitude: -74.006 },
      category: 'restaurant',
      emoji: '🍕',
    });

    const googleData = {
      places: [samplePlace1],
      count: 1,
      fromCache: false,
      cacheHit: false,
    };

    // Execute with empty text query
    processGoogleResponse({
      googleData,
      textQuery: '',
    });

    // Verify empty keywords array was passed
    expect(processIndividualPlace).toHaveBeenCalledWith(
      expect.objectContaining({
        keywords: [''],
      })
    );
  });
});
