import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import type { ErrorResponse } from '@/types/error-response';
import { getOrCreateUser, getCurrentDbUser } from '../../../lib/user-service';
import type { User } from '@prisma/client';

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

    // Get or create the user in our database
    const dbUser = await getOrCreateUser({
      clerkId: user.id,
      email: user.emailAddresses[0].emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      imageUrl: user.imageUrl,
    });

    return NextResponse.json({ user: dbUser });
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
        user: User;
      }
    | ErrorResponse
  >
> {
  try {
    // Get the current Clerk user
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user from our database
    const dbUser = await getCurrentDbUser();

    if (!dbUser) {
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
