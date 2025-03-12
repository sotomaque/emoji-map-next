import type { NextRequest } from 'next/server';
import { isEmpty, isFinite, parseInt } from 'lodash-es';
import { PHOTOS_CONFIG } from '@/constants/photos';

/**
 * Interface for the validated search parameters
 */
interface PhotoSearchParams {
  id: string;
  limit: number;
  bypassCache: boolean;
}

/**
 * Extracts and validates search parameters from the request using Lodash.
 *
 * @param request - The NextRequest object containing the request details.
 * @returns An object containing the validated id, limit, and bypassCache parameters.
 * @throws An error if the id parameter is missing.
 *
 * @remarks
 * The `bypassCache` parameter is considered true in any of these cases:
 * - When it's present without a value (e.g., `?bypassCache`)
 * - When it's present with an empty value (e.g., `?bypassCache=`)
 * - When it's present with the value "true" (case-insensitive, e.g., `?bypassCache=true` or `?bypassCache=TRUE`)
 *
 * In all other cases, including when the parameter is not present or has any other value,
 * `bypassCache` will be false.
 *
 * @example
 * // Request URL: /api/places/photos?id=place123&limit=5
 * const params = getSearchParams(request);
 * // Result: { id: "place123", limit: 5, bypassCache: false }
 *
 * @example
 * // Request URL: /api/places/photos?id=place123&bypassCache
 * const params = getSearchParams(request);
 * // Result: { id: "place123", limit: 10, bypassCache: true }
 *
 * @example
 * // Request URL: /api/places/photos?id=place123&bypassCache=TRUE
 * const params = getSearchParams(request);
 * // Result: { id: "place123", limit: 10, bypassCache: true }
 */
export function getSearchParams(request: NextRequest): PhotoSearchParams {
  const searchParams = request.nextUrl.searchParams;

  // Extract id parameter and validate
  const idParam = searchParams.get('id');
  if (isEmpty(idParam)) {
    throw new Error('Missing required parameter: id');
  }

  // Extract and parse limit parameter with fallback to default
  const limitParam = searchParams.get('limit');

  // Use Lodash's parseInt which handles null/undefined gracefully
  // and isFinite to ensure we have a valid positive number
  let limit: number = PHOTOS_CONFIG.DEFAULT_LIMIT;
  if (!isEmpty(limitParam)) {
    const parsedLimit = parseInt(limitParam as string);
    if (isFinite(parsedLimit) && parsedLimit > 0) {
      limit = parsedLimit;
    }
  }

  // Extract bypassCache parameter
  // bypassCache is true if:
  // 1. The parameter exists with no value (e.g., ?bypassCache)
  // 2. The parameter exists with value 'true' (case-insensitive)
  const bypassCacheParam = searchParams.get('bypassCache');
  const hasParam = searchParams.has('bypassCache');
  const bypassCache =
    hasParam &&
    (bypassCacheParam === null ||
      bypassCacheParam === '' ||
      bypassCacheParam.toLowerCase() === 'true');

  return {
    id: idParam as string,
    limit,
    bypassCache,
  };
}
