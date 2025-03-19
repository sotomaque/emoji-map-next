/**
 * Types related to geographic operations and data
 */

/**
 * Represents a geographic point with latitude and longitude
 *
 * ```json
 * {
 *   "latitude": 37.7937,
 *   "longitude": -122.3965
 * }
 * ```
 */
export interface GeoPoint {
  latitude: number;
  longitude: number;
}

/**
 * Represents a location bias for Google Places API
 *
 * Specify the region as a rectangular Viewport or as a circle.
 * A circle is defined by center point and radius in meters. The
 * radius must be between 0.0 and 50,000.0, inclusive. The default
 * radius is 0.0. For example:
 *
 * ```json
 * {
 *   "locationBias": {
 *     "circle": {
 *       "center": {
 *         "latitude": 37.7937,
 *         "longitude": -122.3965
 *       },
 *       "radius": 500.0
 *     }
 *   }
 * }
 * ```
 */
export interface LocationBias {
  circle: {
    center: GeoPoint;
    radius: number;
  };
}
