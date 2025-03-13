import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterAll,
  beforeAll,
} from 'vitest';
import { GET, POST } from '@/app/api/places/favorite/route';
import { prisma } from '@/lib/db';

// Mock dependencies
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'default_mock_id' }),
}));

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    place: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    favorite: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('Favorite API Routes', () => {
  // Mock system time
  const mockDate = new Date('2023-01-01T12:00:00Z');
  const mockDateString = mockDate.toISOString();

  const mockClerkId = 'clerk_123';
  const mockUserId = 'user_123';
  const mockPlaceId = 'place_123';
  const mockFavoriteId = 'favorite_123';

  // Create mock objects with consistent timestamps
  const mockUser = {
    id: mockUserId,
    clerkId: mockClerkId,
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    imageUrl: 'https://example.com/avatar.jpg',
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockPlace = {
    id: mockPlaceId,
    name: 'Test Place',
    description: 'A test place',
    latitude: 123.456,
    longitude: 789.012,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockFavorite = {
    id: mockFavoriteId,
    userId: mockUserId,
    placeId: mockPlaceId,
    createdAt: mockDate,
  };

  // Create serialized versions of our mock objects for response comparison
  const serializedMockPlace = {
    ...mockPlace,
    createdAt: mockDateString,
    updatedAt: mockDateString,
  };

  const serializedMockFavorite = {
    ...mockFavorite,
    createdAt: mockDateString,
  };

  // Setup fake timers before all tests
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  beforeEach(() => {
    vi.resetAllMocks();
    // Default auth mock
    // @ts-expect-error - Mocking auth object
    vi.mocked(auth).mockResolvedValue({ userId: mockClerkId } as unknown);
  });

  // Restore real time after all tests
  afterAll(() => {
    vi.useRealTimers();
  });

  describe('GET /api/places/favorite', () => {
    it('returns 401 if user is not authenticated', async () => {
      // Mock unauthenticated user
      // @ts-expect-error - Mocking auth object
      vi.mocked(auth).mockResolvedValueOnce({ userId: null } as unknown);

      const request = new NextRequest(
        'http://localhost:3000/api/places/favorite?id=place_123'
      );
      const response = await GET(request);

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: 'Unauthorized' });
    });

    it('returns 400 if place ID is not provided', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/places/favorite'
      );
      const response = await GET(request);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: 'Place ID is required in query params',
      });
    });

    it('returns 404 if user is not found', async () => {
      // Mock user not found
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

      const request = new NextRequest(
        'http://localhost:3000/api/places/favorite?id=place_123'
      );
      const response = await GET(request);

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: 'User not found' });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { clerkId: mockClerkId },
      });
    });

    it('returns isFavorite=false if place is not found', async () => {
      // Mock user found but place not found
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);
      vi.mocked(prisma.place.findUnique).mockResolvedValueOnce(null);

      const request = new NextRequest(
        'http://localhost:3000/api/places/favorite?id=place_123'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        isFavorite: false,
        message: 'Place not found',
      });
    });

    it('returns isFavorite=false if place is not favorited', async () => {
      // Mock user and place found, but no favorite
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);
      vi.mocked(prisma.place.findUnique).mockResolvedValueOnce(mockPlace);
      vi.mocked(prisma.favorite.findUnique).mockResolvedValueOnce(null);

      const request = new NextRequest(
        'http://localhost:3000/api/places/favorite?id=place_123'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const responseData = await response.json();
      expect(responseData.isFavorite).toBe(false);
      expect(responseData.place).toEqual(serializedMockPlace);
    });

    it('returns isFavorite=true if place is favorited', async () => {
      // Mock user, place, and favorite found
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);
      vi.mocked(prisma.place.findUnique).mockResolvedValueOnce(mockPlace);
      vi.mocked(prisma.favorite.findUnique).mockResolvedValueOnce(mockFavorite);

      const request = new NextRequest(
        'http://localhost:3000/api/places/favorite?id=place_123'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const responseData = await response.json();
      expect(responseData.isFavorite).toBe(true);
      expect(responseData.place).toEqual(serializedMockPlace);
      expect(responseData.favorite).toEqual(serializedMockFavorite);
    });

    it('handles errors gracefully', async () => {
      // Mock an error
      vi.mocked(prisma.user.findUnique).mockRejectedValueOnce(
        new Error('Database error')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/places/favorite?id=place_123'
      );
      const response = await GET(request);

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: 'Failed to check favorite status',
      });
    });
  });

  describe('POST /api/places/favorite', () => {
    const createMockRequest = (body: Record<string, unknown>) => {
      return new NextRequest('http://localhost:3000/api/places/favorite', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    };

    it('returns 401 if user is not authenticated', async () => {
      // Mock unauthenticated user
      // @ts-expect-error - Mocking auth object
      vi.mocked(auth).mockResolvedValueOnce({ userId: null } as unknown);

      const request = createMockRequest({ id: mockPlaceId });
      const response = await POST(request);

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: 'Unauthorized' });
    });

    it('returns 400 if place ID is not provided', async () => {
      const request = createMockRequest({});
      const response = await POST(request);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: 'Place ID is required' });
    });

    it('returns 404 if user is not found', async () => {
      // Mock user not found
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

      const request = createMockRequest({ id: mockPlaceId });
      const response = await POST(request);

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: 'User not found' });
    });

    it('creates a new place if it does not exist', async () => {
      // Mock user found but place not found
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);
      vi.mocked(prisma.place.findUnique).mockResolvedValueOnce(null);
      vi.mocked(prisma.place.create).mockResolvedValueOnce(mockPlace);
      vi.mocked(prisma.favorite.findUnique).mockResolvedValueOnce(null);
      vi.mocked(prisma.favorite.create).mockResolvedValueOnce(mockFavorite);

      const request = createMockRequest({
        id: mockPlaceId,
        name: 'Test Place',
        latitude: 123.456,
        longitude: 789.012,
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(prisma.place.create).toHaveBeenCalled();
      const responseData = await response.json();
      expect(responseData.action).toBe('added');
      expect(responseData.place).toEqual(serializedMockPlace);
    });

    it('adds a favorite if it does not exist', async () => {
      // Mock user and place found, but no favorite
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);
      vi.mocked(prisma.place.findUnique).mockResolvedValueOnce(mockPlace);
      vi.mocked(prisma.favorite.findUnique).mockResolvedValueOnce(null);
      vi.mocked(prisma.favorite.create).mockResolvedValueOnce(mockFavorite);

      const request = createMockRequest({ id: mockPlaceId });
      const response = await POST(request);

      expect(response.status).toBe(200);
      const responseData = await response.json();
      expect(responseData.action).toBe('added');
      expect(responseData.favorite).toEqual(serializedMockFavorite);
      expect(prisma.favorite.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          placeId: mockPlaceId,
        },
      });
    });

    it('removes a favorite if it already exists', async () => {
      // Mock user, place, and favorite found
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);
      vi.mocked(prisma.place.findUnique).mockResolvedValueOnce(mockPlace);
      vi.mocked(prisma.favorite.findUnique).mockResolvedValueOnce(mockFavorite);

      const request = createMockRequest({ id: mockPlaceId });
      const response = await POST(request);

      expect(response.status).toBe(200);
      const responseData = await response.json();
      expect(responseData.action).toBe('removed');
      expect(prisma.favorite.delete).toHaveBeenCalledWith({
        where: {
          id: mockFavoriteId,
        },
      });
    });

    it('handles errors gracefully', async () => {
      // Mock an error
      vi.mocked(prisma.user.findUnique).mockRejectedValueOnce(
        new Error('Database error')
      );

      const request = createMockRequest({ id: mockPlaceId });
      const response = await POST(request);

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: 'Failed to process favorite',
      });
    });
  });
});
