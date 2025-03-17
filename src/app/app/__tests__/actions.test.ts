import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
} from 'vitest';
import type { Favorite, User, Rating } from '@prisma/client';

// Mock Clerk's currentUser
vi.mock('@clerk/nextjs/server', () => ({
  currentUser: vi.fn(),
}));

// Mock the env module path
vi.mock('@/env', () => ({
  env: {
    NEXT_PUBLIC_SITE_URL: 'http://test-url.com',
  },
}));

describe('getCurrentUser', () => {
  // Set a fixed date for all tests
  const fixedDate = new Date('2023-05-15T12:00:00Z');

  const mockFavorites: Favorite[] = [
    {
      id: 'fav_1',
      userId: 'user_123',
      placeId: 'place_1',
      createdAt: new Date('2023-02-01'),
    },
    {
      id: 'fav_2',
      userId: 'user_123',
      placeId: 'place_2',
      createdAt: new Date('2023-02-15'),
    },
  ];

  const mockRatings: Rating[] = [
    {
      id: 'rating_1',
      userId: 'user_123',
      placeId: 'place_1',
      rating: 4,
      createdAt: new Date('2023-02-01'),
      updatedAt: new Date('2023-02-01'),
    },
  ];

  const mockUser: User & { favorites: Favorite[]; ratings: Rating[] } = {
    id: 'user_123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    username: 'testuser',
    imageUrl: 'https://example.com/image.jpg',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
    favorites: mockFavorites,
    ratings: mockRatings,
  };

  // Mock console.error to prevent test output pollution
  const originalConsoleError = console.error;
  const originalFetch = global.fetch;

  // Import the mocked currentUser function
  let mockCurrentUser: ReturnType<typeof vi.fn>;

  beforeAll(async () => {
    const { currentUser } = await import('@clerk/nextjs/server');
    mockCurrentUser = currentUser as unknown as ReturnType<typeof vi.fn>;
  });

  beforeEach(() => {
    console.error = vi.fn();
    vi.clearAllMocks();

    // Use fake timers and set a fixed system time
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);

    // Setup fetch mock
    global.fetch = vi.fn() as unknown as typeof fetch;

    // Default mock for currentUser
    mockCurrentUser?.mockResolvedValue({
      id: 'user_123',
    });

    // Reset modules to ensure fresh mocks for each test
    vi.resetModules();

    // Re-mock the env module for each test
    vi.mock('@/env', () => ({
      env: {
        NEXT_PUBLIC_SITE_URL: 'http://test-url.com',
      },
    }));

    // Re-mock Clerk's currentUser for each test
    vi.mock('@clerk/nextjs/server', () => ({
      currentUser: vi.fn().mockResolvedValue({
        id: 'user_123',
      }),
    }));
  });

  afterEach(() => {
    console.error = originalConsoleError;
    global.fetch = originalFetch;
    vi.resetModules();

    // Restore real timers after each test
    vi.useRealTimers();
  });

  it('should return user data with favorites and ratings when fetch is successful', async () => {
    // Re-import the function to use the fresh mocks
    const { getCurrentUser: getUser } = await import('../actions');

    // Setup fetch to return successful response
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      {
        ok: true,
        json: async () => ({ user: mockUser }),
      }
    );

    const result = await getUser();

    // Verify fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/user?userId=user_123'
    );

    // Verify the result is the expected user with favorites
    expect(result).toEqual(mockUser);
    expect(result?.favorites).toHaveLength(2);
    expect(result?.favorites?.[0].id).toBe('fav_1');
    expect(result?.favorites?.[1].id).toBe('fav_2');

    // Verify the result has ratings
    expect(result?.ratings).toHaveLength(1);
    expect(result?.ratings?.[0].id).toBe('rating_1');
    expect(result?.ratings?.[0].rating).toBe(4);

    // Verify dates are consistent with our fixed system time
    expect(result?.createdAt).toEqual(new Date('2023-01-01'));
    expect(result?.updatedAt).toEqual(new Date('2023-01-02'));
  });

  it('should return null when fetch response is not ok', async () => {
    // Re-import the function to use the fresh mocks
    const { getCurrentUser: getUser } = await import('../actions');

    // Setup fetch to return error response
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      {
        ok: false,
        status: 401,
      }
    );

    const result = await getUser();

    // Verify fetch was called
    expect(global.fetch).toHaveBeenCalled();

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      'Failed to fetch user data: 401'
    );

    // Verify the result is null
    expect(result).toBeNull();
  });

  it('should return null when fetch throws an error', async () => {
    // Re-import the function to use the fresh mocks
    const { getCurrentUser: getUser } = await import('../actions');

    // Setup fetch to throw an error
    const error = new Error('Network error');
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      error
    );

    const result = await getUser();

    // Verify fetch was called
    expect(global.fetch).toHaveBeenCalled();

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching user data:',
      error
    );

    // Verify the result is null
    expect(result).toBeNull();
  });

  it('should use localhost fallback when NEXT_PUBLIC_SITE_URL is not set', async () => {
    // Create a new mock for this test
    vi.resetModules();
    vi.mock('@/env', () => ({
      env: {
        NEXT_PUBLIC_SITE_URL: undefined,
      },
    }));

    // Re-mock Clerk's currentUser for this test
    vi.mock('@clerk/nextjs/server', () => ({
      currentUser: vi.fn().mockResolvedValue({
        id: 'user_123',
      }),
    }));

    // Re-import the function to use the new mock
    const { getCurrentUser: getUser } = await import('../actions');

    // Setup fetch to return successful response
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      {
        ok: true,
        json: async () => ({ user: mockUser }),
      }
    );

    await getUser();

    // Verify fetch was called with localhost URL and userId parameter
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/user?userId=user_123'
    );
  });

  it('should return null when no user data is found', async () => {
    // Re-import the function to use the fresh mocks
    const { getCurrentUser: getUser } = await import('../actions');

    // Setup fetch to return successful response but with no user data
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      {
        ok: true,
        json: async () => ({ user: null }),
      }
    );

    const result = await getUser();

    // Verify fetch was called
    expect(global.fetch).toHaveBeenCalled();

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith('No user data found');

    // Verify the result is null
    expect(result).toBeNull();
  });

  it('should return null when user is not authenticated', async () => {
    // We need to directly mock the currentUser function for this test
    const { currentUser } = await import('@clerk/nextjs/server');
    (currentUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      null
    );

    // Re-import the function to use our mock
    const { getCurrentUser: getUser } = await import('../actions');

    const result = await getUser();

    // Verify fetch was NOT called since we return early when user is null
    expect(global.fetch).not.toHaveBeenCalled();

    // Verify the result is null
    expect(result).toBeNull();
  });

  it('should handle malformed API responses gracefully', async () => {
    // Re-import the function to use the fresh mocks
    const { getCurrentUser: getUser } = await import('../actions');

    // Setup fetch to return successful response but with malformed data
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      {
        ok: true,
        json: async () => ({ notUser: 'wrong data structure' }),
      }
    );

    const result = await getUser();

    // Verify fetch was called
    expect(global.fetch).toHaveBeenCalled();

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith('No user data found');

    // Verify the result is null
    expect(result).toBeNull();
  });
});
