'use server';

import { currentUser } from '@clerk/nextjs/server';
import { env } from '@/env';
import type { User, Favorite } from '@prisma/client';

/**
 * Server action to fetch the current user's data
 *
 */
export async function getCurrentUser(): Promise<
  (User & { favorites?: Favorite[] }) | null
> {
  try {
    const user = await currentUser();

    const response = await fetch(
      `${env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/user?userId=${
        user?.id
      }`
    );

    if (!response.ok) {
      console.error(`Failed to fetch user data: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!data.user) {
      console.error('No user data found');
      return null;
    }

    return data.user;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}
