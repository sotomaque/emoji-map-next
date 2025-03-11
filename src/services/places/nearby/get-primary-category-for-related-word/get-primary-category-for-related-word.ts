import _ from 'lodash';
import { CATEGORY_MAP } from '@/constants/category-map';

export const getPrimaryCategoryForRelatedWord = (
  word: string
): string | undefined => {
  const normalizedWord = _.toLower(_.trim(word));

  // Find the category that matches the word
  const category = CATEGORY_MAP.find((category) => {
    // Check if the primary category name matches
    if (category.name === normalizedWord) return true;

    // Check if any of the keywords match
    return _.some(
      category.keywords,
      (keyword) =>
        _.includes(keyword, normalizedWord) ||
        _.includes(normalizedWord, keyword)
    );
  });

  return category?.name;
};
