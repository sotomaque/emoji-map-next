/**
 * Helper functions for testing Clerk webhooks
 */
import { http, HttpResponse } from 'msw';
import { vi } from 'vitest';
import userCreateFixture from '@/__fixtures__/api/webhooks/create.json';
import userUpdateFixture from '@/__fixtures__/api/webhooks/update.json'

/**
 * Available webhook fixtures
 */
export const webhookFixtures = {
  userCreate: userCreateFixture,
  userUpdate: userUpdateFixture,
};

/**
 * Type for webhook fixtures
 */
export type WebhookFixture = typeof userCreateFixture | typeof userUpdateFixture;

/**
 * Type for mocked Prisma client
 */
export type MockedPrismaClient = {
  user: {
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  }
};

/**
 * Mock the Svix webhook verification with a specific fixture
 * @param fixture The webhook fixture to use
 */
export function mockClerkWebhook(fixture: WebhookFixture) {
  vi.mock('svix', () => ({
    Webhook: vi.fn().mockImplementation(() => ({
      verify: vi.fn().mockImplementation(() => fixture),
    })),
  }));
}

/**
 * Create a mock handler for Clerk webhooks
 * @param fixture The webhook fixture to use
 * @param mockPrisma The mocked Prisma client
 * @param path The API path to mock (default: '/api/webhooks')
 */
export function createClerkWebhookHandler(
  fixture: WebhookFixture,
  mockPrisma: MockedPrismaClient,
  path = '/api/webhooks'
) {
  return http.post(path, async ({ request }) => {
    // Manually simulate the webhook handler behavior
    const body = await request.json() as WebhookFixture;
    
    if (body.type === 'user.updated') {
      const userData = body.data;
      
      // Check if user exists
      await mockPrisma.user.findUnique({
        where: { clerkId: userData.id },
      });
      
      // Get email from the user data
      let email = '';
      if (userData.email_addresses && userData.email_addresses.length > 0) {
        email = userData.email_addresses[0].email_address;
      }
      
      // Update the user
      await mockPrisma.user.update({
        where: { clerkId: userData.id },
        data: {
          email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          username: userData.username,
          imageUrl: userData.image_url,
          updatedAt: new Date(userData.updated_at),
        },
      });
    } else if (body.type === 'user.created') {
      const userData = body.data;
      
      // Check if user exists
      const existingUser = await mockPrisma.user.findUnique({
        where: { clerkId: userData.id },
      });
      
      // Only create if user doesn't exist
      if (!existingUser) {
        // Get email from the user data
        let email = '';
        if (userData.email_addresses && userData.email_addresses.length > 0) {
          email = userData.email_addresses[0].email_address;
        }
        
        // Create the user
        await mockPrisma.user.create({
          data: {
            clerkId: userData.id,
            id: userData.id,
            email,
            firstName: userData.first_name,
            lastName: userData.last_name,
            username: userData.username,
            imageUrl: userData.image_url,
            createdAt: new Date(userData.created_at),
            updatedAt: new Date(userData.updated_at),
          },
        });
      }
    }
    
    return HttpResponse.json({ success: true }, { status: 200 });
  });
} 