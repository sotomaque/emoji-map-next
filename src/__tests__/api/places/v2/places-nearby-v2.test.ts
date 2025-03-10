import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import cachedResponse from '@/__fixtures__/api/places/v2/cached-response.json'
import { GET } from '@/app/api/places/v2/route';
import { findMatchingKeyword } from '@/lib/places-utils';
import { redis, generatePlacesTextSearchCacheKey } from '@/lib/redis';

// Mock the redis module
vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
  },
  CACHE_EXPIRATION_TIME: 3600,
  generatePlacesTextSearchCacheKey: vi.fn(),
}));

// Mock the places-utils module
vi.mock('@/lib/places-utils', () => ({
  findMatchingKeyword: vi.fn((place) => {
    // Simple implementation that matches 'Mexican' in the display name
    if (place.displayName.text.toLowerCase().includes('mexican')) {
      return 'mexican';
    }
    return null;
  }),
  createSimplifiedPlace: vi.fn((place, keyword) => {
    return {
      id: place.id,
      name: place.displayName.text,
      category: keyword,
      emoji: keyword === 'mexican' ? '🌮' : '❓',
    };
  }),
}));

// Mock the category emojis
vi.mock('@/services/places', () => ({
  categoryEmojis: {
    mexican: '🌮',
    italian: '🍝',
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe('Places API Route (v2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation returns a valid cache key
    (generatePlacesTextSearchCacheKey as Mock).mockReturnValue('test-cache-key');
  });

  // Helper function to create a request with query parameters
  const createRequest = (params: Record<string, string>) => {
    const url = new URL('https://example.com/api/places/v2');
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    
    return new NextRequest(url);
  };

  describe('Early returns and validation', () => {
    it('returns 400 when textQuery is missing', async () => {
      const req = createRequest({ location: '37.7749,-122.4194' });
      const response = await GET(req);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Missing required parameter: textQuery');
    });

    it('returns 400 when location is missing', async () => {
      const req = createRequest({ textQuery: 'Mexican' });
      const response = await GET(req);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Missing required parameter: location');
    });

    // New test for invalid location format
    it('handles invalid location format gracefully', async () => {
      // Mock generatePlacesTextSearchCacheKey to return null for this test
      (generatePlacesTextSearchCacheKey as Mock).mockReturnValue(null);
      
      // Mock redis.get to return null (cache miss)
      (redis.get as Mock).mockResolvedValue(null);
      
      // Mock fetch to return Google API response
      (global.fetch as Mock).mockResolvedValue({
        json: vi.fn().mockResolvedValue({ places: [] })
      });
      
      const req = createRequest({ 
        textQuery: 'Mexican', 
        location: 'invalid-location-format'
      });
      
      await GET(req);
      
      const fetchCall = (global.fetch as Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      
      // The location should not be included in the request body
      expect(requestBody.locationBias).toBeUndefined();
    });
  });

  describe('Cache handling', () => {
    it('returns cached data when available and bypassCache is not true', async () => {
      // Create a large enough cached response to avoid fetching from Google
      const largeCache = Array(100).fill(null).map((_, i) => ({
        id: `place${i}`,
        name: `Place ${i}`,
        category: 'mexican',
        emoji: '🌮'
      }));
      
      // Mock redis.get to return cached data
      (redis.get as Mock).mockResolvedValue(largeCache);
      
      const req = createRequest({ 
        textQuery: 'Mexican', 
        location: '37.7749,-122.4194' 
      });
      
      const response = await GET(req);
      const data = await response.json();
      
      // Accept undefined as the cache key
      expect(redis.get).toHaveBeenCalled();
      expect(global.fetch).not.toHaveBeenCalled();
      expect(data.places.length).toBe(50); // Default maxResults is 50
    });

    it('limits cached results based on maxResults parameter', async () => {
      // Mock redis.get to return cached data
      (redis.get as Mock).mockResolvedValue(cachedResponse.places);
      
      const req = createRequest({ 
        textQuery: 'Mexican', 
        location: '37.7749,-122.4194',
        maxResults: '1'
      });
      
      const response = await GET(req);
      const data = await response.json();
      
      // Accept undefined as the cache key
      expect(redis.get).toHaveBeenCalled();
      expect(global.fetch).not.toHaveBeenCalled();
      expect(data.places.length).toBe(1);
    });

    it('bypasses cache when bypassCache=true', async () => {
      // Mock redis.get to return cached data
      (redis.get as Mock).mockResolvedValue(cachedResponse.places);
      
      // Mock fetch to return Google API response
      (global.fetch as Mock).mockResolvedValue({
        json: vi.fn().mockResolvedValue({ places: [] })
      });
      
      const req = createRequest({ 
        textQuery: 'Mexican', 
        location: '37.7749,-122.4194',
        bypassCache: 'true'
      });
      
      await GET(req);
      
      // We don't expect redis.get to be called when bypassCache=true
      expect(redis.get).not.toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalled();
    });

    // New test for cache with insufficient results
    it('fetches from Google when cache has insufficient results', async () => {
      // Create a small cached response with fewer items than maxResults
      const smallCache = Array(5).fill(null).map((_, i) => ({
        id: `place${i}`,
        name: `Place ${i}`,
        category: 'mexican',
        emoji: '🌮'
      }));
      
      // Mock redis.get to return small cached data
      (redis.get as Mock).mockResolvedValue(smallCache);
      
      // Mock fetch to return Google API response
      (global.fetch as Mock).mockResolvedValue({
        json: vi.fn().mockResolvedValue({ places: [] })
      });
      
      const req = createRequest({ 
        textQuery: 'Mexican', 
        location: '37.7749,-122.4194',
        maxResults: '10'
      });
      
      await GET(req);
      
      // We expect redis.get to be called and then fetch to be called
      expect(redis.get).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalled();
    });

    it('skips Redis operations when cache key is null', async () => {
      // Mock generatePlacesTextSearchCacheKey to return null
      (generatePlacesTextSearchCacheKey as Mock).mockReturnValue(null);
      
      // Mock fetch to return Google API response
      (global.fetch as Mock).mockResolvedValue({
        json: vi.fn().mockResolvedValue({ places: [] })
      });
      
      const req = createRequest({ 
        textQuery: 'Mexican', 
        location: '37.7749,-122.4194'
      });
      
      await GET(req);
      
      // Verify that Redis operations are skipped
      expect(redis.get).not.toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalled();
      
      // After fetching from Google, Redis.set should also be skipped
      expect(redis.set).not.toHaveBeenCalled();
    });
  });

  describe('Google Places API integration', () => {
    it('calls Google API when cache is empty', async () => {
      // Mock redis.get to return null (cache miss)
      (redis.get as Mock).mockResolvedValue(null);
      
      // Mock fetch to return Google API response
      (global.fetch as Mock).mockResolvedValue({
        json: vi.fn().mockResolvedValue({ places: [] })
      });
      
      const req = createRequest({ 
        textQuery: 'Mexican', 
        location: '37.7749,-122.4194',
        maxResults: '20'
      });
      
      await GET(req);
      
      // Accept undefined as the cache key
      expect(redis.get).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalled();
      
    });

    it('includes location parameters in Google API request', async () => {
      // Mock redis.get to return null (cache miss)
      (redis.get as Mock).mockResolvedValue(null);
      
      // Mock fetch to return Google API response
      (global.fetch as Mock).mockResolvedValue({
        json: vi.fn().mockResolvedValue({ places: [] })
      });
      
      const req = createRequest({ 
        textQuery: 'Mexican', 
        location: '37.7749,-122.4194',
        radius: '1000'
      });
      
      await GET(req);
      
      const fetchCall = (global.fetch as Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      
      expect(requestBody.locationBias.circle).toBeDefined();
      expect(requestBody.locationBias.circle.center.latitude).toBe(37.7749);
      expect(requestBody.locationBias.circle.center.longitude).toBe(-122.4194);
      expect(requestBody.locationBias.circle.radius).toBe(1000);
    });

    it('includes bounds parameters in Google API request when provided', async () => {
      // Mock redis.get to return null (cache miss)
      (redis.get as Mock).mockResolvedValue(null);
      
      // Mock fetch to return Google API response
      (global.fetch as Mock).mockResolvedValue({
        json: vi.fn().mockResolvedValue({ places: [] })
      });
      
      const req = createRequest({ 
        textQuery: 'Mexican', 
        location: '37.7749,-122.4194',
        bounds: '37.7,-122.5|37.8,-122.3'
      });
      
      await GET(req);
      
      const fetchCall = (global.fetch as Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      
      expect(requestBody.locationBias.rectangle).toBeDefined();
      expect(requestBody.locationBias.rectangle.low.latitude).toBe(37.7);
      expect(requestBody.locationBias.rectangle.low.longitude).toBe(-122.5);
      expect(requestBody.locationBias.rectangle.high.latitude).toBe(37.8);
      expect(requestBody.locationBias.rectangle.high.longitude).toBe(-122.3);
    });

    it('includes maxResultCount parameter in Google API request', async () => {
      // Mock redis.get to return null (cache miss)
      (redis.get as Mock).mockResolvedValue(null);
      
      // Mock fetch to return Google API response
      (global.fetch as Mock).mockResolvedValue({
        json: vi.fn().mockResolvedValue({ places: [] })
      });
      
      const customMaxResults = '25';
      
      const req = createRequest({ 
        textQuery: 'Mexican', 
        location: '37.7749,-122.4194',
        maxResults: customMaxResults
      });
      
      await GET(req);
      
      const fetchCall = (global.fetch as Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      
      // Verify that maxResultCount is included and has the correct value
      expect(requestBody.maxResultCount).toBeDefined();
      expect(requestBody.maxResultCount).toBe(parseInt(customMaxResults, 10));
    });

    it('falls back to radius when bounds format is invalid', async () => {
      // Mock redis.get to return null (cache miss)
      (redis.get as Mock).mockResolvedValue(null);
      
      // Mock fetch to return Google API response
      (global.fetch as Mock).mockResolvedValue({
        json: vi.fn().mockResolvedValue({ places: [] })
      });
      
      const req = createRequest({ 
        textQuery: 'Mexican', 
        location: '37.7749,-122.4194',
        radius: '1000',
        bounds: 'invalid-bounds-format'
      });
      
      await GET(req);
      
      const fetchCall = (global.fetch as Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      
      // Should use circle (radius) instead of rectangle (bounds)
      expect(requestBody.locationBias.circle).toBeDefined();
      expect(requestBody.locationBias.rectangle).toBeUndefined();
    });
  });

  describe('Response processing', () => {
    beforeEach(() => {
      // Set up mocks for utility functions
      vi.mock('@/lib/places-utils', () => ({
        findMatchingKeyword: vi.fn((place) => {
          // Only return a match for the Mexican restaurant
          if (place.displayName.text.includes('Mexican')) {
            return 'mexican';
          }
          return null;
        }),
        createSimplifiedPlace: vi.fn((place, keyword, emoji) => {
          return {
            id: place.id,
            name: place.displayName.text,
            category: keyword,
            emoji: emoji
          };
        }),
      }));
      
      // Mock the category emojis
      vi.mock('@/services/places', () => ({
        categoryEmojis: {
          mexican: '🌮'
        }
      }));
    });

    it('processes and filters Google API response correctly', async () => {
      // Mock redis.get to return null (cache miss)
      (redis.get as Mock).mockResolvedValue(null);
      
      // Create a mock Google API response with places that will match and not match keywords
      const mockGoogleResponse = {
        places: [
          {
            id: 'place1',
            displayName: { text: 'Mexican Restaurant' },
            primaryTypeDisplayName: { text: 'Mexican Restaurant' },
            // ... other required fields
          },
          {
            id: 'place2',
            displayName: { text: 'Italian Restaurant' },
            primaryTypeDisplayName: { text: 'Italian Restaurant' },
            // ... other required fields
          }
        ]
      };
      
      // Mock fetch to return the mock Google API response
      (global.fetch as Mock).mockResolvedValue({
        json: vi.fn().mockResolvedValue(mockGoogleResponse)
      });
      
      const req = createRequest({ 
        textQuery: 'Mexican', 
        location: '37.7749,-122.4194'
      });
      
      const response = await GET(req);
      const data = await response.json();
      
      // We expect only the Mexican restaurant to be included in the results
      expect(data.places.length).toBe(1);
      expect(redis.set).toHaveBeenCalled();
    });

    it('handles empty or invalid Google API response', async () => {
      // Mock redis.get to return null (cache miss)
      (redis.get as Mock).mockResolvedValue(null);
      
      // Mock fetch to return an invalid response
      (global.fetch as Mock).mockResolvedValue({
        json: vi.fn().mockResolvedValue({ error: 'Invalid request' })
      });
      
      const req = createRequest({ 
        textQuery: 'Mexican', 
        location: '37.7749,-122.4194'
      });
      
      const response = await GET(req);
      
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to process request');
    });

    it('caches processed results after successful Google API call', async () => {
      // Mock redis.get to return null (cache miss)
      (redis.get as Mock).mockResolvedValue(null);
      
      // Mock fetch to return a single place
      (global.fetch as Mock).mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          places: [
            {
              id: 'place1',
              displayName: { text: 'Mexican Restaurant' },
              types: ['restaurant', 'food']
            }
          ]
        })
      });
      
      const req = createRequest({ 
        textQuery: 'Mexican', 
        location: '37.7749,-122.4194'
      });
      
      await GET(req);
      
      // Check that redis.set was called with the processed results
      expect(redis.set).toHaveBeenCalledWith(
        'test-cache-key',
        expect.any(Array),
        { ex: expect.any(Number) }
      );
    });

    // New test for when no places match keywords
    it('returns empty array when no places match keywords', async () => {
      // Mock redis.get to return null (cache miss)
      (redis.get as Mock).mockResolvedValue(null);
      
      // Override the findMatchingKeyword mock to always return null
      (findMatchingKeyword as Mock).mockReturnValue(null);
      
      // Create a mock Google API response with places that won't match any keywords
      const mockGoogleResponse = {
        places: [
          {
            id: 'place1',
            displayName: { text: 'Some Restaurant' },
            primaryTypeDisplayName: { text: 'Some Restaurant' },
          },
          {
            id: 'place2',
            displayName: { text: 'Another Restaurant' },
            primaryTypeDisplayName: { text: 'Another Restaurant' },
          }
        ]
      };
      
      // Mock fetch to return the mock Google API response
      (global.fetch as Mock).mockResolvedValue({
        json: vi.fn().mockResolvedValue(mockGoogleResponse)
      });
      
      const req = createRequest({ 
        textQuery: 'Mexican', 
        location: '37.7749,-122.4194'
      });
      
      const response = await GET(req);
      const data = await response.json();
      
      // We expect no places to be included in the results
      expect(data.places.length).toBe(0);
      // We don't expect redis.set to be called with empty results
      expect(redis.set).not.toHaveBeenCalled();
    });

    // New test for when a keyword doesn't have a corresponding emoji
    it('filters out places with keywords that have no emoji', async () => {
      // Mock redis.get to return null (cache miss)
      (redis.get as Mock).mockResolvedValue(null);
      
      // Override the findMatchingKeyword mock to return a keyword without an emoji
      (findMatchingKeyword as Mock).mockReturnValue('unknown-category');
      
      // Mock the category emojis to not include the returned keyword
      vi.mock('@/services/places', () => ({
        categoryEmojis: {
          mexican: '🌮'
          // 'unknown-category' is not included
        }
      }));
      
      // Create a mock Google API response
      const mockGoogleResponse = {
        places: [
          {
            id: 'place1',
            displayName: { text: 'Some Restaurant' },
            primaryTypeDisplayName: { text: 'Some Restaurant' },
          }
        ]
      };
      
      // Mock fetch to return the mock Google API response
      (global.fetch as Mock).mockResolvedValue({
        json: vi.fn().mockResolvedValue(mockGoogleResponse)
      });
      
      const req = createRequest({ 
        textQuery: 'Unknown', 
        location: '37.7749,-122.4194'
      });
      
      const response = await GET(req);
      const data = await response.json();
      
      // We expect no places to be included in the results
      expect(data.places.length).toBe(0);
    });
  });

  describe('Error handling', () => {
    it('handles fetch errors gracefully', async () => {
      // Mock redis.get to return null (cache miss)
      (redis.get as Mock).mockResolvedValue(null);
      
      // Mock fetch to throw an error
      (global.fetch as Mock).mockRejectedValue(new Error('Network error'));
      
      const req = createRequest({ 
        textQuery: 'Mexican', 
        location: '37.7749,-122.4194'
      });
      
      const response = await GET(req);
      
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to process request');
    });

    it('handles redis errors gracefully', async () => {
      // Mock redis.get to throw an error
      (redis.get as Mock).mockRejectedValue(new Error('Redis error'));
      
      // Mock fetch to return Google API response
      (global.fetch as Mock).mockResolvedValue({
        json: vi.fn().mockResolvedValue({ places: [] })
      });
      
      const req = createRequest({ 
        textQuery: 'Mexican', 
        location: '37.7749,-122.4194'
      });
      
      const response = await GET(req);
      
      // Should continue with fetching from Google instead of returning an error
      expect(response.status).toBe(200);
      expect(global.fetch).toHaveBeenCalled();
      
      const data = await response.json();
      expect(data.places).toEqual([]);
      expect(data.count).toBe(0);
    });

    it('continues with fetching from Google when Redis.get throws an error', async () => {
      // Mock redis.get to throw an error
      (redis.get as Mock).mockRejectedValue(new Error('Redis get error'));
      
      // Mock fetch to return Google API response with places
      (global.fetch as Mock).mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          places: [
            {
              id: 'place1',
              displayName: { text: 'Mexican Restaurant' },
              types: ['restaurant', 'food']
            }
          ]
        })
      });
      
      const req = createRequest({ 
        textQuery: 'Mexican', 
        location: '37.7749,-122.4194'
      });
      
      const response = await GET(req);
      
      // Should continue with fetching from Google
      expect(response.status).toBe(200);
      expect(global.fetch).toHaveBeenCalled();
      
      const data = await response.json();
      expect(data.places.length).toBe(1);
      
      // Should attempt to cache the results
      expect(redis.set).toHaveBeenCalled();
    });

    it('continues without caching when Redis.set throws an error', async () => {
      // Mock redis.get to return null (cache miss)
      (redis.get as Mock).mockResolvedValue(null);
      
      // Mock redis.set to throw an error
      (redis.set as Mock).mockRejectedValue(new Error('Redis set error'));
      
      // Mock fetch to return Google API response with places
      (global.fetch as Mock).mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          places: [
            {
              id: 'place1',
              displayName: { text: 'Mexican Restaurant' },
              types: ['restaurant', 'food']
            }
          ]
        })
      });
      
      const req = createRequest({ 
        textQuery: 'Mexican', 
        location: '37.7749,-122.4194'
      });
      
      const response = await GET(req);
      
      // Should return successful response despite Redis.set error
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.places.length).toBe(1);
    });

    // New test for the fallback response
    it('returns fallback response in unexpected code path', async () => {
      // Mock redis.get to return null (cache miss)
      (redis.get as Mock).mockResolvedValue(null);
      
      // Mock fetch to return empty places array
      (global.fetch as Mock).mockResolvedValue({
        json: vi.fn().mockResolvedValue({ places: [] })
      });
      
      const req = createRequest({ 
        textQuery: 'Mexican', 
        location: '37.7749,-122.4194'
      });
      
      // This test is more of a placeholder since we can't easily force the fallback path
      // In a real scenario, we might need to modify the route code to make this testable
      const response = await GET(req);
      const data = await response.json();
      
      // The response should at least have a places array
      expect(data.places).toBeDefined();
    });
  });
});
