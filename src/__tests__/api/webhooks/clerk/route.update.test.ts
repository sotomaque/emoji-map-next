import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/webhooks/clerk/route';
import { prisma } from '@/lib/db';
import userUpdateFixture from '@/__fixtures__/clerk/webhooks/user/update.json';

// Mock the Next.js headers
vi.mock('next/headers', () => ({
  headers: vi.fn().mockReturnValue({
    get: vi.fn((header) => {
      switch (header) {
        case 'svix-id':
          return 'test-svix-id';
        case 'svix-timestamp':
          return 'test-svix-timestamp';
        case 'svix-signature':
          return 'test-svix-signature';
        default:
          return null;
      }
    }),
  }),
}));

// Mock the Svix Webhook class
vi.mock('svix', () => ({
  Webhook: vi.fn().mockImplementation(() => ({
    verify: vi.fn().mockReturnValue({
      data: {
        id: 'user_id',
        email_addresses: [{ email_address: 'test@gmail.com' }],
        first_name: 'first_name',
        last_name: 'last_name',
        username: null,
        image_url: 'image_url',
        created_at: 1741475612067,
        updated_at: 1741478589199,
      },
      type: 'user.updated',
    }),
  })),
}));

// Mock the Prisma client
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock environment variables
vi.mock('@/env', () => ({
  env: {
    CLERK_SIGNING_SECRET: 'test-webhook-secret',
  },
}));

describe('Clerk Webhook Handler - User Update', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle user.updated event and update a user in the database', async () => {
    // Mock the request
    const req = {
      json: vi.fn().mockResolvedValue(userUpdateFixture),
    } as unknown as Request;

    // Mock the Prisma findUnique to return an existing user
    const existingUser = {
      id: 'existing-db-id',
      clerkId: 'user_id',
      email: 'test@gmail.com',
      firstName: null,
      lastName: null,
      username: null,
      imageUrl: 'image_url',
      createdAt: new Date(1741475612067),
      updatedAt: new Date(1741475612091),
    };
    vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser);

    // Mock the Prisma update to return the updated user
    const updatedUser = {
      ...existingUser,
      firstName: 'first_name',
      lastName: 'last_name',
      imageUrl: 'image_url',
      updatedAt: new Date(1741478589199),
    };
    vi.mocked(prisma.user.update).mockResolvedValue(updatedUser);

    // Call the webhook handler
    const response = await POST(req);

    // Check that the response is successful
    expect(response.status).toBe(200);

    // Parse the response body
    const responseBody = await response.json();
    expect(responseBody.success).toBe(true);

    // Verify that Prisma was called correctly
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { clerkId: 'user_id' },
    });

    // Verify that update was called with the correct data
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { clerkId: 'user_id' },
      data: {
        email: 'test@gmail.com',
        firstName: 'first_name',
        lastName: 'last_name',
        username: null,
        imageUrl: 'image_url',
        updatedAt: new Date(1741478589199),
      },
    });
  });

  it('should create a user if they do not exist during update', async () => {
    // Mock the request
    const req = {
      json: vi.fn().mockResolvedValue(userUpdateFixture),
    } as unknown as Request;

    // Mock the Prisma findUnique to return null (user doesn't exist)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    // Mock the Prisma create to return a new user
    const mockCreatedUser = {
      id: 'new-db-id',
      clerkId: 'user_id',
      email: 'test@gmail.com',
      firstName: 'first_name',
      lastName: 'last_name',
      username: null,
      imageUrl: 'image_url',
      createdAt: new Date(1741475612067),
      updatedAt: new Date(1741478589199),
    };
    vi.mocked(prisma.user.create).mockResolvedValue(mockCreatedUser);

    // Call the webhook handler
    const response = await POST(req);

    // Check that the response is successful
    expect(response.status).toBe(200);

    // Parse the response body
    const responseBody = await response.json();
    expect(responseBody.success).toBe(true);

    // Verify that Prisma was called correctly
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { clerkId: 'user_id' },
    });

    // Verify that create was called with the correct data
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        clerkId: 'user_id',
        email: 'test@gmail.com',
        firstName: 'first_name',
        lastName: 'last_name',
        username: null,
        imageUrl: 'image_url',
        createdAt: new Date(1741475612067),
        updatedAt: new Date(1741478589199),
        id: 'user_id',
      },
    });
  });
});
