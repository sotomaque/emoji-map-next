import _ from 'lodash';
import { CATEGORY_MAP } from '@/constants/category-map';
import type {
  FilterReasons,
  GooglePlace,
  SimplifiedMapPlace,
} from '@/types/local-places-types';

// Create a mapping of category names to emojis from the new CATEGORY_MAP
const categoryEmojis: Record<string, string> = Object.fromEntries(
  CATEGORY_MAP.map((category) => [category.name, category.emoji])
);

// Internal helper functions
const findMatchingKeyword = (
  place: GooglePlace,
  keywords: string[]
): string | undefined => {
  const lowercaseKeywords = _.map(keywords, _.toLower);
  const placeFields = {
    primaryType: _.toLower(place.primaryType || ''),
    types: _.map(place.types || [], _.toLower),
    primaryTypeDisplayName: _.toLower(place.primaryTypeDisplayName?.text || ''),
    displayName: _.toLower(place.displayName?.text || ''),
    name: _.toLower(place.name || ''),
  };

  return (
    _.find(keywords, (keyword, index) => {
      const lowercaseKeyword = lowercaseKeywords[index];
      const isMatch =
        _.some(placeFields, (field) =>
          _.isArray(field)
            ? _.includes(field, lowercaseKeyword)
            : field === lowercaseKeyword
        ) ||
        _.includes(
          _.join(_.flatten(_.values(placeFields)), ' '),
          lowercaseKeyword
        );

      if (isMatch) {
        // console.log(`[API] Match found for keyword "${keyword}" in place "${place.name}"`, placeFields);
      }
      return isMatch;
    }) ||
    (console.log(`[API] No match found for place "${place.name}"`, placeFields),
    undefined)
  );
};

const getPrimaryCategoryForRelatedWord = (word: string): string | undefined => {
  const normalizedWord = word.toLowerCase().trim();

  // Find the category that contains the word in its keywords
  const matchingCategory = CATEGORY_MAP.find((category) => {
    // Check if the word is the primary category name
    if (category.name === normalizedWord) {
      return true;
    }

    // Check if the word is in the keywords array
    return category.keywords.includes(normalizedWord);
  });

  return matchingCategory?.name;
};

type ProcessIndividualPlaceProps = {
  place: GooglePlace;
  keywords: string[];
  filterReasons: FilterReasons;
};

export const processIndividualPlace = ({
  place,
  keywords,
  filterReasons,
}: ProcessIndividualPlaceProps): SimplifiedMapPlace => {
  // console.log(`[API] Processing place: ${place.name}`, _.pick(place, [
  //   'id', 'primaryType', 'types', 'primaryTypeDisplayName.text', 'displayName.text'
  // ]));

  // Validate required fields first
  if (
    !place.id ||
    !_.isObject(place.location) ||
    !_.isNumber(place.location?.latitude) ||
    !_.isNumber(place.location?.longitude)
  ) {
    // console.error('[API] Place is missing required fields:', place);
    return {} as SimplifiedMapPlace;
  }

  // Determine category with fallback
  const matchedKeyword = findMatchingKeyword(place, keywords);
  const initialCategory =
    matchedKeyword ||
    _.toLower(place.primaryTypeDisplayName?.text) ||
    _.toLower(place.primaryType) ||
    _.tap('place', () => {
      filterReasons.noKeywordMatch =
        _.defaultTo(filterReasons.noKeywordMatch, 0) + 1;
      filterReasons.defaultedToPlace =
        _.defaultTo(filterReasons.defaultedToPlace, 0) + 1;
      // console.log(`[API] No type information available, defaulting to: place`);
    });

  if (matchedKeyword) {
    // console.log(`[API] Matched keyword: ${initialCategory} for place: ${place.name}`);
  } else if (
    !matchedKeyword &&
    !_.toLower(place.primaryTypeDisplayName?.text) &&
    !_.toLower(place.primaryType)
  ) {
    // Already incremented in _.tap
  } else {
    filterReasons.noKeywordMatch =
      _.defaultTo(filterReasons.noKeywordMatch, 0) + 1;
  }

  // Map to main category only if matchedKeyword exists and has a mapping
  const mainCategory = matchedKeyword
    ? getPrimaryCategoryForRelatedWord(initialCategory)
    : undefined;
  const finalCategory =
    mainCategory && mainCategory !== initialCategory
      ? _.tap(mainCategory, () => {
          // console.log(`[API] Mapping category "${initialCategory}" to main category "${mainCategory}"`);
          filterReasons.mappedToMainCategory =
            _.defaultTo(filterReasons.mappedToMainCategory, 0) + 1;
        })
      : initialCategory;

  // Determine emoji with optimized fallback
  // First try to get emoji for the original matched keyword if it exists
  let emoji = matchedKeyword ? categoryEmojis[matchedKeyword] : null;

  // If no emoji found for the matched keyword, try the final category
  if (!emoji) {
    emoji = categoryEmojis[finalCategory];
  }

  // console.log({finalCategory, matchedKeyword, emoji})

  if (!emoji) {
    // console.log(`[API] No emoji found for category: ${finalCategory}`);
    const similarKey = _.find(
      _.keys(categoryEmojis),
      (key) =>
        key !== finalCategory &&
        (_.includes(key, finalCategory) || _.includes(finalCategory, key))
    );
    emoji = similarKey ? categoryEmojis[similarKey] : '🍽️'; // Default to place emoji

    if (similarKey) {
      // console.log(`[API] Found similar emoji for ${finalCategory} using ${similarKey}: ${emoji}`);
    } else {
      filterReasons.noEmoji = _.defaultTo(filterReasons.noEmoji, 0) + 1;
      // console.log(`[API] No emoji found for category: ${finalCategory}, using default place emoji`);
    }
  }

  return {
    id: place.id,
    location: _.pick(place.location, ['latitude', 'longitude']),
    category: finalCategory,
    emoji,
  };
};
