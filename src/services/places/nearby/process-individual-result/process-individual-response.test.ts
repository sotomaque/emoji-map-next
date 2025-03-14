import { describe, it, expect, vi } from 'vitest';
import { MOCK_GOOGLE_PLACES } from '@/__tests__/mocks/places/mock-places';
import type { GooglePlace } from '@/types/google-places';
import { processIndividualPlace } from './process-individual-result';

// Mock the CATEGORY_MAP with the new structure
vi.mock('@/constants/category-map', () => ({
  CATEGORY_MAP: [
    {
      key: 1,
      name: 'pizza',
      emoji: '🍕',
      keywords: ['pizza', 'pizzeria'],
    },
    {
      key: 2,
      name: 'beer',
      emoji: '🍺',
      keywords: ['beer', 'brewery', 'pub'],
    },
    {
      key: 3,
      name: 'sushi',
      emoji: '🍣',
      keywords: ['sushi', 'japanese'],
    },
    {
      key: 4,
      name: 'restaurant',
      emoji: '🍽️',
      keywords: ['restaurant', 'dining'],
    },
  ],
}));

describe('processIndividualPlace', () => {
  // Create a base sample place using properties from the mock but with controlled values
  const createBaseSamplePlace = (): GooglePlace => ({
    id: MOCK_GOOGLE_PLACES[0].id,
    location: MOCK_GOOGLE_PLACES[0].location,
    name: 'Test Place',
    formattedAddress: '123 Test St',
    primaryType: '',
    types: [],
    primaryTypeDisplayName: { text: '', languageCode: 'en' },
    displayName: { text: 'test place', languageCode: 'en' },
    currentOpeningHours: {
      openNow: true,
      periods: [],
      weekdayDescriptions: [],
    },
  });

  const keywords = ['pizza', 'beer', 'sushi', 'pub', 'japanese'];

  it('should handle matched primary keyword', () => {
    const place = createBaseSamplePlace();
    place.primaryType = 'pizza';

    const result = processIndividualPlace({
      place,
      keywords: ['pizza'],
      filterReasons: {
        noKeywordMatch: 0,
        defaultedToPlace: 0,
        noEmoji: 0,
        mappedToMainCategory: 0,
      },
      keys: [],
    });

    expect(result.emoji).toBe('🍕');
  });

  it('should handle matched related keyword with own emoji', () => {
    const place = createBaseSamplePlace();
    place.primaryType = 'pub';

    const result = processIndividualPlace({
      place,
      keywords: ['beer', 'pub'],
      filterReasons: {
        noKeywordMatch: 0,
        defaultedToPlace: 0,
        noEmoji: 0,
        mappedToMainCategory: 0,
      },
      keys: [],
    });

    expect(result.emoji).toBe('🍺');
  });

  it('should handle matched related keyword without own emoji', () => {
    const place = createBaseSamplePlace();
    place.primaryType = 'japanese';

    const result = processIndividualPlace({
      place,
      keywords: ['japanese'],
      filterReasons: {
        noKeywordMatch: 0,
        defaultedToPlace: 0,
        noEmoji: 0,
        mappedToMainCategory: 0,
      },
      keys: [],
    });

    expect(result.emoji).toBe('🍣');
  });

  it('should fallback to primaryTypeDisplayName when no keyword match', () => {
    const place = createBaseSamplePlace();
    place.primaryTypeDisplayName = {
      text: 'Restaurant',
      languageCode: 'en',
    };

    const result = processIndividualPlace({
      place,
      keywords: ['not-matching'],
      filterReasons: {
        noKeywordMatch: 0,
        defaultedToPlace: 0,
        noEmoji: 0,
        mappedToMainCategory: 0,
      },
      keys: [],
    });

    expect(result.emoji).toBe('🍽️');
  });

  it('should fallback to primaryType when no keyword or display name match', () => {
    const place = createBaseSamplePlace();
    place.primaryType = 'restaurant';

    const result = processIndividualPlace({
      place,
      keywords: ['not-matching'],
      filterReasons: {
        noKeywordMatch: 0,
        defaultedToPlace: 0,
        noEmoji: 0,
        mappedToMainCategory: 0,
      },
      keys: [],
    });

    expect(result.emoji).toBe('🍽️');
  });

  it('should default to "place" when no type information is available', () => {
    const place = createBaseSamplePlace();

    const result = processIndividualPlace({
      place,
      keywords: ['not-matching'],
      filterReasons: {
        noKeywordMatch: 0,
        defaultedToPlace: 0,
        noEmoji: 0,
        mappedToMainCategory: 0,
      },
      keys: [],
    });

    expect(result.emoji).toBe('🍽️');
  });

  it('should return empty object when required fields are missing', () => {
    const result = processIndividualPlace({
      place: { id: MOCK_GOOGLE_PLACES[0].id } as GooglePlace,
      keywords,
      filterReasons: {
        noKeywordMatch: 0,
        defaultedToPlace: 0,
        noEmoji: 0,
        mappedToMainCategory: 0,
      },
      keys: [],
    });

    expect(result).toEqual({});
  });
});
