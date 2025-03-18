import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getUserId } from '@/services/user/get-user-id';
import { log } from '@/utils/log';

// Validation schemas
const placeIdSchema = z.string().min(1);
const favoriteSchema = z.object({ placeId: placeIdSchema });
const favoritesSchema = z.array(favoriteSchema);

const ratingSchema = z.object({
  placeId: placeIdSchema,
  rating: z.number().int().min(1).max(5),
});
const ratingsSchema = z.array(ratingSchema);

// Rate limiting cache (simple in-memory solution)
const rateLimits = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_MAX = 10; // Max requests per minute
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

// Helper functions
async function checkRateLimit(userId: string): Promise<boolean> {
  const now = Date.now();
  const userRateLimit = rateLimits.get(userId);

  if (!userRateLimit) {
    rateLimits.set(userId, { count: 1, timestamp: now });
    return true;
  }

  // Reset counter if window has passed
  if (now - userRateLimit.timestamp > RATE_LIMIT_WINDOW_MS) {
    rateLimits.set(userId, { count: 1, timestamp: now });
    return true;
  }

  // Increment counter and check limit
  if (userRateLimit.count >= RATE_LIMIT_MAX) {
    return false;
  }

  userRateLimit.count += 1;
  return true;
}

/**
 * POST handler for syncing a user's favorites and ratings
 *
 * @param request - The NextRequest object containing the user's favorites and ratings
 * @param request.body - The body of the request containing the user's favorites and ratings
 * @param request.body.favorites - The user's favorites
 * @param request.body.ratings - The user's ratings
 *
 * @returns A NextResponse with the user's favorites and ratings
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    // Apply rate limiting
    const rateLimitPassed = await checkRateLimit(userId);
    if (!rateLimitPassed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // check if user exists in our database
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        favorites: true,
        ratings: true,
      },
    });

    // Dont create one if they dont exist, webhook should handle that
    // instead of creating a new user, we should just return an error
    if (!dbUser) {
      log.error('User not found in database');
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    const params = await request.json();
    const favorites = params?.favorites;
    const ratings = params?.ratings;

    // Track what was processed
    const result = {
      favorites: { processed: 0, created: 0, existing: 0, errors: 0 },
      ratings: { processed: 0, created: 0, existing: 0, updated: 0, errors: 0 },
    };

    // Process favorites
    if (favorites) {
      // Validate favorites data
      const validateResult = favoritesSchema.safeParse(favorites);

      if (!validateResult.success) {
        log.error('Invalid favorites', { error: validateResult.error });
        return NextResponse.json(
          { error: 'Invalid favorites' },
          { status: 400 }
        );
      }

      const validatedFavorites = validateResult.data;
      result.favorites.processed = validatedFavorites.length;

      try {
        // Use transaction to ensure data consistency
        await prisma.$transaction(async (tx) => {
          // Get all place IDs to check
          const placeIds = validatedFavorites.map((fav) => fav.placeId);

          // Find existing places in one query
          const existingPlaces = await tx.place.findMany({
            where: {
              id: {
                in: placeIds,
              },
            },
            select: { id: true },
          });

          const existingPlaceIds = new Set(existingPlaces.map((p) => p.id));

          // Create missing places in bulk
          const placesToCreate = placeIds
            .filter((id) => !existingPlaceIds.has(id))
            .map((id) => ({ id }));

          if (placesToCreate.length > 0) {
            await tx.place.createMany({
              data: placesToCreate,
              skipDuplicates: true,
            });
          }

          // Find existing user favorites in one query
          const existingFavorites = await tx.favorite.findMany({
            where: {
              userId,
              placeId: {
                in: placeIds,
              },
            },
            select: { placeId: true },
          });

          const existingFavoriteIds = new Set(
            existingFavorites.map((f) => f.placeId)
          );
          result.favorites.existing = existingFavoriteIds.size;

          // Create missing favorites in bulk
          const favoritesToCreate = validatedFavorites
            .filter((fav) => !existingFavoriteIds.has(fav.placeId))
            .map((fav) => ({
              userId,
              placeId: fav.placeId,
            }));

          if (favoritesToCreate.length > 0) {
            await tx.favorite.createMany({
              data: favoritesToCreate,
              skipDuplicates: true,
            });
            result.favorites.created = favoritesToCreate.length;
          }
        });
      } catch (error) {
        log.error('Error processing favorites', { error });
        result.favorites.errors = result.favorites.processed;
      }
    }

    // Process ratings
    if (ratings) {
      // Validate ratings data
      const validateResult = ratingsSchema.safeParse(ratings);

      if (!validateResult.success) {
        log.error('Invalid ratings', { error: validateResult.error });
        return NextResponse.json({ error: 'Invalid ratings' }, { status: 400 });
      }

      const validatedRatings = validateResult.data;
      result.ratings.processed = validatedRatings.length;

      try {
        // Use transaction to ensure data consistency
        await prisma.$transaction(async (tx) => {
          // Get all place IDs to check
          const placeIds = validatedRatings.map((r) => r.placeId);

          // Find existing places in one query
          const existingPlaces = await tx.place.findMany({
            where: {
              id: {
                in: placeIds,
              },
            },
            select: { id: true },
          });

          const existingPlaceIds = new Set(existingPlaces.map((p) => p.id));

          // Create missing places in bulk
          const placesToCreate = placeIds
            .filter((id) => !existingPlaceIds.has(id))
            .map((id) => ({ id }));

          if (placesToCreate.length > 0) {
            await tx.place.createMany({
              data: placesToCreate,
              skipDuplicates: true,
            });
          }

          // For ratings, we need to use upsert to handle both creation and updates
          // We need to do this one by one since Prisma doesn't support bulk upserts
          await Promise.all(
            validatedRatings.map(async (rating) => {
              try {
                const upsertResult = await tx.rating.upsert({
                  where: {
                    userId_placeId: {
                      userId,
                      placeId: rating.placeId,
                    },
                  },
                  update: {
                    rating: rating.rating,
                  },
                  create: {
                    userId,
                    placeId: rating.placeId,
                    rating: rating.rating,
                  },
                  select: {
                    id: true,
                    // We use this to determine if it was an update or create operation
                    createdAt: true,
                    updatedAt: true,
                  },
                });

                // If createdAt equals updatedAt, it's a new record
                if (
                  upsertResult.createdAt?.getTime() ===
                  upsertResult.updatedAt?.getTime()
                ) {
                  result.ratings.created++;
                } else {
                  result.ratings.updated++;
                }
              } catch (error) {
                result.ratings.errors++;
                log.error('Error upserting rating', {
                  error,
                  userId,
                  placeId: rating.placeId,
                });
              }
            })
          );
        });
      } catch (error) {
        log.error('Error processing ratings', { error });
        result.ratings.errors = result.ratings.processed;
      }
    }

    // Prepare and return response with cache control headers
    const response = NextResponse.json(
      {
        message: 'User synced',
        result,
      },
      { status: 200 }
    );

    // Add cache control headers
    response.headers.set('Cache-Control', 'private, max-age=0, no-cache');

    return response;
  } catch (error) {
    log.error('Error syncing user', { error });
    return NextResponse.json({ error: 'Error syncing user' }, { status: 500 });
  }
}
