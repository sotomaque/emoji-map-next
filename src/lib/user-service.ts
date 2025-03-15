import { currentUser } from '@clerk/nextjs/server';
import { prisma } from './db';
import type { User, Favorite } from '@prisma/client';

/**
 * Get a user by their Clerk ID
 */
export async function getUserByClerkId(
  clerkId: string,
  includeFavorites: boolean = false
): Promise<(User & { favorites?: Favorite[] }) | null> {
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
  const user = await currentUser();

  if (!user) {
    return null;
  }

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
  return await prisma.user.update({
    where: { clerkId },
    data,
  });
}

/**
 * Delete a user from the database
 */
export async function deleteUser(clerkId: string): Promise<User> {
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
  const existingUser = await getUserByClerkId(data.clerkId);

  if (existingUser) {
    return existingUser;
  }

  return await createUser(data);
}
