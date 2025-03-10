import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';
import { setupApiTestServer } from '../../helpers/api-test-helpers';
import { 
  webhookFixtures, 
  mockClerkWebhook, 
  createClerkWebhookHandler,
  type MockedPrismaClient
} from '../../helpers/clerk-webhook-helpers';

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

  it('should handle user.updated event and update a user in the database', async () => {
    // Mock the database operations
    const mockUser = {
      id: webhookFixtures.userUpdate.data.id,
      clerkId: webhookFixtures.userUpdate.data.id,
      email: webhookFixtures.userUpdate.data.email_addresses[0].email_address,
      firstName: webhookFixtures.userUpdate.data.first_name || 'Test',
      lastName: webhookFixtures.userUpdate.data.last_name || 'User',
    };

    // Mock the findUnique method to return a user
    mockedPrisma.user.findUnique.mockResolvedValue(mockUser);

    // Mock the update method to return the updated user
    mockedPrisma.user.update.mockResolvedValue({
      ...mockUser,
      firstName: webhookFixtures.userUpdate.data.first_name || 'Updated',
      lastName: webhookFixtures.userUpdate.data.last_name || 'User',
    });

    // Override the default handler for this specific test
    server.use(
      createClerkWebhookHandler(webhookFixtures.userUpdate, mockedPrisma)
    );

    // Create a mock request with the necessary headers and body
    const response = await fetch('/api/webhooks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'svix-id': 'test-svix-id',
        'svix-timestamp': 'test-svix-timestamp',
        'svix-signature': 'test-svix-signature',
      },
      body: JSON.stringify(webhookFixtures.userUpdate),
    });

    // Check that the response is successful
    expect(response.status).toBe(200);

    // Parse the response body
    const data = await response.json();

    // Check that the response contains the expected data
    expect(data).toHaveProperty('success', true);

    // Verify that findUnique was called with the correct parameters
    expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { clerkId: webhookFixtures.userUpdate.data.id },
    });

    // Verify that update was called with the correct parameters
    expect(mockedPrisma.user.update).toHaveBeenCalledWith({
      where: { clerkId: webhookFixtures.userUpdate.data.id },
      data: expect.objectContaining({
        email: webhookFixtures.userUpdate.data.email_addresses[0].email_address,
        updatedAt: expect.any(Date),
      }),
    });
  });
});
