import { describe, expect, test } from 'vitest';
import { CATEGORY_MAP } from '@/constants/category-map';
import { getEmojiForTypes } from './get-emoji-for-types';

describe('getEmojiForTypes', () => {
  test('returns correct emoji for pizza restaurant type', () => {
    const types = ['pizza_restaurant'];
    expect(getEmojiForTypes('', types)).toBe('🍕');
  });

  test('returns correct emoji for coffee shop type', () => {
    const types = ['coffee_shop'];
    expect(getEmojiForTypes('', types)).toBe('☕');
  });

  test('returns correct emoji when multiple types are provided', () => {
    const types = ['restaurant', 'pizza_restaurant', 'food'];
    expect(getEmojiForTypes('', types)).toBe('🍕');
  });

  test('returns default emoji when no matching type is found', () => {
    const types = ['unknown_type'];
    expect(getEmojiForTypes('', types)).toBe('😶‍🌫️');
  });

  test('returns default emoji for empty types array', () => {
    const types: string[] = [];
    expect(getEmojiForTypes('', types)).toBe('😶‍🌫️');
  });

  test('matches first found category when multiple matches are possible', () => {
    const types = ['italian_restaurant', 'pizza_restaurant'];
    expect(getEmojiForTypes('', types)).toBe('🍕');
  });

  test('handles all primary types from CATEGORY_MAP', () => {
    CATEGORY_MAP.forEach((category) => {
      const { primaryType, emoji } = category;
      expect(getEmojiForTypes('', [primaryType[0]])).toBe(emoji);
    });
  });

  describe('name overrides', () => {
    test('returns override emoji for exact name match', () => {
      expect(getEmojiForTypes('Pizza Hut', ['restaurant'])).toBe('🍕');
      expect(getEmojiForTypes('Jamba Juice', ['juice_shop'])).toBe('🧃');
      expect(getEmojiForTypes('Smoothie King', ['juice_shop'])).toBe('🥤');
    });

    test('returns override emoji regardless of case', () => {
      expect(getEmojiForTypes('pizza hut', ['restaurant'])).toBe('🍕');
      expect(getEmojiForTypes('PIZZA HUT', ['restaurant'])).toBe('🍕');
      expect(getEmojiForTypes('PiZzA hUt', ['restaurant'])).toBe('🍕');
    });

    test('falls back to type matching when no name override exists', () => {
      expect(
        getEmojiForTypes('Generic Pizza Place', ['pizza_restaurant'])
      ).toBe('🍕');
      expect(getEmojiForTypes('Local Coffee Shop', ['coffee_shop'])).toBe('☕');
    });

    test('name override takes precedence over type matching', () => {
      expect(getEmojiForTypes('Jamba Juice', ['coffee_shop'])).toBe('🧃');
      expect(getEmojiForTypes("McDonald's", ['restaurant'])).toBe('🍔');
    });

    test('handles special characters in name overrides', () => {
      expect(getEmojiForTypes("Dave's Hot Chicken", ['restaurant'])).toBe('🍗');
      expect(getEmojiForTypes("Carl's Jr", ['restaurant'])).toBe('🍔');
    });
  });
});
