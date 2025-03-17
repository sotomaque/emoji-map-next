import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CATEGORY_MAP } from '@/constants/category-map';
import { SEARCH_CONFIG } from '@/constants/search';
import { env } from '@/env';
import { redis } from '@/lib/redis';
import type { ErrorResponse } from '@/types/error-response';
import { log } from '@/utils/log';

// TODO for tomoro
// BETTER EMOJI MATCHING
// IE MCDONALDS matches coffee instead of burger
// DAVES HOT CHICKEN matches restaurant instead of chicken
// SAME WITH CHICK FILA
const FIELDS = [
  'places.name',
  'places.id',
  'places.types',
  'places.location',
  'places.currentOpeningHours.openNow',
  'places.priceLevel',
  'places.rating',
  'places.displayName.text',
].join(',');

// TODO:
// in the default case where no keys are provided
// instead of taking all of our categories primary types and making a bunch of requests
// lets potentially just hard code the desired type to "food" / "restaurant"
// or whatever google expect

/**
 * Generates a cache key for the search request
 * @param latitude Latitude of the search location
 * @param longitude Longitude of the search location
 * @param radius Search radius in meters
 * @param key Category key
 * @param openNow Whether to filter for places that are open now
 * @param priceLevels Array of price levels to filter by
 * @returns A formatted cache key
 *
 * @example
 * generateCacheKey(37.7749, -122.4194, 1000, 1) // "search:v1:37.77:37.77:-122.42:1000:1"
 */
function generateCacheKey(
  latitude: number,
  longitude: number,
  radius: number,
  key: number,
  openNow?: boolean,
  priceLevels?: number[]
): string {
  // Round coordinates to SEARCH_CONFIG.LOCATION_DIGITS decimal places for better cache hits
  const roundedLat = Number(latitude).toFixed(SEARCH_CONFIG.LOCATION_DIGITS);
  const roundedLng = Number(longitude).toFixed(SEARCH_CONFIG.LOCATION_DIGITS);

  let cacheKey = `${SEARCH_CONFIG.CACHE_KEY}:${SEARCH_CONFIG.CACHE_KEY_VERSION}:${roundedLat}:${roundedLng}:${radius}:${key}`;

  // Add optional parameters to the cache key if they're provided
  if (openNow !== undefined) {
    cacheKey += `:openNow=${openNow}`;
  }

  if (priceLevels !== undefined && priceLevels.length > 0) {
    // Check if priceLevels contains all possible values [1,2,3,4]
    const hasAllPriceLevels =
      priceLevels.length === 4 &&
      priceLevels.includes(1) &&
      priceLevels.includes(2) &&
      priceLevels.includes(3) &&
      priceLevels.includes(4);

    // Only add to cache key if not all price levels are included
    if (!hasAllPriceLevels) {
      cacheKey += `:priceLevels=${priceLevels.sort().join('-')}`;
    }
  }

  return cacheKey;
}

/**
 * Chunks an array into smaller arrays of a specified size
 * @param array The array to chunk
 * @param chunkSize The maximum size of each chunk
 * @returns An array of chunks
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Finds the best matching emoji for a place based on its types
 * @param placeTypes Array of place types from Google Places API
 * @param selectedKeys Array of category keys that were selected for the search
 * @returns The best matching emoji
 */
function findBestMatchingEmoji(
  placeTypes: string[],
  selectedKeys: number[] = []
): string {
  // Default emoji if no match is found
  const DEFAULT_EMOJI = '🍽️';

  // If no place types, return default emoji
  if (!placeTypes || placeTypes.length === 0) {
    return DEFAULT_EMOJI;
  }

  // Filter CATEGORY_MAP to only include selected categories if any were selected
  const categoriesToConsider =
    selectedKeys.length > 0
      ? CATEGORY_MAP.filter((cat) => selectedKeys.includes(cat.key))
      : CATEGORY_MAP;

  // Find categories that have matching primary types with the place
  const matchingCategories = categoriesToConsider.filter((category) => {
    if (!category.primaryType) return false;

    // Check if any of the place types match any of the category's primary types
    return category.primaryType.some((type) => placeTypes.includes(type));
  });

  // If no matching categories, return default emoji
  if (matchingCategories.length === 0) {
    return DEFAULT_EMOJI;
  }

  // Count the number of matching types for each category
  const categoryMatches = matchingCategories.map((category) => {
    const matchCount =
      category.primaryType?.filter((type) => placeTypes.includes(type))
        .length || 0;

    return {
      category,
      matchCount,
    };
  });

  // Sort by match count (descending)
  categoryMatches.sort((a, b) => b.matchCount - a.matchCount);

  // Return the emoji of the category with the most matches
  return categoryMatches[0].category.emoji;
}

// Define types for Google Places API request
interface LocationRestriction {
  circle: {
    center: {
      latitude: number;
      longitude: number;
    };
    radius: number;
  };
}

interface GooglePlacesSearchParams {
  languageCode: string;
  regionCode: string;
  includedTypes: string[];
  includedPrimaryTypes?: string[];
  excludedPrimaryTypes: string[];
  locationRestriction?: LocationRestriction;
  /*
  Maximum number of results to return. It must be between 1 and 20 (default), inclusively. If the number is unset, it falls back to the upper limit. If the number is set to negative or exceeds the upper limit, an INVALID_ARGUMENT error is returned.
  */
  maxResultCount?: number;
  // Note: openNow and maxPriceLevel are not supported directly by the API
  // We handle these filters in our own code after receiving the response
}

const priceLevelEnum = z.enum([
  'PRICE_LEVEL_UNSPECIFIED',
  'PRICE_LEVEL_FREE',
  'PRICE_LEVEL_INEXPENSIVE',
  'PRICE_LEVEL_MODERATE',
  'PRICE_LEVEL_EXPENSIVE',
  'PRICE_LEVEL_VERY_EXPENSIVE',
]);

// Define Zod schema for Google Places API response
const GooglePlaceSchema = z.object({
  name: z.string(),
  id: z.string(),
  types: z.array(z.string()),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  currentOpeningHours: z
    .object({
      openNow: z.boolean().optional(),
    })
    .optional(),
  priceLevel: priceLevelEnum.optional().default('PRICE_LEVEL_UNSPECIFIED'),
  rating: z.number().optional(),
  displayName: z
    .object({
      text: z.string(),
    })
    .optional(),
});

