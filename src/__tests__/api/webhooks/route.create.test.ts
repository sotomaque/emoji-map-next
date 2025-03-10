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
mockClerkWebhook(webhookFixtures.userCreate);

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

    // Mock the findUnique method to return null (user not found)
    mockedPrisma.user.findUnique.mockResolvedValue(null);

    // Mock the create method to return the new user
    mockedPrisma.user.create.mockResolvedValue(mockUser);

    // Override the default handler for this specific test
    server.use(
      createClerkWebhookHandler(webhookFixtures.userCreate, mockedPrisma)
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
      body: JSON.stringify(webhookFixtures.userCreate),
    });

    // Check that the response is successful
    expect(response.status).toBe(200);

    // Parse the response body
    const data = await response.json();

    // Check that the response contains the expected data
    expect(data).toHaveProperty('success', true);

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

    // Mock the findUnique method to return an existing user
    mockedPrisma.user.findUnique.mockResolvedValue(mockUser);

    // Override the default handler for this specific test
    server.use(
      createClerkWebhookHandler(webhookFixtures.userCreate, mockedPrisma)
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
      body: JSON.stringify(webhookFixtures.userCreate),
    });

    // Check that the response is successful
    expect(response.status).toBe(200);

    // Parse the response body
    const data = await response.json();

    // Check that the response contains the expected data
    expect(data).toHaveProperty('success', true);

    // Verify that findUnique was called with the correct parameters
    expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { clerkId: webhookFixtures.userCreate.data.id },
    });

    // Verify that create was not called
    expect(mockedPrisma.user.create).not.toHaveBeenCalled();
  });
}); 