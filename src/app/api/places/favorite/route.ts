import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import type { ErrorResponse } from '@/types/error-response';
import { log } from '@/utils/log';
import type { Favorite, Place } from '@prisma/client';
import { Prisma } from '@prisma/client';

/**
 * POST handler for favoriting a place
 * if the place is already favorited, it will be removed from the users favorites
 * if the place is not favorited, it will first create the place in the database
 * and then create the favorite relationship
 *
 * @param request - The Next.js request object containing the place ID in the body
 * @returns A NextResponse with:
 *   - 401 if user is not authenticated
 *   - 400 if place ID is missing
 *   - 404 if user is not found
 *   - 200 with favorite data on success
 */
export async function POST(request: NextRequest): Promise<
  NextResponse<
    | {
        message: string;
        place: Place;
        favorite: Favorite | null;
        action: 'added' | 'removed';
      }
    | ErrorResponse
  >
> {
  console.log('POST request received');
  const { userId: clerkId } = await auth();
  console.log('clerkId', { clerkId });

  if (!clerkId) {
    console.log('Unauthorized no clerkId');
    log.error('Unauthorized no clerkId');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      console.log('Place ID is required');
      log.error('Place ID is required');
      return NextResponse.json(
        { error: 'Place ID is required' },
        { status: 400 }
      );
    }

    console.log('Place ID', id);
    log.debug('Place ID', { placeId: id });
    log.debug('Clerk ID', { clerkId });

    // Use a transaction to ensure all database operations are atomic
    return await prisma.$transaction(
      async (tx) => {
        // Find the user by clerkId
        const user = await tx.user.findUnique({
          where: { clerkId: clerkId as string },
        });

        console.log('user found', user);

        if (!user) {
          console.log('User not found', { clerkId });
          log.error('User not found', { clerkId });
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }

        // Check if this place exists in the database
        let place = await tx.place.findUnique({
          where: { id },
        });

        console.log('place found', place);

        // If place doesn't exist, create it
        if (!place) {
          console.log('Place not found, creating it');
          log.debug('Place not found, creating it');
          place = await tx.place.create({
            data: {
              id,
            },
          });
        }

        // Check if the user has already favorited this place
        const existingFavorite = await tx.favorite.findUnique({
          where: {
            userId_placeId: {
              userId: user.id,
              placeId: place.id,
            },
          },
        });

        console.log('existingFavorite', existingFavorite);

        let action: 'added' | 'removed';
        let favorite: Favorite | null = null;

        // If favorite exists, remove it (toggle off)
        if (existingFavorite) {
          console.log('Favorite exists, removing it');
          log.debug('Favorite exists, removing it');
          await tx.favorite.delete({
            where: {
              id: existingFavorite.id,
            },
          });

          action = 'removed';
        } else {
          console.log('Favorite does not exist, creating it');
          log.debug('Favorite does not exist, creating it');
          // If favorite doesn't exist, create it (toggle on)
          favorite = await tx.favorite.create({
            data: {
              userId: user.id,
              placeId: place.id,
            },
          });

          action = 'added';
        }

        return NextResponse.json(
          {
            message: `Favorite ${action}`,
            place,
            favorite,
            action,
          },
          { status: 200 }
        );
      },
      {
        // Transaction options
        maxWait: 5000, // 5s max wait time
        timeout: 10000, // 10s timeout
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      }
    );
  } catch (error) {
    console.log('Failed to process favorite', { error });
    log.error('Failed to process favorite', { error });

    // Check for specific Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle known Prisma errors
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      // Handle unknown Prisma errors
      return NextResponse.json(
        { error: 'Database connection error. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process favorite' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check if a place is favorited by the authenticated user
 *
 * @param request - Next.js request object containing search params with place ID
 * @returns NextResponse with:
 *  - 200: {isFavorite: boolean, place: Place, favorite: Favorite | null} if successful
 *  - 400: {error: string} if place ID missing
 *  - 401: {error: string} if unauthorized
 *  - 404: {error: string} if user not found
 *  - 500: {error: string} if server error
 */
export async function GET(request: NextRequest): Promise<
  NextResponse<
    | {
        isFavorite: boolean;
        place?: Place;
        favorite?: Favorite | null;
        message?: string;
      }
    | ErrorResponse
  >
> {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get the place ID from the URL search params
    const searchParams = request.nextUrl.searchParams;
    const placeId = searchParams.get('id');

    if (!placeId) {
      return NextResponse.json(
        { error: 'Place ID is required in query params' },
        { status: 400 }
      );
    }

    log.debug('placeId', { placeId });

    // Use a transaction for consistent reads
    return await prisma.$transaction(
      async (tx) => {
        // Find the user by clerkId
        const user = await tx.user.findUnique({
          where: { clerkId: clerkId as string },
        });

        if (!user) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }

        // Check if the place exists
        const place = await tx.place.findUnique({
          where: { id: placeId },
        });

        if (!place) {
          return NextResponse.json(
            {
              isFavorite: false,
              message: 'Place not found',
            },
            { status: 200 }
          );
        }

        // Check if the user has favorited this place
        const favorite = await tx.favorite.findUnique({
          where: {
            userId_placeId: {
              userId: user.id,
              placeId: place.id,
            },
          },
        });

        return NextResponse.json(
          {
            isFavorite: !!favorite,
            place,
            favorite,
          },
          { status: 200 }
        );
      },
      {
        // Transaction options
        maxWait: 5000, // 5s max wait time
        timeout: 10000, // 10s timeout
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      }
    );
  } catch (error) {
    log.error('Failed to check favorite status', { error });

    // Check for specific Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle known Prisma errors
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      // Handle unknown Prisma errors
      return NextResponse.json(
        { error: 'Database connection error. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to check favorite status' },
      { status: 500 }
    );
  }
}
