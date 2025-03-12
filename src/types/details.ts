import type { CachedResponse } from './generics';
import type { GooglePlaceDetails } from './google-places-details';

export type Detail = {
  name: GooglePlaceDetails['name'];
  // id: GooglePlaceDetails['id']; TODO add id to our result
  // location: GooglePlaceDetails['location']; TODO add location to our result
  photos: GooglePlaceDetails['photos'];
  reviews: GooglePlaceDetails['reviews'];
  // rating: GooglePlaceDetails['rating']; TODO add rating to our result
  // priceLevel: GooglePlaceDetails['priceLevel']; TODO add priceLevel to our result
  // userRatingCount: GooglePlaceDetails['userRatingCount']; TODO add userRatingCount to our result
  // websiteUri: GooglePlaceDetails['websiteUri']; TODO add websiteUri to our result
};

/**
 * Response type for the details API endpoint
 */
export type DetailResponse = CachedResponse<Detail>;
