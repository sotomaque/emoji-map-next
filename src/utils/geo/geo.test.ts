import { describe, it, expect } from 'vitest';
import {
  isValidLocation,
  isValidLatitude,
  isValidLongitude,
  createLocationBias,
  getValidLocation,
} from './geo';

describe('Geo Utilities', () => {
  describe('isValidLocation', () => {
    it('should return false for empty location', () => {
      expect(isValidLocation('')).toBe(false);
    });

    it('should return false for null or undefined location', () => {
      expect(isValidLocation(null as unknown as string)).toBe(false);
      expect(isValidLocation(undefined as unknown as string)).toBe(false);
    });

    it('should return false for location without comma', () => {
      expect(isValidLocation('40.7128')).toBe(false);
      expect(isValidLocation('invalid')).toBe(false);
    });

    it('should return false for location with empty latitude', () => {
      expect(isValidLocation(',45.123')).toBe(false);
    });

    it('should return false for location with empty longitude', () => {
      expect(isValidLocation('40.7128,')).toBe(false);
    });

    it('should return false for location with non-numeric coordinates', () => {
      expect(isValidLocation('abc,def')).toBe(false);
    });

    it('should return true for location with valid numeric coordinates', () => {
      expect(isValidLocation('40.7128,-74.0060')).toBe(true);
      expect(isValidLocation('-90,180')).toBe(true);
      expect(isValidLocation('0,0')).toBe(true);
    });

    it('should return true for location with at least one valid numeric coordinate', () => {
      expect(isValidLocation('40.7128,special')).toBe(true);
      expect(isValidLocation('custom,-74.0060')).toBe(true);
    });
  });

  describe('getValidLocation', () => {
    it('should return null for invalid location', () => {
      expect(getValidLocation('')).toBeNull();
      expect(getValidLocation('invalid')).toBeNull();
      expect(getValidLocation('40.7128')).toBeNull();
    });

    it('should return a GeoPoint for valid location', () => {
      const result = getValidLocation('40.7128,-74.0060');
      expect(result).not.toBeNull();
      expect(result).toEqual({
        latitude: 40.7128,
        longitude: -74.006,
      });
    });

    it('should handle locations with one valid coordinate', () => {
      const result = getValidLocation('40.7128,invalid');
      expect(result).not.toBeNull();
      expect(result?.latitude).toBe(40.7128);
      expect(isNaN(result?.longitude as number)).toBe(true);
    });
  });

  describe('isValidLatitude', () => {
    it('should return false for empty latitude', () => {
      expect(isValidLatitude('')).toBe(false);
    });

    it('should return false for null or undefined latitude', () => {
      expect(isValidLatitude(null as unknown as string)).toBe(false);
      expect(isValidLatitude(undefined as unknown as string)).toBe(false);
    });

    it('should return false for non-numeric latitude', () => {
      expect(isValidLatitude('invalid')).toBe(false);
    });

    it('should return false for latitude below -90', () => {
      expect(isValidLatitude('-90.1')).toBe(false);
      expect(isValidLatitude('-100')).toBe(false);
    });

    it('should return false for latitude above 90', () => {
      expect(isValidLatitude('90.1')).toBe(false);
      expect(isValidLatitude('100')).toBe(false);
    });

    it('should return true for valid latitude values', () => {
      expect(isValidLatitude('0')).toBe(true);
      expect(isValidLatitude('40.7128')).toBe(true);
      expect(isValidLatitude('-40.7128')).toBe(true);
      expect(isValidLatitude('90')).toBe(true);
      expect(isValidLatitude('-90')).toBe(true);
    });
  });

  describe('isValidLongitude', () => {
    it('should return false for empty longitude', () => {
      expect(isValidLongitude('')).toBe(false);
    });

    it('should return false for null or undefined longitude', () => {
      expect(isValidLongitude(null as unknown as string)).toBe(false);
      expect(isValidLongitude(undefined as unknown as string)).toBe(false);
    });

    it('should return false for non-numeric longitude', () => {
      expect(isValidLongitude('invalid')).toBe(false);
    });

    it('should return false for longitude below -180', () => {
      expect(isValidLongitude('-180.1')).toBe(false);
      expect(isValidLongitude('-200')).toBe(false);
    });

    it('should return false for longitude above 180', () => {
      expect(isValidLongitude('180.1')).toBe(false);
      expect(isValidLongitude('200')).toBe(false);
    });

    it('should return true for valid longitude values', () => {
      expect(isValidLongitude('0')).toBe(true);
      expect(isValidLongitude('-74.0060')).toBe(true);
      expect(isValidLongitude('74.0060')).toBe(true);
      expect(isValidLongitude('180')).toBe(true);
      expect(isValidLongitude('-180')).toBe(true);
    });
  });

  describe('createLocationBias', () => {
    it('should return null for invalid location', () => {
      expect(
        createLocationBias({ location: '', radiusMeters: 1000 })
      ).toBeNull();
      expect(
        createLocationBias({ location: 'invalid', radiusMeters: 1000 })
      ).toBeNull();
      expect(
        createLocationBias({ location: '40.7128', radiusMeters: 1000 })
      ).toBeNull();
      expect(
        createLocationBias({ location: ',45.123', radiusMeters: 1000 })
      ).toBeNull();
      expect(
        createLocationBias({ location: '40.7128,', radiusMeters: 1000 })
      ).toBeNull();
    });

    it('should return null for location with non-numeric coordinates', () => {
      expect(
        createLocationBias({ location: 'abc,def', radiusMeters: 1000 })
      ).toBeNull();
    });

    it('should create a location bias with the specified radius', () => {
      const result = createLocationBias({
        location: '40.7128,-74.0060',
        radiusMeters: 1000,
      });

      expect(result).not.toBeNull();
      if (result) {
        expect(result.circle.center.latitude).toBe(40.7128);
        expect(result.circle.center.longitude).toBe(-74.006);
        expect(result.circle.radius).toBe(1000);
      }
    });

    it('should create location biases with different radii', () => {
      const smallBias = createLocationBias({
        location: '40.7128,-74.0060',
        radiusMeters: 500,
      });

      const largeBias = createLocationBias({
        location: '40.7128,-74.0060',
        radiusMeters: 5000,
      });

      expect(smallBias).not.toBeNull();
      expect(largeBias).not.toBeNull();

      if (smallBias && largeBias) {
        // The centers should be the same
        expect(smallBias.circle.center).toEqual(largeBias.circle.center);

        // The large bias should have a larger radius
        expect(largeBias.circle.radius).toBeGreaterThan(
          smallBias.circle.radius
        );
        expect(smallBias.circle.radius).toBe(500);
        expect(largeBias.circle.radius).toBe(5000);
      }
    });

    it('should handle edge cases near poles and date line', () => {
      // Near North Pole
      const northPole = createLocationBias({
        location: '89,-120',
        radiusMeters: 10000,
      });

      expect(northPole).not.toBeNull();
      if (northPole) {
        expect(northPole.circle.center.latitude).toBe(89);
        expect(northPole.circle.center.longitude).toBe(-120);
      }

      // Near South Pole
      const southPole = createLocationBias({
        location: '-89,60',
        radiusMeters: 10000,
      });

      expect(southPole).not.toBeNull();
      if (southPole) {
        expect(southPole.circle.center.latitude).toBe(-89);
        expect(southPole.circle.center.longitude).toBe(60);
      }

      // Near Date Line
      const dateLine = createLocationBias({
        location: '40,179',
        radiusMeters: 10000,
      });

      expect(dateLine).not.toBeNull();
      if (dateLine) {
        expect(dateLine.circle.center.latitude).toBe(40);
        expect(dateLine.circle.center.longitude).toBe(179);
      }
    });
  });
});
