import { describe, it, expect, vi, beforeEach } from 'vitest';
import { categoryEmojis } from '@/services/places';
import type { GooglePlace } from '@/types/places';
import {
  processPlaces,
  findMatchingKeyword,
  createSimplifiedPlace,
} from './places-utils';

// Mock the categoryEmojis import
vi.mock('@/services/places', () => ({
  categoryEmojis: {
    pizza: '🍕',
    restaurant: '🍴',
    cafe: '☕️',
    bar: '🍺',
    place: '📍',
    italian: '🍝',
    chinese: '🥢',
    japanese: '🍣',
    mexican: '🌮',
    burger: '🍔',
  },
}));

describe('places-utils', () => {
  describe('findMatchingKeyword', () => {
    it('should find a matching keyword in primaryType', () => {
      const place: GooglePlace = {
        id: 'place1',
        name: 'Some Place',
        types: ['food'],
        formattedAddress: '123 Main St',
        location: { latitude: 37.7749, longitude: -122.4194 },
        primaryType: 'pizza_restaurant',
      };

      const keywords = ['pizza', 'burger'];
      const lowercaseKeywords = keywords.map((k) => k.toLowerCase());

      const result = findMatchingKeyword(place, keywords, lowercaseKeywords);

      expect(result).toBe('pizza');
    });

    it('should find a matching keyword in types array', () => {
      const place: GooglePlace = {
        id: 'place1',
        name: 'Some Place',
        types: ['burger_restaurant', 'food'],
        formattedAddress: '123 Main St',
        location: { latitude: 37.7749, longitude: -122.4194 },
      };

      const keywords = ['pizza', 'burger'];
      const lowercaseKeywords = keywords.map((k) => k.toLowerCase());

      const result = findMatchingKeyword(place, keywords, lowercaseKeywords);

      expect(result).toBe('burger');
    });

    it('should find a matching keyword in name', () => {
      const place: GooglePlace = {
        id: 'place1',
        name: 'Pizza Palace',
        types: ['restaurant', 'food'],
        formattedAddress: '123 Main St',
        location: { latitude: 37.7749, longitude: -122.4194 },
      };

      const keywords = ['pizza', 'burger'];
      const lowercaseKeywords = keywords.map((k) => k.toLowerCase());

      const result = findMatchingKeyword(place, keywords, lowercaseKeywords);

      expect(result).toBe('pizza');
    });

    it('should return undefined when no keyword matches', () => {
      const place: GooglePlace = {
        id: 'place1',
        name: 'Italian Restaurant',
        types: ['italian_restaurant', 'food'],
        formattedAddress: '123 Main St',
        location: { latitude: 37.7749, longitude: -122.4194 },
      };

      const keywords = ['pizza', 'burger'];
      const lowercaseKeywords = keywords.map((k) => k.toLowerCase());

      const result = findMatchingKeyword(place, keywords, lowercaseKeywords);

      expect(result).toBeUndefined();
    });
  });

  describe('createSimplifiedPlace', () => {
    it('should create a simplified place object with the provided category and emoji', () => {
      const place: GooglePlace = {
        id: 'place1',
        name: 'Pizza Palace',
        types: ['restaurant', 'food'],
        formattedAddress: '123 Main St',
        location: { latitude: 37.7749, longitude: -122.4194 },
        priceLevel: 'PRICE_LEVEL_EXPENSIVE',
        currentOpeningHours: {
          openNow: true,
          periods: [],
          weekdayDescriptions: [],
        },
        paymentOptions: {
          acceptsCreditCards: true,
          acceptsCashOnly: false,
        },
      };

      const result = createSimplifiedPlace(place, 'pizza', '🍕');

      expect(result.id).toBe('place1');
      expect(result.name).toBe('Pizza Palace');
      expect(result.category).toBe('pizza');
      expect(result.emoji).toBe('🍕');
      expect(result.priceLevel).toBe('PRICE_LEVEL_EXPENSIVE');
      expect(result.openNow).toBe(true);
      expect(result.acceptsCreditCards).toBe(true);
      expect(result.acceptsCashOnly).toBe(false);
    });

    it('should handle PRICE_LEVEL_UNSPECIFIED correctly', () => {
      const place: GooglePlace = {
        id: 'place1',
        name: 'Pizza Palace',
        types: ['restaurant', 'food'],
        formattedAddress: '123 Main St',
        location: { latitude: 37.7749, longitude: -122.4194 },
        priceLevel: 'PRICE_LEVEL_UNSPECIFIED',
      };

      const result = createSimplifiedPlace(place, 'pizza', '🍕');

      expect(result.priceLevel).toBeNull();
    });
  });

  describe('processPlaces', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      // Reset the mock for each test
      vi.mocked(categoryEmojis).pizza = '🍕';
    });

    it('should process places and assign categories based on keywords', () => {
      // Arrange
      const mockPlaces: GooglePlace[] = [
        {
          id: 'place1',
          name: 'Pizza Palace',
          types: ['restaurant', 'food'],
          formattedAddress: '123 Main St',
          location: { latitude: 37.7749, longitude: -122.4194 },
          primaryType: 'restaurant',
          displayName: { text: 'Pizza Palace', languageCode: 'en' },
        },
        {
          id: 'place2',
          name: 'Burger Joint',
          types: ['restaurant', 'burger_restaurant'],
          formattedAddress: '456 Oak St',
          location: { latitude: 37.7749, longitude: -122.4194 },
          primaryTypeDisplayName: {
            text: 'Burger Restaurant',
            languageCode: 'en',
          },
        },
      ];

      const keywords = ['pizza', 'burger'];

      // Act
      const result = processPlaces(mockPlaces, keywords);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].category).toBe('pizza');
      expect(result[0].emoji).toBe('🍕');
      expect(result[1].category).toBe('burger');
      expect(result[1].emoji).toBe('🍔');
    });

    it('should filter out places that do not match any keywords', () => {
      // Arrange
      const mockPlaces: GooglePlace[] = [
        {
          id: 'place1',
          name: 'Italian Restaurant',
          types: ['italian_restaurant', 'restaurant'],
          formattedAddress: '123 Main St',
          location: { latitude: 37.7749, longitude: -122.4194 },
        },
      ];

      const keywords = ['pizza', 'burger'];

      // Act
      const result = processPlaces(mockPlaces, keywords);

      // Assert
      expect(result).toHaveLength(0); // Should be filtered out as it doesn't match any keywords
    });

    it('should filter out places with undefined id', () => {
      // Arrange
      const mockPlaces: GooglePlace[] = [
        {
          id: 'place1',
          name: 'Valid Pizza Place',
          types: ['restaurant', 'food'],
          formattedAddress: '123 Main St',
          location: { latitude: 37.7749, longitude: -122.4194 },
        },
        {
          id: undefined as unknown as string, // This should be filtered out
          name: 'Invalid Pizza Place',
          types: ['restaurant', 'food'],
          formattedAddress: '456 Oak St',
          location: { latitude: 37.7749, longitude: -122.4194 },
        },
      ];

      const keywords = ['pizza'];

      // Act
      const result = processPlaces(mockPlaces, keywords);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('place1');
    });

    it('should log error and return undefined id when no emoji is found for category', () => {
      // Arrange
      const mockPlaces: GooglePlace[] = [
        {
          id: 'place1',
          name: 'Pizza Unknown',
          types: ['unknown_type'],
          formattedAddress: '123 Main St',
          location: { latitude: 37.7749, longitude: -122.4194 },
        },
      ];

      // Mock categoryEmojis to not have the 'pizza' emoji
      const mockedCategoryEmojis = vi.mocked(categoryEmojis);
      mockedCategoryEmojis.pizza = undefined as unknown as string;

      const keywords = ['pizza'];

      // Act
      const result = processPlaces(mockPlaces, keywords);

      // Assert
      expect(result).toHaveLength(0); // Should be filtered out due to undefined id
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('No emoji found for category')
      );
    });

    it('should extract payment, parking, and accessibility options', () => {
      // Arrange
      const mockPlaces: GooglePlace[] = [
        {
          id: 'place1',
          name: 'Pizza Restaurant',
          types: ['restaurant', 'food'],
          formattedAddress: '123 Main St',
          location: { latitude: 37.7749, longitude: -122.4194 },
          paymentOptions: {
            acceptsCreditCards: true,
            acceptsCashOnly: false,
          },
          parkingOptions: {
            valetParking: true,
          },
          accessibilityOptions: {
            wheelchairAccessibleEntrance: true,
            wheelchairAccessibleSeating: true,
          },
        },
      ];

      const keywords = ['pizza'];

      // Act
      const result = processPlaces(mockPlaces, keywords);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].acceptsCreditCards).toBe(true);
      expect(result[0].acceptsCashOnly).toBe(false);
      expect(result[0].valetParking).toBe(true);
      expect(result[0].wheelchairAccessibleEntrance).toBe(true);
      expect(result[0].wheelchairAccessibleSeating).toBe(true);
    });

    it('should handle price level correctly', () => {
      // Arrange
      const mockPlaces: GooglePlace[] = [
        {
          id: 'place1',
          name: 'Pizza Expensive',
          types: ['restaurant', 'food'],
          formattedAddress: '123 Main St',
          location: { latitude: 37.7749, longitude: -122.4194 },
          priceLevel: 'PRICE_LEVEL_EXPENSIVE',
        },
        {
          id: 'place2',
          name: 'Pizza Unspecified',
          types: ['restaurant', 'food'],
          formattedAddress: '456 Oak St',
          location: { latitude: 37.7749, longitude: -122.4194 },
          priceLevel: 'PRICE_LEVEL_UNSPECIFIED',
        },
      ];

      const keywords = ['pizza'];

      // Act
      const result = processPlaces(mockPlaces, keywords);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].priceLevel).toBe('PRICE_LEVEL_EXPENSIVE');
      expect(result[1].priceLevel).toBeNull();
    });

    it('should use currentOpeningHours for openNow status', () => {
      // Arrange
      const mockPlaces: GooglePlace[] = [
        {
          id: 'place1',
          name: 'Pizza Open',
          types: ['restaurant', 'food'],
          formattedAddress: '123 Main St',
          location: { latitude: 37.7749, longitude: -122.4194 },
          currentOpeningHours: {
            openNow: true,
            periods: [],
            weekdayDescriptions: [],
          },
        },
      ];

      const keywords = ['pizza'];

      // Act
      const result = processPlaces(mockPlaces, keywords);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].openNow).toBe(true);
    });
  });
});