const GooglePlacesResponseSchema = z.object({
  places: z.array(GooglePlaceSchema).optional(),
  error: z
    .object({
      code: z.number(),
      message: z.string(),
      status: z.string(),
    })
    .optional(),
});

// Infer TypeScript type from Zod schema
type GooglePlaceResult = z.infer<typeof GooglePlaceSchema>;

// Define the shape of our transformed response
interface TransformedPlace {
  id: string;
  location: {
    latitude: number;
    longitude: number;
  };
  emoji: string;
}

type SearchResponse = {
  results: TransformedPlace[];
  count: number;
  cacheHit: boolean;
};

// Define a type for the raw API response
type GooglePlacesApiResponse = z.infer<typeof GooglePlacesResponseSchema>;

/**
 * Transforms a Google Place result into our application's format
 * @param place The Google Place result to transform
 * @param key The category key used to find this place (used for emoji selection only)
 * @returns A transformed place object
 */
function transformPlace(
  place: GooglePlaceResult,
  key?: number
): TransformedPlace {
  return {
    id: place.id,
    location: place.location,
    emoji: findBestMatchingEmoji([...(place.types || [])], key ? [key] : []),
  };
}

/**
 * Checks the cache for places matching the given key and search parameters
 * @param cacheKey The cache key to check
 * @param key The category key
 * @param shouldBypassCache Whether to bypass the cache
 * @returns An object containing the cached places (if any) and whether it was a cache hit
 */
async function checkCache(
  cacheKey: string,
  key: number,
  shouldBypassCache: boolean
): Promise<{ cachedPlaces: GooglePlaceResult[] | null; isCacheHit: boolean }> {
  if (shouldBypassCache) {
    return { cachedPlaces: null, isCacheHit: false };
  }

  try {
    const cachedPlaces = await redis.get<GooglePlaceResult[]>(cacheKey);
    if (cachedPlaces && cachedPlaces.length > 0) {
      log.success(`[CACHE HIT] for key ${key}`, { cacheKey });

      // Don't limit cached results here - we'll filter first and then limit
      return { cachedPlaces: cachedPlaces, isCacheHit: true };
    }
    log.debug(`[CACHE MISS] for key ${key}`, { cacheKey });
    return { cachedPlaces: null, isCacheHit: false };
  } catch (error) {
    log.error(`[CACHE ERROR] for key ${key}`, { error, cacheKey });
    return { cachedPlaces: null, isCacheHit: false };
  }
}

/**
 * Caches places for a given key and search parameters
 * @param cacheKey The cache key to use
 * @param places The places to cache
 * @param key The category key
 * @param shouldBypassCache Whether to bypass the cache
 */
async function cachePlaces(
  cacheKey: string,
  places: GooglePlaceResult[],
  key: number,
  shouldBypassCache: boolean
): Promise<void> {
  if (places.length === 0 || shouldBypassCache) {
    return;
  }

  try {
    await redis.set(cacheKey, places, {
      ex: SEARCH_CONFIG.CACHE_EXPIRATION_TIME,
    });
    log.success(`[CACHE SET] for key ${key}`, { cacheKey });
  } catch (error) {
    log.error(`[CACHE ERROR] Failed to set cache for key ${key}`, {
      error,
      cacheKey,
    });
  }
}

/**
 * Checks if a place is currently open
 * @param place The Google Place result to check
 * @param openNow Whether to filter for places that are open now
 * @returns True if the place is open or if openNow is not set, false otherwise
 */
function isPlaceOpen(place: GooglePlaceResult, openNow?: boolean): boolean {
  // If openNow is not set or false, don't filter
  if (!openNow) {
    return true;
  }

  // Check if the place has currentOpeningHours and is open now
  return !!place.currentOpeningHours?.openNow;
}

/**
 * Checks if a place matches the requested price levels
 * @param place The Google Place result to check
 * @param priceLevels Array of price levels to filter by (1-4)
 * @returns True if the place matches any of the price levels or if priceLevels is not set, false otherwise
 */
function matchesPriceLevel(
  place: GooglePlaceResult,
  priceLevels?: number[]
): boolean {
  // Debug logging
  console.log(
    `Checking place ${place.name} with price level ${place.priceLevel} against requested levels:`,
    priceLevels
  );

  // If priceLevels is not set or empty, don't filter
  if (!priceLevels || priceLevels.length === 0) {
    console.log('No price levels specified, not filtering');
    return true;
  }

  // If priceLevels contains all possible values [1,2,3,4], treat it as if it were empty (no filtering)
  if (
    priceLevels.length === 4 &&
    priceLevels.includes(1) &&
    priceLevels.includes(2) &&
    priceLevels.includes(3) &&
    priceLevels.includes(4)
  ) {
    console.log('All price levels selected, not filtering');
    return true;
  }

  // If the place doesn't have a price level or it's unspecified, include it if we're filtering for level 1 (inexpensive)
  // This is a compromise to avoid filtering out too many places
  if (!place.priceLevel || place.priceLevel === 'PRICE_LEVEL_UNSPECIFIED') {
    const includeUnspecified = priceLevels.includes(1);
    console.log(
      `Place has no price level or unspecified, ${
        includeUnspecified ? 'including' : 'excluding'
      } (treating as level 1)`
    );
    return includeUnspecified;
  }

  // Always include free places regardless of the requested price levels
  if (place.priceLevel === 'PRICE_LEVEL_FREE') {
    console.log('Place is free, including regardless of filters');
    return true;
  }

  // Map the place's price level to a numeric value
  let placeNumericLevel: number;
  switch (place.priceLevel) {
    case 'PRICE_LEVEL_INEXPENSIVE':
      placeNumericLevel = 1;
      break;
    case 'PRICE_LEVEL_MODERATE':
      placeNumericLevel = 2;
      break;
    case 'PRICE_LEVEL_EXPENSIVE':
      placeNumericLevel = 3;
      break;
    case 'PRICE_LEVEL_VERY_EXPENSIVE':
      placeNumericLevel = 4;
      break;
    default:
      console.log('Unknown price level, excluding');
      return false; // Shouldn't happen, but just in case
  }

  // Check if the place's price level is in the requested levels
  const matches = priceLevels.includes(placeNumericLevel);
  console.log(`Place numeric level: ${placeNumericLevel}, matches: ${matches}`);
  return matches;
}

