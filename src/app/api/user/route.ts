import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import type { ErrorResponse } from '@/types/error-response';
import { log } from '@/utils/log';
import type { User, Favorite, Rating } from '@prisma/client';

export async function POST(): Promise<
  NextResponse<
    | {
        user: User;
      }
    | ErrorResponse
  >
> {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // check if user exists in our database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    // if user exists in our database, return the user
    if (dbUser) {
      return NextResponse.json({ user: dbUser });
    }

    // otherwise, create user in our database
    const newUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.emailAddresses[0].emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        imageUrl: user.imageUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

type UserResponse = {
  user: User & {
    favorites?: Favorite[];
    ratings?: Rating[];
  };
};

/**
 * Get user by userId
 * @param request - NextRequest
 * @returns NextResponse<UserResponse | ErrorResponse>
 *
 * @example No Favorites & No Ratings
 * ```ts
 * const response = await fetch('/api/user?userId=123');
 * const data = await response.json();
 * {
 *   "user": {
 *     "id": "123",
 *     "email": "test@example.com",
 *     "firstName": "Test",
 *     "lastName": "User",
 *   }
 * }
 *
 * @example With Favorites & Ratings
 * ```ts
 * const response = await fetch('/api/user?userId=123');
 * const data = await response.json();
 * {
 *   "user": {
 *     "id": "123",
 *     "email": "test@example.com",
 *     "firstName": "Test",
 *     "lastName": "User",
 *     "favorites": [
 *       {
 *         "id": "123",
 *         "name": "Favorite 1",
 *       },
 *       {
 *         "id": "456",
 *         "name": "Favorite 2",
 *       },
 *     ],
 *     "ratings": [
 *       {
 *         "id": "123",
 *         "rating": 5,
 *       },
 *     ],
 *   },
 *   "status": 200
 * }
 *
 * @example No userId param
 * ```ts
 * const response = await fetch('/api/user');
 * const data = await response.json();
 * {
 *   "error": "Unauthorized"
 *   "status": 400
 * }
 * ```
 *
 * @example User not found in database
 * ```ts
 * const response = await fetch('/api/user?userId=123');
 * const data = await response.json();
 * {
 *   "error": "User not found in database",
 *   "status": 404
 * }
 * ```
 *
 * @example Error fetching user
 * ```ts
 * const response = await fetch('/api/user?userId=123');
 * const data = await response.json();
 * {
 *   "error": "Failed to fetch user",
 *   "status": 500
 * }
 * ```
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<UserResponse | ErrorResponse>> {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      log.error('Unauthorized no userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 400 });
    }

    // check if user exists in our database
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        favorites: true,
        ratings: true,
      },
    });

    log.debug('dbUser', { dbUser });

    if (!dbUser) {
      log.error('User not found in database');
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: dbUser, status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
