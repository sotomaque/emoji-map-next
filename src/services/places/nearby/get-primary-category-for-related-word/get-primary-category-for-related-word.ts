import { includes, some, toLower, trim } from 'lodash-es';
import { CATEGORY_MAP } from '@/constants/category-map';

export const getPrimaryCategoryForRelatedWord = (
  word: string
): string | undefined => {
  const normalizedWord = toLower(trim(word));

  // Return undefined for empty strings
  if (!normalizedWord) {
    return undefined;
  }

  // Find the category that matches the word
  const category = CATEGORY_MAP.find((category) => {
    // Check if the primary category name matches
    if (category.name === normalizedWord) return true;

    // Check if any of the keywords match
    return some(
      category.keywords,
      (keyword) =>
        includes(keyword, normalizedWord) || includes(normalizedWord, keyword)
    );
  });

  return category?.name;
};