/**
 * Checks if a place meets the minimum rating requirement
 * @param place The Google Place result to check
 * @param minimumRating The minimum rating to filter by (1-5)
 * @returns True if the place meets the minimum rating or if minimumRating is not set, false otherwise
 */
function meetsMinimumRating(
  place: GooglePlaceResult,
  minimumRating?: number
): boolean {
  // If minimumRating is not set, don't filter
  if (minimumRating === undefined) {
    return true;
  }

  // If the place doesn't have a rating, exclude it
  if (place.rating === undefined) {
    console.log(
      `Place ${place.name} has no rating, excluding from minimum rating filter`
    );
    return false;
  }

  // Check if the place's rating meets the minimum
  const meets = place.rating >= minimumRating;
  console.log(
    `Place ${place.name} has rating ${place.rating}, minimum required: ${minimumRating}, meets: ${meets}`
  );
  return meets;
}

/**
 * Makes an API request with timeout and retry logic
 * @param url The URL to fetch
 * @param options Fetch options
 * @param timeoutMs Timeout in milliseconds
 * @param retries Number of retries
 * @returns The response data
 */
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  timeoutMs: number = 10000,
  retries: number = 2
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create an AbortController for this attempt
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // Add the signal to the options
      const fetchOptions = {
        ...options,
        signal: controller.signal,
      };

      try {
        const response = await fetch(url, fetchOptions);

        // Clear the timeout
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(
            `HTTP error ${response.status}: ${response.statusText}`
          );
        }

        return (await response.json()) as T;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      lastError = error as Error;

      // If this was an abort error (timeout), log it specifically
      if (error instanceof Error && error.name === 'AbortError') {
        log.warn(
          `Request timed out after ${timeoutMs}ms, attempt ${attempt + 1}/${
            retries + 1
          }`,
          { url }
        );
      } else {
        log.warn(`Request failed, attempt ${attempt + 1}/${retries + 1}`, {
          url,
          error,
        });
      }

      // If this was the last retry, throw the error
      if (attempt === retries) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      const backoffMs = Math.min(1000 * Math.pow(2, attempt), 5000);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  // This should never be reached due to the throw in the loop, but TypeScript doesn't know that
  throw lastError || new Error('Unknown error in fetchWithRetry');
}

/**
 * Executes promises with limited concurrency
 * @param tasks Array of functions that return promises
 * @param concurrency Maximum number of promises to execute at once
 * @returns Array of results in the same order as the tasks
 */
async function limitConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number = 5
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let currentIndex = 0;

  // Helper function to process a task
  async function processTask(taskIndex: number): Promise<void> {
    // If we've processed all tasks, we're done
    if (taskIndex >= tasks.length) return;

    // Execute the task and store its result
    try {
      results[taskIndex] = await tasks[taskIndex]();
    } catch (error) {
      // Store the error as the result
      results[taskIndex] = error as T;
    }

    // Process the next task
    const nextIndex = currentIndex++;
    if (nextIndex < tasks.length) {
      await processTask(nextIndex);
    }
  }

  // Start initial batch of tasks
  const initialBatch: Promise<void>[] = [];
  const initialCount = Math.min(concurrency, tasks.length);

  for (let i = 0; i < initialCount; i++) {
    initialBatch.push(processTask(currentIndex++));
  }

  // Wait for all tasks to complete
  await Promise.all(initialBatch);

  return results;
}

/**
 * Fetches places from the Google Places API for a given category key and search parameters
 * @param key The category key to search for
 * @param baseSearchParams The base search parameters
 * @param location The location to search around
 * @param radius The radius to search within
 * @param shouldBypassCache Whether to bypass the cache
 * @param openNow Whether to filter for places that are open now
 * @param priceLevels Array of price levels to filter by
 * @param maxResultCount Optional maxResultCount to limit the cached results
 * @param minimumRating Optional minimum rating to filter by
 * @returns An array of Google Place results
 */
async function fetchPlacesForKey(
  key: number,
  baseSearchParams: GooglePlacesSearchParams,
  location: { latitude: number; longitude: number },
  radius: number,
  shouldBypassCache: boolean,
  openNow?: boolean,
  priceLevels?: number[],
  maxResultCount?: number,
  minimumRating?: number
): Promise<{ places: GooglePlaceResult[]; isCacheHit: boolean }> {
  // Get the category for this key
  const category = CATEGORY_MAP.find((cat) => cat.key === key);
  if (!category || !category.primaryType) {
    log.warn(`No category found for key ${key} or no primaryType defined`);
    return { places: [], isCacheHit: false };
  }

  // Generate cache key for this request
  const cacheKey = generateCacheKey(
    location.latitude,
    location.longitude,
    radius,
    key,
    openNow,
    priceLevels
  );

  // Check cache first if not bypassing
  const { cachedPlaces, isCacheHit } = await checkCache(
    cacheKey,
    key,
    shouldBypassCache
  );

  if (cachedPlaces) {
    // Filter the cached places based on openNow and priceLevels
    const filteredCachedPlaces = cachedPlaces.filter(
      (place) =>
        isPlaceOpen(place, openNow) &&
        matchesPriceLevel(place, priceLevels) &&
        meetsMinimumRating(place, minimumRating)
    );

    // Apply maxResultCount after filtering
    const limitedPlaces =
      maxResultCount && maxResultCount > 0
        ? filteredCachedPlaces.slice(0, maxResultCount)
        : filteredCachedPlaces;

    return { places: limitedPlaces, isCacheHit };
  }

  // Get primary types for this category
  const primaryTypes = category.primaryType;

  // If we have more than 50 primary types, we need to chunk them
  const primaryTypeChunks = chunkArray(primaryTypes, 50);

  // Collect all places for this key
  const placesForKey: GooglePlaceResult[] = [];

  const GOOGLE_SEARCH_BASE_URL = `${env.GOOGLE_PLACES_URL}/places:searchNearby`;
  const GOOGLE_API_KEY = env.GOOGLE_PLACES_API_KEY;

  // Process each chunk of primary types for this key
  for (const chunk of primaryTypeChunks) {
    const searchParams: GooglePlacesSearchParams = {
      ...baseSearchParams,
      includedPrimaryTypes: chunk,
    };

    log.debug(`Making request for key ${key} with types`, {
      key,
      types: chunk,
      categoryName: category.name,
    });

    const searchUrl = `${GOOGLE_SEARCH_BASE_URL}?fields=${FIELDS}&key=${GOOGLE_API_KEY}`;

    log.debug('Search URL', { searchUrl });

    try {
      // Use fetchWithRetry instead of direct fetch
      const rawData = await fetchWithRetry<GooglePlacesApiResponse>(
        searchUrl,
        {
          method: 'POST',
          body: JSON.stringify(searchParams),
        },
        15000, // 15 second timeout
        2 // 2 retries (3 attempts total)
      );

      const validatedData = GooglePlacesResponseSchema.parse(rawData);

      // Extract places from the validated data
      const places = validatedData.places || [];

      // Add places to our collection for this key
      placesForKey.push(...places);
    } catch (error) {
      log.error(`Failed to validate response data for key ${key}`, {
        key,
        error,
      });
      // Continue processing other chunks even if one fails
    }
  }

  // Cache the results for this key if we got any
  await cachePlaces(cacheKey, placesForKey, key, shouldBypassCache);

  return { places: placesForKey, isCacheHit: false };
}

