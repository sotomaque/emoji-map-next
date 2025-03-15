/**
 * Utility functions for geographic operations
 */

import type { GeoPoint, LocationBias } from '@/types/geo-types';

/**
 * Validates if a location string is properly formatted
 *
 * @param location - The location string to validate
 * @returns True if the location is valid, false otherwise
 *
 * A valid location must:
 * - Not be empty
 * - Contain at least one numeric coordinate
 * - If it contains a comma, both parts (latitude and longitude) must be present
 *
 * @example
 * ```ts
 * isValidLocation('37.7937,-122.3965'); // true
 * isValidLocation('37.7937'); // false
 * isValidLocation('37.7937,'); // false
 * ```
 */
export function isValidLocation(location: string): boolean {
  if (!location) {
    return false;
  }

  // If location contains a comma, check if it has both latitude and longitude
  if (location.includes(',')) {
    const [latitude, longitude] = location.split(',');

    // Both latitude and longitude must be present
    if (!latitude || !longitude) {
      return false;
    }

    // At least one of latitude or longitude should be a valid number
    const isLatitudeNumeric = !isNaN(parseFloat(latitude));
    const isLongitudeNumeric = !isNaN(parseFloat(longitude));

    return isLatitudeNumeric || isLongitudeNumeric;
  }

  // If no comma, it's not a valid coordinate pair
  return false;
}

/**
 * Returns a valid GeoPoint from a location string
 *
 * @param location - The location string to validate
 * @returns A GeoPoint representing the location, or null if the location is invalid
 *
 * @example
 * ```ts
 * const geoPoint = getValidLocation('37.7937,-122.3965');
 * {
 *   "latitude": 37.7937,
 *   "longitude": -122.3965
 * }
 * ```
 *
 * @example
 * ```ts
 * const geoPoint = getValidLocation('37.7937'); // null
 * ```
 */
export function getValidLocation(location: string): GeoPoint | null {
  if (!isValidLocation(location)) {
    return null;
  }

  return {
    latitude: parseFloat(location.split(',')[0]),
    longitude: parseFloat(location.split(',')[1]),
  };
}

/**
 * Checks if a string is a valid latitude value
 *
 * @param latitude - The latitude string to validate
 * @returns True if the latitude is valid, false otherwise
 */
export function isValidLatitude(latitude: string): boolean {
  if (!latitude) return false;

  const lat = parseFloat(latitude);
  return !isNaN(lat) && lat >= -90 && lat <= 90;
}

/**
 * Checks if a string is a valid longitude value
 *
 * @param longitude - The longitude string to validate
 * @returns True if the longitude is valid, false otherwise
 *
 * @example
 * ```ts
 * isValidLongitude('122.3965'); // true
 * isValidLongitude('122.3965'); // false
 * ```
 */
export function isValidLongitude(longitude: string): boolean {
  if (!longitude) return false;

  const lng = parseFloat(longitude);
  return !isNaN(lng) && lng >= -180 && lng <= 180;
}

/**
 * Creates a location bias for a given location and radius
 *
 * Location bias Specifies an area to search. This location serves as
 * a bias which means results around the specified location can be
 * returned, including results outside the specified area.
 *
 * A circle is defined by center point and radius in meters. The
 * radius must be between 0.0 and 50000.0, inclusive. The default
 * radius is 0.0. For example:
 *
 * "locationBias": {
 *   "circle": {
 *     "center": {
 *       "latitude": 37.7937,
 *       "longitude": -122.3965
 *     },
 *     "radius": 500.0
 *   }
 * }
 *
 * @param location - The location string in format "latitude,longitude"
 * @param radiusMeters - The radius in meters
 * @returns A LocationBias representing the location bias, or null if the location is invalid
 *
 * @example
 * ```ts
 * const locationBias = createLocationBias('37.7937,-122.3965', 10);
 * {
 *   "circle": {
 *     "center": {
 *       "latitude": 37.7937,
 *       "longitude": -122.3965
 *     },
 *     "radius": 16093.4
 *   }
 * }
 */
export function createLocationBias({
  location,
  radiusMeters,
}: {
  location: string;
  radiusMeters: number;
}): LocationBias | null {
  // Validate the location
  if (!isValidLocation(location)) {
    return null;
  }

  // Parse the location
  const [latStr, lngStr] = location.split(',');
  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  // Check if both coordinates are valid numbers
  if (isNaN(lat) || isNaN(lng)) {
    return null;
  }

  return {
    circle: {
      center: {
        latitude: lat,
        longitude: lng,
      },
      radius: radiusMeters,
    },
  };
}
