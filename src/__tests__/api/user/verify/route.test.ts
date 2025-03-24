import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/user/verify/route';
import { getUserId } from '@/services/user/get-user-id';

// Mock the getUserId function
vi.mock('@/services/user/get-user-id', () => ({
  getUserId: vi.fn(),
}));

// Mock the clerkClient
vi.mock('@clerk/nextjs/server', () => ({
  clerkClient: vi.fn(),
}));

describe('POST /api/user/verify', () => {
  const mockUserId = 'user_123';
  let mockRequest: NextRequest;
  const mockClerkClient = {
    emailAddresses: {
      createEmailAddress: vi.fn(),
    },
    users: {
      updateUser: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    // Setup clerkClient mock
    (clerkClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockClerkClient
    );

    // Create a new request for each test
    mockRequest = new NextRequest('https://example.com/api/user/verify', {
      method: 'POST',
    });

    // Mock the json method on the request
    mockRequest.json = vi.fn();
  });

  it('should update email and return success response', async () => {
    // Mock getUserId to return a user ID
    (getUserId as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserId);

    // Mock request body
    (mockRequest.json as ReturnType<typeof vi.fn>).mockResolvedValue({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    });

    const response = await POST(mockRequest);

    // Assert response
    expect(response).toBeInstanceOf(NextResponse);
    expect(await response.json()).toEqual({ message: 'Email address updated' });
    expect(response.status).toBe(200);

    // Verify clerk client was called correctly
    expect(
      mockClerkClient.emailAddresses.createEmailAddress
    ).toHaveBeenCalledWith({
      userId: mockUserId,
      emailAddress: 'test@example.com',
    });

    expect(mockClerkClient.users.updateUser).toHaveBeenCalledWith(mockUserId, {
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  it('should update email only if name not provided', async () => {
    // Mock getUserId to return a user ID
    (getUserId as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserId);

    // Mock request body with only email
    (mockRequest.json as ReturnType<typeof vi.fn>).mockResolvedValue({
      email: 'test@example.com',
    });

    const response = await POST(mockRequest);

    // Assert response
    expect(response).toBeInstanceOf(NextResponse);
    expect(await response.json()).toEqual({ message: 'Email address updated' });
    expect(response.status).toBe(200);

    // Verify clerk client was called correctly
    expect(
      mockClerkClient.emailAddresses.createEmailAddress
    ).toHaveBeenCalledWith({
      userId: mockUserId,
      emailAddress: 'test@example.com',
    });

    // Name update should not be called
    expect(mockClerkClient.users.updateUser).not.toHaveBeenCalled();
  });

  it('should return 404 if user not found', async () => {
    // Mock getUserId to return null (user not found)
    (getUserId as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const response = await POST(mockRequest);

    // Assert response
    expect(response).toBeInstanceOf(NextResponse);
    expect(await response.json()).toEqual({ error: 'User not found' });
    expect(response.status).toBe(404);

    // Clerk clients should not be called
    expect(
      mockClerkClient.emailAddresses.createEmailAddress
    ).not.toHaveBeenCalled();
    expect(mockClerkClient.users.updateUser).not.toHaveBeenCalled();
  });

  it('should return 400 if input validation fails', async () => {
    // Mock getUserId to return a user ID
    (getUserId as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserId);

    // Mock request body with invalid email
    (mockRequest.json as ReturnType<typeof vi.fn>).mockResolvedValue({
      email: 'invalid-email',
    });

    const response = await POST(mockRequest);

    // Assert response
    expect(response).toBeInstanceOf(NextResponse);
    expect(await response.json()).toEqual({ error: 'Invalid input' });
    expect(response.status).toBe(400);

    // Clerk clients should not be called
    expect(
      mockClerkClient.emailAddresses.createEmailAddress
    ).not.toHaveBeenCalled();
    expect(mockClerkClient.users.updateUser).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    // Mock getUserId to return a user ID
    (getUserId as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserId);

    // Mock request body
    (mockRequest.json as ReturnType<typeof vi.fn>).mockResolvedValue({
      email: 'test@example.com',
    });

    // Mock Clerk client to throw an error
    mockClerkClient.emailAddresses.createEmailAddress.mockRejectedValue(
      new Error('Clerk error')
    );

    const response = await POST(mockRequest);

    // Assert response
    expect(response).toBeInstanceOf(NextResponse);
    expect(await response.json()).toEqual({ error: 'Internal server error' });
    expect(response.status).toBe(500);
  });
});
