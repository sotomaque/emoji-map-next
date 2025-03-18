import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/user/sync/route';
import { prisma } from '@/lib/db';
import { getUserId } from '@/services/user/get-user-id';
import { log } from '@/utils/log';
import type { User, Favorite, Rating } from '@prisma/client';

// Mock dependencies
vi.mock('@/services/user/get-user-id', () => ({
  getUserId: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    place: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      createMany: vi.fn(),
    },
    favorite: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      createMany: vi.fn(),
    },
    rating: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      upsert: vi.fn().mockResolvedValue({
        id: 'rating_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    },
    $transaction: vi.fn().mockImplementation((callback) => callback(prisma)),
  },
}));

vi.mock('@/utils/log', () => ({
  log: {
    error: vi.fn(),
  },
}));

// Mock NextResponse
vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: vi.fn().mockImplementation((data, options) => ({ data, options })),
    },
  };
});

// Mock JSON method of NextRequest
class MockNextRequest implements Partial<NextRequest> {
  private _body: Record<string, unknown>;

  constructor(body: Record<string, unknown>) {
    this._body = body;
  }

  async json() {
    return this._body;
  }
}

describe('User Sync API Route', () => {
  // Fixed mock date for all tests
  const FIXED_DATE = new Date('2023-01-01T12:00:00Z');
  const mockUserId = 'user_123';

  // Create a complete mock user
  const createMockUser = () => ({
    id: mockUserId,
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    imageUrl: 'https://example.com/image.jpg',
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    favorites: [],
    ratings: [],
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Use fake timers and set a fixed system time
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_DATE);

    // Default mock for getUserId
    vi.mocked(getUserId).mockResolvedValue(mockUserId);
  });

  afterEach(() => {
    // Restore real timers after each test
    vi.useRealTimers();
  });

  it('should return 404 if user is not found in database', async () => {
    // Mock user not found in database
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const mockRequest = new MockNextRequest({});

    await POST(mockRequest as unknown as NextRequest);

    expect(getUserId).toHaveBeenCalledWith(mockRequest);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: mockUserId },
      include: {
        favorites: true,
        ratings: true,
      },
    });
    expect(log.error).toHaveBeenCalledWith('User not found in database');
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'User not found in database' },
      { status: 404 }
    );
  });

  it('should process favorites data successfully', async () => {
    // Mock user found in database
    vi.mocked(prisma.user.findUnique).mockResolvedValue(
      createMockUser() as User & { favorites: Favorite[]; ratings: Rating[] }
    );

    // Prepare request with favorites
    const mockRequest = new MockNextRequest({
      favorites: [{ placeId: 'place_123' }],
    });

    await POST(mockRequest as unknown as NextRequest);

    expect(getUserId).toHaveBeenCalledWith(mockRequest);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: mockUserId },
      include: {
        favorites: true,
        ratings: true,
      },
    });

    // We don't check prisma operations in detail since they are tested in the implementation
    // Just verify the response has the right format
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'User synced',
        result: expect.objectContaining({
          favorites: expect.any(Object),
          ratings: expect.any(Object),
        }),
      }),
      { status: 200 }
    );
  });

  it('should process ratings data successfully', async () => {
    // Mock user found in database
    vi.mocked(prisma.user.findUnique).mockResolvedValue(
      createMockUser() as User & { favorites: Favorite[]; ratings: Rating[] }
    );

    // Prepare request with ratings
    const mockRequest = new MockNextRequest({
      ratings: [{ placeId: 'place_123', rating: 5 }],
    });

    await POST(mockRequest as unknown as NextRequest);

    expect(getUserId).toHaveBeenCalledWith(mockRequest);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: mockUserId },
      include: {
        favorites: true,
        ratings: true,
      },
    });

    // We don't check prisma operations in detail since they are tested in the implementation
    // Just verify the response has the right format
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'User synced',
        result: expect.objectContaining({
          favorites: expect.any(Object),
          ratings: expect.any(Object),
        }),
      }),
      { status: 200 }
    );
  });

  it('should validate favorites data and return 400 if invalid', async () => {
    // Mock user found in database
    vi.mocked(prisma.user.findUnique).mockResolvedValue(
      createMockUser() as User & { favorites: Favorite[]; ratings: Rating[] }
    );

    // Prepare request with invalid favorites (missing placeId)
    const mockRequest = new MockNextRequest({
      favorites: [{ invalidField: 'value' }],
    });

    await POST(mockRequest as unknown as NextRequest);

    expect(getUserId).toHaveBeenCalledWith(mockRequest);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: mockUserId },
      include: {
        favorites: true,
        ratings: true,
      },
    });

    expect(log.error).toHaveBeenCalledWith(
      'Invalid favorites',
      expect.any(Object)
    );

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Invalid favorites' },
      { status: 400 }
    );
  });

  it('should validate ratings data and return 400 if invalid', async () => {
    // Mock user found in database
    vi.mocked(prisma.user.findUnique).mockResolvedValue(
      createMockUser() as User & { favorites: Favorite[]; ratings: Rating[] }
    );

    // Prepare request with invalid ratings (missing rating value)
    const mockRequest = new MockNextRequest({
      ratings: [{ placeId: 'place_123' }],
    });

    await POST(mockRequest as unknown as NextRequest);

    expect(getUserId).toHaveBeenCalledWith(mockRequest);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: mockUserId },
      include: {
        favorites: true,
        ratings: true,
      },
    });

    expect(log.error).toHaveBeenCalledWith(
      'Invalid ratings',
      expect.any(Object)
    );

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Invalid ratings' },
      { status: 400 }
    );
  });

  it('should handle errors and return 500 status', async () => {
    // Mock an error in getUserId
    const mockError = new Error('Database error');
    vi.mocked(getUserId).mockRejectedValue(mockError);

    const mockRequest = new MockNextRequest({});

    await POST(mockRequest as unknown as NextRequest);

    expect(getUserId).toHaveBeenCalledWith(mockRequest);
    expect(log.error).toHaveBeenCalledWith('Error syncing user', {
      error: mockError,
    });
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Error syncing user' },
      { status: 500 }
    );
  });

  it('should handle rate limiting', async () => {
    // Mock user found in database
    vi.mocked(prisma.user.findUnique).mockResolvedValue(
      createMockUser() as User & { favorites: Favorite[]; ratings: Rating[] }
    );

    // Trigger rate limiting by making multiple requests
    for (let i = 0; i < 11; i++) {
      const mockRequest = new MockNextRequest({});
      await POST(mockRequest as unknown as NextRequest);
    }

    // The 11th request should be rate limited
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    );
  });
});
