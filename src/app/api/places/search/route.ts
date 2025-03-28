import { v1 } from '@googlemaps/places';
import { uniq } from 'lodash-es';
import z from 'zod';
import { CATEGORY_MAP_LOOKUP } from '@/constants/category-map';
import { SEARCH_CONFIG } from '@/constants/search';
import { env } from '@/env';
import { getEmojiForTypes } from '@/utils/emoji/get-emoji-for-types';

const zodSchema = z.object({
  keys: z.array(z.number()).optional(),
  openNow: z.boolean().optional(),
  priceLevels: z
    .array(z.number().min(1).max(4).int())
    .refine((levels) => levels.every((level) => level >= 1 && level <= 4), {
      message: 'Price levels must be between 1 and 4 inclusive',
    })
    .optional(),
  radius: z.number().optional().default(SEARCH_CONFIG.DEFAULT_RADIUS_METERS),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  bypassCache: z.boolean().optional().default(false),
  maxResultCount: z
    .number()
    .optional()
    .default(SEARCH_CONFIG.DEFAULT_RECORD_COUNT),
  minimumRating: z.number().min(1).max(5).optional(),
});

const fields = [
  'places.id',
  'places.types',
  'places.location',
  'places.displayName',
].join(',');

const placesClient = new v1.PlacesClient({
  apiKey: env.GOOGLE_PLACES_API_KEY,
});

export async function POST(request: Request) {
  const body = await request.json();
  const validatedBody = zodSchema.safeParse(body);

  if (!validatedBody.success) {
    return Response.json(validatedBody.error, { status: 400 });
  }

  const includedTypes = uniq(
    validatedBody.data.keys?.flatMap(
      (key) => CATEGORY_MAP_LOOKUP[key].primaryType
    ) ?? SEARCH_CONFIG.DEFAULT_INCLUDED_TYPES
  );

  try {
    const [results] = await placesClient.searchNearby(
      {
        locationRestriction: {
          circle: {
            center: validatedBody.data.location,
            radius: validatedBody.data.radius,
          },
        },
        excludedTypes: SEARCH_CONFIG.DEFAULT_EXCLUDED_TYPES,
        // The API only supports up to a maximum of 50 types being filtered on, which should suffice
        // for every situation. If we have more than 50, we'll filter it down to the base _restaurant types.
        includedTypes:
          includedTypes.length > 50
            ? includedTypes.filter(
                (type) => type.includes('restaurant') || type.includes('coffee')
              )
            : includedTypes,
        maxResultCount: validatedBody.data.maxResultCount,
      },
      {
        otherArgs: {
          headers: {
            'X-Goog-FieldMask': fields,
          },
        },
      }
    );

    const transformedResults =
      results.places?.map((place) => ({
        id: place.id,
        location: place.location,
        name: place.displayName,
        emoji: getEmojiForTypes(place.types ?? []),
      })) ?? [];

    return Response.json({
      results: transformedResults,
      count: transformedResults.length,
      cacheHit: false,
    });
  } catch (e) {
    console.dir(e, { depth: null });

    return Response.json({
      results: [],
      count: 0,
      cacheHit: false,
    });
  }
}
