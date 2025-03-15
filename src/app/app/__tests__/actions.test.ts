import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getCurrentUser } from '../actions';
import type { Favorite } from '@prisma/client';

// Mock the modules
vi.mock('next/headers', () => ({
  cookies: () => ({
    toString: () => 'auth-cookie=value',
  }),
}));

// Mock the env module path
vi.mock('@/env', () => ({
  env: {
    NEXT_PUBLIC_APP_URL: 'http://test-url.com',
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

  const mockUser = {
    id: 'user_123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    username: 'testuser',
    imageUrl: 'https://example.com/image.jpg',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
    favorites: mockFavorites,
  };

  // Mock console.error to prevent test output pollution
  const originalConsoleError = console.error;
  const originalFetch = global.fetch;

  beforeEach(() => {
    console.error = vi.fn();
    vi.clearAllMocks();

    // Use fake timers and set a fixed system time
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);

    // Setup fetch mock
    global.fetch = vi.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    console.error = originalConsoleError;
    global.fetch = originalFetch;
    vi.resetModules();

    // Restore real timers after each test
    vi.useRealTimers();
  });

  it('returns user data with favorites when fetch is successful', async () => {
    // Setup fetch to return successful response
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      {
        ok: true,
        json: async () => ({ user: mockUser }),
      }
    );

    const result = await getCurrentUser();

    // Verify fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/user',
      {
        headers: {
          cookie: 'auth-cookie=value',
        },
        cache: 'no-store',
      }
    );

    // Verify the result is the expected user with favorites
    expect(result).toEqual(mockUser);
    expect(result?.favorites).toHaveLength(2);
    expect(result?.favorites?.[0].id).toBe('fav_1');
    expect(result?.favorites?.[1].id).toBe('fav_2');

    // Verify dates are consistent with our fixed system time
    expect(result?.createdAt).toEqual(new Date('2023-01-01'));
    expect(result?.updatedAt).toEqual(new Date('2023-01-02'));
  });

  it('returns null when fetch response is not ok', async () => {
    // Setup fetch to return error response
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      {
        ok: false,
        status: 401,
      }
    );

    const result = await getCurrentUser();

    // Verify fetch was called
    expect(global.fetch).toHaveBeenCalled();

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      'Failed to fetch user data: 401'
    );

    // Verify the result is null
    expect(result).toBeNull();
  });

  it('returns null when fetch throws an error', async () => {
    // Setup fetch to throw an error
    const error = new Error('Network error');
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      error
    );

    const result = await getCurrentUser();

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

  it('uses localhost fallback when NEXT_PUBLIC_APP_URL is not set', async () => {
    // Create a new mock for this test
    vi.resetModules();
    vi.mock('@/env', () => ({
      env: {
        NEXT_PUBLIC_APP_URL: undefined,
      },
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

    // Verify fetch was called with localhost URL
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/user',
      expect.any(Object)
    );
  });
});
