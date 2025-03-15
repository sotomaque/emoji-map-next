import { currentUser } from '@clerk/nextjs/server';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { getCurrentDbUser } from '@/lib/user-service';
import { GET } from './route';

// Define mock types
type MockClerkUser = {
  id: string;
  emailAddresses: Array<{ emailAddress: string }>;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  imageUrl: string | null;
  // Add additional properties required by the User type
  passwordEnabled: boolean;
  totpEnabled: boolean;
  backupCodeEnabled: boolean;
  twoFactorEnabled: boolean;
  banned: boolean;
  createdAt: number;
  updatedAt: number;
  // Add any other required properties with default values
  [key: string]: unknown;
};

// Mock dependencies
vi.mock('@clerk/nextjs/server', () => ({
  currentUser: vi.fn(),
}));

vi.mock('@/lib/user-service', () => ({
  getOrCreateUser: vi.fn(),
  getCurrentDbUser: vi.fn(),
}));

describe('User API Routes', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/user', () => {
    it('returns 401 if user is not authenticated', async () => {
      vi.mocked(currentUser).mockResolvedValueOnce(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('returns 404 if user is not found in database', async () => {
      // Create a mock Clerk user
      const mockClerkUser: MockClerkUser = {
        id: 'clerk_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        imageUrl: 'https://example.com/image.jpg',
        // Add required properties
        passwordEnabled: true,
        totpEnabled: false,
        backupCodeEnabled: false,
        twoFactorEnabled: false,
        banned: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Use type assertion to unknown first, then to the expected type
      vi.mocked(currentUser).mockResolvedValueOnce(
        mockClerkUser as unknown as Awaited<ReturnType<typeof currentUser>>
      );
      vi.mocked(getCurrentDbUser).mockResolvedValueOnce(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'User not found in database' });
    });

    it('returns user data if user is found in database', async () => {
      // Create a mock Clerk user
      const mockClerkUser: MockClerkUser = {
        id: 'clerk_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        imageUrl: 'https://example.com/image.jpg',
        // Add required properties
        passwordEnabled: true,
        totpEnabled: false,
        backupCodeEnabled: false,
        twoFactorEnabled: false,
        banned: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Use type assertion to unknown first, then to the expected type
      vi.mocked(currentUser).mockResolvedValueOnce(
        mockClerkUser as unknown as Awaited<ReturnType<typeof currentUser>>
      );

      const createdAt = new Date();
      const updatedAt = new Date();

      const mockUser = {
        id: 'db_1',
        clerkId: 'clerk_123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        imageUrl: 'https://example.com/image.jpg',
        createdAt,
        updatedAt,
      };

      vi.mocked(getCurrentDbUser).mockResolvedValueOnce(mockUser);

      const response = await GET();
      const data = await response.json();

      // Extract the user from the response
      const { user } = data;

      // Check individual properties instead of the whole object
      expect(response.status).toBe(200);
      expect(user.id).toBe(mockUser.id);
      expect(user.clerkId).toBe(mockUser.clerkId);
      expect(user.email).toBe(mockUser.email);
      expect(user.firstName).toBe(mockUser.firstName);
      expect(user.lastName).toBe(mockUser.lastName);
      expect(user.username).toBe(mockUser.username);
      expect(user.imageUrl).toBe(mockUser.imageUrl);
      // Date objects are serialized to strings in JSON
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('returns 500 if an error occurs', async () => {
      // Create a mock Clerk user
      const mockClerkUser: MockClerkUser = {
        id: 'clerk_123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        imageUrl: 'https://example.com/image.jpg',
        // Add required properties
        passwordEnabled: true,
        totpEnabled: false,
        backupCodeEnabled: false,
        twoFactorEnabled: false,
        banned: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Use type assertion to unknown first, then to the expected type
      vi.mocked(currentUser).mockResolvedValueOnce(
        mockClerkUser as unknown as Awaited<ReturnType<typeof currentUser>>
      );
      vi.mocked(getCurrentDbUser).mockRejectedValueOnce(
        new Error('Database error')
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch user' });
    });
  });

  // You can add tests for the POST handler here if needed
});