/**
 * Fetches places from the Google Places API for multiple category keys at once
 * by combining their primary types into a single request
 * @param keys Array of category keys to search for
 * @param baseSearchParams The base search parameters
 * @param location The location to search around
 * @param radius The radius to search within
 * @param shouldBypassCache Whether to bypass the cache
 * @param openNow Whether to filter for places that are open now
 * @param priceLevels Array of price levels to filter by
 * @param minimumRating Optional minimum rating to filter by
 * @returns An array of Google Place results with their associated keys
 */
async function fetchPlacesForMultipleKeys(
  keys: number[],
  baseSearchParams: GooglePlacesSearchParams,
  location: { latitude: number; longitude: number },
  radius: number,
  shouldBypassCache: boolean,
  openNow?: boolean,
  priceLevels?: number[],
  minimumRating?: number
): Promise<{
  places: (GooglePlaceResult & { key?: number })[];
  isCacheHit: boolean;
}> {
  // Generate a combined cache key for all keys
  // Round coordinates to CACHE_CONFIG.LOCATION_DIGITS decimal places for better cache hits
  const roundedLat = Number(location.latitude).toFixed(
    SEARCH_CONFIG.LOCATION_DIGITS
  );
  const roundedLng = Number(location.longitude).toFixed(
    SEARCH_CONFIG.LOCATION_DIGITS
  );

  // Start with the base key format
  let combinedCacheKey = `${SEARCH_CONFIG.CACHE_KEY}:${
    SEARCH_CONFIG.CACHE_KEY_VERSION
  }:combined:${roundedLat}:${roundedLng}:${radius}:${keys.join(',')}`;

  // Add optional parameters if they're provided, matching the format of individual cache keys
  if (openNow !== undefined) {
    combinedCacheKey += `:openNow=${openNow}`;
  }
  if (priceLevels !== undefined && priceLevels.length > 0) {
    combinedCacheKey += `:priceLevels=${priceLevels.join('|')}`;
  }
  if (minimumRating !== undefined) {
    combinedCacheKey += `:minimumRating=${minimumRating}`;
  }

  // Check combined cache first if not bypassing
  if (!shouldBypassCache) {
    try {
      const cachedPlaces = await redis.get<
        (GooglePlaceResult & { key?: number })[]
      >(combinedCacheKey);
      if (cachedPlaces && cachedPlaces.length > 0) {
        log.success(`[CACHE HIT] for combined keys`, { combinedCacheKey });
        return { places: cachedPlaces, isCacheHit: true };
      }
      log.debug(`[CACHE MISS] for combined keys`, { combinedCacheKey });
    } catch (error) {
      log.error(`[CACHE ERROR] for combined keys`, { error, combinedCacheKey });
    }
  }

  // Collect all primary types from all requested categories
  const allPrimaryTypes: string[] = [];
  const keyToPrimaryTypesMap: Record<number, string[]> = {};

  for (const key of keys) {
    const category = CATEGORY_MAP.find((cat) => cat.key === key);
    if (category?.primaryType) {
      keyToPrimaryTypesMap[key] = category.primaryType;
      allPrimaryTypes.push(...category.primaryType);
    }
  }

  // Count frequency of each primary type
  const typeFrequency: Record<string, number> = {};
  for (const type of allPrimaryTypes) {
    typeFrequency[type] = (typeFrequency[type] || 0) + 1;
  }

  // Get unique primary types and sort by frequency (most common first)
  // This prioritizes types that appear in multiple categories
  const uniquePrimaryTypes = Array.from(new Set(allPrimaryTypes)).sort(
    (a, b) => typeFrequency[b] - typeFrequency[a]
  );

  // Limit to a reasonable number of types to avoid excessive API calls
  // For the default case, 100 types should cover the most important categories
  const MAX_TYPES = 100;
  const limitedTypes = uniquePrimaryTypes.slice(0, MAX_TYPES);

  if (uniquePrimaryTypes.length > MAX_TYPES) {
    log.debug(
      `Limiting from ${uniquePrimaryTypes.length} to ${MAX_TYPES} primary types for combined request`,
      {
        totalTypes: uniquePrimaryTypes.length,
        limitedTo: MAX_TYPES,
      }
    );
  }

  // If we have more than 50 primary types, we need to chunk them
  const primaryTypeChunks = chunkArray(limitedTypes, 50);

  // Collect all places
  const allPlaces: (GooglePlaceResult & { key?: number })[] = [];

  const GOOGLE_SEARCH_BASE_URL = `${env.GOOGLE_PLACES_URL}/places:searchNearby`;
  const GOOGLE_API_KEY = env.GOOGLE_PLACES_API_KEY;

  // Process each chunk of primary types
  for (const chunk of primaryTypeChunks) {
    const searchParams: GooglePlacesSearchParams = {
      ...baseSearchParams,
      includedPrimaryTypes: chunk,
    };

    log.debug(
      `Making combined request for ${keys.length} keys with ${chunk.length} types`,
      {
        keys,
        typesCount: chunk.length,
      }
    );

    const searchUrl = `${GOOGLE_SEARCH_BASE_URL}?fields=${FIELDS}&key=${GOOGLE_API_KEY}`;

    try {
      // Use fetchWithRetry instead of direct fetch
      const rawData = await fetchWithRetry<GooglePlacesApiResponse>(
        searchUrl,
        {
          method: 'POST',
          body: JSON.stringify(searchParams),
        },
        15000, // 15 second timeout
        2 // 2 retries (3 attempts total)
      );

      const validatedData = GooglePlacesResponseSchema.parse(rawData);

      // Extract places from the validated data
      const places = validatedData.places || [];

      // For each place, determine which category key(s) it belongs to
      for (const place of places) {
        const placeTypes = place.types || [];

        // Find all keys whose primary types match any of the place's types
        const matchingKeys: number[] = [];

        for (const [keyStr, primaryTypes] of Object.entries(
          keyToPrimaryTypesMap
        )) {
          const key = parseInt(keyStr, 10);
          if (primaryTypes.some((type) => placeTypes.includes(type))) {
            matchingKeys.push(key);
          }
        }

        if (matchingKeys.length > 0) {
          // Use the first matching key for simplicity
          // This will be used for emoji selection
          allPlaces.push({ ...place, key: matchingKeys[0] });
        } else {
          // If no matching key, still include the place without a key
          allPlaces.push(place);
        }
      }
    } catch (error) {
      log.error(`Failed to fetch or validate response data for combined keys`, {
        keys,
        error,
      });
      // Continue processing other chunks even if one fails
    }
  }

  // Cache the results if we got any
  if (allPlaces.length > 0 && !shouldBypassCache) {
    try {
      await redis.set(combinedCacheKey, allPlaces, {
        ex: SEARCH_CONFIG.CACHE_EXPIRATION_TIME,
      });
      log.success(`[CACHE SET] for combined keys`, { combinedCacheKey });
    } catch (error) {
      log.error(`[CACHE ERROR] Failed to set cache for combined keys`, {
        error,
        combinedCacheKey,
      });
    }
  }

  return { places: allPlaces, isCacheHit: false };
}

