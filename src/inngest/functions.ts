import { prisma } from '@/lib/db';
import type { DetailResponse } from '@/types/details';
import { inngest } from './client';

export const checkIfPlaceExistsAndCreateIfNot = inngest.createFunction(
  { id: 'places/check-if-place-exists-and-create-if-not' },
  { event: 'places/check-if-place-exists-and-create-if-not' },
  async ({ event }) => {
    const id: string = event.data.id;
    const details: DetailResponse = event.data.details;

    const place = await prisma.place.findUnique({
      where: {
        id: id,
      },
    });

    if (place) {
      return { message: `Place ${id} already exists` };
    }

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

    return { message: `Place ${id} created` };
  }
);
