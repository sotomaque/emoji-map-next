import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { log } from '@/utils/log';

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    log.error('Unauthorized', {
      request,
    });

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();

    if (!id) {
      log.error('Place ID is required', {
        request,
      });

      return NextResponse.json(
        { error: 'Place ID is required' },
        { status: 400 }
      );
    }

    log.debug('Favorite request received', {
      id,
      clerkId,
    });

    // Find the user by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      log.debug('User not found', {
        clerkId,
      });

      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if this place exists in the database
    let place = await prisma.place.findUnique({
      where: { id },
    });

    log.success('Existing Place Found', { ...place });

    // If place doesn't exist, create it
    if (!place) {
      log.debug('Place not found, creating it', {
        id,
      });

      place = await prisma.place.create({
        data: {
          id,
        },
      });

      log.success('Place Created', { ...place });
    }

    // Check if the user has already favorited this place
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_placeId: {
          userId: user.id,
          placeId: place.id,
        },
      },
    });

    let action;
    let favorite;

    // If favorite exists, remove it (toggle off)
    if (existingFavorite) {
      log.debug('Favorite exists, removing it', {
        id: existingFavorite.id,
      });

      await prisma.favorite.delete({
        where: {
          id: existingFavorite.id,
        },
      });

      log.success('Favorite Removed', {
        id: existingFavorite.id,
      });

      action = 'removed';
    } else {
      log.debug('Favorite does not exist, creating it', {
        userId: user.id,
        placeId: place.id,
      });

      // If favorite doesn't exist, create it (toggle on)
      favorite = await prisma.favorite.create({
        data: {
          userId: user.id,
          placeId: place.id,
        },
      });

      log.success('Favorite Created', {
        id: favorite.id,
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
  } catch (error) {
    console.error('Error handling favorite:', error);
    return NextResponse.json(
      { error: 'Failed to process favorite' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    log.error('Unauthorized', {
      request: request.url,
    });

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get the place ID from the URL search params
    const searchParams = request.nextUrl.searchParams;
    const placeId = searchParams.get('id');

    if (!placeId) {
      log.error('Place ID is required', {
        request: request.url,
      });

      return NextResponse.json(
        { error: 'Place ID is required in query params' },
        { status: 400 }
      );
    }

    // Find the user by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      log.debug('User not found', {
        clerkId,
      });

      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if the place exists
    const place = await prisma.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      log.debug('Place not found', {
        placeId,
      });

      return NextResponse.json(
        {
          isFavorite: false,
          message: 'Place not found',
        },
        { status: 200 }
      );
    }

    // Check if the user has favorited this place
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_placeId: {
          userId: user.id,
          placeId: place.id,
        },
      },
    });

    log.success('Favorite status checked', {
      placeId,
      userId: user.id,
      isFavorite: !!favorite,
    });

    return NextResponse.json(
      {
        isFavorite: !!favorite,
        place,
        favorite,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return NextResponse.json(
      { error: 'Failed to check favorite status' },
      { status: 500 }
    );
  }
}
