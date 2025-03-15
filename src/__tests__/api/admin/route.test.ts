import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/admin/route';

// Mock the entire Clerk module
vi.mock('@clerk/nextjs/server', () => ({
  currentUser: vi.fn(),
}));

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data) => ({
      json: () => Promise.resolve(data),
    })),
  },
}));

describe('Admin API Route', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return isAdmin: true when user has admin metadata', async () => {
    // Setup the mock to return a user with admin: true
    (currentUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      publicMetadata: {
        admin: true,
      },
    });

    // Call the route handler
    const response = await GET();

    // Parse the response JSON
    const data = await response.json();

    // Verify the response
    expect(data).toEqual({ isAdmin: true });
    expect(currentUser).toHaveBeenCalledTimes(1);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { isAdmin: true },
      { status: 200 }
    );
  });

  it('should return isAdmin: false when user does not have admin metadata', async () => {
    // Setup the mock to return a user with admin: false
    (currentUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      publicMetadata: {
        admin: false,
      },
    });

    // Call the route handler
    const response = await GET();

    // Parse the response JSON
    const data = await response.json();

    // Verify the response
    expect(data).toEqual({ isAdmin: false });
    expect(currentUser).toHaveBeenCalledTimes(1);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { isAdmin: false },
      { status: 200 }
    );
  });

  it('should return isAdmin: false with status 401 when user is null', async () => {
    // Setup the mock to return null (no user)
    (currentUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      null
    );

    // Call the route handler
    const response = await GET();

    // Parse the response JSON
    const data = await response.json();

    // Verify the response
    expect(data).toEqual({ isAdmin: false });
    expect(currentUser).toHaveBeenCalledTimes(1);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { isAdmin: false },
      { status: 401 }
    );
  });
});
