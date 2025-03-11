/**
 * Utility functions for geographic operations
 */

import type { GeoRectangle } from '@/types/geo-types';

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
 */
export function isValidLongitude(longitude: string): boolean {
  if (!longitude) return false;

  const lng = parseFloat(longitude);
  return !isNaN(lng) && lng >= -180 && lng <= 180;
}

/**
 * Earth radius in miles
 */
const EARTH_RADIUS_MILES = 3963.19;

/**
 * Convert degrees to radians
 *
 * @param degrees - The angle in degrees
 * @returns The angle in radians
 */
function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 *
 * @param radians - The angle in radians
 * @returns The angle in degrees
 */
function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Creates a buffered rectangle around a location point
 *
 * @param location - The location string in format "latitude,longitude"
 * @param bufferMiles - The buffer distance in miles (default: 10)
 * @returns A GeoRectangle representing the buffered area, or null if the location is invalid
 *
 * @remarks
 * This function creates a rectangle around the given point by extending
 * the specified distance in all four directions (north, south, east, west).
 * The calculation takes into account the Earth's curvature.
 */
export function createLocationBuffer(
  location: string,
  bufferMiles: number = 10
): GeoRectangle | null {
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

  // Convert latitude and longitude to radians
  const latRad = degreesToRadians(lat);
  const lngRad = degreesToRadians(lng);

  // Calculate the angular distance in radians
  const angularDistance = bufferMiles / EARTH_RADIUS_MILES;

  // Calculate the latitude bounds
  const latNorth = latRad + angularDistance;
  const latSouth = latRad - angularDistance;

  // Calculate the longitude bounds
  // This takes into account that the distance between longitude lines varies with latitude
  const deltaLng = Math.asin(Math.sin(angularDistance) / Math.cos(latRad));
  const lngWest = lngRad - deltaLng;
  const lngEast = lngRad + deltaLng;

  // Convert back to degrees and handle edge cases
  const northLat = Math.min(radiansToDegrees(latNorth), 90);
  const southLat = Math.max(radiansToDegrees(latSouth), -90);
  const westLng = radiansToDegrees(lngWest);
  const eastLng = radiansToDegrees(lngEast);

  // Create the rectangle
  return {
    low: {
      latitude: southLat,
      longitude: westLng < -180 ? westLng + 360 : westLng,
    },
    high: {
      latitude: northLat,
      longitude: eastLng > 180 ? eastLng - 360 : eastLng,
    },
  };
}