/**
 * Executes a function with a timeout
 * @param fn The function to execute
 * @param timeoutMs Timeout in milliseconds
 * @param fallbackFn Optional fallback function to execute if the timeout is reached
 * @returns The result of the function or fallback
 */
async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  fallbackFn?: () => Promise<T>
): Promise<T> {
  return new Promise<T>(async (resolve, reject) => {
    // Set up the timeout
    const timeoutId = setTimeout(async () => {
      if (fallbackFn) {
        try {
          const fallbackResult = await fallbackFn();
          resolve(fallbackResult);
        } catch (error) {
          reject(
            new Error(
              `Request timed out after ${timeoutMs}ms and fallback failed: ${error}`
            )
          );
        }
      } else {
        reject(new Error(`Request timed out after ${timeoutMs}ms`));
      }
    }, timeoutMs);

    try {
      // Execute the function
      const result = await fn();
      clearTimeout(timeoutId);
      resolve(result);
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}

/**
 * Groups similar category keys together to reduce the number of API calls
 * @param keys Array of category keys to group
 * @returns Array of grouped keys
 */
function groupSimilarCategories(keys: number[]): number[][] {
  // If there are only a few keys, don't bother grouping
  if (keys.length <= 3) {
    return keys.map((key) => [key]);
  }

  // Create a map of primary types to keys
  const typeToKeysMap: Record<string, Set<number>> = {};

  // For each key, add it to the sets for each of its primary types
  for (const key of keys) {
    const category = CATEGORY_MAP.find((cat) => cat.key === key);
    if (!category?.primaryType) continue;

    for (const type of category.primaryType) {
      if (!typeToKeysMap[type]) {
        typeToKeysMap[type] = new Set<number>();
      }
      typeToKeysMap[type].add(key);
    }
  }

  // Create groups of keys that share primary types
  const groups: Set<number>[] = [];
  const processedKeys = new Set<number>();

  // Start with keys that have the most overlap
  const typesWithCounts = Object.entries(typeToKeysMap)
    .map(([type, keysSet]) => ({ type, count: keysSet.size }))
    .sort((a, b) => b.count - a.count);

  for (const { type } of typesWithCounts) {
    const keysForType = typeToKeysMap[type];

    // Skip if all keys in this type have been processed
    if (Array.from(keysForType).every((key) => processedKeys.has(key))) {
      continue;
    }

    // Find a group that has overlap with this type's keys
    let foundGroup = false;
    for (const group of groups) {
      // Check if there's significant overlap between the group and this type's keys
      const overlap = Array.from(group).filter((key) => keysForType.has(key));

      if (overlap.length > 0) {
        // Add all keys from this type to the group
        for (const key of Array.from(keysForType)) {
          group.add(key);
          processedKeys.add(key);
        }
        foundGroup = true;
        break;
      }
    }

    // If no existing group has overlap, create a new group
    if (!foundGroup) {
      const newGroup = new Set<number>(keysForType);
      for (const key of Array.from(newGroup)) {
        processedKeys.add(key);
      }
      groups.push(newGroup);
    }
  }

  // Add any remaining keys as individual groups
  for (const key of keys) {
    if (!processedKeys.has(key)) {
      groups.push(new Set([key]));
      processedKeys.add(key);
    }
  }

  // Convert sets to arrays
  return groups.map((group) => Array.from(group));
}

/**
 * POST /api/places/search
 *
 * Search for places using the Google Places API with optional filtering and caching
 *
 * @param {Object} req.body - The request body
 * @param {number[]} [req.body.keys] - Array of category keys to search for. Defaults to all categories
 * @param {boolean} [req.body.openNow] - Filter for places that are currently open (based on currentOpeningHours.openNow)
 * @param {number[]} [req.body.priceLevels] - Array of price levels to filter results, must be integers between 1-4 inclusive:
 *   - 1: PRICE_LEVEL_INEXPENSIVE
 *   - 2: PRICE_LEVEL_MODERATE
 *   - 3: PRICE_LEVEL_EXPENSIVE
 *   - 4: PRICE_LEVEL_VERY_EXPENSIVE
 *   Note: Places with no price level or PRICE_LEVEL_UNSPECIFIED are excluded when this filter is applied.
 *   Places with PRICE_LEVEL_FREE are always included regardless of the requested price levels.
 *   If all price levels [1,2,3,4] are provided, it's treated as if no price level filter was applied.
 * @param {number} [req.body.radius=SEARCH_CONFIG.DEFAULT_RADIUS_METERS] - Search radius in meters from location
 * @param {Object} req.body.location - Center point for location-based search (required)
 * @param {number} req.body.location.latitude - Latitude coordinate
 * @param {number} req.body.location.longitude - Longitude coordinate
 * @param {boolean} [req.body.stream=false] - Whether to stream results
 * @param {boolean} [req.body.bypassCache=false] - Whether to bypass Redis cache
 * @param {number} [req.body.minimumRating] - Minimum rating to filter results (integer between 1 and 5 inclusive)
 *
 * @returns {Promise<NextResponse<SearchResponse | ErrorResponse>>} JSON response containing:
 *  - results: Array of transformed place objects with id, location, and emoji
 *  - count: Total number of results
 *  - cacheHit: Whether results were served from cache
 */
export async function POST(
  req: Request
): Promise<NextResponse<SearchResponse | ErrorResponse>> {
  // Set a timeout for the entire request (30 seconds)
  const GLOBAL_TIMEOUT_MS = 30000;

  try {
    return await withTimeout(
      async () => {
        const body = await req.json();

        const zodSchema = z.object({
          keys: z
            .array(z.number())
            .optional()
            .default(CATEGORY_MAP.map((cat) => cat.key)),
          openNow: z.boolean().optional(),
          priceLevels: z
            .array(z.number().min(1).max(4).int())
            .refine(
              (levels) => levels.every((level) => level >= 1 && level <= 4),
              {
                message: 'Price levels must be between 1 and 4 inclusive',
              }
            )
            .optional(),
          radius: z
            .number()
            .optional()
            .default(SEARCH_CONFIG.DEFAULT_RADIUS_METERS),
          location: z.object({
            latitude: z.number(),
            longitude: z.number(),
          }),
          stream: z.boolean().optional().default(false),
          bypassCache: z.boolean().optional().default(false),
          maxResultCount: z.number().optional(),
          minimumRating: z.number().min(1).max(5).optional(),
        });

        const {
          keys,
          openNow,
          priceLevels,
          radius,
          location,
          stream,
          bypassCache,
          maxResultCount,
          minimumRating,
        } = zodSchema.parse(body);

        log.debug('Search request', {
          keys,
          openNow,
          priceLevels,
          radius,
          location,
        });

        // Log the minimumRating parameter (not used yet)
        if (minimumRating !== undefined) {
          log.debug('Minimum rating parameter received', { minimumRating });
        }

        // Debug logging for price levels
        console.log('Search request with price levels:', priceLevels);

        // Log the total number of places before filtering
        let totalPlacesBeforeFiltering = 0;
        let totalPlacesAfterFiltering = 0;
        let placesWithPriceLevelCount = 0;
        let placesWithoutPriceLevelCount = 0;

        // Check if priceLevels contains all possible values [1,2,3,4]
        const hasAllPriceLevels =
          priceLevels &&
          priceLevels.length === 4 &&
          priceLevels.includes(1) &&
          priceLevels.includes(2) &&
          priceLevels.includes(3) &&
          priceLevels.includes(4);

        // Determine if we should bypass the cache
        // Always bypass if openNow is provided or if priceLevels is provided but doesn't contain all values
        // Also bypass if minimumRating is provided
        const shouldBypassCache =
          bypassCache ||
          openNow !== undefined ||
          minimumRating !== undefined ||
          (priceLevels !== undefined &&
            priceLevels.length > 0 &&
            !hasAllPriceLevels);

        if (
          openNow !== undefined ||
          minimumRating !== undefined ||
          (priceLevels !== undefined &&
            priceLevels.length > 0 &&
            !hasAllPriceLevels)
        ) {
          log.debug('Bypassing cache due to dynamic parameters', {
            openNow,
            priceLevels,
            minimumRating,
          });
        }

        // Create base search params
        const baseSearchParams: GooglePlacesSearchParams = {
          languageCode: 'en',
          regionCode: 'US',
          includedTypes: [],
          excludedPrimaryTypes: [],
          // Use the user's maxResultCount when no filters are applied,
          // but use 20 (Google's max) when we need to filter client-side
          maxResultCount:
            openNow !== undefined ||
            minimumRating !== undefined ||
            (priceLevels !== undefined &&
              priceLevels.length > 0 &&
              !hasAllPriceLevels)
              ? 20 // Use max when filters are applied
              : maxResultCount || 20, // Use user's value or default when no filters
        };

        baseSearchParams.locationRestriction = {
          circle: {
            center: {
              latitude: location.latitude,
              longitude: location.longitude,
            },
            radius: radius,
          },
        };

        // Check if we're using default keys (all keys from CATEGORY_MAP)
        const isUsingDefaultKeys =
          keys.length === CATEGORY_MAP.length &&
          keys.every((key, index) => key === CATEGORY_MAP[index].key);

        // If not using default keys but still have multiple keys, group similar categories
        const keyGroups = isUsingDefaultKeys
          ? [keys]
          : keys.length > 1
          ? groupSimilarCategories(keys)
          : [keys];

        // Log the grouping information
        if (!isUsingDefaultKeys && keys.length > 1) {
          log.debug(
            `Grouped ${keys.length} keys into ${keyGroups.length} groups for more efficient API calls`,
            {
              originalKeys: keys,
              groups: keyGroups,
            }
          );
        }

        // If streaming is requested, use a streaming response
        if (stream) {
          // Create a TransformStream to stream the results
          const encoder = new TextEncoder();
          const { readable, writable } = new TransformStream();
          const writer = writable.getWriter();

          // Start processing in the background
          (async () => {
            try {
              // Keep track of seen IDs to avoid duplicates
              const seenIds = new Set<string>();
              let totalCount = 0;
              let allCacheHits = true; // Track if all keys were served from cache

              // Send initial response
              writer.write(encoder.encode('{"results":['));

              if (isUsingDefaultKeys) {
                // Optimization: Fetch all places at once for default keys case
                const { places, isCacheHit } = await fetchPlacesForMultipleKeys(
                  keys,
                  baseSearchParams,
                  location,
                  radius,
                  shouldBypassCache,
                  openNow,
                  priceLevels,
                  minimumRating
                );

                // Update cache hit tracking
                if (!isCacheHit) {
                  allCacheHits = false;
                }

                // Transform and stream each place
                for (const place of places) {
                  // Skip if we've already seen this place
                  if (seenIds.has(place.id)) continue;

                  // Skip if openNow is true and the place is not open
                  if (!isPlaceOpen(place, openNow)) continue;

                  // Skip if the place doesn't match the requested price levels
                  if (!matchesPriceLevel(place, priceLevels)) continue;

                  // Skip if the place doesn't meet the minimum rating
                  if (!meetsMinimumRating(place, minimumRating)) continue;

                  seenIds.add(place.id);

                  // Transform the place
                  const placeWithKey = place as GooglePlaceResult & {
                    key?: number;
                  };
                  const transformedPlace = transformPlace(
                    place,
                    placeWithKey.key
                  );

                  // Add a comma if this isn't the first result
                  if (totalCount > 0) {
                    writer.write(encoder.encode(','));
                  }

                  // Stream the transformed place
                  writer.write(
                    encoder.encode(JSON.stringify(transformedPlace))
                  );
                  totalCount++;
                }
              } else {
                // Original approach: Process each key group with concurrency limiting
                // Create task functions for each key group
                const tasks = keyGroups.map((group) => async () => {
                  try {
                    if (group.length === 1) {
                      // If the group has only one key, use the original function
                      const result = await fetchPlacesForKey(
                        group[0],
                        baseSearchParams,
                        location,
                        radius,
                        shouldBypassCache,
                        openNow,
                        priceLevels,
                        maxResultCount,
                        minimumRating
                      );
                      return {
                        result,
                        keys: group,
                      };
                    } else {
                      // If the group has multiple keys, use the combined function
                      const result = await fetchPlacesForMultipleKeys(
                        group,
                        baseSearchParams,
                        location,
                        radius,
                        shouldBypassCache,
                        openNow,
                        priceLevels,
                        minimumRating
                      );
                      return {
                        result,
                        keys: group,
                      };
                    }
                  } catch (error) {
                    log.error(`Failed to fetch places for key group`, {
                      group,
                      error,
                    });
                    return {
                      result: { places: [], isCacheHit: false },
                      keys: group,
                    };
                  }
                });

                // Execute tasks with limited concurrency (5 at a time)
                const results = await limitConcurrency(tasks, 5);

                // Process results
                let processedKeys = 0;

                for (let i = 0; i < results.length; i++) {
                  const groupKeys = keyGroups[i];
                  const { result } = results[i];
                  const { places, isCacheHit } = result;

                  processedKeys += groupKeys.length;

                  // Update cache hit tracking
                  if (!isCacheHit) {
                    allCacheHits = false;
                  }

                  // Transform and stream each place
                  for (const place of places) {
                    // Skip if we've already seen this place
                    if (seenIds.has(place.id)) continue;

                    // Skip if openNow is true and the place is not open
                    if (!isPlaceOpen(place, openNow)) continue;

                    // Skip if the place doesn't match the requested price levels
                    if (!matchesPriceLevel(place, priceLevels)) continue;

                    // Skip if the place doesn't meet the minimum rating
                    if (!meetsMinimumRating(place, minimumRating)) continue;

                    seenIds.add(place.id);

                    // Transform the place - use the place's key if available, otherwise use the first key in the group
                    const placeWithKey = place as GooglePlaceResult & {
                      key?: number;
                    };
                    const keyForEmoji =
                      placeWithKey.key !== undefined
                        ? placeWithKey.key
                        : groupKeys[0];
                    const transformedPlace = transformPlace(place, keyForEmoji);

                    // Add a comma if this isn't the first result
                    if (totalCount > 0) {
                      writer.write(encoder.encode(','));
                    }

                    // Stream the transformed place
                    writer.write(
                      encoder.encode(JSON.stringify(transformedPlace))
                    );
                    totalCount++;
                  }
                }

                // If we didn't process any keys successfully, set allCacheHits to false
                if (processedKeys === 0) {
                  allCacheHits = false;
                }
              }

              // Close the JSON array and add the count and cacheHit flag
              writer.write(
                encoder.encode(
                  `],"count":${totalCount},"cacheHit":${allCacheHits}}`
                )
              );
              writer.close();
            } catch (error) {
              log.error('Error in streaming process', { error });

              // Try to write an error response if possible
              try {
                writer.write(
                  encoder.encode(
                    '{"error":"Failed to process request","details":"' +
                      (error as Error).message.replace(/"/g, '\\"') +
                      '"}'
                  )
                );
                writer.close();
              } catch (writeError) {
                log.error('Failed to write error response', { writeError });
                writer.abort(error as Error);
              }
            }
          })();

          // Return the readable stream as the response
          return new NextResponse(readable, {
            headers: {
              'Content-Type': 'application/json',
              'Transfer-Encoding': 'chunked',
            },
          });
        } else {
          // Non-streaming approach
          let allResults: (GooglePlaceResult & { key?: number })[] = [];
          let allCacheHits = true; // Track if all keys were served from cache

          if (isUsingDefaultKeys) {
            // Optimization: Fetch all places at once for default keys case
            const { places, isCacheHit } = await fetchPlacesForMultipleKeys(
              keys,
              baseSearchParams,
              location,
              radius,
              shouldBypassCache,
              openNow,
              priceLevels,
              minimumRating
            );

            // Update cache hit tracking
            if (!isCacheHit) {
              allCacheHits = false;
            }

            allResults = places;
          } else {
            // Process each key group with concurrency limiting
            // Create task functions for each key group
            const tasks = keyGroups.map((group) => async () => {
              try {
                if (group.length === 1) {
                  // If the group has only one key, use the original function
                  const result = await fetchPlacesForKey(
                    group[0],
                    baseSearchParams,
                    location,
                    radius,
                    shouldBypassCache,
                    openNow,
                    priceLevels,
                    maxResultCount,
                    minimumRating
                  );

                  // Add the key to each place
                  return {
                    places: result.places.map((place) => ({
                      ...place,
                      key: group[0],
                    })),
                    isCacheHit: result.isCacheHit,
                    keys: group,
                  };
                } else {
                  // If the group has multiple keys, use the combined function
                  const result = await fetchPlacesForMultipleKeys(
                    group,
                    baseSearchParams,
                    location,
                    radius,
                    shouldBypassCache,
                    openNow,
                    priceLevels,
                    minimumRating
                  );

                  return {
                    ...result,
                    keys: group,
                  };
                }
              } catch (error) {
                log.error(`Failed to fetch places for key group`, {
                  group,
                  error,
                });
                return {
                  places: [],
                  isCacheHit: false,
                  keys: group,
                };
              }
            });

            // Execute tasks with limited concurrency (5 at a time)
            const results = await limitConcurrency(tasks, 5);

            // Process results
            let processedKeys = 0;

            for (let i = 0; i < keyGroups.length; i++) {
              const groupKeys = keyGroups[i];
              const { places, isCacheHit } = results[i];

              processedKeys += groupKeys.length;

              // Update cache hit tracking
              if (!isCacheHit) {
                allCacheHits = false;
              }

              // Add places to our overall collection
              allResults.push(...places);
            }

            // If we didn't process any keys successfully, set allCacheHits to false
            if (processedKeys === 0) {
              allCacheHits = false;
            }
          }

          // Remove duplicates based on place ID and filter for open places if needed
          const uniqueResults = Array.from(
            new Map(
              allResults
                .filter(
                  (place) =>
                    isPlaceOpen(place, openNow) &&
                    matchesPriceLevel(place, priceLevels) &&
                    meetsMinimumRating(place, minimumRating)
                )
                .map((place) => [place.id, place])
            ).values()
          );

          // Count places with and without price levels
          totalPlacesBeforeFiltering = allResults.length;

          // Count places with each price level
          const priceLevelCounts = {
            PRICE_LEVEL_UNSPECIFIED: 0,
            PRICE_LEVEL_FREE: 0,
            PRICE_LEVEL_INEXPENSIVE: 0,
            PRICE_LEVEL_MODERATE: 0,
            PRICE_LEVEL_EXPENSIVE: 0,
            PRICE_LEVEL_VERY_EXPENSIVE: 0,
            undefined: 0,
          };

          allResults.forEach((place) => {
            if (!place.priceLevel) {
              priceLevelCounts['undefined']++;
              placesWithoutPriceLevelCount++;
            } else {
              priceLevelCounts[place.priceLevel]++;
              placesWithPriceLevelCount++;
            }
          });

          totalPlacesAfterFiltering = uniqueResults.length;

          console.log('Places before filtering:', totalPlacesBeforeFiltering);
          console.log('Places with price level:', placesWithPriceLevelCount);
          console.log(
            'Places without price level:',
            placesWithoutPriceLevelCount
          );
          console.log('Price level distribution:', priceLevelCounts);
          console.log('Places after filtering:', totalPlacesAfterFiltering);
          console.log('Requested price levels:', priceLevels);

          log.debug('Total unique results', { count: uniqueResults.length });

          // Add rating distribution logging similar to price level distribution
          // Count places with and without ratings
          let placesWithRatingCount = 0;
          let placesWithoutRatingCount = 0;

          // Count places with each rating range
          const ratingCounts = {
            'No Rating': 0,
            '1.0-1.9': 0,
            '2.0-2.9': 0,
            '3.0-3.9': 0,
            '4.0-4.9': 0,
            '5.0': 0,
          };

          allResults.forEach((place) => {
            if (place.rating === undefined) {
              ratingCounts['No Rating']++;
              placesWithoutRatingCount++;
            } else {
              if (place.rating < 2) ratingCounts['1.0-1.9']++;
              else if (place.rating < 3) ratingCounts['2.0-2.9']++;
              else if (place.rating < 4) ratingCounts['3.0-3.9']++;
              else if (place.rating < 5) ratingCounts['4.0-4.9']++;
              else ratingCounts['5.0']++;
              placesWithRatingCount++;
            }
          });

          console.log('Places with rating:', placesWithRatingCount);
          console.log('Places without rating:', placesWithoutRatingCount);
          console.log('Rating distribution:', ratingCounts);
          console.log('Minimum rating filter:', minimumRating);

          // Transform the results to the desired shape
          const transformedResults: TransformedPlace[] = uniqueResults.map(
            (place) => transformPlace(place, place.key)
          );

          // Limit results if maxResultCount is provided
          const limitedResults = maxResultCount
            ? transformedResults.slice(0, maxResultCount)
            : transformedResults;

          // Log the filtering process
          console.log(`Original results from Google: ${allResults.length}`);
          console.log(
            `After filtering (price/open/rating): ${transformedResults.length}`
          );
          console.log(
            `After applying maxResultCount (${maxResultCount}): ${limitedResults.length}`
          );

          // Update the response object to only include results, cacheHit, and count
          return NextResponse.json({
            results: limitedResults,
            count: limitedResults.length,
            cacheHit: allCacheHits,
          });
        }
      },
      GLOBAL_TIMEOUT_MS,
      async () => {
        // Fallback response if the request times out
        log.error('Request timed out, returning empty results');
        return NextResponse.json(
          {
            results: [],
            count: 0,
            cacheHit: false,
          },
          { status: 408 } // Request Timeout status
        );
      }
    );
  } catch (error) {
    log.error('Error processing request', { error });
    return NextResponse.json(
      { error: 'Failed to process request', details: (error as Error).message },
      { status: 500 }
    );
  }
}
