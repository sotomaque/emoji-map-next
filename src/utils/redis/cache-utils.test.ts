import { describe, it, expect } from 'vitest';
import { roundCoordinate, normalizeLocation } from './cache-utils';

describe('Redis Cache Utilities', () => {
  describe('roundCoordinate', () => {
    it('should round coordinates to the specified number of decimal places', () => {
      expect(roundCoordinate(40.7128, 2)).toBe(40.71);
      expect(roundCoordinate(40.7128, 3)).toBe(40.713);
      expect(roundCoordinate(40.7128, 1)).toBe(40.7);
      expect(roundCoordinate(40.7128, 0)).toBe(41);
    });

    it('should use 2 decimal places by default', () => {
      expect(roundCoordinate(40.7128)).toBe(40.71);
      expect(roundCoordinate(-74.006)).toBe(-74.01);
    });
  });

  describe('normalizeLocation', () => {
    it('should normalize location strings by rounding coordinates', () => {
      expect(normalizeLocation('40.7128,-74.0060')).toBe('40.71,-74.01');
      expect(normalizeLocation('40.7128,-74.0060', 3)).toBe('40.713,-74.006');
      expect(normalizeLocation('40.7128,-74.0060', 1)).toBe('40.7,-74');
    });

    it('should return the original string if parsing fails', () => {
      expect(normalizeLocation('invalid')).toBe('invalid');
      expect(normalizeLocation('')).toBe('');
    });
  });
});
