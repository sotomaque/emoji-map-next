import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchPlaces,
  placesToMapDataPoints,
  categories,
  categoryEmojis,
  categoryTypes,
} from './places';
import type { Place, PlacesParams } from './places';

// Mock fetch
global.fetch = vi.fn();

describe('Places Service', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
    // Mock console methods to keep test output clean
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchPlaces', () => {
    it('should fetch places with correct parameters', async () => {
      // Mock successful response
      const mockPlaces = [
        {
          placeId: 'place123',
          name: 'Test Restaurant',
          coordinate: { latitude: 37.7749, longitude: -122.4194 },
          category: 'restaurant',
          description: 'A test restaurant',
          priceLevel: 2,
          openNow: true,
          rating: 4.5,
        },
      ];

      // Setup fetch mock
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ places: mockPlaces }),
      });

      // Test parameters
      const params: Omit<PlacesParams, 'refetchTrigger'> = {
        latitude: 37.7749,
        longitude: -122.4194,
        radius: 5000,
        categories: ['restaurant', 'cafe'],
        openNow: true,
        priceLevel: [1, 2],
        minimumRating: 4,
      };

      // Call the function
      const result = await fetchPlaces(params);

      // Verify fetch was called with correct URL
      expect(global.fetch).toHaveBeenCalledTimes(1);
      const fetchUrl = (global.fetch as ReturnType<typeof vi.fn>).mock
        .calls[0][0] as string;

      // Check URL contains all parameters (accounting for URL encoding)
      expect(fetchUrl).toContain('/api/places/nearby');
      expect(fetchUrl).toContain('location=37.7749%2C-122.4194'); // URL encoded comma: %2C
      expect(fetchUrl).toContain('radius=5000');
      expect(fetchUrl).toContain('keywords=restaurant%2Ccafe'); // URL encoded comma: %2C
      expect(fetchUrl).toContain('openNow=true');
      expect(fetchUrl).toContain('priceLevel=1%2C2'); // URL encoded comma: %2C
      expect(fetchUrl).toContain('minimumRating=4');

      // Verify result
      expect(result).toEqual(mockPlaces);
    });

    it('should handle bounds parameter correctly', async () => {
      // Mock successful response
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ places: [] }),
      });

      // Test parameters with bounds
      const params: Omit<PlacesParams, 'refetchTrigger'> = {
        latitude: 37.7749,
        longitude: -122.4194,
        bounds: {
          ne: { lat: 37.8, lng: -122.3 },
          sw: { lat: 37.7, lng: -122.5 },
        },
      };

      // Call the function
      await fetchPlaces(params);

      // Verify fetch was called with correct URL
      expect(global.fetch).toHaveBeenCalledTimes(1);
      const fetchUrl = (global.fetch as ReturnType<typeof vi.fn>).mock
        .calls[0][0] as string;

      // Check URL contains bounds parameter (accounting for URL encoding)
      expect(fetchUrl).toContain('bounds=37.8%2C-122.3%7C37.7%2C-122.5'); // %2C is comma, %7C is pipe
    });

    it('should throw an error when fetch fails', async () => {
      // Mock failed response
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'API error' }),
      });

      // Test parameters
      const params: Omit<PlacesParams, 'refetchTrigger'> = {
        latitude: 37.7749,
        longitude: -122.4194,
      };

      // Call the function and expect it to throw
      await expect(fetchPlaces(params)).rejects.toThrow('API error');
    });

    it('should throw an error when network request fails', async () => {
      // Mock network error
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Network error')
      );

      // Test parameters
      const params: Omit<PlacesParams, 'refetchTrigger'> = {
        latitude: 37.7749,
        longitude: -122.4194,
      };

      // Call the function and expect it to throw
      await expect(fetchPlaces(params)).rejects.toThrow('Network error');
    });
  });

  describe('placesToMapDataPoints', () => {
    it('should convert places to map data points correctly', () => {
      // Test places
      const places: Place[] = [
        {
          placeId: 'place123',
          name: 'Test Restaurant',
          coordinate: { latitude: 37.7749, longitude: -122.4194 },
          category: 'restaurant',
          description: 'A test restaurant',
          priceLevel: 2,
          openNow: true,
          rating: 4.5,
        },
        {
          placeId: 'place456',
          name: 'Test Cafe',
          coordinate: { latitude: 37.775, longitude: -122.4195 },
          category: 'cafe',
          description: 'A test cafe',
          priceLevel: 1,
          openNow: false,
          rating: 3.5,
        },
      ];

      // Call the function
      const result = placesToMapDataPoints(places);

      // Verify result
      expect(result).toHaveLength(2);

      // Check first map data point
      expect(result[0]).toEqual({
        id: 'place123',
        position: { lat: 37.7749, lng: -122.4194 },
        emoji: expect.any(String), // The emoji depends on the category mapping
        title: 'Test Restaurant',
        category: 'restaurant',
        priceLevel: 2,
        openNow: true,
        rating: 4.5,
      });

      // Check second map data point
      expect(result[1]).toEqual({
        id: 'place456',
        position: { lat: 37.775, lng: -122.4195 },
        emoji: expect.any(String), // The emoji depends on the category mapping
        title: 'Test Cafe',
        category: 'cafe',
        priceLevel: 1,
        openNow: false,
        rating: 3.5,
      });
    });

    it('should handle empty places array', () => {
      // Call the function with empty array
      const result = placesToMapDataPoints([]);

      // Verify result is empty array
      expect(result).toEqual([]);
    });

    it('should use default emoji for unknown categories', () => {
      // Test place with unknown category
      const places: Place[] = [
        {
          placeId: 'place123',
          name: 'Unknown Place',
          coordinate: { latitude: 37.7749, longitude: -122.4194 },
          category: 'unknown_category',
          description: 'A place with unknown category',
        },
      ];

      // Call the function
      const result = placesToMapDataPoints(places);

      // Verify result uses default emoji
      expect(result[0].emoji).toBe('📍'); // Default emoji
    });
  });

  describe('categories', () => {
    it('should have the correct structure', () => {
      // Verify categories is an array of arrays
      expect(Array.isArray(categories)).toBe(true);

      // Check each category has emoji, name, and type
      categories.forEach((category) => {
        expect(category).toHaveLength(3);
        expect(typeof category[0]).toBe('string'); // emoji
        expect(typeof category[1]).toBe('string'); // name
        expect(typeof category[2]).toBe('string'); // type
      });
    });
  });

  describe('categoryEmojis', () => {
    it('should map category names to emojis', () => {
      // Verify categoryEmojis is an object
      expect(typeof categoryEmojis).toBe('object');

      // Check a few mappings
      categories.forEach(([emoji, name]) => {
        expect(categoryEmojis[name]).toBe(emoji);
      });
    });
  });

  describe('categoryTypes', () => {
    it('should map category names to types', () => {
      // Verify categoryTypes is an object
      expect(typeof categoryTypes).toBe('object');

      // Check a few mappings
      categories.forEach(([, name, type]) => {
        expect(categoryTypes[name]).toBe(type);
      });
    });
  });
});
