import {
  defaultTo,
  find,
  flatten,
  includes,
  isArray,
  isNumber,
  isObject,
  join,
  keys,
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
import { log } from '@/utils/log';

// Create a mapping of category names to emojis from the new CATEGORY_MAP
const categoryEmojis: Record<string, string> = Object.fromEntries(
  CATEGORY_MAP.map((category) => [category.name, category.emoji])
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

  return (
    find(keywords, (keyword, index) => {
      const lowercaseKeyword = lowercaseKeywords[index];
      const isMatch =
        some(placeFields, (field) =>
          isArray(field)
            ? includes(field, lowercaseKeyword)
            : field === lowercaseKeyword
        ) ||
        includes(join(flatten(values(placeFields)), ' '), lowercaseKeyword);

      if (isMatch) {
        log.info(
          `[API] Match found for keyword "${keyword}" in place "${place.name}"`,
          placeFields
        );
      }
      return isMatch;
    }) ||
    (log.debug(`[API] No match found for place "${place.name}"`, placeFields),
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
}: ProcessIndividualPlaceProps): Place => {
  log.info(
    `[API] Processing place: ${place.name}`,
    pick(place, [
      'id',
      'primaryType',
      'types',
      'primaryTypeDisplayName.text',
      'displayName.text',
    ])
  );

  // Validate required fields first
  if (
    !place.id ||
    !isObject(place.location) ||
    !isNumber(place.location?.latitude) ||
    !isNumber(place.location?.longitude)
  ) {
    log.error('[API] Place is missing required fields:', place);
    return {} as Place;
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
      log.debug(`[API] No type information available, defaulting to: place`);
    });

  if (matchedKeyword) {
    log.info(
      `[API] Matched keyword: ${initialCategory} for place: ${place.name}`
    );
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
          log.info(
            `[API] Mapping category "${initialCategory}" to main category "${mainCategory}"`
          );
          filterReasons.mappedToMainCategory =
            defaultTo(filterReasons.mappedToMainCategory, 0) + 1;
        })
      : initialCategory;

  // Determine emoji with optimized fallback
  // First try to get emoji for the original matched keyword if it exists
  let emoji = matchedKeyword ? categoryEmojis[matchedKeyword] : null;

  // If no emoji found for the matched keyword, try the final category
  if (!emoji) {
    emoji = categoryEmojis[finalCategory];
  }

  if (!emoji) {
    log.debug(`[API] No emoji found for category: ${finalCategory}`);
    const similarKey = find(
      keys(categoryEmojis),
      (key) =>
        key !== finalCategory &&
        (includes(key, finalCategory) || includes(finalCategory, key))
    );
    emoji = similarKey ? categoryEmojis[similarKey] : '🍽️'; // Default to place emoji

    if (similarKey) {
      log.info(
        `[API] Found similar emoji for ${finalCategory} using ${similarKey}: ${emoji}`
      );
    } else {
      filterReasons.noEmoji = defaultTo(filterReasons.noEmoji, 0) + 1;
      log.debug(
        `[API] No emoji found for category: ${finalCategory}, using default place emoji`
      );
    }
  }

  return {
    id: place.id,
    location: pick(place.location, ['latitude', 'longitude']),
    emoji,
  };
};
