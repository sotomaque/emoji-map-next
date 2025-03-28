import { describe, expect, test } from 'vitest';
import { CATEGORY_MAP } from '@/constants/category-map';
import { getEmojiForTypes } from './get-emoji-for-types';

describe('getEmojiForTypes', () => {
  test('returns correct emoji for pizza restaurant type', () => {
    const types = ['pizza_restaurant'];
    expect(getEmojiForTypes(types)).toBe('🍕');
  });

  test('returns correct emoji for coffee shop type', () => {
    const types = ['coffee_shop'];
    expect(getEmojiForTypes(types)).toBe('☕');
  });

  test('returns correct emoji when multiple types are provided', () => {
    const types = ['restaurant', 'pizza_restaurant', 'food'];
    expect(getEmojiForTypes(types)).toBe('🍕');
  });

  test('returns default emoji when no matching type is found', () => {
    const types = ['unknown_type'];
    expect(getEmojiForTypes(types)).toBe('😶‍🌫️');
  });

  test('returns default emoji for empty types array', () => {
    const types: string[] = [];
    expect(getEmojiForTypes(types)).toBe('😶‍🌫️');
  });

  test('matches first found category when multiple matches are possible', () => {
    // Using types that could match multiple categories
    const types = ['italian_restaurant', 'pizza_restaurant'];
    // Should match pizza (🍕) since it's checked first in the CATEGORY_MAP
    expect(getEmojiForTypes(types)).toBe('🍕');
  });

  test('handles all primary types from CATEGORY_MAP', () => {
    // Test that each primary type from the category map returns its corresponding emoji
    CATEGORY_MAP.forEach((category) => {
      const { primaryType, emoji } = category;
      expect(getEmojiForTypes([primaryType[0]])).toBe(emoji);
    });
  });
});
