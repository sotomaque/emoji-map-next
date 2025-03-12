import { describe, it, expect, vi } from 'vitest';
import { MOCK_GOOGLE_PLACES } from '@/__tests__/mocks/places/mock-places';
import type { GooglePlace } from '@/types/google-places';
import { processIndividualPlace } from './process-individual-result';

// Mock the CATEGORY_MAP with the new structure
vi.mock('@/constants/category-map', () => ({
  CATEGORY_MAP: [
    {
      key: 'pizza',
      name: 'pizza',
      emoji: '🍕',
      keywords: ['pizza', 'pizzeria'],
    },
    {
      key: 'beer',
      name: 'beer',
      emoji: '🍺',
      keywords: ['beer', 'brewery', 'pub'],
    },
    {
      key: 'sushi',
      name: 'sushi',
      emoji: '🍣',
      keywords: ['sushi', 'japanese'],
    },
    {
      key: 'restaurant',
      name: 'restaurant',
      emoji: '🍽️',
      keywords: ['restaurant', 'dining'],
    },
    {
      key: 'place',
      name: 'place',
      emoji: '📍',
      keywords: ['place'],
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
    const filterReasons = {
      noKeywordMatch: 0,
      defaultedToPlace: 0,
      noEmoji: 0,
      mappedToMainCategory: 0,
    };

    const testPlace = createBaseSamplePlace();
    testPlace.primaryType = 'pizza';

    const result = processIndividualPlace({
      place: testPlace,
      keywords,
      filterReasons,
    });

    expect(result).toEqual({
      id: testPlace.id,
      location: testPlace.location,
      emoji: '🍕',
    });
    expect(filterReasons).toEqual({
      noKeywordMatch: 0,
      defaultedToPlace: 0,
      noEmoji: 0,
      mappedToMainCategory: 0,
    });
  });

  it('should handle matched related keyword with own emoji', () => {
    const filterReasons = {
      noKeywordMatch: 0,
      defaultedToPlace: 0,
      noEmoji: 0,
      mappedToMainCategory: 0,
    };

    const testPlace = createBaseSamplePlace();
    testPlace.primaryType = 'pub';

    const result = processIndividualPlace({
      place: testPlace,
      keywords,
      filterReasons,
    });

    expect(result).toEqual({
      id: testPlace.id,
      location: testPlace.location,
      emoji: '🍺',
    });
    expect(filterReasons).toEqual({
      noKeywordMatch: 0,
      defaultedToPlace: 0,
      noEmoji: 0,
      mappedToMainCategory: 1,
    });
  });

  it('should handle matched related keyword without own emoji', () => {
    const filterReasons = {
      noKeywordMatch: 0,
      defaultedToPlace: 0,
      noEmoji: 0,
      mappedToMainCategory: 0,
    };

    const testPlace = createBaseSamplePlace();
    testPlace.primaryType = 'japanese';

    const result = processIndividualPlace({
      place: testPlace,
      keywords,
      filterReasons,
    });

    expect(result).toEqual({
      id: testPlace.id,
      location: testPlace.location,
      emoji: '🍣',
    });
    expect(filterReasons).toEqual({
      noKeywordMatch: 0,
      defaultedToPlace: 0,
      noEmoji: 0,
      mappedToMainCategory: 1,
    });
  });

  it('should fallback to primaryTypeDisplayName when no keyword match', () => {
    const filterReasons = {
      noKeywordMatch: 0,
      defaultedToPlace: 0,
      noEmoji: 0,
      mappedToMainCategory: 0,
    };

    const testPlace = createBaseSamplePlace();
    testPlace.primaryTypeDisplayName = {
      text: 'Restaurant',
      languageCode: 'en',
    };

    const result = processIndividualPlace({
      place: testPlace,
      keywords,
      filterReasons,
    });

    expect(result).toEqual({
      id: testPlace.id,
      location: testPlace.location,
      emoji: '🍽️',
    });
    expect(filterReasons).toEqual({
      noKeywordMatch: 1,
      defaultedToPlace: 0,
      noEmoji: 0,
      mappedToMainCategory: 0,
    });
  });

  it('should fallback to primaryType when no keyword or display name match', () => {
    const filterReasons = {
      noKeywordMatch: 0,
      defaultedToPlace: 0,
      noEmoji: 0,
      mappedToMainCategory: 0,
    };

    const testPlace = createBaseSamplePlace();
    testPlace.primaryType = 'restaurant';

    const result = processIndividualPlace({
      place: testPlace,
      keywords,
      filterReasons,
    });

    expect(result).toEqual({
      id: testPlace.id,
      location: testPlace.location,
      emoji: '🍽️',
    });
    expect(filterReasons).toEqual({
      noKeywordMatch: 1,
      defaultedToPlace: 0,
      noEmoji: 0,
      mappedToMainCategory: 0,
    });
  });

  it('should default to "place" when no type information is available', () => {
    const filterReasons = {
      noKeywordMatch: 0,
      defaultedToPlace: 0,
      noEmoji: 0,
      mappedToMainCategory: 0,
    };

    const testPlace = createBaseSamplePlace();

    const result = processIndividualPlace({
      place: testPlace,
      keywords,
      filterReasons,
    });

    expect(result).toEqual({
      id: testPlace.id,
      location: testPlace.location,
      emoji: '📍',
    });
    expect(filterReasons).toEqual({
      noKeywordMatch: 1,
      defaultedToPlace: 1,
      noEmoji: 0,
      mappedToMainCategory: 0,
    });
  });

  it('should return empty object when required fields are missing', () => {
    const filterReasons = {
      noKeywordMatch: 0,
      defaultedToPlace: 0,
      noEmoji: 0,
      mappedToMainCategory: 0,
    };

    const result = processIndividualPlace({
      place: { id: MOCK_GOOGLE_PLACES[0].id } as GooglePlace,
      keywords,
      filterReasons,
    });

    expect(result).toEqual({});
    expect(filterReasons).toEqual({
      noKeywordMatch: 0,
      defaultedToPlace: 0,
      noEmoji: 0,
      mappedToMainCategory: 0,
    });
  });
});
