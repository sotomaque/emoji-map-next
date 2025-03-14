import {
  defaultTo,
  find,
  flatten,
  includes,
  isArray,
  isNumber,
  isObject,
  join,
  keys as keysOf,
  map,
  pick,
  some,
  tap,
  toLower,
  values,
} from 'lodash-es';
import { CATEGORY_MAP } from '@/constants/category-map';
import type { GooglePlace } from '@/types/google-places';
import type { Place, FilterReasons } from '@/types/places';

// Create a mapping of category names to emojis from the new CATEGORY_MAP
const categoryEmojis: Record<string, string> = Object.fromEntries(
  CATEGORY_MAP.map((category) => [category.name, category.emoji])
);

// Create a mapping of category keys to emojis for direct lookup
const keyToEmojiMap: Record<number, string> = Object.fromEntries(
  CATEGORY_MAP.map((category) => [category.key, category.emoji])
);

// Create a mapping of category keys to category names
const keyToCategoryMap: Record<number, string> = Object.fromEntries(
  CATEGORY_MAP.map((category) => [category.key, category.name])
);

// Internal helper functions
const findMatchingKeyword = (
  place: GooglePlace,
  keywords: string[]
): string | undefined => {
  const lowercaseKeywords = map(keywords, toLower);
  const placeFields = {
    primaryType: toLower(place.primaryType || ''),
    types: map(place.types || [], toLower),
    primaryTypeDisplayName: toLower(place.primaryTypeDisplayName?.text || ''),
    displayName: toLower(place.displayName?.text || ''),
    name: toLower(place.name || ''),
  };

  return find(keywords, (keyword, index) => {
    const lowercaseKeyword = lowercaseKeywords[index];
    const isMatch =
      some(placeFields, (field) =>
        isArray(field)
          ? includes(field, lowercaseKeyword)
          : field === lowercaseKeyword
      ) || includes(join(flatten(values(placeFields)), ' '), lowercaseKeyword);

    return isMatch;
  });
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
  keys?: number[];
};

/**
 * Processes an individual place from the Google Places API response.
 *
 * This function:
 * 1. Validates that the place has required fields
 * 2. Determines the appropriate category based on keywords and place types
 * 3. Maps related keywords to main categories when possible
 * 4. Assigns an emoji based on the determined category
 *
 * @param props - Processing parameters
 * @param props.place - The Google Place object to process
 * @param props.keywords - Array of search keywords to match against
 * @param props.filterReasons - Object to track filtering statistics
 * @param props.keys - Array of category keys
 *
 * @returns A simplified {@link Place} object containing:
 *   - id: Unique identifier for the place
 *   - location: Latitude and longitude coordinates
 *   - emoji: Emoji marker representing the place type
 *
 * @remarks
 * Returns an empty object if the place is missing required fields.
 * The function tracks various filtering statistics for debugging purposes.
 */
export const processIndividualPlace = ({
  place,
  keywords,
  filterReasons,
  keys = [],
}: ProcessIndividualPlaceProps): Place => {
  // Validate required fields first
  if (
    !place.id ||
    !isObject(place.location) ||
    !isNumber(place.location?.latitude) ||
    !isNumber(place.location?.longitude)
  ) {
    return {} as Place;
  }

  // Optimization: If only one key is provided, directly use its emoji
  if (keys.length === 1) {
    const categoryKey = keys[0];
    const emoji = keyToEmojiMap[categoryKey];

    if (emoji) {
      return {
        id: place.id,
        location: pick(place.location, ['latitude', 'longitude']),
        emoji,
      };
    }
  }

  // Determine category with fallback
  const matchedKeyword = findMatchingKeyword(place, keywords);
  const initialCategory =
    matchedKeyword ||
    toLower(place.primaryTypeDisplayName?.text) ||
    toLower(place.primaryType) ||
    tap('place', () => {
      filterReasons.noKeywordMatch =
        defaultTo(filterReasons.noKeywordMatch, 0) + 1;
      filterReasons.defaultedToPlace =
        defaultTo(filterReasons.defaultedToPlace, 0) + 1;
    });

  if (matchedKeyword) {
    // noop
  } else if (
    !matchedKeyword &&
    !toLower(place.primaryTypeDisplayName?.text) &&
    !toLower(place.primaryType)
  ) {
    // Already incremented in tap
  } else {
    filterReasons.noKeywordMatch =
      defaultTo(filterReasons.noKeywordMatch, 0) + 1;
  }

  // Map to main category only if matchedKeyword exists and has a mapping
  const mainCategory = matchedKeyword
    ? getPrimaryCategoryForRelatedWord(initialCategory)
    : undefined;
  const finalCategory =
    mainCategory && mainCategory !== initialCategory
      ? tap(mainCategory, () => {
          filterReasons.mappedToMainCategory =
            defaultTo(filterReasons.mappedToMainCategory, 0) + 1;
        })
      : initialCategory;

  // If multiple keys are provided, restrict emoji selection to those keys
  if (keys.length > 1) {
    // Create a set of allowed category names based on the provided keys
    const allowedCategories = new Set(
      keys.map((key) => keyToCategoryMap[key]).filter(Boolean)
    );

    // Try to find a direct match in the allowed categories
    if (allowedCategories.has(finalCategory)) {
      const emoji = categoryEmojis[finalCategory];

      return {
        id: place.id,
        location: pick(place.location, ['latitude', 'longitude']),
        emoji,
      };
    }

    // Try to find a related match in the allowed categories
    for (const category of Array.from(allowedCategories)) {
      const categoryObj = CATEGORY_MAP.find((cat) => cat.name === category);
      if (categoryObj && categoryObj.keywords.includes(finalCategory)) {
        const emoji = categoryEmojis[category];

        return {
          id: place.id,
          location: pick(place.location, ['latitude', 'longitude']),
          emoji,
        };
      }
    }

    // If no match found in allowed categories, use the first key's emoji as fallback
    const fallbackEmoji = keyToEmojiMap[keys[0]];

    return {
      id: place.id,
      location: pick(place.location, ['latitude', 'longitude']),
      emoji: fallbackEmoji,
    };
  }

  // Original logic for when no keys are provided or the optimization didn't apply
  // Determine emoji with optimized fallback
  // First try to get emoji for the original matched keyword if it exists
  let emoji = matchedKeyword ? categoryEmojis[matchedKeyword] : null;

  // If no emoji found for the matched keyword, try the final category
  if (!emoji) {
    emoji = categoryEmojis[finalCategory];
  }

  if (!emoji) {
    const similarKey = find(
      keysOf(categoryEmojis),
      (key) =>
        key !== finalCategory &&
        (includes(key, finalCategory) || includes(finalCategory, key))
    );
    emoji = similarKey ? categoryEmojis[similarKey] : '🍽️'; // Default to place emoji

    if (similarKey) {
      // noop
    } else {
      filterReasons.noEmoji = defaultTo(filterReasons.noEmoji, 0) + 1;
    }
  }

  return {
    id: place.id,
    location: pick(place.location, ['latitude', 'longitude']),
    emoji,
  };
};
