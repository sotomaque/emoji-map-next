import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '@/app/api/user/route';
import { prisma } from '@/lib/db';
import { getUserId } from '@/services/user/get-user-id';
import type { User, Favorite, Rating } from '@prisma/client';

// Mock dependencies
vi.mock('@clerk/nextjs/server', () => ({
  createClerkClient: vi.fn().mockReturnValue({
    authenticateRequest: vi.fn().mockResolvedValue({
      toAuth: vi.fn().mockReturnValue({ userId: 'user_123' }),
    }),
  }),
}));

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('@/services/user/get-user-id', () => ({
  getUserId: vi.fn(),
}));

// Create a proper mock for NextRequest
class MockNextRequest {
  nextUrl: URL;
  headers: Headers;

  constructor(url: string, headers: Record<string, string> = {}) {
    this.nextUrl = new URL(url);
    this.headers = new Headers(headers);
  }

  clone() {
    return this;
  }
}

vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: vi.fn((data, options) => ({ data, options })),
    },
    NextRequest: vi.fn().mockImplementation((url, init) => {
      return new MockNextRequest(url, init?.headers);
    }),
  };
});

describe('User API Routes', () => {
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

  describe('GET /api/user', () => {
    it('should return a 500 if getUserId throws an Unauthorized error', async () => {
      const mockRequest = new MockNextRequest('https://example.com/api/user', {
        authorization: 'Bearer token',
      });

      // Mock getUserId to throw Unauthorized error
      vi.mocked(getUserId).mockRejectedValue(new Error('Unauthorized'));

      await GET(mockRequest as unknown as NextRequest);

      expect(getUserId).toHaveBeenCalledWith(mockRequest);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch user' },
        { status: 500 }
      );
    });

    it('should return 404 if user is not found in database', async () => {
      // Create a mock request with authorization header
      const mockRequest = new MockNextRequest('https://example.com/api/user', {
        authorization: 'Bearer token',
      });

      // Mock getUserId to return a userId
      vi.mocked(getUserId).mockResolvedValue('user_123');

      // Mock user not found in database
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await GET(mockRequest as unknown as NextRequest);

      expect(getUserId).toHaveBeenCalledWith(mockRequest);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user_123' },
        include: {
          favorites: true,
          ratings: true,
        },
      });
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'User not found in database' },
        { status: 404 }
      );
    });

    it('should return user if found in database', async () => {
      // Create a mock request with authorization header
      const mockRequest = new MockNextRequest('https://example.com/api/user', {
        authorization: 'Bearer token',
      });

      // Mock getUserId to return a userId
      vi.mocked(getUserId).mockResolvedValue('user_123');

      // Mock user found in database with favorites and ratings
      const mockDbUser = {
        id: 'user_123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        imageUrl: 'https://example.com/image.jpg',
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE,
        favorites: [] as Favorite[],
        ratings: [] as Rating[],
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        mockDbUser as User & { favorites: Favorite[]; ratings: Rating[] }
      );

      await GET(mockRequest as unknown as NextRequest);

      expect(getUserId).toHaveBeenCalledWith(mockRequest);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user_123' },
        include: {
          favorites: true,
          ratings: true,
        },
      });
      expect(NextResponse.json).toHaveBeenCalledWith({
        user: mockDbUser,
        status: 200,
      });
    });

    it('should return user with ratings if found in database', async () => {
      // Create a mock request with authorization header
      const mockRequest = new MockNextRequest('https://example.com/api/user', {
        authorization: 'Bearer token',
      });

      // Mock getUserId to return a userId
      vi.mocked(getUserId).mockResolvedValue('user_123');

      // Mock user found in database with favorites and ratings
      const mockRatings = [
        {
          id: 'rating_1',
          userId: 'user_123',
          placeId: 'place_1',
          rating: 4,
          createdAt: FIXED_DATE,
          updatedAt: FIXED_DATE,
        },
        {
          id: 'rating_2',
          userId: 'user_123',
          placeId: 'place_2',
          rating: 5,
          createdAt: FIXED_DATE,
          updatedAt: FIXED_DATE,
        },
      ] as Rating[];

      const mockDbUser = {
        id: 'user_123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        imageUrl: 'https://example.com/image.jpg',
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE,
        favorites: [] as Favorite[],
        ratings: mockRatings,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(
        mockDbUser as User & { favorites: Favorite[]; ratings: Rating[] }
      );

      await GET(mockRequest as unknown as NextRequest);

      expect(getUserId).toHaveBeenCalledWith(mockRequest);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user_123' },
        include: {
          favorites: true,
          ratings: true,
        },
      });
      expect(NextResponse.json).toHaveBeenCalledWith({
        user: mockDbUser,
        status: 200,
      });
    });

    it('should handle errors and return 500 status', async () => {
      // Create a mock request with authorization header
      const mockRequest = new MockNextRequest('https://example.com/api/user', {
        authorization: 'Bearer token',
      });

      // Mock getUserId to return a userId
      vi.mocked(getUserId).mockResolvedValue('user_123');

      // Mock database error
      vi.mocked(prisma.user.findUnique).mockRejectedValue(
        new Error('Database error')
      );

      // Spy on console.error
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await GET(mockRequest as unknown as NextRequest);

      expect(getUserId).toHaveBeenCalledWith(mockRequest);
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch user' },
        { status: 500 }
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
