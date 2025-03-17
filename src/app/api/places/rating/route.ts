import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { ErrorResponse } from '@/types/error-response';
import { log } from '@/utils/log';
import type { Place, Rating } from '@prisma/client';

/**
 * POST handler for rating a place
 * if the place is already rated, it will be updated with the new rating
 * if the place is not created, it will first create the place in the database
 * and then create the rating relationship
 *
 * @param request - The Next.js request object containing the place ID in the body
 * @returns A NextResponse with:
 *   - 401 if user is not authenticated
 *   - 400 if place ID is not provided
 *   - 404 if user is not found
 *   - 200 with rating data on success
 */
export async function POST(request: NextRequest): Promise<
  NextResponse<
    | {
        message: string;
        place: Place;
        rating: Rating | null;
        action: 'added' | 'removed' | 'updated';
      }
    | ErrorResponse
  >
> {
  const params = await request.json();
  const userId = params?.user_id || params?.userId;

  if (!userId) {
    log.error('Unauthorized no userId');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const placeId = params?.place_id || params?.id || params?.placeId;

  if (!placeId) {
    log.error('Place ID is required');
    return NextResponse.json(
      { error: 'Place ID is required' },
      { status: 400 }
    );
  }

  const userRating = params?.rating;

  try {
    // Find the user by id
    const user = await prisma.user.findUnique({
      where: { id: userId as string },
    });

    if (!user) {
      log.error('User not found', { userId });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if this place exists in the database
    let place = await prisma.place.findUnique({
      where: { id: placeId },
    });

    // If place doesn't exist, create it
    if (!place) {
      log.debug('Place not found, creating it');
      place = await prisma.place.create({
        data: {
          id: placeId,
        },
      });
    }

    // Check if the user has already rated this place
    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_placeId: {
          userId: user.id,
          placeId: place.id,
        },
      },
    });

    if (!userRating) {
      log.error(
        'Rating not provided, if exiting rating found, it will be removed'
      );
    }

    let action: 'added' | 'removed' | 'updated';
    let rating: Rating | null = null;

    // If rating exists, check if the rating is being updated or removed
    if (existingRating) {
      log.debug('Prior exists');

      if (existingRating.rating === userRating || !userRating) {
        log.debug('Rating is being removed');
        rating = await prisma.rating.delete({
          where: { id: existingRating.id },
        });
        action = 'removed';
      } else {
        log.debug('Rating is being updated');
        rating = await prisma.rating.update({
          where: { id: existingRating.id },
          data: { rating: userRating },
        });
        action = 'updated';
      }
    } else {
      log.debug('Rating does not exist, creating it');
      // If rating doesn't exist, create it (toggle on)
      if (!userRating) {
        return NextResponse.json(
          { error: 'Rating is required' },
          { status: 400 }
        );
      }

      rating = await prisma.rating.create({
        data: {
          userId: user.id,
          placeId: place.id,
          rating: userRating,
        },
      });

      action = 'added';
    }

    return NextResponse.json(
      {
        message:
          action === 'added'
            ? 'Rating added'
            : action === 'updated'
            ? 'Rating updated'
            : 'Rating removed',
        place,
        rating,
        action,
      },
      { status: 200 }
    );
  } catch (error) {
    log.error('Failed to process rating', { error });
    return NextResponse.json(
      { error: 'Failed to process rating' },
      { status: 500 }
    );
  }
}
