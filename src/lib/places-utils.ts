import { categoryEmojis } from '@/services/places';
import type { GooglePlace, NearbyPlace } from '@/types/places';
import _ from 'lodash';

/**
 * Checks if a place matches any of the provided keywords
 * @param place - GooglePlace object to check
 * @param keywords - Array of keywords to match against
 * @param lowercaseKeywords - Lowercase version of keywords for case-insensitive matching
 * @returns The matched keyword or undefined if no match
 */
export function findMatchingKeyword(
  place: GooglePlace,
  keywords: string[],
  lowercaseKeywords: string[]
): string | undefined {
  return _.find(keywords, (keyword: string, index: number) => {
    const lowercaseKeyword = lowercaseKeywords[index];

    return (
      // Check in primaryType
      _.includes(_.toLower(place.primaryType || ''), lowercaseKeyword) ||
      // Check in types array
      _.some(place.types || [], (type: string) =>
        _.includes(_.toLower(type), lowercaseKeyword)
      ) ||
      // Check in primaryTypeDisplayName
      _.includes(
        _.toLower(place.primaryTypeDisplayName?.text || ''),
        lowercaseKeyword
      ) ||
      // Check in displayName
      _.includes(_.toLower(place.displayName?.text || ''), lowercaseKeyword) ||
      // Check in name
      _.includes(_.toLower(place.name || ''), lowercaseKeyword) ||
      // Check in formattedAddress
      _.includes(_.toLower(place.formattedAddress || ''), lowercaseKeyword)
    );
  });
}

/**
 * Creates a simplified place object with only the fields we care about
 * @param place - GooglePlace object from the API
 * @param category - Category assigned to the place
 * @param emoji - Emoji assigned to the place
 * @returns Simplified NearbyPlace object
 */
export function createSimplifiedPlace(
  place: GooglePlace,
  category: string,
  emoji: string
): NearbyPlace {
  // Handle price level - if PRICE_LEVEL_UNSPECIFIED, return null instead of 0
  const priceLevel =
    place.priceLevel && place.priceLevel !== 'PRICE_LEVEL_UNSPECIFIED'
      ? place.priceLevel
      : null;

  return {
    id: place.id,
    name: place.name,
    nationalPhoneNumber: place.nationalPhoneNumber,
    formattedAddress: place.formattedAddress,
    location: place.location,
    rating: place.rating,
    googleMapsUri: place.googleMapsUri,
    websiteUri: place.websiteUri,
    displayName: place.displayName,
    primaryTypeDisplayName: place.primaryTypeDisplayName,
    takeout: place.takeout,
    delivery: place.delivery,
    dineIn: place.dineIn,
    servesBeer: place.servesBeer,
    servesWine: place.servesWine,
    userRatingCount: place.userRatingCount,
    iconMaskBaseUri: place.iconMaskBaseUri,
    iconBackgroundColor: place.iconBackgroundColor,
    businessStatus: place.businessStatus,
    primaryType: place.primaryType,
    reviews: place.reviews,
    photos: place.photos,
    outdoorSeating: place.outdoorSeating,
    liveMusic: place.liveMusic,
    menuForChildren: place.menuForChildren,
    servesCocktails: place.servesCocktails,
    servesDessert: place.servesDessert,
    servesCoffee: place.servesCoffee,
    allowsDogs: place.allowsDogs,
    restroom: place.restroom,
    goodForWatchingSports: place.goodForWatchingSports,
    acceptsCreditCards: place.paymentOptions?.acceptsCreditCards,
    acceptsCashOnly: place.paymentOptions?.acceptsCashOnly,
    valetParking: place.parkingOptions?.valetParking,
    wheelchairAccessibleEntrance:
      place.accessibilityOptions?.wheelchairAccessibleEntrance,
    wheelchairAccessibleSeating:
      place.accessibilityOptions?.wheelchairAccessibleSeating,
    priceRange: place.priceRange,
    priceLevel,
    // Use currentOpeningHours instead of regularOpeningHours for openNow
    openNow: place.currentOpeningHours?.openNow,
    openingPeriods: place.currentOpeningHours?.periods,
    category,
    emoji,
  };
}

/**
 * Processes Google Places API results to add categories, emojis, and filter fields
 * @param places - Array of GooglePlace objects from the API
 * @param keywords - Keywords to check for categorization
 * @returns Array of processed Place objects that match at least one of the keywords
 */
export function processPlaces(
  places: GooglePlace[],
  keywords: string[]
): NearbyPlace[] {
  // Convert keywords to lowercase for case-insensitive matching
  const lowercaseKeywords = keywords.map((keyword) => keyword.toLowerCase());

  return _(places)
    .map((place: GooglePlace) => {
      // Find the first keyword that matches any of the place's properties
      const matchedKeyword = findMatchingKeyword(
        place,
        keywords,
        lowercaseKeywords
      );

      // If no keyword match was found, return a place with undefined id which will be filtered out
      if (!matchedKeyword) {
        return { id: undefined } as unknown as NearbyPlace;
      }

      // Get the emoji for the category from our mapping
      const emoji = categoryEmojis[matchedKeyword];

      if (!emoji) {
        console.error(
          `[places] No emoji found for category: ${matchedKeyword}`
        );
        // Return a place with undefined id which will be filtered out
        return { id: undefined } as unknown as NearbyPlace;
      }

      // Create a simplified place object with only the fields we care about
      return createSimplifiedPlace(place, matchedKeyword, emoji);
    })
    .filter((place: Partial<NearbyPlace>) => place.id !== undefined)
    .value();
}
