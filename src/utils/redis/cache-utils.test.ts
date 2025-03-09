import { describe, it, expect } from 'vitest';
import {
  roundCoordinate,
  normalizeLocation,
  normalizeRadius,
  generatePlacesCacheKey,
  generatePlaceDetailsCacheKey,
} from './cache-utils';

describe('Redis Cache Utilities', () => {
  describe('roundCoordinate', () => {
    it('should round coordinates to the specified number of decimal places', () => {
      expect(roundCoordinate(32.86618219877268, 2)).toBe(32.87);
      expect(roundCoordinate(-117.22646885454822, 2)).toBe(-117.23);
      expect(roundCoordinate(32.86618219877268, 3)).toBe(32.866);
      expect(roundCoordinate(-117.22646885454822, 3)).toBe(-117.226);
      expect(roundCoordinate(32.86618219877268, 0)).toBe(33);
      expect(roundCoordinate(-117.22646885454822, 0)).toBe(-117);
    });

    it('should use 2 decimal places by default', () => {
      expect(roundCoordinate(32.86618219877268)).toBe(32.87);
      expect(roundCoordinate(-117.22646885454822)).toBe(-117.23);
    });
  });

  describe('normalizeLocation', () => {
    it('should normalize location strings by rounding coordinates', () => {
      expect(normalizeLocation('32.86618219877268,-117.22646885454822')).toBe(
        '32.87,-117.23'
      );
      expect(
        normalizeLocation('32.86618219877268,-117.22646885454822', 3)
      ).toBe('32.866,-117.226');
      expect(
        normalizeLocation('32.86618219877268,-117.22646885454822', 0)
      ).toBe('33,-117');
    });

    it('should return the original string if parsing fails', () => {
      expect(normalizeLocation('invalid')).toBe('invalid');
      expect(normalizeLocation('32.866,invalid')).toBe('32.866,invalid');
    });
  });

  describe('normalizeRadius', () => {
    it('should normalize small radius values to the nearest 500m', () => {
      expect(normalizeRadius('1000')).toBe('1000');
      expect(normalizeRadius('1200')).toBe('1000');
      expect(normalizeRadius('1300')).toBe('1500');
      expect(normalizeRadius('4800')).toBe('5000');
      expect(normalizeRadius('5100')).toBe('5000');
      expect(normalizeRadius('9800')).toBe('10000');
    });

    it('should normalize large radius values to the nearest 1km', () => {
      expect(normalizeRadius('10500')).toBe('11000');
      expect(normalizeRadius('15400')).toBe('15000');
      expect(normalizeRadius('20600')).toBe('21000');
      expect(normalizeRadius('50000')).toBe('50000');
    });

    it('should return the original string if parsing fails', () => {
      expect(normalizeRadius('invalid')).toBe('invalid');
    });
  });

  describe('generatePlacesCacheKey', () => {
    it('should generate a cache key based on location and radius', () => {
      expect(
        generatePlacesCacheKey({
          location: '32.86618219877268,-117.22646885454822',
          radius: '5000',
        })
      ).toBe('places:32.87,-117.23:5000');

      expect(
        generatePlacesCacheKey({
          location: '32.86618219877268,-117.22646885454822',
          radius: '1200',
        })
      ).toBe('places:32.87,-117.23:1000');

      expect(
        generatePlacesCacheKey({
          location: '32.86618219877268,-117.22646885454822',
          radius: '15400',
        })
      ).toBe('places:32.87,-117.23:15000');
    });

    it('should use default radius if not provided', () => {
      expect(
        generatePlacesCacheKey({
          location: '32.86618219877268,-117.22646885454822',
        })
      ).toBe('places:32.87,-117.23:5000');

      expect(
        generatePlacesCacheKey({
          location: '32.86618219877268,-117.22646885454822',
          radius: null,
        })
      ).toBe('places:32.87,-117.23:5000');
    });

    it('should throw an error if location is not provided', () => {
      expect(() =>
        generatePlacesCacheKey({
          location: null,
        })
      ).toThrow('Location is required for generating a cache key');
    });
  });

  describe('generatePlaceDetailsCacheKey', () => {
    it('should generate a cache key based on placeId', () => {
      expect(generatePlaceDetailsCacheKey('ChIJN1t_tDeuEmsRUsoyG83frY4')).toBe(
        'place-details:ChIJN1t_tDeuEmsRUsoyG83frY4'
      );
      
      expect(generatePlaceDetailsCacheKey('abc123')).toBe('place-details:abc123');
      
      expect(generatePlaceDetailsCacheKey('place-with-dashes-and_underscores')).toBe(
        'place-details:place-with-dashes-and_underscores'
      );
    });

    it('should handle special characters in placeId', () => {
      expect(generatePlaceDetailsCacheKey('place:with:colons')).toBe(
        'place-details:place:with:colons'
      );
      
      expect(generatePlaceDetailsCacheKey('place/with/slashes')).toBe(
        'place-details:place/with/slashes'
      );
      
      expect(generatePlaceDetailsCacheKey('place.with.dots')).toBe(
        'place-details:place.with.dots'
      );
    });

    it('should handle numeric placeIds', () => {
      expect(generatePlaceDetailsCacheKey('123456')).toBe('place-details:123456');
    });

    it('should throw an error if placeId is not provided', () => {
      expect(() => generatePlaceDetailsCacheKey(null)).toThrow(
        'PlaceId is required for generating a cache key'
      );
    });

    it('should throw an error for empty string placeId', () => {
      expect(() => generatePlaceDetailsCacheKey('')).toThrow(
        'PlaceId is required for generating a cache key'
      );
    });
  });
});
