import type { NextRequest } from 'next/server';
import { isEmpty, isNaN, isNull, toLower, toNumber, uniq } from 'lodash-es';
import { CATEGORY_MAP } from '@/constants/category-map';

interface SearchParams {
  // REQUIRED
  keys: number[];
  location: string | null;

  // OPTIONAL
  openNow?: boolean;
  bypassCache?: boolean;
  limit?: number;
  bufferMiles?: number;
}

/**
 * Extracts and validates search parameters from the request.
 *
 * @param request - The NextRequest object containing the request details
 * @returns An object containing the validated search parameters
 *
 * @remarks
 * The `bypassCache` parameter is considered true in any of these cases:
 * - When it's present without a value (e.g., `?bypassCache`)
 * - When it's present with an empty value (e.g., `?bypassCache=`)
 * - When it's present with the value "true" (case-insensitive, e.g., `?bypassCache=true` or `?bypassCache=TRUE`)
 *
 * It's considered false when it's present with any other value.
 * It's undefined when the parameter is not present at all.
 */
export function getSearchParams(request: NextRequest): SearchParams {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  // KEYS
  const keyParams = searchParams.getAll('key');
  let keys: number[];

  // Get all valid category keys
  const validCategoryKeys = CATEGORY_MAP.map((category) => category.key);

  // Fix keys handling: properly process when keys are provided
  if (isEmpty(keyParams)) {
    // If no keys provided, use all valid category keys
    keys = validCategoryKeys;
  } else {
    // Filter and convert provided keys
    keys = uniq(
      keyParams
        .map((k) => toNumber(k))
        .filter((k) => !isNaN(k) && validCategoryKeys.includes(k))
    );
  }

  // LOCATION
  const location = searchParams.get('location');

  // BUFFER MILES
  const bufferMilesParam = searchParams.get('bufferMiles');
  const bufferMiles = isNull(bufferMilesParam)
    ? undefined
    : Number.isFinite(toNumber(bufferMilesParam))
    ? toNumber(bufferMilesParam)
    : undefined;

  // OPEN NOW
  const openNowParam = searchParams.get('openNow');
  const openNow = isNull(openNowParam)
    ? undefined
    : toLower(openNowParam) === 'true';

  // BYPASS CACHE
  // bypassCache is true if:
  // 1. The parameter exists with no value (e.g., ?bypassCache)
  // 2. The parameter exists with empty value (e.g., ?bypassCache=)
  // 3. The parameter exists with value 'true' (case-insensitive)
  const bypassCacheParam = searchParams.get('bypassCache');
  const hasParam = searchParams.has('bypassCache');

  // If the parameter is not present, return undefined
  // If it is present, determine if it should be true or false
  const bypassCache = !hasParam
    ? undefined
    : bypassCacheParam === null ||
      bypassCacheParam === '' ||
      toLower(bypassCacheParam) === 'true';

  // LIMIT
  const limitParam = searchParams.get('limit');
  const limit = isNull(limitParam)
    ? undefined
    : Number.isFinite(toNumber(limitParam))
    ? toNumber(limitParam)
    : undefined;

  return {
    location,
    bufferMiles,
    openNow,
    bypassCache,
    keys,
    limit,
  };
}
