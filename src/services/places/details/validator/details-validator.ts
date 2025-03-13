import { z } from 'zod';

// Define Zod schema for the Google Details API response
const reviewSchema = z.object({
  name: z.string(),
  relativePublishTimeDescription: z.string(),
  rating: z.number(),
  text: z.object({
    text: z.string(),
    languageCode: z.string(),
  }),
  originalText: z.object({
    text: z.string(),
    languageCode: z.string(),
  }),
  authorAttribution: z.object({
    displayName: z.string(),
    uri: z.string(),
    photoUri: z.string(),
  }),
  publishTime: z.string(),
  flagContentUri: z.string(),
  googleMapsUri: z.string(),
});

const textObjectSchema = z.object({
  text: z.string().optional(),
  languageCode: z.string().optional(),
});

// Define the valid price level values
const priceLevelEnum = z.enum([
  'PRICE_LEVEL_UNSPECIFIED',
  'PRICE_LEVEL_FREE',
  'PRICE_LEVEL_INEXPENSIVE',
  'PRICE_LEVEL_MODERATE',
  'PRICE_LEVEL_EXPENSIVE',
  'PRICE_LEVEL_VERY_EXPENSIVE',
]);

export const googleDetailsResponseSchema = z.object({
  name: z.string(),
  reviews: z.array(reviewSchema).optional().default([]),
  rating: z.number(),
  priceLevel: priceLevelEnum.optional().default('PRICE_LEVEL_UNSPECIFIED'),
  userRatingCount: z.number(),
  currentOpeningHours: z
    .object({
      openNow: z.boolean(),
    })
    .optional(),
  displayName: textObjectSchema.optional(),
  primaryTypeDisplayName: textObjectSchema.optional(),
  takeout: z.boolean().optional(),
  delivery: z.boolean().optional(),
  dineIn: z.boolean().optional(),
  editorialSummary: textObjectSchema.optional(),
  outdoorSeating: z.boolean().optional(),
  liveMusic: z.boolean().optional(),
  menuForChildren: z.boolean().optional(),
  servesDessert: z.boolean().optional(),
  servesCoffee: z.boolean().optional(),
  goodForChildren: z.boolean().optional(),
  goodForGroups: z.boolean().optional(),
  allowsDogs: z.boolean().optional(),
  restroom: z.boolean().optional(),
  paymentOptions: z
    .object({
      acceptsCreditCards: z.boolean().optional().default(false),
      acceptsDebitCards: z.boolean().optional().default(false),
      acceptsCashOnly: z.boolean().optional().default(false),
    })
    .optional(),
  generativeSummary: z
    .object({
      overview: textObjectSchema.optional(),
    })
    .optional(),
});

// Define the type for the validated data
export type ValidatedGoogleDetailsResponse = z.infer<
  typeof googleDetailsResponseSchema
>;

/**
 * Maps Google Places API price level to Detail price level
 * @param priceLevel - The Google Places API price level
 * @returns The Detail price level (1-4 or null)
 */
export function mapPriceLevel(priceLevel: string): (1 | 2 | 3 | 4) | null {
  switch (priceLevel) {
    case 'PRICE_LEVEL_FREE':
    case 'PRICE_LEVEL_INEXPENSIVE':
      return 1;
    case 'PRICE_LEVEL_MODERATE':
      return 2;
    case 'PRICE_LEVEL_EXPENSIVE':
      return 3;
    case 'PRICE_LEVEL_VERY_EXPENSIVE':
      return 4;
    case 'PRICE_LEVEL_UNSPECIFIED':
    default:
      return null;
  }
}
