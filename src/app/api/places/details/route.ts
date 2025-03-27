import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getPlaceDetailsWithCache } from '@/services/places/details/get-place-details-with-cache/get-place-details-with-cache';
import { getSearchParams } from '@/services/places/details/get-search-params/get-search-params';
import type { DetailResponse } from '@/types/details';
import type { ErrorResponse } from '@/types/error-response';

/**
 * GET handler for the /api/places/details endpoint
 *
 * Fetches details for a specific place from Google Places API, with optional caching
 *
 * @param request - The incoming Next.js request object
 * @returns A JSON response containing either:
 *   - On success: A {@link DetailResponse} with place details and cache status
 *   - On error: An {@link ErrorResponse} with error details
 *
 * @example
 * ```ts
 * // Fetch details with caching (default)
 * GET /api/places/details?id=ChIJ...
 *
 * // Bypass cache and fetch fresh details
 * GET /api/places/details?id=ChIJ...&bypassCache=true
 * ```
 */

export async function GET(
  request: NextRequest
): Promise<NextResponse<DetailResponse | ErrorResponse>> {
  try {
    const { id, bypassCache } = getSearchParams(request);
    const details = await getPlaceDetailsWithCache({ id, bypassCache });

    // check if the place exists in prisma
    const place = await prisma.place.findUnique({
      where: {
        id: id,
      },
    });

    // if it doesn't exist, create it
    if (!place) {
      const googlePlaceDisplayName = details.data.displayName;
      const googlePlaceEditorialSummary = details.data.editorialSummary;
      const googlePlaceReviews = details.data.reviews
        .map((review) => ({
          name: review.name, // googles id for the review
          relativePublishTimeDescription: review.relativePublishTimeDescription,
          rating: review.rating,
          text: review.text?.text ?? '',
        }))
        .filter((review) => Boolean(review.text && review.text.length > 0));

      const latitude = details.data.location.latitude;
      const longitude = details.data.location.longitude;
      const formattedAddress = details.data.formattedAddress;

      await prisma.place.create({
        data: {
          id,
          name: googlePlaceDisplayName,
          description: googlePlaceEditorialSummary,
          latitude: latitude,
          longitude: longitude,
          address: formattedAddress,
          reviews: {
            createMany: {
              data: googlePlaceReviews,
            },
          },
        },
      });
    }

    return NextResponse.json(details);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch place details', message: String(error) },
      { status: 500 }
    );
  }
}
