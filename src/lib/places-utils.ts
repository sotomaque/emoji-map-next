import filter from 'lodash/filter';
import find from 'lodash/find';
import includes from 'lodash/includes';
import map from 'lodash/map';
import some from 'lodash/some';
import toLower from 'lodash/toLower';
import { categoryEmojis } from '@/services/places';
import type { GooglePlace, NearbyPlace } from '@/types/places';

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
  // Log place fields for debugging
  const placeFields = {
    primaryType: place.primaryType || '',
    types: place.types || [],
    primaryTypeDisplayName: place.primaryTypeDisplayName?.text || '',
    displayName: place.displayName?.text || '',
    name: place.name || '',
  };
  
  // First try exact matches
  const exactMatch = find(keywords, (keyword: string, index: number) => {
    const lowercaseKeyword = lowercaseKeywords[index];

    // Check each field individually and log matches
    const matchesPrimaryType = includes(toLower(place.primaryType || ''), lowercaseKeyword);
    const matchesTypes = some(place.types || [], (type: string) =>
      includes(toLower(type), lowercaseKeyword)
    );
    const matchesPrimaryTypeDisplayName = includes(
      toLower(place.primaryTypeDisplayName?.text || ''),
      lowercaseKeyword
    );
    const matchesDisplayName = includes(toLower(place.displayName?.text || ''), lowercaseKeyword);
    const matchesName = includes(toLower(place.name || ''), lowercaseKeyword);
    const matchesAddress = includes(toLower(place.formattedAddress || ''), lowercaseKeyword);
    
    const isMatch = matchesPrimaryType || matchesTypes || matchesPrimaryTypeDisplayName || 
                    matchesDisplayName || matchesName || matchesAddress;
    
    if (isMatch) {
      console.log(`[API] Exact match found for keyword "${keyword}" in place "${place.name}":`, {
        matchesPrimaryType,
        matchesTypes,
        matchesPrimaryTypeDisplayName,
        matchesDisplayName,
        matchesName,
        matchesAddress
      });
    }
    
    return isMatch;
  });

  if (exactMatch) {
    return exactMatch;
  }

  // If no exact match, try partial matches (keyword is part of a field)
  const partialMatch = find(keywords, (keyword: string, index: number) => {
    const lowercaseKeyword = lowercaseKeywords[index];
    
    // Get all text fields as a single string for matching
    const allText = [
      place.primaryType || '',
      ...(place.types || []),
      place.primaryTypeDisplayName?.text || '',
      place.displayName?.text || '',
      place.name || '',
      place.formattedAddress || ''
    ].join(' ').toLowerCase();
    
    // Check if the keyword is contained in any part of the text
    const isMatch = allText.includes(lowercaseKeyword);
    
    if (isMatch) {
      console.log(`[API] Partial match found for keyword "${keyword}" in place "${place.name}" in combined text`);
    }
    
    return isMatch;
  });
  
  if (!partialMatch) {
    console.log(`[API] No match found for place "${place.name}" with fields:`, placeFields);
  }
  
  return partialMatch;
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
  // Check for required fields
  if (!place.id) {
    console.error('[API] Place is missing required id field:', place);
    return { id: undefined } as unknown as NearbyPlace;
  }
  
  if (!place.location || typeof place.location.latitude !== 'number' || typeof place.location.longitude !== 'number') {
    console.error('[API] Place is missing valid location:', place);
    return { id: undefined } as unknown as NearbyPlace;
  }
  
  // Log the place being processed
  console.log(`[API] Creating simplified place for: ${place.name || 'Unknown'} (${place.id}), category: ${category}, emoji: ${emoji}`);
  
  // Handle price level - if PRICE_LEVEL_UNSPECIFIED, return null instead of 0
  const priceLevel =
    place.priceLevel && place.priceLevel !== 'PRICE_LEVEL_UNSPECIFIED'
      ? place.priceLevel
      : null;

  // Create the simplified place with all available fields
  try {
    return {
      id: place.id,
      name: place.name || place.displayName?.text || 'Unknown Place',
      nationalPhoneNumber: place.nationalPhoneNumber,
      formattedAddress: place.formattedAddress || 'No address available',
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
  } catch (error) {
    console.error('[API] Error creating simplified place:', error, place);
    return { id: undefined } as unknown as NearbyPlace;
  }
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

  const mappedPlaces = map(places, (place: GooglePlace) => {
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
      console.error(`[places] No emoji found for category: ${matchedKeyword}`);
      // Return a place with undefined id which will be filtered out
      return { id: undefined } as unknown as NearbyPlace;
    }

    // Create a simplified place object with only the fields we care about
    return createSimplifiedPlace(place, matchedKeyword, emoji);
  });

  return filter(
    mappedPlaces,
    (place: Partial<NearbyPlace>) => place.id !== undefined
  );
}
