export interface GooglePlaceDetails {
  name: string;
  id: string;
  types: string[];
  nationalPhoneNumber: string;
  internationalPhoneNumber: string;
  formattedAddress: string;
  addressComponents: AddressComponent[];
  plusCode: PlusCode;
  location: Location;
  viewport: Viewport;
  rating: number;
  googleMapsUri: string;
  websiteUri: string;
  regularOpeningHours: RegularOpeningHours;
  utcOffsetMinutes: number;
  adrFormatAddress: string;
  businessStatus: string;
  priceLevel: string;
  userRatingCount: number;
  iconMaskBaseUri: string;
  iconBackgroundColor: string;
  displayName: DisplayName;
  primaryTypeDisplayName: PrimaryTypeDisplayName;
  takeout: boolean;
  dineIn: boolean;
  curbsidePickup: boolean;
  reservable: boolean;
  servesBreakfast: boolean;
  servesLunch: boolean;
  servesDinner: boolean;
  servesBeer: boolean;
  servesWine: boolean;
  servesBrunch: boolean;
  servesVegetarianFood: boolean;
  currentOpeningHours: CurrentOpeningHours;
  currentSecondaryOpeningHours: CurrentSecondaryOpeningHour[];
  regularSecondaryOpeningHours: RegularSecondaryOpeningHour[];
  primaryType: string;
  shortFormattedAddress: string;
  editorialSummary: EditorialSummary;
  reviews: Review[];
  photos: Photo[];
  outdoorSeating: boolean;
  liveMusic: boolean;
  menuForChildren: boolean;
  servesDessert: boolean;
  servesCoffee: boolean;
  goodForChildren: boolean;
  restroom: boolean;
  goodForGroups: boolean;
  paymentOptions: PaymentOptions;
  parkingOptions: ParkingOptions;
  accessibilityOptions: AccessibilityOptions;
  generativeSummary: GenerativeSummary;
  pureServiceAreaBusiness: boolean;
  addressDescriptor: AddressDescriptor;
  googleMapsLinks: GoogleMapsLinks;
  priceRange: PriceRange;
  timeZone: TimeZone;
  delivery?: boolean;
  allowsDogs?: boolean;
}

export interface AddressComponent {
  longText: string;
  shortText: string;
  types: string[];
  languageCode: string;
}

export interface PlusCode {
  globalCode: string;
  compoundCode: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Viewport {
  low: Low;
  high: High;
}

export interface Low {
  latitude: number;
  longitude: number;
}

export interface High {
  latitude: number;
  longitude: number;
}

export interface RegularOpeningHours {
  openNow: boolean;
  periods: Period[];
  weekdayDescriptions: string[];
  nextOpenTime: string;
}

export interface Period {
  open: Open;
  close: Close;
}

export interface Open {
  day: number;
  hour: number;
  minute: number;
}

export interface Close {
  day: number;
  hour: number;
  minute: number;
}

export interface DisplayName {
  text: string;
  languageCode: string;
}

export interface PrimaryTypeDisplayName {
  text: string;
  languageCode: string;
}

export interface CurrentOpeningHours {
  openNow: boolean;
  periods: Period2[];
  weekdayDescriptions: string[];
  nextOpenTime: string;
}

export interface Period2 {
  open: Open2;
  close: Close2;
}

export interface Open2 {
  day: number;
  hour: number;
  minute: number;
  date: Date;
}

export interface Date {
  year: number;
  month: number;
  day: number;
}

export interface Close2 {
  day: number;
  hour: number;
  minute: number;
  date: Date2;
}

export interface Date2 {
  year: number;
  month: number;
  day: number;
}

export interface CurrentSecondaryOpeningHour {
  openNow: boolean;
  periods: Period3[];
  weekdayDescriptions: string[];
  secondaryHoursType: string;
  nextOpenTime: string;
}

export interface Period3 {
  open: Open3;
  close: Close3;
}

export interface Open3 {
  day: number;
  hour: number;
  minute: number;
  date: Date3;
}

export interface Date3 {
  year: number;
  month: number;
  day: number;
}

export interface Close3 {
  day: number;
  hour: number;
  minute: number;
  date: Date4;
}

export interface Date4 {
  year: number;
  month: number;
  day: number;
}

export interface RegularSecondaryOpeningHour {
  openNow: boolean;
  periods: Period4[];
  weekdayDescriptions: string[];
  secondaryHoursType: string;
  nextOpenTime: string;
}

export interface Period4 {
  open: Open4;
  close: Close4;
}

export interface Open4 {
  day: number;
  hour: number;
  minute: number;
}

export interface Close4 {
  day: number;
  hour: number;
  minute: number;
}

export interface EditorialSummary {
  text: string;
  languageCode: string;
}

export interface Review {
  name: string;
  relativePublishTimeDescription: string;
  rating: number;
  text: Text;
  originalText: OriginalText;
  authorAttribution: AuthorAttribution;
  publishTime: string;
  flagContentUri: string;
  googleMapsUri: string;
}

export interface Text {
  text: string;
  languageCode: string;
}

export interface OriginalText {
  text: string;
  languageCode: string;
}

export interface AuthorAttribution {
  displayName: string;
  uri: string;
  photoUri: string;
}

export interface Photo {
  name: string;
  widthPx: number;
  heightPx: number;
  authorAttributions: AuthorAttribution2[];
  flagContentUri: string;
  googleMapsUri: string;
}

export interface AuthorAttribution2 {
  displayName: string;
  uri: string;
  photoUri: string;
}

export interface PaymentOptions {
  acceptsCreditCards: boolean;
  acceptsDebitCards: boolean;
  acceptsCashOnly: boolean;
}

export interface ParkingOptions {
  freeParkingLot: boolean;
  freeStreetParking: boolean;
  valetParking: boolean;
}

export interface AccessibilityOptions {
  wheelchairAccessibleParking: boolean;
  wheelchairAccessibleEntrance: boolean;
  wheelchairAccessibleRestroom: boolean;
  wheelchairAccessibleSeating: boolean;
}

export interface GenerativeSummary {
  overview: Overview;
  description: Description;
  overviewFlagContentUri: string;
  descriptionFlagContentUri: string;
}

export interface Overview {
  text: string;
  languageCode: string;
}

export interface Description {
  text: string;
  languageCode: string;
}

export interface AddressDescriptor {
  landmarks: Landmark[];
  areas: Area[];
}

export interface Landmark {
  name: string;
  placeId: string;
  displayName: DisplayName2;
  types: string[];
  straightLineDistanceMeters: number;
  travelDistanceMeters: number;
}

export interface DisplayName2 {
  text: string;
  languageCode: string;
}

export interface Area {
  name: string;
  placeId: string;
  displayName: DisplayName3;
  containment: string;
}

export interface DisplayName3 {
  text: string;
  languageCode: string;
}

export interface GoogleMapsLinks {
  directionsUri: string;
  placeUri: string;
  writeAReviewUri: string;
  reviewsUri: string;
  photosUri: string;
}

export interface PriceRange {
  startPrice: StartPrice;
  endPrice: EndPrice;
}

export interface StartPrice {
  currencyCode: string;
  units: string;
}

export interface EndPrice {
  currencyCode: string;
  units: string;
}

export interface TimeZone {
  id: string;
}
