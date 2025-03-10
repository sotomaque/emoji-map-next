import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/webhooks/route';
import { prisma } from '@/lib/db';
import userCreateFixture from '@/__fixtures__/clerk/webhooks/user/create.json';

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
        first_name: null,
        last_name: null,
        username: null,
        image_url: 'https://img.clerk.com/image',
        created_at: 1741475612067,
        updated_at: 1741475612091,
      },
      type: 'user.created',
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

describe('Clerk Webhook Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock console.log and console.error to keep test output clean
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should handle user.created event and create a user in the database', async () => {
    // Mock the request
    const req = {
      json: vi.fn().mockResolvedValue(userCreateFixture),
    } as unknown as Request;

    // Mock the Prisma findUnique to return null (user doesn't exist)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    // Mock the Prisma create to return a new user
    const mockCreatedUser = {
      id: 'test-db-id',
      clerkId: 'user_id',
      email: 'test@gmail.com',
      firstName: null,
      lastName: null,
      username: null,
      imageUrl: 'https://img.clerk.com/',
      createdAt: new Date(1741475612067),
      updatedAt: new Date(1741475612091),
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

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        clerkId: 'user_id',
        email: 'test@gmail.com',
        firstName: null,
        lastName: null,
        username: null,
        imageUrl: 'https://img.clerk.com/image',
        createdAt: new Date(1741475612067),
        updatedAt: new Date(1741475612091),
        id: 'user_id',
      },
    });
  });

  it('should not create a user if they already exist', async () => {
    // Mock the request
    const req = {
      json: vi.fn().mockResolvedValue(userCreateFixture),
    } as unknown as Request;

    // Mock the Prisma findUnique to return an existing user
    const existingUser = {
      id: 'existing-db-id',
      clerkId: 'user_id',
      email: 'test@gmail.com',
      firstName: null,
      lastName: null,
      username: null,
      imageUrl: 'https://img.clerk.com/',
      createdAt: new Date(1741475612067),
      updatedAt: new Date(1741475612091),
    };
    vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser);

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

    // Verify that create was not called
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('should handle missing svix headers', async () => {
    // Mock the headers to return null
    const headersModule = await import('next/headers');
    vi.mocked(headersModule.headers).mockReturnValue({
      // @ts-expect-error - Mocking the headers
      get: vi.fn().mockReturnValue(null),
    });

    // Mock the request
    const req = {
      json: vi.fn().mockResolvedValue(userCreateFixture),
    } as unknown as Request;

    // Call the webhook handler
    const response = await POST(req);

    // Check that the response is a 400 error
    expect(response.status).toBe(400);

    // Verify that Prisma was not called
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});
