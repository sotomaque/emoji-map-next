import { compact, uniq } from 'lodash-es';
import { CATEGORY_MAP } from '@/constants/category-map';

/**
 * Gets the primary category name for a given category key.
 *
 * @param key - The numeric key representing a category in CATEGORY_MAP
 * @returns The primary category name or undefined if the key doesn't exist
 *
 * @example
 * // If CATEGORY_MAP contains { key: 1, name: 'pizza', ... }
 * getCategoryByKey(1); // Returns 'pizza'
 * getCategoryByKey(999); // Returns undefined
 */
function getCategoryByKey(key: number): string | undefined {
  const category = CATEGORY_MAP.find((cat) => cat.key === key);
  return category?.name;
}

/**
 * Gets the array of related keywords for a given category key.
 *
 * @param key - The numeric key representing a category in CATEGORY_MAP
 * @returns An array of related keywords or undefined if the key doesn't exist
 *
 * @example
 * // If CATEGORY_MAP contains { key: 1, name: 'pizza', keywords: ['italian', 'cheese'] }
 * getRelatedWordsByKey(1); // Returns ['italian', 'cheese']
 * getRelatedWordsByKey(999); // Returns undefined
 */
function getRelatedWordsByKey(key: number): string[] | undefined {
  const category = CATEGORY_MAP.find((cat) => cat.key === key);
  return category?.keywords;
}

/**
 * Builds a pipe-delimited query string from an array of category keys.
 *
 * This function takes an array of category keys and creates a search query string
 * by combining the category names and their related keywords. The resulting string
 * is formatted as a pipe-delimited list, which is suitable for use with the Google
 * Places API text search.
 *
 * @param keys - Array of category keys to include in the query
 * @returns A pipe-delimited string of categories and related keywords
 *
 * @remarks
 * - If the keys array is empty, all categories from CATEGORY_MAP will be used
 * - If all provided keys are invalid, all categories from CATEGORY_MAP will be used
 * - Duplicate keys are automatically filtered out
 * - The returned string format is: "category1|keyword1|keyword2|category2|keyword3"
 *
 * @example
 * // If CATEGORY_MAP contains:
 * // [
 * //   { key: 1, name: 'pizza', keywords: ['italian'] },
 * //   { key: 2, name: 'beer', keywords: ['pub', 'brewery'] }
 * // ]
 *
 * // Using specific keys
 * buildTextQueryFromKeys([1, 2]); // Returns "pizza|italian|beer|pub|brewery"
 *
 * // Using empty array (returns all categories)
 * buildTextQueryFromKeys([]); // Returns "pizza|italian|beer|pub|brewery"
 *
 * // Using invalid keys (returns all categories)
 * buildTextQueryFromKeys([999]); // Returns "pizza|italian|beer|pub|brewery"
 *
 * // Using duplicate keys (duplicates are removed)
 * buildTextQueryFromKeys([1, 1, 2]); // Returns "pizza|italian|beer|pub|brewery"
 */
export const buildTextQueryFromKeys = (keys: number[]): string => {
  // Get all valid category keys
  const allValidKeys = CATEGORY_MAP.map((cat) => cat.key);

  // If keys array is empty, use all keys from CATEGORY_MAP
  const keysToUse = keys.length === 0 ? allValidKeys : uniq(keys); // Remove duplicates

  // Filter out invalid keys
  const validKeys = keysToUse.filter((key) => allValidKeys.includes(key));

  // If no valid keys were provided, use all keys
  const finalKeys = validKeys.length === 0 ? allValidKeys : validKeys;

  return finalKeys
    .flatMap((key) =>
      compact([getCategoryByKey(key), ...(getRelatedWordsByKey(key) || [])])
    )
    .join('|');
};
