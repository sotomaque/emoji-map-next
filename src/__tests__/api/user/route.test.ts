import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { currentUser, type User as ClerkUser } from '@clerk/nextjs/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET, POST } from '@/app/api/user/route';
import { prisma } from '@/lib/db';
import type { User, Favorite, Rating } from '@prisma/client';

// Mock dependencies
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Create a proper mock for NextRequest
class MockNextRequest {
  nextUrl: URL;

  constructor(url: string) {
    this.nextUrl = new URL(url);
  }
}

vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: vi.fn((data, options) => ({ data, options })),
    },
    NextRequest: vi.fn().mockImplementation((url) => {
      return new MockNextRequest(url);
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

  describe('POST /api/user', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Mock currentUser to return null (unauthenticated)
      vi.mocked(currentUser).mockResolvedValue(null);

      await POST();

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    });

    const mockAuthenticatedClerkUser = {
      id: 'user_123',
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      imageUrl: 'https://example.com/image.jpg',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    } as unknown as ClerkUser;

    it('should return existing user if found in database', async () => {
      vi.mocked(currentUser).mockResolvedValue(mockAuthenticatedClerkUser);

      // Mock existing user in database
      const mockDbUser: User = {
        id: 'user_123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        imageUrl: 'https://example.com/image.jpg',
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE,
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockDbUser);

      await POST();

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user_123' },
      });
      expect(NextResponse.json).toHaveBeenCalledWith({ user: mockDbUser });
    });

    it('should create a new user if not found in database', async () => {
      vi.mocked(currentUser).mockResolvedValue(mockAuthenticatedClerkUser);

      // Mock user not found in database
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      // Mock user creation
      const mockNewUser: User = {
        id: 'user_123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        imageUrl: 'https://example.com/image.jpg',
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE,
      };
      vi.mocked(prisma.user.create).mockResolvedValue(mockNewUser);

      await POST();

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user_123' },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          id: 'user_123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          username: 'testuser',
          imageUrl: 'https://example.com/image.jpg',
          createdAt: FIXED_DATE,
          updatedAt: FIXED_DATE,
        },
      });
      expect(NextResponse.json).toHaveBeenCalledWith({ user: mockNewUser });
    });

    it('should handle errors and return 500 status', async () => {
      vi.mocked(currentUser).mockResolvedValue(mockAuthenticatedClerkUser);

      // Mock database error
      vi.mocked(prisma.user.findUnique).mockRejectedValue(
        new Error('Database error')
      );

      // Spy on console.error instead of mocking it
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await POST();

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to create user' },
        { status: 500 }
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('GET /api/user', () => {
    it('should return a 400 if no userId is provided', async () => {
      const mockRequest = new MockNextRequest('https://example.com/api/user');

      await GET(mockRequest as unknown as NextRequest);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized' },
        { status: 400 }
      );
    });

    it('should return 404 if user is not found in database', async () => {
      // Create a mock request with userId
      const mockRequest = new MockNextRequest(
        'https://example.com/api/user?userId=user_123'
      );

      // Mock user not found in database
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await GET(mockRequest as unknown as NextRequest);

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
      // Create a mock request with userId
      const mockRequest = new MockNextRequest(
        'https://example.com/api/user?userId=user_123'
      );

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
      // Create a mock request with userId
      const mockRequest = new MockNextRequest(
        'https://example.com/api/user?userId=user_123'
      );

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
      // Create a mock request with userId
      const mockRequest = new MockNextRequest(
        'https://example.com/api/user?userId=user_123'
      );

      // Mock database error
      vi.mocked(prisma.user.findUnique).mockRejectedValue(
        new Error('Database error')
      );

      // Spy on console.error
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await GET(mockRequest as unknown as NextRequest);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch user' },
        { status: 500 }
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
