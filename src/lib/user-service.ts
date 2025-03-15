import { currentUser } from '@clerk/nextjs/server';
import { log } from '@/utils/log';
import { prisma } from './db';
import type { User, Favorite } from '@prisma/client';

/**
 * Get a user by their Clerk ID
 */
export async function getUserByClerkId(
  clerkId: string,
  includeFavorites: boolean = false
): Promise<(User & { favorites?: Favorite[] }) | null> {
  log.debug('getUserByClerkId', { clerkId, includeFavorites });
  return await prisma.user.findUnique({
    where: { clerkId },
    include: {
      favorites: includeFavorites,
    },
  });
}

/**
 * Get the current authenticated user from the database
 */
export async function getCurrentDbUser(
  includeFavorites: boolean = false
): Promise<(User & { favorites?: Favorite[] }) | null> {
  log.debug('getCurrentDbUser', { includeFavorites });
  const user = await currentUser();
  log.debug('currentUser', { user });
  if (!user) {
    return null;
  }
  log.debug('user.id', { userId: user.id });
  return await getUserByClerkId(user.id, includeFavorites);
}

/**
 * Create a new user in the database
 */
export async function createUser(data: {
  clerkId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  imageUrl?: string | null;
}): Promise<User> {
  log.debug('createUser', { data });
  return await prisma.user.create({
    data,
  });
}

/**
 * Update a user in the database
 */
export async function updateUser(
  clerkId: string,
  data: Partial<{
    email: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    imageUrl: string | null;
  }>
): Promise<User> {
  log.debug('updateUser', { clerkId, data });
  return await prisma.user.update({
    where: { clerkId },
    data,
  });
}

/**
 * Delete a user from the database
 */
export async function deleteUser(clerkId: string): Promise<User> {
  log.debug('deleteUser', { clerkId });
  return await prisma.user.delete({
    where: { clerkId },
  });
}

/**
 * Get or create a user in the database
 */
export async function getOrCreateUser(data: {
  clerkId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  imageUrl?: string | null;
}): Promise<User> {
  log.debug('getOrCreateUser', { data });
  const existingUser = await getUserByClerkId(data.clerkId);
  log.debug('existingUser', { existingUser });

  if (existingUser) {
    return existingUser;
  }

  return await createUser(data);
}
