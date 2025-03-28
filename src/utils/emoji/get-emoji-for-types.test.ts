import { describe, expect, test, vi } from 'vitest';
import { getEmojiForTypes } from './get-emoji-for-types';

interface CategoryMapItem {
  key: number;
  emoji: string;
  name: string;
  primaryType: string[];
}

// Mock the category map
vi.mock('@/constants/category-map', () => ({
  CATEGORY_MAP: [
    {
      key: 1,
      emoji: '🍕',
      name: 'pizza',
      primaryType: ['pizza_restaurant', 'italian_restaurant'],
    },
    {
      key: 4,
      emoji: '☕',
      name: 'coffee',
      primaryType: ['coffee_shop', 'cafe'],
    },
    {
      key: 25,
      emoji: '🍽️',
      name: 'place',
      primaryType: ['restaurant', 'food_court', 'buffet_restaurant'],
    },
  ],
  EMOJI_OVERRIDES: {
    'pizza hut': '🍕',
    'jamba juice': '🧃',
    'smoothie king': '🥤',
    "mcdonald's": '🍔',
    "dave's hot chicken": '🍗',
    "carl's jr": '🍔',
  },
}));

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
    expect(getEmojiForTypes('', types)).toBe('🍽️');
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

  test('handles all primary types from CATEGORY_MAP', async () => {
    const { CATEGORY_MAP } = await import('@/constants/category-map');
    CATEGORY_MAP.forEach((category: CategoryMapItem) => {
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
