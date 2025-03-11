import type { NextRequest } from 'next/server';
import _ from 'lodash';
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

export function getSearchParams(request: NextRequest): SearchParams {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  // KEYS
  const keyParams = searchParams.getAll('key');
  let keys: number[];

  // Get all valid category keys
  const validCategoryKeys = CATEGORY_MAP.map((category) => category.key);

  // Fix keys handling: properly process when keys are provided
  if (_.isEmpty(keyParams)) {
    // If no keys provided, use all valid category keys
    keys = validCategoryKeys;
  } else {
    // Filter and convert provided keys
    keys = _(keyParams)
      .map((k) => _.toNumber(k))
      .filter((k) => !_.isNaN(k) && validCategoryKeys.includes(k))
      .uniq() // Add uniq to prevent duplicate keys
      .value();
  }

  // LOCATION
  const location = searchParams.get('location');

  // BUFFER MILES
  const bufferMilesParam = searchParams.get('bufferMiles');
  const bufferMiles = _.isNull(bufferMilesParam)
    ? undefined
    : Number.isFinite(_.toNumber(bufferMilesParam))
      ? _.toNumber(bufferMilesParam)
      : undefined;

  // OPEN NOW
  const openNowParam = searchParams.get('openNow');
  const openNow = _.isNull(openNowParam)
    ? undefined
    : _.toLower(openNowParam) === 'true';

  // BYPASS CACHE
  const bypassCacheParam = searchParams.get('bypassCache');
  const bypassCache = _.isNull(bypassCacheParam)
    ? undefined
    : _.toLower(bypassCacheParam) === 'true';

  // LIMIT
  const limitParam = searchParams.get('limit');
  const limit = _.isNull(limitParam)
    ? undefined
    : Number.isFinite(_.toNumber(limitParam))
      ? _.toNumber(limitParam)
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
