import type { CachedResponse } from './generics';
import type { GooglePlaceDetails } from './google-places-details';

export type Detail = {
  name: GooglePlaceDetails['name'];
  reviews: GooglePlaceDetails['reviews'];
  rating: GooglePlaceDetails['rating'];
  priceLevel: (1 | 2 | 3 | 4) | null;
  userRatingCount: GooglePlaceDetails['userRatingCount'];
  openNow?: GooglePlaceDetails['currentOpeningHours']['openNow'];
  displayName: GooglePlaceDetails['displayName']['text'];
  primaryTypeDisplayName: GooglePlaceDetails['primaryTypeDisplayName']['text'];
  takeout: GooglePlaceDetails['takeout'];
  delivery: GooglePlaceDetails['delivery'];
  dineIn: GooglePlaceDetails['dineIn'];
  editorialSummary: GooglePlaceDetails['editorialSummary']['text'];
  outdoorSeating: GooglePlaceDetails['outdoorSeating'];
  liveMusic: GooglePlaceDetails['liveMusic'];
  menuForChildren: GooglePlaceDetails['menuForChildren'];
  servesDessert: GooglePlaceDetails['servesDessert'];
  servesCoffee: GooglePlaceDetails['servesCoffee'];
  goodForChildren: GooglePlaceDetails['goodForChildren'];
  goodForGroups: GooglePlaceDetails['goodForGroups'];
  allowsDogs: GooglePlaceDetails['allowsDogs'];
  restroom: GooglePlaceDetails['restroom'];
  paymentOptions: GooglePlaceDetails['paymentOptions'];
  generativeSummary: GooglePlaceDetails['generativeSummary']['overview']['text'];
  isFree: boolean;
};

/**
 * Response type for the details API endpoint
 */
export type DetailResponse = CachedResponse<Detail>;

export type GoogleDetailsResponse = {
  name: GooglePlaceDetails['name'];
  reviews: GooglePlaceDetails['reviews'];
  rating: GooglePlaceDetails['rating'];
  priceLevel: GooglePlaceDetails['priceLevel'];
  userRatingCount: GooglePlaceDetails['userRatingCount'];
  currentOpeningHours: GooglePlaceDetails['currentOpeningHours'];
  displayName: GooglePlaceDetails['displayName'];
  primaryTypeDisplayName: GooglePlaceDetails['primaryTypeDisplayName'];
  takeout: GooglePlaceDetails['takeout'];
  delivery: GooglePlaceDetails['delivery'];
  dineIn: GooglePlaceDetails['dineIn'];
  editorialSummary: GooglePlaceDetails['editorialSummary'];
  outdoorSeating: GooglePlaceDetails['outdoorSeating'];
  liveMusic: GooglePlaceDetails['liveMusic'];
  menuForChildren: GooglePlaceDetails['menuForChildren'];
  servesDessert: GooglePlaceDetails['servesDessert'];
  servesCoffee: GooglePlaceDetails['servesCoffee'];
  goodForChildren: GooglePlaceDetails['goodForChildren'];
  goodForGroups: GooglePlaceDetails['goodForGroups'];
  allowsDogs: GooglePlaceDetails['allowsDogs'];
  restroom: GooglePlaceDetails['restroom'];
  paymentOptions: GooglePlaceDetails['paymentOptions'];
  generativeSummary: GooglePlaceDetails['generativeSummary'];
};
