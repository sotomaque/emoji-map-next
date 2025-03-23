import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import type { ErrorResponse } from '@/types/error-response';
import type { User } from '@prisma/client';

// Define an expanded user type that includes counts
export interface UserWithCounts extends User {
  favoritesCount: number;
  ratingsCount: number;
}

export interface PaginatedUserResponse {
  users: UserWithCounts[];
  totalCount: number;
  limit: number;
  offset: number;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<PaginatedUserResponse | ErrorResponse>> {
  // check if user is admin
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // check if user is admin
  if (!user?.publicMetadata?.admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get pagination parameters from query string
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  try {
    // First get the total count for pagination
    const totalCount = await prisma.user.count();

    // Get users with their favorites and ratings counts, with pagination
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            favorites: true,
            ratings: true,
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc', // Most recent users first
      },
    });

    // Transform the users to include the count properties
    const usersWithCounts = users.map((user) => ({
      ...user,
      favoritesCount: user._count.favorites,
      ratingsCount: user._count.ratings,
    }));

    return NextResponse.json({
      users: usersWithCounts,
      totalCount,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
