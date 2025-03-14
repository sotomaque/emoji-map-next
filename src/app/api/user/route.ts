import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import type { ErrorResponse } from '@/types/error-response';
import { log } from '@/utils/log';
import type { User, Favorite } from '@prisma/client';

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

export async function GET(): Promise<
  NextResponse<
    | {
        user: User & { favorites?: Favorite[] };
      }
    | ErrorResponse
  >
> {
  try {
    // Get the current Clerk user
    const { userId } = await auth();

    log.debug('userId', { userId });
    if (!userId) {
      log.error('Unauthorized no userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // check if user exists in our database
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    log.debug('dbUser', { dbUser });

    if (!dbUser) {
      log.error('User not found in database');
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: dbUser });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
