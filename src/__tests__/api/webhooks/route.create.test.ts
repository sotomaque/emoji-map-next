import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';
import {
  webhookFixtures,
  mockClerkWebhook,
  createClerkWebhookHandler,
  setupApiTestServer,
  type MockedPrismaClient,
} from '../../../../vitest.setup';

// Mock the database operations
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Type the mocked functions
const mockedPrisma = prisma as unknown as MockedPrismaClient;

// Mock the Svix webhook verification
mockClerkWebhook(webhookFixtures.userCreate);

// Setup server with API handlers
const server = setupApiTestServer();

describe('Clerk Webhook Handler - User Create', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should handle user.created event and create a user in the database', async () => {
    // Mock the database operations
    const mockUser = {
      id: webhookFixtures.userCreate.data.id,
      clerkId: webhookFixtures.userCreate.data.id,
      email: webhookFixtures.userCreate.data.email_addresses[0].email_address,
      firstName: webhookFixtures.userCreate.data.first_name || 'Test',
      lastName: webhookFixtures.userCreate.data.last_name || 'User',
    };

    // Mock findUnique to return null (user doesn't exist)
    mockedPrisma.user.findUnique.mockResolvedValueOnce(null);

    // Mock create to return the mock user
    mockedPrisma.user.create.mockResolvedValueOnce(mockUser);

    // Override the default handler for this specific test
    server.use(
      createClerkWebhookHandler(
        webhookFixtures.userCreate,
        mockedPrisma,
        'http://localhost/api/webhooks/test-create'
      )
    );

    // Create a mock request with the necessary headers and body
    const response = await fetch('http://localhost/api/webhooks/test-create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'svix-id': 'test-svix-id',
        'svix-timestamp': 'test-svix-timestamp',
        'svix-signature': 'test-svix-signature',
      },
      body: JSON.stringify(webhookFixtures.userCreate),
    });

    // Verify the response
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('message');
    expect(data).toHaveProperty('timestamp');

    // Verify that findUnique was called with the correct parameters
    expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { clerkId: webhookFixtures.userCreate.data.id },
    });

    // Verify that create was called with the correct parameters
    expect(mockedPrisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        clerkId: webhookFixtures.userCreate.data.id,
        id: webhookFixtures.userCreate.data.id,
        email: webhookFixtures.userCreate.data.email_addresses[0].email_address,
      }),
    });
  });

  it('should not create a user if they already exist', async () => {
    // Mock the database operations
    const mockUser = {
      id: webhookFixtures.userCreate.data.id,
      clerkId: webhookFixtures.userCreate.data.id,
      email: webhookFixtures.userCreate.data.email_addresses[0].email_address,
      firstName: webhookFixtures.userCreate.data.first_name || 'Test',
      lastName: webhookFixtures.userCreate.data.last_name || 'User',
    };

    // Mock findUnique to return the mock user (user exists)
    mockedPrisma.user.findUnique.mockResolvedValueOnce(mockUser);

    // Override the default handler for this specific test
    server.use(
      createClerkWebhookHandler(
        webhookFixtures.userCreate,
        mockedPrisma,
        'http://localhost/api/webhooks/test-existing'
      )
    );

    // Create a mock request with the necessary headers and body
    const response = await fetch(
      'http://localhost/api/webhooks/test-existing',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': 'test-svix-id',
          'svix-timestamp': 'test-svix-timestamp',
          'svix-signature': 'test-svix-signature',
        },
        body: JSON.stringify(webhookFixtures.userCreate),
      }
    );

    // Verify the response
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('message');
    expect(data).toHaveProperty('timestamp');

    // Verify that findUnique was called with the correct parameters
    expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { clerkId: webhookFixtures.userCreate.data.id },
    });

    // Verify that create was not called
    expect(mockedPrisma.user.create).not.toHaveBeenCalled();
  });
});
