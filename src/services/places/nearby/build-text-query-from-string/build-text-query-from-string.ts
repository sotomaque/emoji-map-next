import _ from 'lodash';
import { CATEGORY_MAP } from '@/constants/category-map';

/**
 * Gets the primary category name for a given category key
 * @param key The numeric key representing a category in CATEGORY_MAP
 * @returns The primary category name or undefined if the key doesn't exist
 */
function getCategoryByKey(key: number): string | undefined {
  const category = CATEGORY_MAP.find((cat) => cat.key === key);
  return category?.name;
}

/**
 * Gets the array of related words for a given category key
 * @param key The numeric key representing a category in CATEGORY_MAP
 * @returns An array of related words or undefined if the key doesn't exist
 */
function getRelatedWordsByKey(key: number): string[] | undefined {
  const category = CATEGORY_MAP.find((cat) => cat.key === key);
  return category?.keywords;
}

/**
 * Builds a query string from an array of category keys
 * @param keys Array of category keys to include in the query
 * @returns A pipe-delimited string of categories and related words
 *
 * If keys is empty, returns all categories and related words
 * If all provided keys are invalid, returns all categories and related words
 * Duplicate keys are automatically filtered out
 */
export const buildTextQueryFromKeys = (keys: number[]): string => {
  // Get all valid category keys
  const allValidKeys = CATEGORY_MAP.map((cat) => cat.key);

  // If keys array is empty, use all keys from CATEGORY_MAP
  const keysToUse = keys.length === 0 ? allValidKeys : _.uniq(keys); // Remove duplicates

  // Filter out invalid keys
  const validKeys = keysToUse.filter((key) => allValidKeys.includes(key));

  // If no valid keys were provided, use all keys
  const finalKeys = validKeys.length === 0 ? allValidKeys : validKeys;

  return _(finalKeys)
    .flatMap((key) =>
      _.compact([getCategoryByKey(key), ...(getRelatedWordsByKey(key) || [])])
    )
    .join('|');
};
