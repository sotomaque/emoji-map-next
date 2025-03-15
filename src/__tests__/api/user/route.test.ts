import { NextResponse } from 'next/server';
import {
  auth,
  currentUser,
  type User as ClerkUser,
} from '@clerk/nextjs/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET, POST } from '@/app/api/user/route';
import { prisma } from '@/lib/db';
import { log } from '@/utils/log';
import type { User } from '@prisma/client';

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

vi.mock('@/utils/log', () => ({
  log: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('next/server', () => {
  const originalModule = vi.importActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      json: vi.fn((data, options) => ({ data, options })),
    },
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

      // Mock console.error to prevent test output pollution
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
    it('should return 401 if user is not authenticated', async () => {
      // Mock auth to return null userId (unauthenticated)
      // @ts-expect-error Mocking auth
      vi.mocked(auth).mockResolvedValue({ userId: null });

      await GET();

      expect(log.debug).toHaveBeenCalledWith('userId', { userId: null });
      expect(log.error).toHaveBeenCalledWith('Unauthorized no userId');
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    });

    it('should return 404 if user is not found in database', async () => {
      // Mock authenticated user
      // @ts-expect-error Mocking auth
      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' });

      // Mock user not found in database
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await GET();

      expect(log.debug).toHaveBeenCalledWith('userId', { userId: 'user_123' });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user_123' },
      });
      expect(log.debug).toHaveBeenCalledWith('dbUser', { dbUser: null });
      expect(log.error).toHaveBeenCalledWith('User not found in database');
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'User not found in database' },
        { status: 404 }
      );
    });

    it('should return user if found in database', async () => {
      // Mock authenticated user
      // @ts-expect-error Mocking auth
      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' });

      // Mock user found in database
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

      await GET();

      expect(log.debug).toHaveBeenCalledWith('userId', { userId: 'user_123' });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user_123' },
      });
      expect(log.debug).toHaveBeenCalledWith('dbUser', { dbUser: mockDbUser });
      expect(NextResponse.json).toHaveBeenCalledWith({ user: mockDbUser });
    });

    it('should handle errors and return 500 status', async () => {
      // Mock authenticated user
      // @ts-expect-error Mocking auth
      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' });

      // Mock database error
      vi.mocked(prisma.user.findUnique).mockRejectedValue(
        new Error('Database error')
      );

      // Mock console.error to prevent test output pollution
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await GET();

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch user' },
        { status: 500 }
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
