import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserId } from '@/services/user/get-user-id';
import type { ErrorResponse } from '@/types/error-response';
import { log } from '@/utils/log';
import type { User, Favorite, Rating } from '@prisma/client';

type UserResponse = {
  user: User & {
    favorites?: Favorite[];
    ratings?: Rating[];
  };
};

// GET /api/user
// uses auth token approach instead of
// const { userId } = await auth()
// to work nicely with iOS app / clients outside
// of Next App
export async function GET(
  request: NextRequest
): Promise<NextResponse<UserResponse | ErrorResponse>> {
  try {
    const userId = await getUserId(request);

    // check if user exists in our database
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        favorites: true,
        ratings: true,
      },
    });

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
