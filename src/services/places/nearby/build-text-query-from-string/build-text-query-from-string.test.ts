import { describe, it, expect, vi } from 'vitest';
import { CATEGORY_MAP } from '@/constants/category-map';
import { buildTextQueryFromKeys } from './build-text-query-from-string';

// Mock CATEGORY_MAP with the new structure
vi.mock('@/constants/category-map', () => ({
  CATEGORY_MAP: [
    {
      key: 1,
      name: 'pizza',
      emoji: '🍕',
      keywords: ['italian', 'pepperoni', 'cheese', 'pasta', 'calzone'],
    },
    {
      key: 2,
      name: 'beer',
      emoji: '🍺',
      keywords: ['brewery', 'pub', 'ale', 'lager', 'bar'],
    },
    {
      key: 3,
      name: 'sushi',
      emoji: '🍣',
      keywords: ['japanese', 'sashimi', 'roll', 'tempura', 'miso'],
    },
  ],
}));

describe('buildTextQueryFromKeys', () => {
  // Single key
  it('should build a query string from a single key', () => {
    const result = buildTextQueryFromKeys([1]);

    // For key 1, we expect 'pizza|italian|pepperoni|cheese|pasta|calzone'
    expect(result).toBe('pizza|italian|pepperoni|cheese|pasta|calzone');

    // Verify against the actual data in CATEGORY_MAP
    const category = CATEGORY_MAP.find((cat) => cat.key === 1);
    const expectedQuery = [category?.name, ...(category?.keywords || [])].join(
      '|'
    );
    expect(result).toBe(expectedQuery);
  });

  // Multiple keys
  it('should build a query string from multiple keys', () => {
    const result = buildTextQueryFromKeys([1, 2]);

    // For keys 1 and 2, we expect the combined query string
    const category1 = CATEGORY_MAP.find((cat) => cat.key === 1);
    const category2 = CATEGORY_MAP.find((cat) => cat.key === 2);
    const expectedQuery = [
      ...[category1?.name, ...(category1?.keywords || [])],
      ...[category2?.name, ...(category2?.keywords || [])],
    ].join('|');

    expect(result).toBe(expectedQuery);
    expect(result).toBe(
      'pizza|italian|pepperoni|cheese|pasta|calzone|beer|brewery|pub|ale|lager|bar'
    );
  });

  // Empty array - should return all categories
  it('should return all categories and related words for an empty array of keys', () => {
    const result = buildTextQueryFromKeys([]);

    // Build expected query from all categories and related words
    const allTerms = CATEGORY_MAP.flatMap((category) => [
      category.name,
      ...category.keywords,
    ]);
    const expectedQuery = allTerms.join('|');

    expect(result).toBe(expectedQuery);

    // Verify it contains all categories
    CATEGORY_MAP.forEach((category) => {
      expect(result).toContain(category.name);
    });

    // Verify it contains all related words
    CATEGORY_MAP.forEach((category) => {
      category.keywords.forEach((word) => {
        expect(result).toContain(word);
      });
    });
  });

  // Invalid key
  it('should handle invalid keys gracefully', () => {
    // Key 999 doesn't exist in the CATEGORY_MAP
    const result = buildTextQueryFromKeys([999]);

    // When all keys are invalid, it should return all categories
    const allTerms = CATEGORY_MAP.flatMap((category) => [
      category.name,
      ...category.keywords,
    ]);
    const expectedQuery = allTerms.join('|');

    expect(result).toBe(expectedQuery);
  });

  // Mix of valid and invalid keys
  it('should handle a mix of valid and invalid keys', () => {
    const result = buildTextQueryFromKeys([1, 999, 2]);

    // Should include only the valid keys (1 and 2)
    const category1 = CATEGORY_MAP.find((cat) => cat.key === 1);
    const category2 = CATEGORY_MAP.find((cat) => cat.key === 2);
    const expectedQuery = [
      ...[category1?.name, ...(category1?.keywords || [])],
      ...[category2?.name, ...(category2?.keywords || [])],
    ].join('|');

    expect(result).toBe(expectedQuery);
    expect(result).toBe(
      'pizza|italian|pepperoni|cheese|pasta|calzone|beer|brewery|pub|ale|lager|bar'
    );
  });

  // Duplicate keys - should be filtered out
  it('should filter out duplicate keys', () => {
    const result = buildTextQueryFromKeys([1, 1]);

    // For duplicate key 1, we expect the terms to appear only once
    const category1 = CATEGORY_MAP.find((cat) => cat.key === 1);
    const expectedQuery = [
      category1?.name,
      ...(category1?.keywords || []),
    ].join('|');

    expect(result).toBe(expectedQuery);
    expect(result).toBe('pizza|italian|pepperoni|cheese|pasta|calzone');
  });

  // All keys in CATEGORY_MAP
  it('should build a query string from all keys in CATEGORY_MAP', () => {
    const allKeys = CATEGORY_MAP.map((cat) => cat.key);
    const result = buildTextQueryFromKeys(allKeys);

    // Build expected query from all categories and related words
    const allTerms = CATEGORY_MAP.flatMap((category) => [
      category.name,
      ...category.keywords,
    ]);
    const expectedQuery = allTerms.join('|');

    expect(result).toBe(expectedQuery);

    // Verify it contains all categories
    CATEGORY_MAP.forEach((category) => {
      expect(result).toContain(category.name);
    });

    // Verify it contains all related words
    CATEGORY_MAP.forEach((category) => {
      category.keywords.forEach((word) => {
        expect(result).toContain(word);
      });
    });
  });

  // Mix of valid, invalid, and duplicate keys
  it('should handle a mix of valid, invalid, and duplicate keys', () => {
    const result = buildTextQueryFromKeys([1, 999, 2, 1, 888]);

    // Should include only the unique valid keys (1 and 2)
    const category1 = CATEGORY_MAP.find((cat) => cat.key === 1);
    const category2 = CATEGORY_MAP.find((cat) => cat.key === 2);
    const expectedQuery = [
      ...[category1?.name, ...(category1?.keywords || [])],
      ...[category2?.name, ...(category2?.keywords || [])],
    ].join('|');

    expect(result).toBe(expectedQuery);
    expect(result).toBe(
      'pizza|italian|pepperoni|cheese|pasta|calzone|beer|brewery|pub|ale|lager|bar'
    );
  });

  // Edge case: Negative keys
  it('should handle negative keys gracefully', () => {
    const result = buildTextQueryFromKeys([-1, -2]);

    // When all keys are invalid, it should return all categories
    const allTerms = CATEGORY_MAP.flatMap((category) => [
      category.name,
      ...category.keywords,
    ]);
    const expectedQuery = allTerms.join('|');

    expect(result).toBe(expectedQuery);
  });

  // Edge case: Non-integer keys
  it('should handle non-integer keys gracefully', () => {
    const result = buildTextQueryFromKeys([1.5, 2.7] as number[]);

    // When all keys are invalid, it should return all categories
    const allTerms = CATEGORY_MAP.flatMap((category) => [
      category.name,
      ...category.keywords,
    ]);
    const expectedQuery = allTerms.join('|');

    expect(result).toBe(expectedQuery);
  });

  // Edge case: Empty array with all invalid keys
  it('should return all categories when all keys are invalid', () => {
    const result = buildTextQueryFromKeys([999, 888, 777]);

    // When all keys are invalid, it should return all categories
    const allTerms = CATEGORY_MAP.flatMap((category) => [
      category.name,
      ...category.keywords,
    ]);
    const expectedQuery = allTerms.join('|');

    expect(result).toBe(expectedQuery);
  });

  // Edge case: Comparison with empty array
  it('should return the same result for empty array and all valid keys', () => {
    const emptyResult = buildTextQueryFromKeys([]);
    const allKeysResult = buildTextQueryFromKeys(
      CATEGORY_MAP.map((cat) => cat.key)
    );
    expect(emptyResult).toBe(allKeysResult);
  });

  // Edge case: Comparison with all invalid keys
  it('should return the same result for all invalid keys and empty array', () => {
    const invalidKeysResult = buildTextQueryFromKeys([999, 888, 777]);
    const emptyResult = buildTextQueryFromKeys([]);
    expect(invalidKeysResult).toBe(emptyResult);
  });
});
