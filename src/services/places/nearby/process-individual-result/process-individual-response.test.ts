import { describe, it, expect, vi } from 'vitest';
import type { GooglePlace } from '@/types/local-places-types';
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
  const baseSamplePlace: GooglePlace = {
    id: '123',
    location: { latitude: 40.7128, longitude: -74.006 },
    primaryType: '',
    types: [],
    primaryTypeDisplayName: { text: '', languageCode: 'en' },
    displayName: { text: 'test place', languageCode: 'en' },
    name: 'Test Place',
    formattedAddress: '123 Test St',
    currentOpeningHours: {
      openNow: true,
      periods: [],
      weekdayDescriptions: [],
    },
  };

  const keywords = ['pizza', 'beer', 'sushi', 'pub', 'japanese'];

  it('should handle matched primary keyword', () => {
    const filterReasons = {
      noKeywordMatch: 0,
      defaultedToPlace: 0,
      noEmoji: 0,
      mappedToMainCategory: 0,
    };

    const result = processIndividualPlace({
      place: {
        ...baseSamplePlace,
        primaryType: 'pizza',
      },
      keywords,
      filterReasons,
    });

    expect(result).toEqual({
      id: '123',
      location: { latitude: 40.7128, longitude: -74.006 },
      category: 'pizza',
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

    const result = processIndividualPlace({
      place: {
        ...baseSamplePlace,
        primaryType: 'pub',
      },
      keywords,
      filterReasons,
    });

    expect(result).toEqual({
      id: '123',
      location: { latitude: 40.7128, longitude: -74.006 },
      category: 'beer',
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

    const result = processIndividualPlace({
      place: {
        ...baseSamplePlace,
        primaryType: 'japanese',
      },
      keywords,
      filterReasons,
    });

    expect(result).toEqual({
      id: '123',
      location: { latitude: 40.7128, longitude: -74.006 },
      category: 'sushi',
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

    const result = processIndividualPlace({
      place: {
        ...baseSamplePlace,
        primaryTypeDisplayName: { text: 'Restaurant', languageCode: 'en' },
      },
      keywords,
      filterReasons,
    });

    expect(result).toEqual({
      id: '123',
      location: { latitude: 40.7128, longitude: -74.006 },
      category: 'restaurant',
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

    const result = processIndividualPlace({
      place: {
        ...baseSamplePlace,
        primaryType: 'restaurant',
      },
      keywords,
      filterReasons,
    });

    expect(result).toEqual({
      id: '123',
      location: { latitude: 40.7128, longitude: -74.006 },
      category: 'restaurant',
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

    const result = processIndividualPlace({
      place: baseSamplePlace,
      keywords,
      filterReasons,
    });

    expect(result).toEqual({
      id: '123',
      location: { latitude: 40.7128, longitude: -74.006 },
      category: 'place',
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
      place: { id: '123' } as GooglePlace,
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
