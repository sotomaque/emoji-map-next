import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { log } from '@/utils/log';

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Place ID is required' },
        { status: 400 }
      );
    }

    log.debug('Place ID', { placeId: id });
    log.debug('Clerk ID', { clerkId });

    // Find the user by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      log.error('User not found', { clerkId });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if this place exists in the database
    let place = await prisma.place.findUnique({
      where: { id },
    });

    // If place doesn't exist, create it
    if (!place) {
      place = await prisma.place.create({
        data: {
          id,
        },
      });
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
      await prisma.favorite.delete({
        where: {
          id: existingFavorite.id,
        },
      });

      action = 'removed';
    } else {
      // If favorite doesn't exist, create it (toggle on)
      favorite = await prisma.favorite.create({
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
  } catch {
    return NextResponse.json(
      { error: 'Failed to process favorite' },
      { status: 500 }
    );
  }
}

// TODO: prob dont want to do this on the current /app route, instead want to query for all given users favorites

// thats one request vs this being 1 request per place
export async function GET(request: NextRequest) {
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

    // Find the user by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if the place exists
    const place = await prisma.place.findUnique({
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
    const favorite = await prisma.favorite.findUnique({
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
  } catch {
    return NextResponse.json(
      { error: 'Failed to check favorite status' },
      { status: 500 }
    );
  }
}
