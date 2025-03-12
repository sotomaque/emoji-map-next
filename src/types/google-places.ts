export type GooglePlacesResponse = {
  places: GooglePlace[];
  contextualContents?: unknown[];
  nextPageToken?: string;
  searchUri?: string;
};

// Nested types
export interface GooglePlace {
  name: string;
  id: string;
  types: string[];
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  formattedAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  googleMapsUri?: string;
  websiteUri?: string;
  regularOpeningHours?: {
    openNow: boolean;
    periods: OpeningPeriod[];
    weekdayDescriptions: string[];
    nextOpenTime?: string;
    nextCloseTime?: string;
  };
  priceLevel?: string;
  userRatingCount?: number;
  displayName?: {
    text: string;
    languageCode: string;
  };
  primaryTypeDisplayName?: {
    text: string;
    languageCode: string;
  };
  takeout?: boolean;
  delivery?: boolean;
  dineIn?: boolean;
  curbsidePickup?: boolean;
  reservable?: boolean;
  servesBreakfast?: boolean;
  servesLunch?: boolean;
  servesDinner?: boolean;
  servesBeer?: boolean;
  servesWine?: boolean;
  servesBrunch?: boolean;
  servesVegetarianFood?: boolean;
  editorialSummary?: {
    text: string;
    languageCode: string;
  };
  reviews?: Review[];
  photos?: Photo[];
  outdoorSeating?: boolean;
  liveMusic?: boolean;
  menuForChildren?: boolean;
  servesCocktails?: boolean;
  servesDessert?: boolean;
  servesCoffee?: boolean;
  goodForChildren?: boolean;
  allowsDogs?: boolean;
  restroom?: boolean;
  goodForGroups?: boolean;
  goodForWatchingSports?: boolean;
  paymentOptions?: {
    acceptsCreditCards?: boolean;
    acceptsDebitCards?: boolean;
    acceptsCashOnly?: boolean;
    acceptsNfc?: boolean;
  };
  parkingOptions?: {
    freeParkingLot?: boolean;
    freeStreetParking?: boolean;
    paidStreetParking?: boolean;
    valetParking?: boolean;
  };
  accessibilityOptions?: {
    wheelchairAccessibleParking?: boolean;
    wheelchairAccessibleEntrance?: boolean;
    wheelchairAccessibleRestroom?: boolean;
    wheelchairAccessibleSeating?: boolean;
  };
  generativeSummary?: {
    overview?: {
      text: string;
      languageCode: string;
    };
    description?: {
      text: string;
      languageCode: string;
    };
  };
  priceRange?: {
    startPrice?: {
      currencyCode: string;
      units: string;
    };
    endPrice?: {
      currencyCode: string;
      units: string;
    };
  };
  timeZone?: {
    id: string;
  };
  currentOpeningHours?: {
    openNow: boolean;
    periods: OpeningPeriod[];
    weekdayDescriptions: string[];
    nextOpenTime?: string;
    nextCloseTime?: string;
  };
  primaryType?: string;
  iconMaskBaseUri?: string;
  iconBackgroundColor?: string;
  businessStatus?: string;
}

export interface OpeningPeriod {
  open: {
    day: number;
    hour: number;
    minute: number;
    date?: {
      year: number;
      month: number;
      day: number;
    };
  };
  close: {
    day: number;
    hour: number;
    minute: number;
    date?: {
      year: number;
      month: number;
      day: number;
    };
  };
}

export interface Review {
  name: string;
  relativePublishTimeDescription: string;
  rating: number;
  text: {
    text: string;
    languageCode: string;
  };
  authorAttribution: {
    displayName: string;
    uri: string;
    photoUri?: string;
  };
  publishTime: string;
}

export interface Photo {
  name: string;
  widthPx: number;
  heightPx: number;
  authorAttributions: {
    displayName: string;
    uri: string;
    photoUri?: string;
  }[];
  googleMapsUri: string;
}
