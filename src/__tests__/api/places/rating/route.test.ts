import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/places/rating/route';
import { prisma } from '@/lib/db';
import type { User, Place, Rating } from '@prisma/client';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    place: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    rating: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock NextRequest
class MockNextRequest {
  private body: Record<string, unknown>;

  constructor(body: Record<string, unknown>) {
    this.body = body;
  }

  async json() {
    return this.body;
  }
}

vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: vi.fn((data, options) => ({ data, options })),
    },
  };
});

// Mock logger
vi.mock('@/utils/log', () => ({
  log: {
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Rating API Routes', () => {
  // Fixed mock date for all tests
  const FIXED_DATE = new Date('2023-01-01T12:00:00Z');

  beforeEach(() => {
    vi.clearAllMocks();
    // Use fake timers and set a fixed system time
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_DATE);
  });

  afterEach(() => {
    // Restore real timers after each test
    vi.useRealTimers();
  });

  describe('POST /api/places/rating', () => {
    it('should return 401 if userId is not provided', async () => {
      const mockRequest = new MockNextRequest({}) as unknown as NextRequest;

      await POST(mockRequest);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    });

    it('should return 400 if placeId is not provided', async () => {
      const mockRequest = new MockNextRequest({
        userId: 'user_123',
      }) as unknown as NextRequest;

      await POST(mockRequest);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Place ID is required' },
        { status: 400 }
      );
    });

    it('should return 400 if rating is not provided for a new rating', async () => {
      const mockRequest = new MockNextRequest({
        userId: 'user_123',
        place_id: 'place_123',
      }) as unknown as NextRequest;

      // Mock user found
      const mockUser: User = {
        id: 'user_123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        imageUrl: 'https://example.com/image.jpg',
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE,
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      // Mock place found
      const mockPlace: Place = {
        id: 'place_123',
        name: null,
        description: null,
        latitude: null,
        longitude: null,
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE,
      };
      vi.mocked(prisma.place.findUnique).mockResolvedValue(mockPlace);

      // Mock no existing rating found
      vi.mocked(prisma.rating.findUnique).mockResolvedValue(null);

      await POST(mockRequest);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Rating is required' },
        { status: 400 }
      );
    });

    it('should remove an existing rating if no new rating is provided', async () => {
      const mockRequest = new MockNextRequest({
        userId: 'user_123',
        place_id: 'place_123',
      }) as unknown as NextRequest;

      // Mock user found
      const mockUser: User = {
        id: 'user_123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        imageUrl: 'https://example.com/image.jpg',
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE,
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      // Mock place found
      const mockPlace: Place = {
        id: 'place_123',
        name: null,
        description: null,
        latitude: null,
        longitude: null,
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE,
      };
      vi.mocked(prisma.place.findUnique).mockResolvedValue(mockPlace);

      // Mock existing rating found
      const existingRating: Rating = {
        id: 'rating_123',
        userId: 'user_123',
        placeId: 'place_123',
        rating: 4,
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE,
      };
      vi.mocked(prisma.rating.findUnique).mockResolvedValue(existingRating);

      // Mock rating deletion (since no rating is provided, it should delete existing)
      vi.mocked(prisma.rating.delete).mockResolvedValue(existingRating);

      await POST(mockRequest);

      // The implementation should delete the rating if no new rating is provided
      expect(prisma.rating.delete).toHaveBeenCalledWith({
        where: { id: 'rating_123' },
      });
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          message: 'Rating removed',
          place: mockPlace,
          rating: existingRating,
          action: 'removed',
        },
        { status: 200 }
      );
    });

    it('should return 404 if user is not found', async () => {
      const mockRequest = new MockNextRequest({
        userId: 'user_123',
        place_id: 'place_123',
        rating: 4,
      }) as unknown as NextRequest;

      // Mock user not found
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await POST(mockRequest);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user_123' },
      });
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'User not found' },
        { status: 404 }
      );
    });

    it('should create a new place if it does not exist', async () => {
      const mockRequest = new MockNextRequest({
        userId: 'user_123',
        place_id: 'place_123',
        rating: 4,
      }) as unknown as NextRequest;

      // Mock user found
      const mockUser: User = {
        id: 'user_123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        imageUrl: 'https://example.com/image.jpg',
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE,
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      // Mock place not found
      vi.mocked(prisma.place.findUnique).mockResolvedValue(null);

      // Mock place creation
      const mockPlace: Place = {
        id: 'place_123',
        name: null,
        description: null,
        latitude: null,
        longitude: null,
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE,
      };
      vi.mocked(prisma.place.create).mockResolvedValue(mockPlace);

      // Mock rating not found
      vi.mocked(prisma.rating.findUnique).mockResolvedValue(null);

      // Mock rating creation
      const mockRating: Rating = {
        id: 'rating_123',
        userId: 'user_123',
        placeId: 'place_123',
        rating: 4,
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE,
      };
      vi.mocked(prisma.rating.create).mockResolvedValue(mockRating);

      await POST(mockRequest);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user_123' },
      });
      expect(prisma.place.findUnique).toHaveBeenCalledWith({
        where: { id: 'place_123' },
      });
      expect(prisma.place.create).toHaveBeenCalledWith({
        data: {
          id: 'place_123',
        },
      });
      expect(prisma.rating.findUnique).toHaveBeenCalledWith({
        where: {
          userId_placeId: {
            userId: 'user_123',
            placeId: 'place_123',
          },
        },
      });
      expect(prisma.rating.create).toHaveBeenCalledWith({
        data: {
          userId: 'user_123',
          placeId: 'place_123',
          rating: 4,
        },
      });
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          message: 'Rating added',
          place: mockPlace,
          rating: mockRating,
          action: 'added',
        },
        { status: 200 }
      );
    });

    it('should update an existing rating', async () => {
      const mockRequest = new MockNextRequest({
        userId: 'user_123',
        place_id: 'place_123',
        rating: 5,
      }) as unknown as NextRequest;

      // Mock user found
      const mockUser: User = {
        id: 'user_123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        imageUrl: 'https://example.com/image.jpg',
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE,
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      // Mock place found
      const mockPlace: Place = {
        id: 'place_123',
        name: null,
        description: null,
        latitude: null,
        longitude: null,
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE,
      };
      vi.mocked(prisma.place.findUnique).mockResolvedValue(mockPlace);

      // Mock existing rating found
      const existingRating: Rating = {
        id: 'rating_123',
        userId: 'user_123',
        placeId: 'place_123',
        rating: 4, // Previous rating
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE,
      };
      vi.mocked(prisma.rating.findUnique).mockResolvedValue(existingRating);

      // Mock rating update
      const updatedRating: Rating = {
        id: 'rating_123',
        userId: 'user_123',
        placeId: 'place_123',
        rating: 5, // Updated rating
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE,
      };
      vi.mocked(prisma.rating.update).mockResolvedValue(updatedRating);

      await POST(mockRequest);

      expect(prisma.rating.update).toHaveBeenCalledWith({
        where: { id: 'rating_123' },
        data: { rating: 5 },
      });
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          message: 'Rating updated',
          place: mockPlace,
          rating: updatedRating,
          action: 'updated',
        },
        { status: 200 }
      );
    });

    it('should remove a rating if the same rating is submitted again', async () => {
      const mockRequest = new MockNextRequest({
        userId: 'user_123',
        place_id: 'place_123',
        rating: 4, // Same as existing rating
      }) as unknown as NextRequest;

      // Mock user found
      const mockUser: User = {
        id: 'user_123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        imageUrl: 'https://example.com/image.jpg',
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE,
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      // Mock place found
      const mockPlace: Place = {
        id: 'place_123',
        name: null,
        description: null,
        latitude: null,
        longitude: null,
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE,
      };
      vi.mocked(prisma.place.findUnique).mockResolvedValue(mockPlace);

      // Mock existing rating found with same rating
      const existingRating: Rating = {
        id: 'rating_123',
        userId: 'user_123',
        placeId: 'place_123',
        rating: 4, // Same rating
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE,
      };
      vi.mocked(prisma.rating.findUnique).mockResolvedValue(existingRating);

      // Mock rating deletion
      vi.mocked(prisma.rating.delete).mockResolvedValue(existingRating);

      await POST(mockRequest);

      expect(prisma.rating.delete).toHaveBeenCalledWith({
        where: { id: 'rating_123' },
      });
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          message: 'Rating removed',
          place: mockPlace,
          rating: existingRating,
          action: 'removed',
        },
        { status: 200 }
      );
    });

    it('should handle errors and return 500 status', async () => {
      const mockRequest = new MockNextRequest({
        userId: 'user_123',
        place_id: 'place_123',
        rating: 4,
      }) as unknown as NextRequest;

      // Mock database error
      vi.mocked(prisma.user.findUnique).mockRejectedValue(
        new Error('Database error')
      );

      await POST(mockRequest);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to process rating' },
        { status: 500 }
      );
    });
  });
});
