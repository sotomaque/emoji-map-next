import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CATEGORY_MAP } from '@/constants/category-map';
import { processIndividualPlace } from '@/services/places/nearby/process-individual-result/process-individual-result';
import type { GooglePlace } from '@/types/google-places';
import type { FilterReasons } from '@/types/places';

describe('processIndividualPlace', () => {
  // Sample Google Place data for testing
  const mockGooglePlace: GooglePlace = {
    id: 'place123',
    location: {
      latitude: 40.7128,
      longitude: -74.006,
    },
    name: 'Test Place',
    displayName: {
      text: 'Test Place Display',
      languageCode: 'en',
    },
    primaryType: 'restaurant',
    primaryTypeDisplayName: {
      text: 'Restaurant',
      languageCode: 'en',
    },
    types: ['restaurant', 'food', 'point_of_interest'],
    formattedAddress: '123 Test St, New York, NY 10001',
  };

  // Filter reasons object for tracking stats
  let filterReasons: FilterReasons;

  beforeEach(() => {
    // Reset the filter reasons before each test
    filterReasons = {
      noKeywordMatch: 0,
      noEmoji: 0,
      defaultedToPlace: 0,
      mappedToMainCategory: 0,
    };

    // Clear all mocks
    vi.clearAllMocks();
  });

  it('should directly use emoji for a single key', () => {
    // Test with key 1 (pizza)
    const pizzaKey = 1;
    const pizzaEmoji = CATEGORY_MAP.find((cat) => cat.key === pizzaKey)?.emoji;

    const result = processIndividualPlace({
      place: mockGooglePlace,
      keywords: ['pizza'],
      filterReasons,
      keys: [pizzaKey],
    });

    expect(result.emoji).toBe(pizzaEmoji);
  });

  it('should restrict emoji selection to provided keys when multiple keys are given', () => {
    // Test with keys 1 and 2 (pizza and beer)
    const keys = [1, 2]; // pizza and beer

    // Create a place that would normally match with sushi (key 3)
    const sushiPlace: GooglePlace = {
      ...mockGooglePlace,
      name: 'Sushi Restaurant',
      primaryType: 'restaurant',
      primaryTypeDisplayName: {
        text: 'Japanese Restaurant',
        languageCode: 'en',
      },
      types: ['restaurant', 'japanese', 'sushi', 'food'],
    };

    const result = processIndividualPlace({
      place: sushiPlace,
      keywords: ['pizza', 'beer', 'sushi', 'japanese'],
      filterReasons,
      keys,
    });

    // Get the emoji for key 3 (sushi)
    const sushiEmoji = CATEGORY_MAP.find((cat) => cat.key === 3)?.emoji;

    // The result should NOT have the sushi emoji
    expect(result.emoji).not.toBe(sushiEmoji);

    // The result should have an emoji from either key 1 or key 2
    const allowedEmojis = keys.map(
      (key) => CATEGORY_MAP.find((cat) => cat.key === key)?.emoji
    );

    expect(allowedEmojis).toContain(result.emoji);
  });

  it('should use fallback emoji randomly selected from provided keys when no direct match is found', () => {
    // GIVEN we are searching for pizza and beer
    const keys = [1, 2]; // pizza and beer

    // WHEN we receive a google place result that matches
    // neither pizza nor beer
    const unrelatedPlace: GooglePlace = {
      ...mockGooglePlace,
      name: 'Hardware Store',
      primaryType: 'store',
      primaryTypeDisplayName: {
        text: 'Hardware Store',
        languageCode: 'en',
      },
      types: ['store', 'hardware', 'point_of_interest'],
    };

    const result = processIndividualPlace({
      place: unrelatedPlace,
      keywords: ['pizza', 'beer'],
      filterReasons,
      keys,
    });

    // We still show it bc despite not showing the exact words in the "name" / "keywords",
    // Google returned this result bc they do fuzzy matching
    // and we are ultimatley showing it as an emoji so it should be ok
    // The result should have the emoji from the first key (pizza)
    const pizzaEmoji = CATEGORY_MAP.find((cat) => cat.key === keys[0])?.emoji;
    expect(result.emoji).toBe(pizzaEmoji);
  });

  it('should attempt to match the provided google place result with most likely emoji given the keywords', () => {
    // Create a place that matches with sushi
    const sushiPlace: GooglePlace = {
      ...mockGooglePlace,
      name: 'Sushi Restaurant',
      primaryType: 'restaurant',
      primaryTypeDisplayName: {
        text: 'Japanese Restaurant',
        languageCode: 'en',
      },
      types: ['restaurant', 'japanese', 'sushi', 'food'],
    };

    const result = processIndividualPlace({
      place: sushiPlace,
      keywords: ['sushi', 'japanese'],
      filterReasons,
      keys: [], // No keys provided
    });

    // The result should have an emoji related to sushi or japanese
    const sushiEmoji = CATEGORY_MAP.find((cat) => cat.name === 'sushi')?.emoji;
    const japaneseEmoji = CATEGORY_MAP.find(
      (cat) => cat.name === 'japanese'
    )?.emoji;

    expect([sushiEmoji, japaneseEmoji]).toContain(result.emoji);
  });
});
