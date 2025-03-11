import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPrimaryCategoryForRelatedWord } from './get-primary-category-for-related-word';

// Mock the CATEGORY_MAP with the new structure
vi.mock('@/constants/category-map', () => ({
  CATEGORY_MAP: [
    {
      key: 1,
      name: 'pizza',
      emoji: '🍕',
      keywords: ['italian', 'pepperoni', 'cheese'],
    },
    {
      key: 2,
      name: 'beer',
      emoji: '🍺',
      keywords: ['brewery', 'pub', 'ale'],
    },
    {
      key: 3,
      name: 'sushi',
      emoji: '🍣',
      keywords: ['japanese', 'sashimi', 'roll'],
    },
  ],
}));

// Mock lodash with a default export
vi.mock('lodash', () => {
  const lodashMock = {
    toLower: (str: string) => str?.toLowerCase() || '',
    trim: (str: string) => str?.trim() || '',
    includes: (str: string, searchStr: string) => {
      if (!str || !searchStr) return false;
      return str.includes(searchStr);
    },
    some: (arr: unknown[], predicate: (value: unknown) => boolean) => {
      return arr.some(predicate);
    },
  };

  return {
    default: lodashMock,
    ...lodashMock,
  };
});

describe('getPrimaryCategoryForRelatedWord', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // Test 1: Exact match with primary category
  it('should return primary category for exact match', () => {
    expect(getPrimaryCategoryForRelatedWord('pizza')).toBe('pizza');
    expect(getPrimaryCategoryForRelatedWord('beer')).toBe('beer');
    expect(getPrimaryCategoryForRelatedWord('sushi')).toBe('sushi');
  });

  // Test 2: Exact match with related word
  it('should return primary category for related word', () => {
    expect(getPrimaryCategoryForRelatedWord('italian')).toBe('pizza');
    expect(getPrimaryCategoryForRelatedWord('brewery')).toBe('beer');
    expect(getPrimaryCategoryForRelatedWord('japanese')).toBe('sushi');
  });

  // Test 3: Partial match with related word
  it('should return primary category for partial match', () => {
    expect(getPrimaryCategoryForRelatedWord('ital')).toBe('pizza');
    expect(getPrimaryCategoryForRelatedWord('brew')).toBe('beer');
    expect(getPrimaryCategoryForRelatedWord('japan')).toBe('sushi');
  });

  // Test 4: Case insensitivity
  it('should be case insensitive', () => {
    expect(getPrimaryCategoryForRelatedWord('PIZZA')).toBe('pizza');
    expect(getPrimaryCategoryForRelatedWord('Beer')).toBe('beer');
    expect(getPrimaryCategoryForRelatedWord('SuShI')).toBe('sushi');
    expect(getPrimaryCategoryForRelatedWord('ITALIAN')).toBe('pizza');
  });

  // Test 5: Whitespace handling
  it('should handle whitespace', () => {
    expect(getPrimaryCategoryForRelatedWord('  pizza  ')).toBe('pizza');
    expect(getPrimaryCategoryForRelatedWord(' beer ')).toBe('beer');
    expect(getPrimaryCategoryForRelatedWord('\tsushi\n')).toBe('sushi');
  });

  // Test 6: No match
  it('should return undefined for no match', () => {
    expect(getPrimaryCategoryForRelatedWord('burger')).toBeUndefined();
    expect(getPrimaryCategoryForRelatedWord('coffee')).toBeUndefined();
    expect(getPrimaryCategoryForRelatedWord('')).toBeUndefined();
  });

  // Test 7: Overlapping matches
  it('should return the first match for overlapping words', () => {
    // This test assumes the implementation searches the CATEGORY_MAP in order
    // If "japanese" appears in both sushi and another category that comes first,
    // it should return the first one
    expect(getPrimaryCategoryForRelatedWord('japanese')).toBe('sushi');
  });
});
