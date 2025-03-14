import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
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

    return NextResponse.json(details);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch place details', message: String(error) },
      { status: 500 }
    );
  }
}
