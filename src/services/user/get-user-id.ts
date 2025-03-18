import type { NextRequest } from 'next/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { env } from '@/env';
import { log } from '@/utils/log';

export async function getUserId(request: NextRequest) {
  try {
    if (!request.headers.get('authorization')) {
      log.error('Unauthorized no token');
      throw new Error('Unauthorized');
    }

    const client = createClerkClient({
      secretKey: env.CLERK_SECRET_KEY,
      publishableKey: env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    });

    const userId = (await client.authenticateRequest(request)).toAuth()?.userId;

    if (!userId) {
      // TODO: check if we can refresh the token
      log.error('Unauthorized no userId');
      throw new Error('Unauthorized');
    }

    return userId;
  } catch (error) {
    log.error('Error fetching user:', error);
    throw error;
  }
}
