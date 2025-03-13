import { describe, it, expect } from 'vitest';
import {
  googleDetailsResponseSchema,
  mapPriceLevel,
} from './details-validator';

describe('details-validator', () => {
  describe('mapPriceLevel', () => {
    it('should map PRICE_LEVEL_FREE to 1', () => {
      expect(mapPriceLevel('PRICE_LEVEL_FREE')).toBe(1);
    });

    it('should map PRICE_LEVEL_INEXPENSIVE to 1', () => {
      expect(mapPriceLevel('PRICE_LEVEL_INEXPENSIVE')).toBe(1);
    });

    it('should map PRICE_LEVEL_MODERATE to 2', () => {
      expect(mapPriceLevel('PRICE_LEVEL_MODERATE')).toBe(2);
    });

    it('should map PRICE_LEVEL_EXPENSIVE to 3', () => {
      expect(mapPriceLevel('PRICE_LEVEL_EXPENSIVE')).toBe(3);
    });

    it('should map PRICE_LEVEL_VERY_EXPENSIVE to 4', () => {
      expect(mapPriceLevel('PRICE_LEVEL_VERY_EXPENSIVE')).toBe(4);
    });

    it('should map PRICE_LEVEL_UNSPECIFIED to null', () => {
      expect(mapPriceLevel('PRICE_LEVEL_UNSPECIFIED')).toBeNull();
    });

    it('should map unknown values to null', () => {
      expect(mapPriceLevel('UNKNOWN_VALUE')).toBeNull();
    });
  });

  describe('googleDetailsResponseSchema', () => {
    it('should validate a valid response', () => {
      const validResponse = {
        name: 'Test Place',
        priceLevel: 'PRICE_LEVEL_MODERATE',
        rating: 4.5,
        userRatingCount: 100,
      };

      const result = googleDetailsResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Test Place');
        expect(result.data.priceLevel).toBe('PRICE_LEVEL_MODERATE');
        expect(result.data.rating).toBe(4.5);
        expect(result.data.userRatingCount).toBe(100);
      }
    });

    it('should apply default values for optional fields', () => {
      const minimalResponse = {
        name: 'Test Place',
        rating: 4.0,
        userRatingCount: 50,
      };

      const result = googleDetailsResponseSchema.safeParse(minimalResponse);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Test Place');
        expect(result.data.priceLevel).toBe('PRICE_LEVEL_UNSPECIFIED');
        expect(result.data.reviews).toEqual([]);
      }
    });

    it('should reject responses without a name', () => {
      const invalidResponse = {
        priceLevel: 'PRICE_LEVEL_MODERATE',
        rating: 4.5,
        userRatingCount: 100,
      };

      const result = googleDetailsResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it('should reject responses without a rating', () => {
      const invalidResponse = {
        name: 'Test Place',
        priceLevel: 'PRICE_LEVEL_MODERATE',
        userRatingCount: 100,
      };

      const result = googleDetailsResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it('should reject responses without a userRatingCount', () => {
      const invalidResponse = {
        name: 'Test Place',
        priceLevel: 'PRICE_LEVEL_MODERATE',
        rating: 4.5,
      };

      const result = googleDetailsResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it('should validate a response with reviews', () => {
      const responseWithReviews = {
        name: 'Test Place',
        rating: 4.5,
        userRatingCount: 100,
        reviews: [
          {
            name: 'Review 1',
            rating: 5,
            relativePublishTimeDescription: '2 days ago',
            text: {
              text: 'Great place!',
              languageCode: 'en',
            },
            originalText: {
              text: 'Great place!',
              languageCode: 'en',
            },
            authorAttribution: {
              displayName: 'John Doe',
              uri: 'https://example.com/johndoe',
              photoUri: 'https://example.com/johndoe/photo',
            },
            publishTime: '2023-01-01T12:00:00Z',
            flagContentUri: 'https://example.com/flag',
            googleMapsUri: 'https://maps.google.com/review',
          },
        ],
      };

      const result = googleDetailsResponseSchema.safeParse(responseWithReviews);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.reviews).toHaveLength(1);
        expect(result.data.reviews[0].rating).toBe(5);
        expect(result.data.reviews[0].authorAttribution.displayName).toBe(
          'John Doe'
        );
        expect(result.data.reviews[0].text).toEqual({
          text: 'Great place!',
          languageCode: 'en',
        });
      }
    });

    it('should validate a response with payment options', () => {
      const responseWithPaymentOptions = {
        name: 'Test Place',
        rating: 4.5,
        userRatingCount: 100,
        paymentOptions: {
          acceptsCreditCards: true,
          acceptsDebitCards: false,
          acceptsCashOnly: false,
        },
      };

      const result = googleDetailsResponseSchema.safeParse(
        responseWithPaymentOptions
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.paymentOptions?.acceptsCreditCards).toBe(true);
        expect(result.data.paymentOptions?.acceptsDebitCards).toBe(false);
        expect(result.data.paymentOptions?.acceptsCashOnly).toBe(false);
      }
    });

    it('should validate a response with PRICE_LEVEL_FREE', () => {
      const responseWithFreePrice = {
        name: 'Free Museum',
        rating: 4.8,
        userRatingCount: 200,
        priceLevel: 'PRICE_LEVEL_FREE',
      };

      const result = googleDetailsResponseSchema.safeParse(
        responseWithFreePrice
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priceLevel).toBe('PRICE_LEVEL_FREE');
      }
    });

    it('should reject invalid price level values', () => {
      const invalidPriceLevel = {
        name: 'Test Place',
        rating: 4.5,
        userRatingCount: 100,
        priceLevel: 'INVALID_PRICE_LEVEL',
      };

      const result = googleDetailsResponseSchema.safeParse(invalidPriceLevel);
      expect(result.success).toBe(false);
    });

    it('should validate all valid price level values', () => {
      // Test all valid price levels
      const priceLevels = [
        'PRICE_LEVEL_FREE',
        'PRICE_LEVEL_INEXPENSIVE',
        'PRICE_LEVEL_MODERATE',
        'PRICE_LEVEL_EXPENSIVE',
        'PRICE_LEVEL_VERY_EXPENSIVE',
        'PRICE_LEVEL_UNSPECIFIED',
      ];

      priceLevels.forEach((priceLevel) => {
        const response = {
          name: `${priceLevel} Place`,
          rating: 4.0,
          userRatingCount: 50,
          priceLevel,
        };

        const result = googleDetailsResponseSchema.safeParse(response);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.priceLevel).toBe(priceLevel);
        }
      });
    });
  });
});
