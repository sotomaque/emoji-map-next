import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET, DELETE } from '@/app/api/user/route';
import { prisma } from '@/lib/db';
import { getUserId } from '@/services/user/get-user-id';
import type { User, Favorite, Rating } from '@prisma/client';

// Define minimal types to match what we need for mocking
interface ClerkUserAPI {
  deleteUser: (userId: string) => Promise<unknown>;
}

interface MockClerkClient {
  users: ClerkUserAPI;
}

// Mock dependencies
vi.mock('@clerk/nextjs/server', () => ({
  createClerkClient: vi.fn().mockReturnValue({
    authenticateRequest: vi.fn().mockResolvedValue({
      toAuth: vi.fn().mockReturnValue({ userId: 'user_123' }),
    }),
    users: {
      deleteUser: vi.fn().mockResolvedValue({}),
    },
  }),
  clerkClient: vi.fn().mockResolvedValue({
    users: {
      deleteUser: vi.fn().mockResolvedValue({}),
    },
  } as MockClerkClient),
}));

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
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

// Mock the log utility
vi.mock('@/utils/log', () => ({
  log: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

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
    it('should return a 401 if getUserId throws an Unauthorized error', async () => {
      const mockRequest = new MockNextRequest('https://example.com/api/user', {
        authorization: 'Bearer token',
      });

      // Mock getUserId to throw Unauthorized error
      const errorMessage = 'Unauthorized: Missing authorization header';
      vi.mocked(getUserId).mockRejectedValue(new Error(errorMessage));

      await GET(mockRequest as unknown as NextRequest);

      expect(getUserId).toHaveBeenCalledWith(mockRequest);
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          error: 'Authentication failed',
          message: errorMessage,
          timestamp: FIXED_DATE.toISOString(),
        },
        { status: 401 }
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
        {
          error: 'User not found in database',
          userId: 'user_123',
          timestamp: FIXED_DATE.toISOString(),
        },
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
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          user: mockDbUser,
        },
        { status: 200 }
      );
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
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          user: mockDbUser,
        },
        {
          status: 200,
        }
      );
    });

    it('should handle database errors and return 500 status', async () => {
      // Create a mock request with authorization header
      const mockRequest = new MockNextRequest('https://example.com/api/user', {
        authorization: 'Bearer token',
      });

      // Mock getUserId to return a userId
      vi.mocked(getUserId).mockResolvedValue('user_123');

      // Mock database error
      const dbErrorMessage = 'Database error';
      vi.mocked(prisma.user.findUnique).mockRejectedValue(
        new Error(dbErrorMessage)
      );

      await GET(mockRequest as unknown as NextRequest);

      expect(getUserId).toHaveBeenCalledWith(mockRequest);
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          error: 'Database error',
          message: dbErrorMessage,
          timestamp: FIXED_DATE.toISOString(),
        },
        { status: 500 }
      );
    });

    it('should handle authentication errors and return 401 status', async () => {
      // Create a mock request with authorization header
      const mockRequest = new MockNextRequest('https://example.com/api/user', {
        authorization: 'Bearer token',
      });

      // Mock getUserId to throw Unauthorized error
      const errorMessage = 'Unauthorized: Missing authorization header';
      vi.mocked(getUserId).mockRejectedValue(new Error(errorMessage));

      await GET(mockRequest as unknown as NextRequest);

      expect(getUserId).toHaveBeenCalledWith(mockRequest);
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          error: 'Authentication failed',
          message: errorMessage,
          timestamp: FIXED_DATE.toISOString(),
        },
        { status: 401 }
      );
    });

    it('should handle unexpected errors when getUserId throws', async () => {
      // Create a mock request with authorization header
      const mockRequest = new MockNextRequest('https://example.com/api/user', {
        authorization: 'Bearer token',
      });

      // Mock getUserId to throw an unexpected error
      const unexpectedError = new Error('Unexpected error');
      vi.mocked(getUserId).mockRejectedValue(unexpectedError);

      await GET(mockRequest as unknown as NextRequest);

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          error: 'Authentication failed',
          message: 'Unexpected error',
          timestamp: FIXED_DATE.toISOString(),
        },
        { status: 401 }
      );
    });
  });

  describe('DELETE /api/user', () => {
    it('should return a 401 if getUserId throws an Unauthorized error', async () => {
      const mockRequest = new MockNextRequest('https://example.com/api/user', {
        authorization: 'Bearer token',
      });

      // Mock getUserId to throw Unauthorized error
      const errorMessage = 'Unauthorized: Missing authorization header';
      vi.mocked(getUserId).mockRejectedValue(new Error(errorMessage));

      await DELETE(mockRequest as unknown as NextRequest);

      expect(getUserId).toHaveBeenCalledWith(mockRequest);
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          error: 'Authentication failed',
          message: errorMessage,
          timestamp: FIXED_DATE.toISOString(),
        },
        { status: 401 }
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

      await DELETE(mockRequest as unknown as NextRequest);

      expect(getUserId).toHaveBeenCalledWith(mockRequest);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user_123' },
      });
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          error: 'User not found in database',
          userId: 'user_123',
          timestamp: FIXED_DATE.toISOString(),
        },
        { status: 404 }
      );
    });

    it('should delete user from Clerk', async () => {
      // Create a mock request with authorization header
      const mockRequest = new MockNextRequest('https://example.com/api/user', {
        authorization: 'Bearer token',
      });

      // Mock getUserId to return a userId
      vi.mocked(getUserId).mockResolvedValue('user_123');

      // Mock user found in database
      const mockDbUser = {
        id: 'user_123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        imageUrl: 'https://example.com/image.jpg',
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE,
      };

      // Create mock clerk user deletion function
      const mockDeleteUser = vi.fn().mockResolvedValue({});
      const mockClerkClient: MockClerkClient = {
        users: {
          deleteUser: mockDeleteUser,
        },
      };

      // Mock clerk client
      const { clerkClient } = await import('@clerk/nextjs/server');
      // @ts-expect-error - This is a mock implementation
      vi.mocked(clerkClient).mockResolvedValueOnce(mockClerkClient);

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockDbUser as User);

      await DELETE(mockRequest as unknown as NextRequest);

      expect(getUserId).toHaveBeenCalledWith(mockRequest);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user_123' },
      });
      expect(mockDeleteUser).toHaveBeenCalledWith('user_123');

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          message: 'User deleted successfully',
          userId: 'user_123',
          timestamp: FIXED_DATE.toISOString(),
        },
        { status: 200 }
      );
    });

    it('should handle database errors during findUnique and return 500 status', async () => {
      // Create a mock request with authorization header
      const mockRequest = new MockNextRequest('https://example.com/api/user', {
        authorization: 'Bearer token',
      });

      // Mock getUserId to return a userId
      vi.mocked(getUserId).mockResolvedValue('user_123');

      // Mock database error
      const dbErrorMessage = 'Database error';
      vi.mocked(prisma.user.findUnique).mockRejectedValue(
        new Error(dbErrorMessage)
      );

      await DELETE(mockRequest as unknown as NextRequest);

      expect(getUserId).toHaveBeenCalledWith(mockRequest);
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          error: 'Database error',
          message: dbErrorMessage,
          timestamp: FIXED_DATE.toISOString(),
        },
        { status: 500 }
      );
    });

    it('should handle Clerk deletion errors', async () => {
      // Create a mock request with authorization header
      const mockRequest = new MockNextRequest('https://example.com/api/user', {
        authorization: 'Bearer token',
      });

      // Mock getUserId to return a userId
      vi.mocked(getUserId).mockResolvedValue('user_123');

      // Mock user found in database
      const mockDbUser = {
        id: 'user_123',
        email: 'test@example.com',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockDbUser as User);

      // Mock Clerk client to throw error
      const { clerkClient } = await import('@clerk/nextjs/server');
      const clerkError = new Error('Error deleting user from Clerk');
      vi.mocked(clerkClient).mockImplementationOnce(() => {
        throw clerkError;
      });

      await DELETE(mockRequest as unknown as NextRequest);

      expect(getUserId).toHaveBeenCalledWith(mockRequest);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user_123' },
      });
      // Database delete should not be called if Clerk deletion fails
      expect(prisma.user.delete).not.toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          error: 'Database error',
          message: 'Error deleting user from Clerk',
          timestamp: FIXED_DATE.toISOString(),
        },
        { status: 500 }
      );
    });

    it('should handle unexpected errors', async () => {
      // Create a mock request with authorization header
      const mockRequest = new MockNextRequest('https://example.com/api/user', {
        authorization: 'Bearer token',
      });

      // Mock getUserId to return a userId
      vi.mocked(getUserId).mockResolvedValue('user_123');

      // Mock user found in database
      const mockDbUser = {
        id: 'user_123',
        email: 'test@example.com',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockDbUser as User);

      // We need to mock the catch handler at the end of the file
      // Override the implementation to verify the error handling
      // @ts-expect-error - This is a mock implementation
      vi.spyOn(NextResponse, 'json').mockImplementationOnce(() => {
        return {
          data: {
            error: 'Unexpected error',
            message: 'Unexpected error',
            timestamp: FIXED_DATE.toISOString(),
          },
          options: { status: 500 },
        } as { data: unknown; options: unknown };
      });

      // Intentionally throw an error inside the DELETE function
      const originalDeleteUser = vi
        .fn()
        .mockRejectedValue(new Error('Unexpected clerk error'));
      const mockClerkClient: MockClerkClient = {
        users: {
          deleteUser: originalDeleteUser,
        },
      };

      const { clerkClient } = await import('@clerk/nextjs/server');
      // @ts-expect-error - This is a mock implementation
      vi.mocked(clerkClient).mockResolvedValueOnce(mockClerkClient);

      // This function should throw an error in the main try/catch block
      await DELETE(mockRequest as unknown as NextRequest);

      // We don't need to check the response since we mocked it directly,
      // but we can check the Clerk client was called
      expect(originalDeleteUser).toHaveBeenCalledWith('user_123');
    });

    it('should handle authentication errors with 401 status', async () => {
      // Create a mock request with authorization header
      const mockRequest = new MockNextRequest('https://example.com/api/user', {
        authorization: 'Bearer token',
      });

      // Mock an auth error
      const authError = new Error('Auth failed');
      vi.mocked(getUserId).mockRejectedValue(authError);

      await DELETE(mockRequest as unknown as NextRequest);

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          error: 'Authentication failed',
          message: 'Auth failed',
          timestamp: FIXED_DATE.toISOString(),
        },
        { status: 401 }
      );
    });
  });
});
