import { describe, it, expect } from 'vitest';
import {
  isValidLocation,
  isValidLatitude,
  isValidLongitude,
  createLocationBuffer,
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

  describe('createLocationBuffer', () => {
    it('should return null for invalid location', () => {
      expect(createLocationBuffer('')).toBeNull();
      expect(createLocationBuffer('invalid')).toBeNull();
      expect(createLocationBuffer('40.7128')).toBeNull();
      expect(createLocationBuffer(',45.123')).toBeNull();
      expect(createLocationBuffer('40.7128,')).toBeNull();
    });

    it('should return null for location with non-numeric coordinates', () => {
      expect(createLocationBuffer('abc,def')).toBeNull();
    });

    it('should create a buffer around a valid location with default buffer size', () => {
      const result = createLocationBuffer('40.7128,-74.0060');

      expect(result).not.toBeNull();
      if (result) {
        // Check that the buffer is roughly 10 miles in each direction
        expect(result.low.latitude).toBeLessThan(40.7128);
        expect(result.high.latitude).toBeGreaterThan(40.7128);
        expect(result.low.longitude).toBeLessThan(-74.006);
        expect(result.high.longitude).toBeGreaterThan(-74.006);

        // Check that the original point is inside the buffer
        expect(40.7128).toBeGreaterThan(result.low.latitude);
        expect(40.7128).toBeLessThan(result.high.latitude);
        expect(-74.006).toBeGreaterThan(result.low.longitude);
        expect(-74.006).toBeLessThan(result.high.longitude);
      }
    });

    it('should create a buffer with custom buffer size', () => {
      const smallBuffer = createLocationBuffer('40.7128,-74.0060', 5);
      const largeBuffer = createLocationBuffer('40.7128,-74.0060', 20);

      expect(smallBuffer).not.toBeNull();
      expect(largeBuffer).not.toBeNull();

      if (smallBuffer && largeBuffer) {
        // The large buffer should be bigger than the small buffer
        expect(largeBuffer.low.latitude).toBeLessThan(smallBuffer.low.latitude);
        expect(largeBuffer.high.latitude).toBeGreaterThan(
          smallBuffer.high.latitude
        );
        expect(largeBuffer.low.longitude).toBeLessThan(
          smallBuffer.low.longitude
        );
        expect(largeBuffer.high.longitude).toBeGreaterThan(
          smallBuffer.high.longitude
        );
      }
    });

    it('should handle edge cases near poles and date line', () => {
      // Near North Pole
      const northPole = createLocationBuffer('89,-120', 200);
      expect(northPole).not.toBeNull();
      if (northPole) {
        expect(northPole.high.latitude).toBeLessThanOrEqual(90);
      }

      // Near South Pole
      const southPole = createLocationBuffer('-89,60', 200);
      expect(southPole).not.toBeNull();
      if (southPole) {
        expect(southPole.low.latitude).toBeGreaterThanOrEqual(-90);
      }

      // Near Date Line
      const dateLine = createLocationBuffer('40,179', 200);
      expect(dateLine).not.toBeNull();
      // We don't need to check specific values here, just that it doesn't throw
    });
  });
});
