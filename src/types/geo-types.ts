/**
 * Types related to geographic operations and data
 */

/**
 * Represents a geographic point with latitude and longitude
 */
export interface GeoPoint {
  latitude: number;
  longitude: number;
}

/**
 * Represents a geographic rectangle with low and high points
 */
export interface GeoRectangle {
  low: GeoPoint;
  high: GeoPoint;
}

/**
 * Represents a location restriction for Google Places API
 */
export interface LocationRestriction {
  rectangle: GeoRectangle;
}
