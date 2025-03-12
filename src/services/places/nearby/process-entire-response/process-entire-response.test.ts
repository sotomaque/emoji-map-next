import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  MOCK_GOOGLE_PLACES,
  MOCK_PLACES,
} from '@/__tests__/mocks/places/mock-places';
import type { GooglePlace } from '@/types/google-places';
import { processGoogleResponse } from './process-entire-response';
import { processIndividualPlace } from '../process-individual-result/process-individual-result';

// Mock the processIndividualPlace function
vi.mock('../process-individual-result/process-individual-result', () => ({
  processIndividualPlace: vi.fn(),
}));

describe('processGoogleResponse', () => {
  // Create a third sample place for testing invalid cases
  const invalidPlace: GooglePlace = {
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
    // Use the mock places from our mock file
    const mockResult1 = { ...MOCK_PLACES[0] };
    const mockResult2 = { ...MOCK_PLACES[1] };

    // Configure mock to return different values for different inputs
    const mockProcessIndividualPlace = vi.mocked(processIndividualPlace);

    // @ts-expect-error - Mocking the return value that can be null
    mockProcessIndividualPlace.mockImplementation(({ place }) => {
      if (place.id === MOCK_GOOGLE_PLACES[0].id) return mockResult1;
      if (place.id === MOCK_GOOGLE_PLACES[1].id) return mockResult2;
      return null;
    });

    // Test data
    const googleData = {
      places: [...MOCK_GOOGLE_PLACES, invalidPlace],
    };

    // Execute function
    const result = processGoogleResponse({
      googleData,
      textQuery: 'pizza | coffee',
    });

    // Verify results - now includes null values
    expect(result).toHaveLength(3);
    expect(result).toEqual([mockResult1, mockResult2, null]);

    // Verify processIndividualPlace was called correctly
    expect(processIndividualPlace).toHaveBeenCalledTimes(3);
    expect(processIndividualPlace).toHaveBeenCalledWith({
      place: MOCK_GOOGLE_PLACES[0],
      keywords: ['pizza', 'coffee'],
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
    // @ts-expect-error - Mocking the return value that can be null
    vi.mocked(processIndividualPlace).mockReturnValue(null);

    const googleData = {
      places: MOCK_GOOGLE_PLACES,
    };

    const result = processGoogleResponse({
      googleData,
      textQuery: 'invalid',
    });

    expect(result).toHaveLength(MOCK_GOOGLE_PLACES.length);
    expect(result).toEqual(Array(MOCK_GOOGLE_PLACES.length).fill(null));
    expect(processIndividualPlace).toHaveBeenCalledTimes(
      MOCK_GOOGLE_PLACES.length
    );
  });

  // Test 4: Process with multiple keywords and verify they're properly split
  it('should properly split multiple keywords', () => {
    // Configure mock to return a valid result
    vi.mocked(processIndividualPlace).mockReturnValue(MOCK_PLACES[0]);

    const googleData = {
      places: [MOCK_GOOGLE_PLACES[0]],
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
        if (place.id === MOCK_GOOGLE_PLACES[0].id) {
          filterReasons.noKeywordMatch += 1;
        } else if (place.id === MOCK_GOOGLE_PLACES[1].id) {
          filterReasons.mappedToMainCategory += 1;
        }

        return {
          id: place.id,
          location: place.location,
          emoji: '🍴',
        };
      }
    );

    const googleData = {
      places: MOCK_GOOGLE_PLACES,
    };

    processGoogleResponse({
      googleData,
      textQuery: 'pizza | coffee',
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
    vi.mocked(processIndividualPlace).mockReturnValue(MOCK_PLACES[0]);

    const googleData = {
      places: [MOCK_GOOGLE_PLACES[0]],
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
