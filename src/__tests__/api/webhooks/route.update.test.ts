import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';
import {
  webhookFixtures,
  mockClerkWebhook,
  createClerkWebhookHandler,
  setupApiTestServer,
  type MockedPrismaClient,
} from '../../../../vitest.setup';

// Setup server with API handlers
const server = setupApiTestServer();

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
mockClerkWebhook(webhookFixtures.userUpdate);

describe('Clerk Webhook Handler - User Update', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should update a user when user.updated event is received', async () => {
    // Mock the findUnique method to return a user
    mockedPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'existing-user-id',
      clerkId: webhookFixtures.userUpdate.data.id,
      email: 'old-email@example.com',
      // Add other required fields
    });

    // Mock the update method to return the updated user
    mockedPrisma.user.update.mockResolvedValueOnce({
      id: 'existing-user-id',
      clerkId: webhookFixtures.userUpdate.data.id,
      email: webhookFixtures.userUpdate.data.email_addresses[0].email_address,
      // Add other required fields
    });

    // Override the default handler for this specific test
    server.use(
      createClerkWebhookHandler(
        webhookFixtures.userUpdate,
        mockedPrisma,
        'http://localhost/api/webhooks/test-update'
      )
    );

    // Create a mock request with the necessary headers and body
    const response = await fetch('http://localhost/api/webhooks/test-update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'svix-id': 'test-svix-id',
        'svix-timestamp': 'test-svix-timestamp',
        'svix-signature': 'test-svix-signature',
      },
      body: JSON.stringify(webhookFixtures.userUpdate),
    });

    // Verify the response
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('message');
    expect(data).toHaveProperty('timestamp');

    // Verify that findUnique was called with the correct parameters
    expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { clerkId: webhookFixtures.userUpdate.data.id },
    });

    // Verify that update was called with the correct parameters
    expect(mockedPrisma.user.update).toHaveBeenCalledWith({
      where: { clerkId: webhookFixtures.userUpdate.data.id },
      data: expect.objectContaining({
        email: webhookFixtures.userUpdate.data.email_addresses[0].email_address,
      }),
    });
  });
});
