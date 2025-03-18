import { NextRequest } from 'next/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { env } from '@/env';
import { log } from '@/utils/log';
import { getUserId } from './get-user-id';

// Mock dependencies
vi.mock('@clerk/nextjs/server', () => ({
  createClerkClient: vi.fn(),
}));

vi.mock('@/env', () => ({
  env: {
    CLERK_SECRET_KEY: 'mock-secret-key',
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'mock-publishable-key',
  },
}));

vi.mock('@/utils/log', () => ({
  log: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('getUserId', () => {
  // Mock request
  let mockRequest: NextRequest;
  const mockUserId = 'mock-user-id';

  // Mock auth response
  const mockToAuth = vi.fn().mockReturnValue({ userId: mockUserId });
  const mockAuthenticateRequest = vi.fn();

  // Mock Clerk client
  const mockClerkClient = {
    authenticateRequest: mockAuthenticateRequest,
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Default mock implementation
    mockAuthenticateRequest.mockResolvedValue({ toAuth: mockToAuth });

    // Setup mock Clerk client
    (createClerkClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockClerkClient
    );

    // Create mock request with authorization header
    mockRequest = new NextRequest('https://example.com', {
      headers: {
        authorization: 'Bearer mock-token',
      },
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return userId when authentication is successful', async () => {
    // Act
    const result = await getUserId(mockRequest);

    // Assert
    expect(createClerkClient).toHaveBeenCalledWith({
      secretKey: env.CLERK_SECRET_KEY,
      publishableKey: env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    });
    expect(mockAuthenticateRequest).toHaveBeenCalledWith(mockRequest);
    expect(mockToAuth).toHaveBeenCalled();
    expect(result).toEqual(mockUserId);
  });

  it('should throw an error when no authorization header is present', async () => {
    // Arrange
    mockRequest = new NextRequest('https://example.com');

    // Act & Assert
    await expect(getUserId(mockRequest)).rejects.toThrow(
      'Unauthorized: Missing authorization header'
    );
    expect(log.error).toHaveBeenCalledWith(
      'Unauthorized: No authorization header provided'
    );
    expect(createClerkClient).not.toHaveBeenCalled();
  });

  it('should throw an error when authorization header has invalid format', async () => {
    // Arrange - Create request with invalid authorization header format
    mockRequest = new NextRequest('https://example.com', {
      headers: {
        authorization: 'InvalidFormat mock-token',
      },
    });

    // Act & Assert
    await expect(getUserId(mockRequest)).rejects.toThrow(
      'Unauthorized: Invalid authorization header format'
    );
    expect(log.error).toHaveBeenCalledWith(
      'Unauthorized: Invalid authorization header format'
    );
    expect(createClerkClient).not.toHaveBeenCalled();
  });

  it('should throw an error when token is empty', async () => {
    // Arrange - Create request with empty token but still valid format
    // Note: The implementation actually treats 'Bearer ' as an invalid format rather than empty token
    mockRequest = new NextRequest('https://example.com', {
      headers: {
        authorization: 'Bearer ',
      },
    });

    // Act & Assert
    await expect(getUserId(mockRequest)).rejects.toThrow(
      'Unauthorized: Invalid authorization header format'
    );
    expect(log.error).toHaveBeenCalledWith(
      'Unauthorized: Invalid authorization header format'
    );
    expect(createClerkClient).not.toHaveBeenCalled();
  });

  it('should throw an error when userId is not returned', async () => {
    // Arrange - Create a new mockToAuth that returns a null userId
    const nullUserIdAuth = vi.fn().mockReturnValue({ userId: null });
    mockAuthenticateRequest.mockResolvedValueOnce({ toAuth: nullUserIdAuth });

    // Act & Assert
    await expect(getUserId(mockRequest)).rejects.toThrow(
      'Unauthorized: Authentication successful but no user ID found'
    );
    expect(log.error).toHaveBeenCalledWith(
      'Unauthorized: Valid token but no userId returned'
    );
    expect(createClerkClient).toHaveBeenCalled();
    expect(mockAuthenticateRequest).toHaveBeenCalled();
  });

  it('should throw an error when Clerk authentication fails', async () => {
    // Arrange
    const mockError = new Error('Clerk error message');
    mockAuthenticateRequest.mockRejectedValueOnce(mockError);

    // Act & Assert
    await expect(getUserId(mockRequest)).rejects.toThrow(
      'Unauthorized: Authentication failed - Clerk error message'
    );
    expect(log.error).toHaveBeenCalledWith(
      'Clerk authentication error:',
      mockError
    );
    expect(createClerkClient).toHaveBeenCalled();
  });

  it('should handle non-Error objects from Clerk authentication', async () => {
    // Arrange - Simulate a non-Error object being thrown
    const nonErrorObject = 'Just a string error';
    mockAuthenticateRequest.mockRejectedValueOnce(nonErrorObject);

    // Act & Assert
    await expect(getUserId(mockRequest)).rejects.toThrow(
      'Unauthorized: Authentication failed - Unknown clerk error'
    );
    expect(log.error).toHaveBeenCalledWith(
      'Clerk authentication error:',
      nonErrorObject
    );
    expect(createClerkClient).toHaveBeenCalled();
  });

  it('should handle empty auth object', async () => {
    // Arrange - Create a mock that returns undefined after toAuth() is called
    const emptyAuthFn = vi.fn().mockReturnValue(undefined);
    mockAuthenticateRequest.mockResolvedValueOnce({ toAuth: emptyAuthFn });

    // Act & Assert
    await expect(getUserId(mockRequest)).rejects.toThrow(
      'Unauthorized: Authentication successful but no user ID found'
    );
    expect(log.error).toHaveBeenCalledWith(
      'Unauthorized: Valid token but no userId returned'
    );
  });
});
